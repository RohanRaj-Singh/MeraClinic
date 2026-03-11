# Mera Clinic - Security

## Authentication

### Laravel Sanctum

- SPA authentication using Laravel Sanctum
- Token-based authentication with Bearer tokens
- Token expiration: 1 year (configurable)
- Token abilities: scope-based permissions

### Login Flow

```
1. User submits credentials (email/password)
2. Server validates credentials
3. Server checks for suspicious activity:
   - IP address change
   - Login after 3 days
   - Device change
4. If suspicious → Send OTP to email
5. User verifies OTP
6. Generate Sanctum token
7. Return token to client
```

## Security Rules

### OTP Requirements

OTP is required when:
1. **IP Change**: User's IP address differs from last login
2. **Time Gap**: User hasn't logged in for 3+ days
3. **New Device**: Device fingerprint doesn't match

### OTP Implementation

```php
// Generate OTP
$otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

// Store in cache with 10-minute expiry
Cache::put('otp_'.$user->id, $otp, now()->addMinutes(10));

// Send to user's email
Mail::to($user->email)->send(new OtpMail($otp));
```

### OTP Verification

```php
// Verify OTP
$cachedOtp = Cache::get('otp_'.$user->id);

if ($request->otp !== $cachedOtp) {
    return response()->json([
        'success' => false,
        'message' => 'Invalid OTP',
        'code' => 'OTP_INVALID'
    ], 422);
}

// Clear OTP after successful verification
Cache::delete('otp_'.$user->id);
```

## IP & Device Tracking

### User Table Fields

```php
$table->string('last_login_ip')->nullable();
$table->timestamp('last_login_at')->nullable();
$table->text('device_info')->nullable();
```

### Login Tracking

```php
public function updateLoginInfo(User $user, Request $request)
{
    $user->update([
        'last_login_ip' => $request->ip(),
        'last_login_at' => now(),
        'device_info' => $request->userAgent()
    ]);
}
```

### Suspicious Activity Detection

```php
public function requiresOtp(User $user, Request $request): bool
{
    // Check IP change
    if ($user->last_login_ip !== $request->ip()) {
        return true;
    }
    
    // Check 3-day gap
    if ($user->last_login_at && $user->last_login_at->diffInDays(now()) >= 3) {
        return true;
    }
    
    // Check device change
    if ($user->device_info !== $request->userAgent()) {
        return true;
    }
    
    return false;
}
```

## Data Isolation

### Multi-Tenancy Rules

1. All queries MUST include `clinic_id` filter
2. Use global scope for automatic filtering
3. Never expose data from other clinics

### Global Scope Implementation

```php
// Base Model
abstract class BaseModel extends Model
{
    protected static function booted()
    {
        static::addGlobalScope('clinic', function (Builder $builder) {
            $clinicId = auth()->user()?->clinic_id;
            if ($clinicId) {
                $builder->where('clinic_id', $clinicId);
            }
        });
    }
}
```

### Super Admin Rules

```php
// Super admin can NEVER access patient medical data
class PatientController extends Controller
{
    public function index()
    {
        // Super admins cannot list patients
        if (auth()->user()->role === 'super_admin') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied',
                'code' => 'FORBIDDEN'
            ], 403);
        }
        
        // Proceed with normal logic
    }
}
```

## Authorization

### Roles

| Role | Permissions |
|------|-------------|
| super_admin | Manage all clinics, subscriptions, passwords |
| admin | Manage clinic users, settings |
| doctor | Manage patients, visits, prescriptions |

### Permission Middleware

```php
// routes/api.php
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    Route::apiResource('clinics', ClinicController::class);
});

Route::middleware(['auth:sanctum', 'role:admin|doctor'])->group(function () {
    Route::apiResource('patients', PatientController::class);
    Route::apiResource('visits', VisitController::class);
});
```

## File Security

### Upload Validation

```php
public function rules(): array
{
    return [
        'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
    ];
}
```

### File Storage

```php
// Store in clinic-specific directory
$path = $file->store('clinic_'.$clinicId.'/patients/'.$patientId, 'local');

// Generate unique filename
$filename = Str::uuid().'.'.$file->getClientOriginalExtension();
```

### File Access

```php
// Don't expose direct file paths
Route::get('/files/{id}/download', [FileController::class, 'download'])
    ->middleware('auth:sanctum');
```

## API Security

### Rate Limiting

```php
// app/Http/Kernel.php
protected $middlewareAliases = [
    'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
];
```

```php
// routes/api.php
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    // Authenticated routes
});

Route::middleware(['throttle:20,1'])->group(function () {
    // Public routes
});
```

### CORS Configuration

```php
// config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['https://meraclinic.com', 'http://localhost:3000'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => ['API-Version'],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

## Audit Logging

### Log Events

```php
// Log all important actions
AuditLog::create([
    'clinic_id' => auth()->user()->clinic_id,
    'user_id' => auth()->id(),
    'action' => 'patient.created',
    'description' => 'Created patient: '.$patient->name,
    'ip_address' => request()->ip(),
    'device_info' => request()->userAgent()
]);
```

### Logged Actions

- User login/logout
- Patient CRUD
- Visit CRUD
- Report access
- File upload/download
- Settings changes
- Clinic management (super admin)

## Password Security

### Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character

### Hashing

- Use bcrypt with cost factor 12
- Never store plain text passwords

## Security Headers

```php
// app/Http/Middleware/SecurityHeaders.php
public function handle($request, Closure $next)
{
    $response = $next($request);
    
    $response->headers->set('X-Content-Type-Options', 'nosniff');
    $response->headers->set('X-Frame-Options', 'DENY');
    $response->headers->set('X-XSS-Protection', '1; mode=block');
    $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return $response;
}
```

## Environment Security

### Required Environment Variables

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://meraclinic.com

DB_HOST=localhost
DB_DATABASE=meraclinic
DB_USERNAME=secure_user
DB_PASSWORD=secure_password

SANCTUM_STATEFUL_DOMAINS=meraclinic.com
SESSION_DOMAIN=.meraclinic.com

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
```

## Security Checklist

- [ ] HTTPS enforced in production
- [ ] CSRF protection enabled
- [ ] XSS protection enabled
- [ ] SQL injection prevention (Eloquent ORM)
- [ ] Mass assignment protection (fillable/guarded)
- [ ] Rate limiting enabled
- [ ] Audit logging implemented
- [ ] OTP system functional
- [ ] Data isolation enforced
- [ ] File upload validation
- [ ] Session management secure
- [ ] Password requirements enforced

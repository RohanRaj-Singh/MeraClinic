# Mera Clinic - Multi-Tenancy

## Overview

Mera Clinic uses a **shared database, shared schema** multi-tenancy approach. Each clinic (doctor's practice) is a tenant, and all data is isolated by `clinic_id`.

## Tenancy Model

```
┌─────────────────────────────────────────────────────────────┐
│                      MySQL Database                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   clinics table                       │  │
│  │  id | name | slug | subscription | is_active         │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│         ┌────────────────────┼────────────────────┐        │
│         ▼                    ▼                    ▼        │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│  │ Clinic 1    │     │ Clinic 2    │     │ Clinic 3    │   │
│  │ patients    │     │ patients    │     │ patients    │   │
│  │ visits      │     │ visits      │     │ visits      │   │
│  │ reports     │     │ reports     │     │ reports     │   │
│  │ files       │     │ files       │     │ files       │   │
│  └─────────────┘     └─────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Database Isolation

### clinic_id Column

Every data table includes a `clinic_id` foreign key:

```php
// All tables must have clinic_id
$table->foreignId('clinic_id')->constrained()->onDelete('cascade');
```

### Foreign Key Constraints

```php
// Patients belong to clinic
$table->foreignId('clinic_id')
    ->constrained('clinics')
    ->onDelete('cascade')
    ->onUpdate('cascade');
```

## Automatic Filtering

### Global Scope

All models automatically filter by current clinic:

```php
// app/Models/Patient.php
class Patient extends BaseModel
{
    protected $fillable = [
        'clinic_id',
        'user_id',
        'name',
        'phone',
        'whatsapp',
        'address',
        'country',
        'date_of_birth',
        'gender',
        'notes'
    ];
}
```

```php
// app/Models/BaseModel.php
abstract class BaseModel extends Model
{
    protected static function booted()
    {
        static::addGlobalScope('clinic', function (Builder $builder) {
            // Skip for super admin
            if (auth()->check() && auth()->user()->role !== 'super_admin') {
                $builder->where('clinic_id', auth()->user()->clinic_id);
            }
        });
    }
}
```

## Scopes

### Clinic Scope

```php
// In any model
public function scopeForClinic($query, $clinicId)
{
    return $query->where('clinic_id', $clinicId);
}
```

### Usage

```php
// Get patients for current clinic
$patients = Patient::all();

// Get patients for specific clinic (super admin)
$patients = Patient::withoutGlobalScope('clinic')
    ->forClinic($clinicId)
    ->get();
```

## User-Clinic Relationship

### User Belongs to Clinic

```php
// app/Models/User.php
class User extends Authenticatable
{
    public function clinic()
    {
        return $this->belongsTo(Clinic::class);
    }
}
```

### Accessing Clinic Data

```php
// Get current user's clinic
$clinic = auth()->user()->clinic;

// Get clinic ID
$clinicId = auth()->user()->clinic_id;
```

## Query Examples

### Standard Queries (Doctor)

```php
// Get all patients for current doctor
$patients = Patient::all();

// Get visits for today
$visits = Visit::where('visit_date', today())->get();

// Get patient visits
$visits = Visit::where('patient_id', $patientId)->get();
```

### Admin Queries (Super Admin)

```php
// Get all patients across all clinics
$patients = Patient::withoutGlobalScope('clinic')->get();

// Get patients for specific clinic
$patients = Patient::withoutGlobalScope('clinic')
    ->where('clinic_id', $clinicId)
    ->get();

// Get all clinics
$clinics = Clinic::all();
```

## Middleware

### Clinic Middleware

```php
// app/Http/Middleware/EnsureClinicIsActive.php
public function handle($request, Closure $next)
{
    $user = $request->user();
    
    if (!$user) {
        return response()->json(['message' => 'Unauthenticated'], 401);
    }
    
    // Super admin can access everything
    if ($user->role === 'super_admin') {
        return $next($request);
    }
    
    // Check clinic is active
    if ($user->clinic && !$user->clinic->is_active) {
        return response()->json([
            'message' => 'Clinic is inactive',
            'code' => 'CLINIC_INACTIVE'
        ], 403);
    }
    
    return $next($request);
}
```

### Apply Middleware

```php
// routes/api.php
Route::middleware(['auth:sanctum', 'clinic.active'])->group(function () {
    // Protected routes
});
```

## Data Seeders

### Clinic Seeder

```php
// database/seeders/ClinicSeeder.php
public function run()
{
    // Create demo clinic
    $clinic = Clinic::create([
        'name' => 'Demo Clinic',
        'slug' => 'demo-clinic',
        'email' => 'demo@meraclinic.com',
        'phone' => '+92-300-1234567',
        'address' => 'Demo Address, Pakistan',
        'subscription_status' => 'trial',
        'subscription_expires_at' => now()->addDays(14),
        'is_active' => true
    ]);
    
    // Create admin user for clinic
    User::create([
        'clinic_id' => $clinic->id,
        'name' => 'Demo Doctor',
        'email' => 'doctor@demo.com',
        'password' => Hash::make('password'),
        'role' => 'doctor',
        'phone' => '+92-300-1234567'
    ]);
}
```

## Subscription Management

### Status Types

```php
enum ClinicSubscription: string
{
    case TRIAL = 'trial';
    case ACTIVE = 'active';
    case EXPIRED = 'expired';
    case CANCELLED = 'cancelled';
}
```

### Subscription Check

```php
public function isSubscriptionActive(): bool
{
    return in_array($this->subscription_status, ['trial', 'active'])
        && $this->subscription_expires_at > now();
}
```

### Access Control by Subscription

```php
public function handle($request, Closure $next)
{
    $user = $request->user();
    
    if ($user->role !== 'super_admin') {
        $clinic = $user->clinic;
        
        if (!$clinic->isSubscriptionActive()) {
            return response()->json([
                'message' => 'Subscription expired',
                'code' => 'SUBSCRIPTION_EXPIRED'
            ], 403);
        }
    }
    
    return $next($request);
}
```

## Data Migration

### Adding clinic_id to Existing Table

```php
// database/migrations/xxxx_xx_xx_add_clinic_id_to_table.php
public function up()
{
    Schema::table('patients', function (Blueprint $table) {
        $table->foreignId('clinic_id')
            ->constrained('clinics')
            ->onDelete('cascade');
        
        $table->index('clinic_id');
    });
}
```

## Best Practices

1. **Always include clinic_id** in all data tables
2. **Use global scopes** for automatic filtering
3. **Skip scope for super admin** - they need access to all data
4. **Use foreign key constraints** for data integrity
5. **Index clinic_id** for query performance
6. **Cascade delete** - when clinic is deleted, delete all related data

## Tenancy Verification

### Test Queries

```php
// Should return only current clinic's patients
public function test_patients_isolated_by_clinic()
{
    $clinic1 = Clinic::create(['name' => 'Clinic 1', 'slug' => 'clinic-1', 'email' => 'c1@test.com']);
    $clinic2 = Clinic::create(['name' => 'Clinic 2', 'slug' => 'clinic-2', 'email' => 'c2@test.com']);
    
    $user1 = User::create(['clinic_id' => $clinic1->id, 'name' => 'User 1', 'email' => 'u1@test.com', 'password' => 'xxx']);
    $user2 = User::create(['clinic_id' => $clinic2->id, 'name' => 'User 2', 'email' => 'u2@test.com', 'password' => 'xxx']);
    
    Patient::create(['clinic_id' => $clinic1->id, 'user_id' => $user1->id, 'name' => 'Patient 1']);
    Patient::create(['clinic_id' => $clinic2->id, 'user_id' => $user2->id, 'name' => 'Patient 2']);
    
    // As user 1, should only see Patient 1
    Auth::login($user1);
    $this->assertEquals(1, Patient::count());
}
```

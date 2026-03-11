# Mera Clinic - Backend Architecture

## Clean Architecture

The backend follows **Clean Architecture** with clear layer separation:

```
┌─────────────────────────────────────────┐
│        Controllers (HTTP Layer)         │
│   Handle requests, validate, respond   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│        Services (Business Logic)        │
│   Business rules, orchestration         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Repositories (Data Access)         │
│   Database queries, data retrieval      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Models (Domain Entities)        │
│   Data structures, relationships        │
└─────────────────────────────────────────┘
```

---

## Directory Structure

```
backend/
├── app/
│   ├── Console/
│   ├── Exceptions/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       └── V1/
│   │   │           ├── Auth/
│   │   │           │   ├── AuthController.php
│   │   │           │   └── OtpController.php
│   │   │           ├── Patients/
│   │   │           │   ├── PatientController.php
│   │   │           │   └── PatientRequest.php
│   │   │           ├── Visits/
│   │   │           │   ├── VisitController.php
│   │   │           │   └── VisitRequest.php
│   │   │           └── Admin/
│   │   │               └── ClinicController.php
│   │   ├── Middleware/
│   │   │   ├── Authenticate.php
│   │   │   ├── VerifyOtp.php
│   │   │   └── CheckClinicStatus.php
│   │   └── Requests/          ← Form Requests
│   ├── Services/              ← Business Logic
│   │   ├── AuthService.php
│   │   ├── PatientService.php
│   │   ├── VisitService.php
│   │   ├── ReportService.php
│   │   ├── FileService.php
│   │   └── ClinicService.php
│   ├── Repositories/          ← Data Access
│   │   ├── PatientRepository.php
│   │   ├── VisitRepository.php
│   │   ├── ReportRepository.php
│   │   └── FileRepository.php
│   ├── Models/
│   │   ├── BaseModel.php
│   │   ├── Clinic.php
│   │   ├── User.php
│   │   ├── Patient.php
│   │   ├── Visit.php
│   │   ├── Report.php
│   │   └── File.php
│   ├── Traits/
│   │   ├── HasClinicScope.php
│   │   └── HasAuditLog.php
│   └── Providers/
├── config/
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
├── lang/
│   ├── en/
│   └── ur/
├── routes/
│   └── api.php
└── tests/
```

---

## Controller Rules

### Maximum Lines: 150

Controllers MUST be thin. They only:
- Handle HTTP requests
- Validate input
- Call services
- Return responses

### Example: PatientController

```php
<?php

namespace App\Http\Controllers\Api\V1\Patients;

use App\Http\Controllers\Controller;
use App\Http\Requests\PatientStoreRequest;
use App\Http\Requests\PatientUpdateRequest;
use App\Http\Resources\PatientResource;
use App\Services\PatientService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function __construct(
        private PatientService $patientService
    ) {}

    /**
     * List all patients
     * GET /api/v1/patients
     */
    public function index(Request $request): JsonResponse
    {
        $patients = $this->patientService->getAll(
            perPage: $request->get('per_page', 15),
            search: $request->get('search')
        );

        return response()->json([
            'success' => true,
            'message' => 'Patients retrieved',
            'data' => PatientResource::collection($patients),
            'meta' => pagination($patients)
        ]);
    }

    /**
     * Create new patient
     * POST /api/v1/patients
     */
    public function store(PatientStoreRequest $request): JsonResponse
    {
        $patient = $this->patientService->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Patient created',
            'data' => new PatientResource($patient)
        ], 201);
    }

    /**
     * Get single patient
     * GET /api/v1/patients/{id}
     */
    public function show(int $id): JsonResponse
    {
        $patient = $this->patientService->getById($id);

        return response()->json([
            'success' => true,
            'message' => 'Patient retrieved',
            'data' => new PatientResource($patient)
        ]);
    }

    /**
     * Update patient
     * PUT /api/v1/patients/{id}
     */
    public function update(PatientUpdateRequest $request, int $id): JsonResponse
    {
        $patient = $this->patientService->update($id, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Patient updated',
            'data' => new PatientResource($patient)
        ]);
    }

    /**
     * Delete patient
     * DELETE /api/v1/patients/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $this->patientService->delete($id);

        return response()->json([
            'success' => true,
            'message' => 'Patient deleted'
        ]);
    }
}
```

---

## Service Layer

### Maximum Responsibility

Services handle ALL business logic:
- Data validation
- Business rules
- Calculations
- External integrations
- Audit logging

### Example: PatientService

```php
<?php

namespace App\Services;

use App\Models\Patient;
use App\Repositories\PatientRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PatientService
{
    public function __construct(
        private PatientRepository $patientRepository
    ) {}

    /**
     * Get all patients with filtering
     */
    public function getAll(array $params = []): \LengthAwarePaginator
    {
        return $this->patientRepository->getAll($params);
    }

    /**
     * Get patient by ID
     */
    public function getById(int $id): Patient
    {
        return $this->patientRepository->getById($id);
    }

    /**
     * Create new patient
     */
    public function create(array $data): Patient
    {
        return DB::transaction(function () use ($data) {
            $data['clinic_id'] = Auth::user()->clinic_id;
            $data['user_id'] = Auth::id();

            $patient = $this->patientRepository->create($data);

            // Handle diseases
            if (!empty($data['diseases'])) {
                $patient->diseases()->sync($data['diseases']);
            }

            // Log audit
            audit_log('patient.created', "Created patient: {$patient->name}");

            return $patient;
        });
    }

    /**
     * Update patient
     */
    public function update(int $id, array $data): Patient
    {
        $patient = $this->getById($id);

        return DB::transaction(function () use ($patient, $data) {
            $patient->update($data);

            if (isset($data['diseases'])) {
                $patient->diseases()->sync($data['diseases']);
            }

            audit_log('patient.updated', "Updated patient: {$patient->name}");

            return $patient->fresh();
        });
    }

    /**
     * Delete patient
     */
    public function delete(int $id): void
    {
        $patient = $this->getById($id);
        $name = $patient->name;

        $patient->delete();

        audit_log('patient.deleted', "Deleted patient: {$name}");
    }

    /**
     * Get patient balance
     */
    public function getBalance(int $id): array
    {
        $patient = $this->getById($id);

        $totals = $patient->visits()->selectRaw('
            SUM(total_amount) as total,
            SUM(received_amount) as received
        ')->first();

        return [
            'total' => $totals->total ?? 0,
            'received' => $totals->received ?? 0,
            'balance' => ($totals->total ?? 0) - ($totals->received ?? 0)
        ];
    }
}
```

---

## Repository Layer

### Single Responsibility

Repositories ONLY handle database queries:
- CRUD operations
- Query building
- Data retrieval
- Pagination

### Example: PatientRepository

```php
<?php

namespace App\Repositories;

use App\Models\Patient;
use Illuminate\Database\Eloquent\Builder;

class PatientRepository
{
    /**
     * Get all patients with filtering
     */
    public function getAll(array $params = []): \LengthAwarePaginator
    {
        $query = Patient::with(['user', 'diseases']);

        if (!empty($params['search'])) {
            $query->where(function ($q) use ($params) {
                $q->where('name', 'like', "%{$params['search']}%")
                  ->orWhere('phone', 'like', "%{$params['search']}%");
            });
        }

        return $query->latest()->paginate($params['per_page'] ?? 15);
    }

    /**
     * Get patient by ID
     */
    public function getById(int $id): Patient
    {
        return Patient::with(['user', 'diseases', 'visits'])
            ->findOrFail($id);
    }

    /**
     * Create patient
     */
    public function create(array $data): Patient
    {
        return Patient::create($data);
    }

    /**
     * Get patient by phone
     */
    public function getByPhone(string $phone): ?Patient
    {
        return Patient::where('phone', $phone)->first();
    }

    /**
     * Get patient count for clinic
     */
    public function getCount(): int
    {
        return Patient::count();
    }
}
```

---

## Model Layer

### Base Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

abstract class BaseModel extends Model
{
    /**
     * Global scope for clinic filtering
     */
    public static function boot(): void
    {
        parent::boot();

        static::addGlobalScope('clinic', function (Builder $builder) {
            // Skip for super_admin
            if (auth()->check() && auth()->user()->role !== 'super_admin') {
                $builder->where('clinic_id', auth()->user()->clinic_id);
            }
        });
    }

    /**
     * Scope to bypass clinic scope
     */
    public function scopeWithoutClinicScope(Builder $query): Builder
    {
        return $query->withoutGlobalScope('clinic');
    }
}
```

---

## Form Requests

Validation happens in Form Request classes:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PatientStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:patients,phone,NULL,id,clinic_id,' . $this->clinic_id,
            'whatsapp' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'country' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other',
            'notes' => 'nullable|string',
            'diseases' => 'nullable|array',
            'diseases.*' => 'exists:diseases,id'
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'clinic_id' => auth()->user()->clinic_id
        ]);
    }
}
```

---

## Middleware

### Essential Middleware

```php
// Authenticate - Verify Sanctum token
// VerifyOtp - Check OTP verification status
// CheckClinicStatus - Verify clinic is active
// RoleMiddleware - Check user role
```

---

## Error Handling

### Response Format

```php
// Success
return response()->json([
    'success' => true,
    'message' => 'Operation successful',
    'data' => $resource
], 200);

// Validation Error
return response()->json([
    'success' => false,
    'message' => 'Validation failed',
    'errors' => $validator->errors()
], 422);

// Not Found
return response()->json([
    'success' => false,
    'message' => 'Patient not found',
    'code' => 'NOT_FOUND'
], 404);

// Forbidden
return response()->json([
    'success' => false,
    'message' => 'Access denied',
    'code' => 'FORBIDDEN'
], 403);
```

---

## Coding Standards

### File Naming

- Controllers: `PascalCase` + Controller (PatientController)
- Services: `PascalCase` + Service (PatientService)
- Repositories: `PascalCase` + Repository (PatientRepository)
- Requests: `PascalCase` + Request (PatientStoreRequest)
- Resources: `PascalCase` + Resource (PatientResource)

### Method Naming

- `getAll()` - List with pagination
- `getById($id)` - Get single record
- `create(array $data)` - Create new record
- `update($id, array $data)` - Update record
- `delete($id)` - Delete record

# Mera Clinic - Architecture Rules

## Clean Architecture

### Backend Layers

```
┌────────────────────────────────────┐
│  Controllers (HTTP Layer)          │
│  - Handle requests                 │
│  - Validate input                  │
│  - Return responses                │
│  - Max 150 lines                   │
└────────────────────────────────────┘
                ↓
┌────────────────────────────────────┐
│  Services (Business Logic)         │
│  - All business rules              │
│  - Orchestration                   │
│  - Calculations                    │
│  - External integrations           │
└────────────────────────────────────┘
                ↓
┌────────────────────────────────────┐
│  Repositories (Data Access)        │
│  - Database queries                │
│  - Query building                  │
│  - Data retrieval                  │
│  - No business logic               │
└────────────────────────────────────┘
                ↓
┌────────────────────────────────────┐
│  Models (Domain Entities)          │
│  - Data structures                 │
│  - Relationships                   │
│  - Scopes                          │
└────────────────────────────────────┘
```

---

## Backend Rules

### Controllers

**Responsibilities:**
- Receive HTTP requests
- Validate with Form Requests
- Call services
- Return JSON responses

**Constraints:**
- Max 150 lines
- No business logic
- Inject services via constructor

**Example:**
```php
class PatientController extends Controller
{
    public function __construct(
        private PatientService $service
    ) {}
    
    public function index(Request $request)
    {
        $patients = $this->service->getAll($request->all());
        return PatientResource::collection($patients);
    }
}
```

---

### Services

**Responsibilities:**
- All business logic
- Data validation
- Calculations
- Orchestration
- Audit logging
- External integrations

**Constraints:**
- No HTTP requests
- No direct DB queries (use repositories)
- Single responsibility per service

**Example:**
```php
class PatientService
{
    public function __construct(
        private PatientRepository $repo
    ) {}
    
    public function create(array $data): Patient
    {
        // Validation
        $this->validatePhone($data['phone'], $data['clinic_id'] ?? null);
        
        // Business logic
        $patient = $this->repo->create($data);
        
        // Audit
        audit_log('patient.created', "Created: {$patient->name}");
        
        return $patient;
    }
}
```

---

### Repositories

**Responsibilities:**
- Database queries
- Query building
- Data retrieval
- Pagination
- Eager loading

**Constraints:**
- No business logic
- No validation
- Only data access

**Example:**
```php
class PatientRepository
{
    public function getAll(array $params = []): LengthAwarePaginator
    {
        return Patient::with(['user'])
            ->when($params['search'] ?? null, fn($q, $search) => 
                $q->where('name', 'like', "%$search%")
            )
            ->latest()
            ->paginate($params['per_page'] ?? 15);
    }
}
```

---

## Frontend Rules

### Pages (Screens)

**Responsibilities:**
- Layout structure
- Component composition
- Data display

**Constraints:**
- Max 150 lines
- Thin - delegate to hooks
- Use existing components

**Example:**
```tsx
export default function PatientsIndex({ patients }) {
  return (
    <>
      <Head title="Patients" />
      <PageHeader title="Patients" />
      <DataTable data={patients.data} columns={columns} />
    </>
  );
}
```

---

### Components (Reusable)

**Responsibilities:**
- Single UI purpose
- Handle own state
- Accept props

**Constraints:**
- Reusable across app
- Single responsibility
- No direct API calls

---

### Hooks (Business Logic)

**Responsibilities:**
- State management
- API calls
- Business logic
- Data transformation

**Constraints:**
- Single purpose
- Reusable
- No JSX

**Example:**
```ts
export function usePatients() {
  const query = useQuery({
    queryKey: ['patients'],
    queryFn: patientService.list,
  });
  
  return { patients: query.data, isLoading: query.isLoading };
}
```

---

## Database Rules

### Multi-Tenancy

- Every table has `clinic_id` column
- Global scopes automatically filter by clinic
- Super admin bypasses scope
- Super admin cannot access patient data

### Indexes

```sql
-- Required indexes
patients: (clinic_id, phone) UNIQUE
patients: (clinic_id, name)
visits: (clinic_id, visit_date)
visits: (patient_id)
files: (patient_id)
files: (visit_id)
```

### Relationships

- clinic → users, patients, visits, etc.
- user → clinic, patients, visits
- patient → clinic, visits, reports, files
- visit → patient, user, reports, files

---

## API Rules

### RESTful Design

| Method | Endpoint | Action |
|--------|----------|--------|
| GET | /patients | List |
| POST | /patients | Create |
| GET | /patients/{id} | Show |
| PUT | /patients/{id} | Update |
| DELETE | /patients/{id} | Delete |

### Response Format

```json
{
  "success": true,
  "message": "Operation message",
  "data": { ... },
  "meta": { "pagination": {...} }
}
```

---

## Security Rules

### Authentication
- Token in Authorization header
- Bearer token (Sanctum)
- Token in localStorage (SPA)

### Authorization
- Role middleware
- clinic_id filtering
- Super admin restrictions

### Audit
- Log all CRUD operations
- Include IP, device, user
- Immutable logs

---

## File Structure Rules

### Backend
```
app/
├── Http/Controllers/Api/V1/{Feature}/
│   ├── FeatureController.php
│   └── FeatureRequest.php
├── Services/
│   └── FeatureService.php
├── Repositories/
│   └── FeatureRepository.php
├── Models/
│   └── Feature.php
└── Http/Resources/
    └── FeatureResource.php
```

### Frontend
```
src/
├── pages/{Feature}/
│   ├── Index.tsx
│   ├── Show.tsx
│   └── Create.tsx
├── components/{feature}/
│   └── FeatureForm.tsx
├── hooks/
│   └── useFeature.ts
├── services/
│   └── feature.service.ts
└── types/
    └── feature.ts
```

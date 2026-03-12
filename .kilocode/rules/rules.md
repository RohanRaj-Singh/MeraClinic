# Mera Clinic - Development Rules

This document contains the comprehensive rules and guidelines for developing the Mera Clinic application. All AI assistants and developers must follow these rules when working on this project.

---

## 1. Project Overview

**Mera Clinic** is a mobile-first SaaS patient management system for doctors and hakeems in Pakistan.

| Attribute | Value |
|-----------|-------|
| **Product Name** | Mera Clinic (میرا کلینک) |
| **Tagline** | Your Digital Clinic Register (آپ کے کلینک کا ڈیجیٹل رجسٹر) |
| **Backend** | Laravel 11, PHP 8.3, MySQL |
| **Frontend** | React 18, Vite, TailwindCSS, TypeScript |
| **Auth** | Laravel Sanctum (Token-based) |
| **Multi-tenancy** | Shared database, shared schema |

---

## 2. Technology Stack

### Backend Requirements
- **Framework**: Laravel 11
- **PHP**: 8.3+
- **Database**: MySQL 8.0
- **Authentication**: Laravel Sanctum
- **API Version**: RESTful JSON API v1

### Frontend Requirements
- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Context + React Query
- **UI Components**: ShadCN UI

---

## 3. Brand Identity

### Color Palette

| Name | Hex Code | Usage |
|------|----------|-------|
| Primary | #2E7D32 | Buttons, headers, main actions |
| Primary Dark | #1B5E20 | Hover states |
| Primary Light | #4CAF50 | Highlights, success |
| Secondary | #81C784 | Accents, tags, badges |
| Accent | #1565C0 | Links, information |
| Background | #F7FAF8 | Page background |
| Surface | #FFFFFF | Cards, modals |
| Success | #2E7D32 | Success messages |
| Warning | #F57C00 | Warnings |
| Error | #D32F2F | Errors |
| Icon Gradient | #38C6A7 → #0F8B74 | Logo, badges |

### Typography

| Language | Font | Usage |
|----------|------|-------|
| English | Inter | Headings, buttons, navigation, dashboard |
| Urdu | Noto Nastaliq Urdu | Urdu translations, labels |

### Touch Targets
- **Minimum**: 44x44px
- **Recommended**: 48x48px
- **Primary actions**: Full-width on mobile

---

## 4. Architecture Rules

### Clean Architecture Layers (Backend)

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

### Code Size Limits
- **Controllers**: Maximum 150 lines
- **React Pages**: Maximum 150 lines
- **Functions**: Keep under 30 lines when possible

---

## 5. Backend Rules (Laravel)

### Controller Pattern
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

### Service Pattern
```php
class PatientService
{
    public function __construct(
        private PatientRepository $repo
    ) {}
    
    public function create(array $data): Patient
    {
        $this->validatePhone($data['phone'], $data['clinic_id'] ?? null);
        $patient = $this->repo->create($data);
        audit_log('patient.created', "Created: {$patient->name}");
        return $patient;
    }
}
```

### Repository Pattern
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

### Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": { "pagination": {...} }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": { "field": ["error"] },
  "code": "ERROR_CODE"
}
```

### Routes
- Use `/api/v1/` prefix
- Use `apiResource` for CRUD operations
- Apply auth middleware
- Group by feature

---

## 6. Frontend Rules (React)

### Page Pattern
```tsx
export default function PageName({ data }) {
  return (
    <>
      <Head title="Page Title" />
      <div className="container">
        <PageHeader title="Title" />
        <DataTable data={data} columns={columns} />
      </div>
    </>
  );
}
```

### Component Pattern
```tsx
interface Props {
  prop1: string;
  prop2?: number;
}

export function ComponentName({ prop1, prop2 }: Props) {
  // Hooks first
  // Then JSX
  
  return (
    <div className="component">
      {/* JSX */}
    </div>
  );
}
```

### Hook Pattern
```ts
export function useSomething() {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['something'],
    queryFn: () => service.get(),
  });
  
  const mutation = useMutation({
    mutationFn: (data) => service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['something'] });
    },
  });
  
  return { query, mutation };
}
```

### Service Pattern
```ts
export const serviceName = {
  list: (params?: Params) => 
    api.get<Response>('/endpoint', { params }),
    
  create: (data: Dto) => 
    api.post<Response>('/endpoint', data),
    
  update: (id: string, data: Dto) => 
    api.put<Response>(`/endpoint/${id}`, data),
    
  delete: (id: string) => 
    api.delete(`/endpoint/${id}`),
};
```

---

## 7. Multi-Tenancy Rules

### Database Isolation
- **ALL** tables MUST have `clinic_id` foreign key
- **ALL** queries MUST filter by current user's `clinic_id`
- Use global scopes for automatic filtering
- Super admin can bypass scope (check role)
- Foreign key constraints with cascade delete

### Global Scope Implementation
```php
abstract class BaseModel extends Model
{
    protected static function booted()
    {
        static::addGlobalScope('clinic', function (Builder $builder) {
            if (auth()->check() && auth()->user()->role !== 'super_admin') {
                $builder->where('clinic_id', auth()->user()->clinic_id);
            }
        });
    }
}
```

### Super Admin Rules
- Super admin bypasses clinic scope
- **NEVER** expose patient medical data to super admins
- Use `withoutGlobalScope()` only when explicitly needed

---

## 8. Security Rules

### Authentication
- Token-based (Laravel Sanctum)
- Token in Authorization header: `Bearer {token}`
- Token expires in 1 year (configurable)
- OTP required for suspicious activity

### OTP Requirements
OTP is required when:
1. **IP Change**: Login from different IP
2. **Time Gap**: No login for 3+ days
3. **Device Change**: New device/browser

### Authorization Roles

| Role | Permissions |
|------|-------------|
| super_admin | Manage all clinics, subscriptions, passwords - **NO patient data access** |
| admin | Full clinic access |
| doctor | Own clinic data |

### File Upload Rules
- **Max size**: 10MB
- **Allowed types**: jpg, jpeg, png, pdf
- Store in clinic-specific directory: `clinic_{id}/patients/{patient_id}/`
- Use UUID-based filenames

### Rate Limiting
- Authenticated: 60 requests/minute
- Unauthenticated: 20 requests/minute

### Audit Logging
Log all:
- User login/logout
- Patient CRUD
- Visit CRUD
- Report access
- File upload/download
- Settings changes

---

## 9. API Standards

### Base URL
```
Development: http://localhost:8000/api/v1
Production: https://api.meraclinic.com/v1
```

### Required Headers
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
X-Locale: en|ur
```

### Pagination
- Default: 15 items
- Max: 100 items

### Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Request validation failed |
| UNAUTHENTICATED | Not logged in |
| FORBIDDEN | No permission |
| NOT_FOUND | Resource not found |
| OTP_REQUIRED | OTP verification needed |
| OTP_INVALID | Wrong OTP |
| DUPLICATE_PHONE | Phone already exists |

---

## 10. Business Rules

### Patient Rules
1. **Name** is required
2. **Phone** is required
3. **Phone** must be unique within the clinic
4. **Reference Number** auto-generated: `{PREFIX}-{NUMBER}` (e.g., MC-0001)
5. **Reference Counter** auto-increments per clinic
6. **Country** defaults to "Pakistan"
7. **Date of birth** must be in the past
8. **Gender** must be: male, female, or other
9. Soft delete only

### Visit Rules
1. **Patient** is required
2. **Visit date** defaults to today
3. **Total amount** defaults to 0
4. **Received amount** defaults to 0
5. Visit number auto-increments per patient
6. Balance = total_amount - received_amount

### Financial Rules
- Amounts stored as decimal(10,2)
- Currency: PKR (Pakistani Rupees)
- Display format: ₨ 1,234.00

### Payment Status

| Status | Condition |
|--------|-----------|
| Unpaid | received_amount = 0 |
| Partial | 0 < received_amount < total_amount |
| Paid | received_amount >= total_amount |

---

## 11. Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Controllers | PascalCase + Controller | PatientController |
| Services | PascalCase + Service | PatientService |
| Repositories | PascalCase + Repository | PatientRepository |
| Models | PascalCase | Patient, Visit |
| Components | PascalCase | PatientForm |
| Hooks | camelCase, use prefix | usePatients |
| Services (Frontend) | camelCase | patientService |
| Types | PascalCase | Patient, Visit |
| Files | kebab-case | patient-form.tsx |

---

## 12. Code Quality Rules

### DRY (Don't Repeat Yourself)
- Extract common logic to hooks or utilities
- Reuse components
- Use inheritance for similar models

### YAGNI (You Aren't Gonna Need It)
- Don't add features until needed
- Keep code simple first
- Refactor when necessary

### SOLID Principles
- **S**: Single responsibility
- **O**: Open/closed
- **L**: Liskov substitution
- **I**: Interface segregation
- **D**: Dependency inversion

### Git Rules

**Commit Messages:**
```
feat: add patient search
fix: resolve visit date validation
docs: update API contract
refactor: extract patient service
```

**Branch Naming:**
```
feature/patient-search
fix/visit-validation
hotfix/security-patch
```

---

## 13. Mobile-First Rules

### Responsive Breakpoints

| Name | Width | Description |
|------|-------|-------------|
| xs | < 640px | Mobile phones |
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Laptops |
| xl | 1280px | Desktops |

### Navigation
- Mobile: Bottom tab bar
- Desktop: Sidebar

### Responsive Classes
```tsx
// Mobile first
<div className="w-full md:w-1/2 lg:w-1/3">

// Bottom nav (mobile only)
<nav className="md:hidden">...</nav>

// Sidebar (desktop only)
<aside className="hidden md:block">...</aside>
```

---

## 14. Language Support

### Supported Languages
- **English (en)** - LTR - Default
- **Urdu (ur)** - RTL

### Translation Scope
- All UI text
- Error messages
- Validation messages
- Button labels
- Placeholders

---

## 15. Performance Rules

### Database
- Index on clinic_id, user_id, patient_id
- Index on (clinic_id, phone) for patients
- Eager load relationships

### Frontend
- Lazy load routes
- Optimize images before upload
- Cache with React Query

---

## 16. File Structure

### Backend
```
backend/
├── app/
│   ├── Http/Controllers/Api/V1/
│   │   └── {Feature}/
│   │       ├── FeatureController.php
│   │       └── FeatureRequest.php
│   ├── Services/
│   │   └── FeatureService.php
│   ├── Repositories/
│   │   └── FeatureRepository.php
│   ├── Models/
│   │   └── Feature.php
│   └── Http/Resources/
│       └── FeatureResource.php
├── routes/api.php
└── database/migrations/
```

### Frontend
```
frontend/src/
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
├── types/
│   └── feature.ts
└── lib/api.ts
```

---

## 17. Environment Variables

### Backend (.env)
```
APP_NAME="Mera Clinic"
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mera_clinic
DB_USERNAME=root
DB_PASSWORD=
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```

---

## 18. Security Checklist

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

---

## 19. Important Patterns

### Patient Reference Numbers
- Format: `{PREFIX}-{0000}` (e.g., "MC-0001")
- Each clinic has independent counter
- Configurable prefix per clinic

### API Versioning
- All endpoints prefixed with `/api/v1/`
- JSON responses only

### Clean Architecture Flow
- Controller → Service → Repository → Model
- Max 150 lines per controller
- Business logic in Services only

---

*Last Updated: 2026-03-11*
*Version: 1.0*

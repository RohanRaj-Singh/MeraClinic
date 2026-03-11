# Mera Clinic - Coding Rules

## General Rules

### Code Limits
- **Controllers**: Maximum 150 lines
- **React Pages**: Maximum 150 lines
- **Functions**: Keep small, single responsibility
- **Classes**: Single responsibility principle

### Naming Conventions

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

## Backend Rules (Laravel)

### Controller Pattern

```php
<?php

namespace App\Http\Controllers\Api\V1\Patients;

use App\Http\Controllers\Controller;
use App\Http\Requests\PatientStoreRequest;
use App\Http\Resources\PatientResource;
use App\Services\PatientService;
use Illuminate\Http\JsonResponse;

class PatientController extends Controller
{
    public function __construct(
        private PatientService $patientService
    ) {}

    // Methods: index, store, show, update, destroy
    // Each method should be < 30 lines
}
```

### Service Pattern

```php
<?php

namespace App\Services;

use App\Repositories\PatientRepository;
use Illuminate\Support\Facades\Auth;

class PatientService
{
    public function __construct(
        private PatientRepository $patientRepository
    ) {}

    // All business logic here
    // No direct DB queries
}
```

### Repository Pattern

```php
<?php

namespace App\Repositories;

use App\Models\Patient;

class PatientRepository
{
    // Only DB queries
    // No business logic
}
```

### Request Validation

- Use Form Request classes
- Keep validation rules in request class
- Use prepareForValidation() for data transformation

### Response Format

```php
// Success
return response()->json([
    'success' => true,
    'message' => 'Operation message',
    'data' => new PatientResource($patient)
], 201);

// Error
return response()->json([
    'success' => false,
    'message' => 'Error message',
    'errors' => $validator->errors()
], 422);
```

---

## Frontend Rules (React)

### Page Pattern

```tsx
import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { columns } from './columns';

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
  // Define props interface
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
import api from '@/lib/api';

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

## Mobile-First Rules

### Touch Targets
- Minimum: 44x44px
- Primary actions: Full-width on mobile

### Responsive Classes
```tsx
// Mobile first
<div className="w-full md:w-1/2 lg:w-1/3">

// Bottom nav (mobile only)
<nav className="md:hidden">...</nav>

// Sidebar (desktop only)
<aside className="hidden md:block">...</aside>
```

### Navigation
- Mobile: Bottom tab bar
- Desktop: Sidebar

---

## Code Quality Rules

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

---

## Comment Rules

- Explain WHY, not WHAT
- Document complex business logic
- Use TODO for future work
- Keep comments updated

---

## Git Rules

### Commit Messages
```
feat: add patient search
fix: resolve visit date validation
docs: update API contract
refactor: extract patient service
```

### Branch Naming
```
feature/patient-search
fix/visit-validation
hotfix/security-patch
```

---

## Testing Rules

- Test critical business logic
- Test edge cases
- Test error handling
- Minimum: Unit tests for services

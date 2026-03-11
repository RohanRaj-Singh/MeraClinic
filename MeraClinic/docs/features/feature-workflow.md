# Feature Workflow

## Overview

This document defines the workflow for implementing new features in Mera Clinic.

---

## Feature Workflow

### Step 1: Create Feature Document

Before implementing any feature, create a feature document:

```
docs/features/feature-name.md
```

### Feature Document Template

```markdown
# Feature Name

## Overview
Brief description of the feature.

## Business Rules
1. Rule 1
2. Rule 2
3. Rule 3

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /resource | List |
| POST | /resource | Create |

## UI Components
- Component1
- Component2

## Database Impact
- Table: table_name
- Changes: description
```

---

## Implementation Order

Always implement in this order:

### 1. Backend Service
```
backend/app/Services/FeatureService.php
```
- All business logic
- Data validation
- Calculations

### 2. Repository
```
backend/app/Repositories/FeatureRepository.php
```
- Database queries
- Data retrieval

### 3. Controller
```
backend/app/Http/Controllers/Api/V1/Feature/FeatureController.php
```
- HTTP request handling
- Response formatting
- Max 150 lines

### 4. API Endpoint
```
backend/routes/api.php
```
- Route definition
- Middleware

### 5. Frontend Service
```
frontend/src/services/feature.service.ts
```
- API calls
- Type definitions

### 6. UI Components
```
frontend/src/components/features/feature/
```
- Reusable components

### 7. Page Integration
```
frontend/src/pages/features/
```
- Page components

---

## Code Quality Rules

### Never Break Architecture

- **Controllers** MUST only handle HTTP requests
- **Business logic** MUST be in Services
- **Database queries** MUST go through Repositories

### Layer Responsibilities

```
Controller → calls → Service → uses → Repository → queries → Database
```

### Anti-Patterns to Avoid

```php
// ❌ BAD: Business logic in controller
public function store(Request $request)
{
    $patient = Patient::create([...]);
    $patient->diseases()->sync($request->diseases);
    audit_log('created');
}

// ✅ GOOD: Call service
public function store(PatientRequest $request)
{
    $patient = $this->patientService->create($request->validated());
    return new PatientResource($patient);
}
```

```php
// ❌ BAD: Query in service
public function create(array $data)
{
    $patient = Patient::create($data); // Direct query!
    return $patient;
}

// ✅ GOOD: Use repository
public function create(array $data)
{
    return $this->repository->create($data);
}
```

---

## Change Management

### Update Change Log

Every feature must update:

```
ai/change-log.md
```

### Change Log Entry

```markdown
## Version X.Y.Z - YYYY-MM-DD

### Feature: Feature Name

#### Added
- New feature description

#### Backend
- Created FeatureService
- Created FeatureRepository
- Created FeatureController

#### Frontend
- Created feature.service.ts
- Created FeatureForm component
- Created feature page

#### Database
- Created features table
```

---

## Feature Checklist

- [ ] Feature document created
- [ ] Backend Service implemented
- [ ] Repository implemented
- [ ] Controller implemented
- [ ] API endpoint added
- [ ] Frontend Service implemented
- [ ] UI Components created
- [ ] Page integration done
- [ ] Change log updated

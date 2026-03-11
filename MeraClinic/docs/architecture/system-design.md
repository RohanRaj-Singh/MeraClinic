# Mera Clinic - System Design

## Architecture Overview

Mera Clinic uses **Clean Architecture** with a clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│    (Controllers / Pages / Components)                      │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                         │
│    (Services / Use Cases / DTOs)                           │
├─────────────────────────────────────────────────────────────┤
│                    Domain Layer                              │
│    (Models / Entities / Business Rules)                     │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                      │
│    (Repositories / Database / External Services)           │
└─────────────────────────────────────────────────────────────┘
```

## Backend Architecture

### Clean Architecture Layers

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/V1/
│   │   │       ├── Auth/
│   │   │       ├── Patients/
│   │   │       ├── Visits/
│   │   │       └── Reports/
│   │   ├── Middleware/
│   │   └── Requests/
│   ├── Services/              ← Application Layer
│   │   ├── AuthService.php
│   │   ├── PatientService.php
│   │   ├── VisitService.php
│   │   └── ReportService.php
│   ├── Repositories/          ← Infrastructure Layer
│   │   ├── PatientRepository.php
│   │   ├── VisitRepository.php
│   │   └── ReportRepository.php
│   ├── Models/                ← Domain Layer
│   ├── Traits/
│   └── Providers/
├── database/
│   ├── migrations/
│   ├── factories/
│   └── seeders/
└── routes/
    └── api.php
```

### Data Flow

```
HTTP Request
    ↓
Controller (handle request, validate, respond)
    ↓
Service (business logic)
    ↓
Repository (database queries)
    ↓
Database (MySQL)
```

---

## Frontend Architecture

### Project Structure

```
frontend/src/
├── pages/              ← Screen components
│   ├── Patients/
│   │   ├── Index.tsx
│   │   ├── Show.tsx
│   │   └── Create.tsx
│   ├── Visits/
│   └── Dashboard/
├── components/         ← Reusable components
│   ├── ui/            ← ShadCN base components
│   ├── patients/      ← Patient-specific components
│   ├── visits/       ← Visit-specific components
│   └── layout/       ← Layout components
├── hooks/             ← Custom React hooks
│   ├── usePatients.ts
│   ├── useVisits.ts
│   └── useAuth.ts
├── services/          ← API services
│   ├── patient.service.ts
│   ├── visit.service.ts
│   └── auth.service.ts
├── store/             ← Zustand stores
│   ├── auth.store.ts
│   └── ui.store.ts
├── layouts/           ← Inertia layouts
│   ├── AppLayout.tsx
│   └── AuthLayout.tsx
├── utils/             ← Utility functions
│   ├── api.ts
│   └── helpers.ts
├── i18n/              ← Translations
│   ├── en/
│   └── ur/
└── types/             ← TypeScript types
    ├── patient.ts
    └── visit.ts
```

---

## Database Design

### Multi-Tenant Architecture

- **Shared Database**: All clinics share one MySQL database
- **Shared Schema**: All tables have `clinic_id` column
- **Data Isolation**: Queries automatically filter by `clinic_id`

### Tables

| Table | Purpose | Unique Constraint |
|-------|---------|-------------------|
| clinics | Tenants | slug |
| users | Doctors/Admins | email |
| patients | Patient records | clinic_id + phone |
| visits | Visit records | - |
| diseases | Disease tags | clinic_id + name |
| reports | Report records | - |
| report_types | Report definitions | clinic_id + name |
| files | File attachments | - |
| audit_logs | Activity tracking | - |

### Indexes

```sql
-- Essential indexes for performance
CREATE INDEX idx_patients_clinic_phone ON patients(clinic_id, phone);
CREATE INDEX idx_patients_clinic_name ON patients(clinic_id, name);
CREATE INDEX idx_visits_clinic_date ON visits(clinic_id, visit_date);
CREATE INDEX idx_visits_patient ON visits(patient_id);
CREATE INDEX idx_files_patient ON files(patient_id);
CREATE INDEX idx_files_visit ON files(visit_id);
```

---

## API Design

### RESTful Conventions

- **Base URL**: `/api/v1/`
- **Authentication**: Bearer token (Sanctum)
- **Content-Type**: `application/json`

### Endpoints

```
Authentication
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

Patients
GET    /api/v1/patients
POST   /api/v1/patients
GET    /api/v1/patients/{id}
PUT    /api/v1/patients/{id}
DELETE /api/v1/patients/{id}

Visits
POST   /api/v1/visits
GET    /api/v1/visits/{id}
PUT    /api/v1/visits/{id}
GET    /api/v1/patients/{id}/visits
GET    /api/v1/visits/today

Reports
GET    /api/v1/report-types
POST   /api/v1/report-types
POST   /api/v1/reports
GET    /api/v1/visits/{id}/reports

Files
POST   /api/v1/files
GET    /api/v1/visits/{id}/files

Admin
GET    /api/v1/admin/clinics
POST   /api/v1/admin/clinics
POST   /api/v1/admin/clinics/{id}/activate
POST   /api/v1/admin/clinics/{id}/deactivate
```

---

## Security Design

### Authentication Flow

```
1. User submits credentials
2. Server validates credentials
3. Server checks for suspicious activity:
   - IP address change?
   - Login after 3 days?
   - Device change?
4. If suspicious → Send OTP
5. User verifies OTP
6. Generate Sanctum token
7. Return token
```

### Data Protection

| Measure | Implementation |
|---------|---------------|
| Authentication | Laravel Sanctum |
| Authorization | Role-based (super_admin, admin, doctor) |
| Data Isolation | clinic_id filtering |
| Audit Logging | All CRUD operations logged |
| File Security | No direct path exposure |

---

## Mobile-First Design

### Responsive Strategy

```
Mobile (< 768px)     Tablet (768-1024px)    Desktop (> 1024px)
┌─────────────┐       ┌─────────────────┐    ┌─────────────────────┐
│ Bottom Nav  │       │ Side Nav        │    │ Side Nav            │
│ Full Width  │       │ Centered Content│    │ Centered Content   │
│ Large Touch │       │ Medium Touch    │    │ Standard Touch     │
│ Targets     │       │ Targets         │    │ Targets             │
└─────────────┘       └─────────────────┘    └─────────────────────┘
```

### Touch Targets

- Minimum: 44x44px
- Recommended: 48x48px
- Primary actions: Full-width on mobile

### Navigation

Bottom tab bar for mobile, sidebar for desktop.

---

## File Storage

### Local Storage Structure

```
storage/app/
├── clinic_{id}/
│   ├── patients/
│   │   └── {patient_id}/
│   │       ├── images/
│   │       │   └── {uuid}.jpg
│   │       └── documents/
│   │           └── {uuid}.pdf
│   └── temp/
└── public/
    └── uploads/         (symlink to storage/app/public)
```

### File Rules

- Max size: 10MB
- Allowed types: jpg, jpeg, png, pdf
- Organized by patient_id and visit_id

---

## Internationalization

### Languages

| Code | Language | Direction |
|------|----------|-----------|
| en | English | LTR |
| ur | Urdu | RTL |

### Implementation

- i18next for translations
- Inter font for English
- Noto Nastaliq Urdu for Urdu
- CSS direction based on locale

---

## Performance Considerations

### Backend

- Database indexes on frequently queried columns
- Eager loading relationships
- Pagination (15-50 records)
- Caching for static data (future: Redis)

### Frontend

- Inertia.js for SSR + CSR
- React Query for data caching
- Image compression before upload
- Lazy loading components

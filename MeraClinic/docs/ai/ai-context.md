# Mera Clinic - AI Context

## Project Overview
**Mera Clinic** is a mobile-first SaaS patient management system for doctors and hakeems in Pakistan. The system manages patients, visits, prescriptions, reports, file uploads, balances, and clinic subscriptions.

**Product Name:** Mera Clinic (آپ کے کلینک کا ڈیجیٹل رجسٹر)
**Tagline:** Your Digital Clinic Register

## Technology Stack

### Backend
- Laravel 11
- PHP 8.3
- MySQL
- Laravel Sanctum

### Frontend
- React 18
- Vite
- TailwindCSS
- React Context
- TypeScript

## Key Features

### Core Features
- Patient management with reference numbers (MC-0001 format)
- Visit tracking with payment management
- Disease tracking
- Lab report management (BP, CBC, Sugar, etc.)
- File uploads (images, PDFs)
- WhatsApp contact integration
- Dashboard with statistics

### Security
- Token-based authentication (Laravel Sanctum)
- OTP verification for login
- Audit logging
- IP/device tracking

### Multi-Tenancy
- Shared database, shared schema
- clinic_id on all data tables
- Data isolation between clinics

## Brand Identity

### Colors
| Name | Hex | Usage |
|------|-----|-------|
| Primary | #2E7D32 | Main actions |
| Secondary | #81C784 | Highlights |
| Accent | #1565C0 | Links |
| Background | #F7FAF8 | Page bg |

### Typography
- **Primary:** Inter (headings, UI)
- **Urdu:** Noto Nastaliq Urdu

## Current Implementation

### Backend Structure
```
backend/app/
├── Http/
│   ├── Controllers/Api/V1/
│   │   ├── AuthController.php
│   │   ├── PatientController.php
│   │   ├── VisitController.php
│   │   ├── DiseaseController.php
│   │   ├── ReportTypeController.php
│   │   ├── FileController.php
│   │   ├── DashboardController.php
│   │   └── ClinicController.php
│   └── Middleware/Role.php
├── Models/
│   ├── BaseModel.php
│   ├── Clinic.php
│   ├── User.php
│   ├── Patient.php
│   ├── Visit.php
│   ├── Disease.php
│   ├── ReportType.php
│   ├── Report.php
│   ├── File.php
│   ├── AuditLog.php
│   └── PatientDisease.php
└── Services/
    ├── AuthService.php
    ├── PatientService.php
    ├── VisitService.php
    ├── DiseaseService.php
    ├── ReportTypeService.php
    ├── FileService.php
    ├── DashboardService.php
    └── ClinicService.php
```

### Frontend Structure
```
frontend/src/
├── contexts/AuthContext.tsx
├── lib/api.ts
├── services/
│   ├── auth.ts
│   ├── patient.ts
│   ├── visit.ts
│   ├── dashboard.ts
│   └── index.ts
└── styles/globals.css
```

### Database Migrations
11 migrations created for:
1. clinics
2. users
3. patients
4. visits
5. diseases
6. patient_diseases
7. report_types
8. reports
9. files
10. audit_logs
11. personal_access_tokens

## Important Patterns

### Clean Architecture
- Controller → Service → Model flow
- Max 150 lines per controller
- Business logic in Services only

### API Versioning
- All endpoints prefixed with `/api/v1/`
- JSON responses only

### Patient Reference Numbers
- Format: `{PREFIX}-{0000}` (e.g., "MC-0001")
- Each clinic has independent counter
- Configurable prefix per clinic

## Supported Languages
- English (default)
- Urdu (RTL support)

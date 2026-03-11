# Mera Clinic - Project Structure

## Overview
Mera Clinic is a mobile-first SaaS patient management system for doctors and hakeems. Built with Laravel 11 (backend) and React (frontend).

## Technology Stack

### Backend
- **Framework:** Laravel 11
- **PHP:** 8.3
- **Database:** MySQL
- **Authentication:** Laravel Sanctum
- **API:** RESTful JSON API v1

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **State Management:** React Context + React Query
- **UI Components:** ShadCN UI

## Directory Structure

```
MeraClinic/
├── docs/                    # Project documentation
│   ├── api/                 # API contracts
│   ├── architecture/        # System architecture
│   ├── business-rules/      # Business rules
│   ├── features/           # Feature specifications
│   └── product/            # Product specifications
│
├── ai/                     # AI context and prompts
│   ├── prompts/            # Development prompts
│   ├── ai-context.md       # Project context for AI
│   ├── architecture-rules.md
│   ├── coding-rules.md
│   └── constraints.md
│
├── backend/                # Laravel application
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/V1/    # API v1 controllers
│   │   │   │       ├── AuthController.php
│   │   │   │       ├── PatientController.php
│   │   │   │       ├── VisitController.php
│   │   │   │       ├── DiseaseController.php
│   │   │   │       ├── ReportTypeController.php
│   │   │   │       ├── FileController.php
│   │   │   │       ├── DashboardController.php
│   │   │   │       └── ClinicController.php
│   │   │   │
│   │   │   └── Middleware/
│   │   │       └── Role.php
│   │   │
│   │   ├── Models/         # Eloquent models
│   │   │   ├── BaseModel.php
│   │   │   ├── Clinic.php
│   │   │   ├── User.php
│   │   │   ├── Patient.php
│   │   │   ├── Visit.php
│   │   │   ├── Disease.php
│   │   │   ├── ReportType.php
│   │   │   ├── Report.php
│   │   │   ├── File.php
│   │   │   ├── AuditLog.php
│   │   │   └── PatientDisease.php
│   │   │
│   │   └── Services/       # Business logic
│   │       ├── AuthService.php
│   │       ├── PatientService.php
│   │       ├── VisitService.php
│   │       ├── DiseaseService.php
│   │       ├── ReportTypeService.php
│   │       ├── FileService.php
│   │       ├── DashboardService.php
│   │       └── ClinicService.php
│   │
│   ├── bootstrap/           # Laravel bootstrap
│   ├── config/              # Configuration files
│   ├── database/
│   │   └── migrations/     # Database migrations
│   │       ├── 2024_01_01_000001_create_clinics_table.php
│   │       ├── 2024_01_01_000002_create_users_table.php
│   │       ├── 2024_01_01_000003_create_patients_table.php
│   │       ├── 2024_01_01_000004_create_visits_table.php
│   │       ├── 2024_01_01_000005_create_diseases_table.php
│   │       ├── 2024_01_01_000006_create_patient_diseases_table.php
│   │       ├── 2024_01_01_000007_create_report_types_table.php
│   │       ├── 2024_01_01_000008_create_reports_table.php
│   │       ├── 2024_01_01_000009_create_files_table.php
│   │       ├── 2024_01_01_000010_create_audit_logs_table.php
│   │       └── 2024_01_01_000011_create_personal_access_tokens_table.php
│   │
│   ├── routes/
│   │   └── api.php         # API routes
│   │
│   └── storage/            # Laravel storage
│
└── frontend/               # React application
    ├── src/
    │   ├── contexts/       # React contexts
    │   │   └── AuthContext.tsx
    │   │
    │   ├── lib/            # Utilities
    │   │   └── api.ts      # API client
    │   │
    │   ├── services/       # API services
    │   │   ├── auth.ts
    │   │   ├── patient.ts
    │   │   ├── visit.ts
    │   │   ├── dashboard.ts
    │   │   └── index.ts
    │   │
    │   ├── styles/        # Styles
    │   │   └── globals.css
    │   │
    │   ├── App.tsx        # Main app
    │   └── main.tsx       # Entry point
    │
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.ts
    └── tsconfig.json
```

## Brand Colors

| Name | Hex Code | Usage |
|------|----------|-------|
| Primary | #2E7D32 | Buttons, headers |
| Secondary | #81C784 | Accents, highlights |
| Accent | #1565C0 | Links, interactive |
| Background | #F7FAF8 | Page background |
| Icon Gradient | #38C6A7 → #0F8B74 | Logo, icons |

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new clinic
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/otp/verify` - Verify OTP
- `GET /api/v1/auth/me` - Get current user

### Patients
- `GET /api/v1/patients` - List patients
- `POST /api/v1/patients` - Create patient
- `GET /api/v1/patients/{id}` - Get patient
- `PUT /api/v1/patients/{id}` - Update patient
- `DELETE /api/v1/patients/{id}` - Delete patient

### Visits
- `GET /api/v1/visits` - List visits
- `POST /api/v1/visits` - Create visit
- `GET /api/v1/visits/{id}` - Get visit
- `PUT /api/v1/visits/{id}` - Update visit
- `POST /api/v1/visits/{id}/payment` - Record payment

### Dashboard
- `GET /api/v1/dashboard` - Doctor dashboard

### Admin
- `GET /api/v1/admin/clinics` - List clinics
- `POST /api/v1/admin/clinics` - Create clinic
- `GET /api/v1/admin/dashboard` - Super admin dashboard

## Database Schema

### Tables
1. **clinics** - Clinic/tenant data
2. **users** - Doctors and super admins
3. **patients** - Patient records
4. **visits** - Visit records
5. **diseases** - Disease types
6. **patient_diseases** - Patient-disease pivot
7. **report_types** - Report types (BP, CBC, Sugar)
8. **reports** - Patient reports
9. **files** - File uploads
10. **audit_logs** - Audit trail
11. **personal_access_tokens** - Sanctum tokens

## Features

- Mobile-first responsive design
- Multi-tenant SaaS architecture
- Patient reference numbers (MC-0001)
- Visit management with payments
- Disease tracking
- Lab report management
- File uploads (images, PDFs)
- Audit logging
- OTP security
- English/Urdu support

## Getting Started

### Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

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

# Mera Clinic - System Architecture

## Overview

Mera Clinic is a mobile-first SaaS patient management system designed for doctors and hakeems. The system provides comprehensive patient management, visit tracking, prescriptions, reports, and financial balance management.

## Architecture Pattern

### Multi-Tenant SaaS Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (Future)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Web Server (cPanel/VPS)                   │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   Laravel Backend   │    │   React Frontend (Inertia) │ │
│  │   (API + Web)       │    │   (SSR + CSR)               │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      MySQL Database                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Multi-Tenant: All tables include clinic_id            │ │
│  │  - clinics (tenants)                                   │ │
│  │  - users (doctors, admins)                            │ │
│  │  - patients, visits, prescriptions, reports           │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    File Storage                              │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   Local Storage     │    │   S3 (Future)               │ │
│  │   /storage/app/     │    │   for scalable storage      │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Framework**: Laravel 11
- **PHP Version**: 8.3
- **Database**: MySQL 8.0
- **Authentication**: Laravel Sanctum (SPA)
- **API**: RESTful with JSON responses

### Frontend
- **Framework**: React 18+
- **SSR/Meta-Framework**: Inertia.js
- **Styling**: TailwindCSS
- **UI Components**: ShadCN UI
- **State Management**: React Query + Zustand
- **HTTP Client**: Axios

### Infrastructure
- **Initial Hosting**: cPanel subdomain
- **Future Hosting**: VPS/Cloud (AWS/DigitalOcean)
- **File Storage**: Local (initial) → S3 (future)

## Module Architecture

### 1. Authentication Module
- Email/Password authentication via Sanctum
- OTP verification for security
- Session management with device tracking

### 2. Clinic Management (Super Admin)
- Create/manage clinics
- Subscription management
- Password reset capabilities
- Clinic enable/disable functionality

### 3. Patient Management
- Patient CRUD operations
- Contact information (phone, WhatsApp)
- Medical history tracking
- Disease tags and notes

### 4. Visit Management
- Visit scheduling and logging
- Prescription management
- Visit notes
- Financial tracking per visit

### 5. Report System
- Flexible key-value report types
- Custom report creation by doctors
- Report history per patient

### 6. File Management
- Image uploads (investigations, prescriptions)
- PDF document storage
- Organized file structure by patient/visit

### 7. Financial Module
- Total amount tracking per visit
- Received amount logging
- Balance calculation (total - received)
- Financial reports per clinic

### 8. Communication Module
- WhatsApp contact integration
- Appointment reminders (future)
- Email notifications (OTP, system)

## Security Architecture

### Authentication Flow
```
User Login → Validate Credentials → Generate Sanctum Token
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
            Check IP Change      Check 3-Day Gap      Device Change
                    │                   │                   │
                    └───────────────────┼───────────────────┘
                                            │
                                            ▼
                                    Require OTP Verification
                                            │
                                            ▼
                                    Full Access Granted
```

### Security Measures
1. **Token-based Auth**: Laravel Sanctum with SPA tokens
2. **IP Tracking**: Store last login IP address
3. **Device Tracking**: Store device information
4. **OTP System**: Email-based OTP for suspicious activity
5. **Data Isolation**: clinic_id based filtering on all queries
6. **Admin Isolation**: Super admins cannot access patient medical data

## Database Schema Overview

### Core Tables

```sql
-- Clinics (Tenants)
clinics
├── id
├── name
├── slug
├── email
├── phone
├── address
├── subscription_status
├── subscription_expires_at
├── is_active
├── settings (JSON)
└── timestamps

-- Users (Doctors/Admins)
users
├── id
├── clinic_id (FK)
├── name
├── email
├── password
├── role (admin|doctor|super_admin)
├── phone
├── whatsapp
├── last_login_ip
├── last_login_at
├── device_info
├── email_verified_at
└── timestamps

-- Patients
patients
├── id
├── clinic_id (FK)
├── user_id (FK - created by)
├── name
├── phone
├── whatsapp
├── address
├── country
├── date_of_birth
├── gender
├── notes
└── timestamps

-- Diseases (Tags)
diseases
├── id
├── clinic_id (FK)
├── name
├── description
└── timestamps

-- Patient Diseases (Pivot)
patient_diseases
├── id
├── patient_id (FK)
├── disease_id (FK)
└── timestamps

-- Visits
visits
├── id
├── clinic_id (FK)
├── patient_id (FK)
├── user_id (FK - doctor)
├── visit_date
├── visit_time
├── prescription
├── notes
├── total_amount
├── received_amount
└── timestamps

-- Reports (Key-Value)
reports
├── id
├── clinic_id (FK)
├── patient_id (FK)
├── visit_id (FK, nullable)
├── report_type_id (FK)
├── value (JSON - flexible)
├── notes
└── timestamps

-- Report Types (Customizable)
report_types
├── id
├── clinic_id (FK)
├── name
├── unit
├── reference_range
├── is_active
└── timestamps

-- Files
files
├── id
├── clinic_id (FK)
├── patient_id (FK)
├── visit_id (FK, nullable)
├── type (image|pdf)
├── file_name
├── file_path
├── file_size
├── mime_type
└── timestamps

-- Audit Logs
audit_logs
├── id
├── clinic_id (FK)
├── user_id (FK)
├── action
├── description
├── ip_address
├── device_info
└── timestamps
```

## API Standards

### Versioning
- All APIs prefixed with `/api/v1/`
- Version in response headers: `API-Version: 1.0`

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "pagination": { ... }
  }
}
```

### Error Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  },
  "code": "ERROR_CODE"
}
```

## Localization

### Supported Languages
- English (en) - Default
- Urdu (ur) - RTL Support

### Translation Structure
```
resources/lang/
├── en/
│   ├── auth.php
│   ├── patients.php
│   ├── visits.php
│   └── common.php
└── ur/
    ├── auth.php
    ├── patients.php
    ├── visits.php
    └── common.php
```

## File Storage Structure

```
storage/app/
├── clinic_{clinic_id}/
│   ├── patients/
│   │   └── patient_{id}/
│   │       ├── images/
│   │       └── documents/
│   └── temp/
└── public/
    └── uploads/
```

## Performance Considerations

1. **Database Indexing**: Index on clinic_id, user_id, patient_id
2. **Caching**: Redis for session and query caching (future)
3. **Lazy Loading**: Inertia.js for progressive page loading
4. **Image Optimization**: Compress uploads client-side
5. **Pagination**: 15-50 records per page default

## Deployment Strategy

### Phase 1 (Initial)
- cPanel hosting
- Local file storage
- Single MySQL database

### Phase 2 (Growth)
- VPS/Dedicated server
- S3 file storage
- Redis caching
- Load balancing

### Phase 3 (Scale)
- Kubernetes cluster
- Multi-region database
- CDN for static assets
- Advanced monitoring

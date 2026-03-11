# Database Schema

## Overview
Mera Clinic uses a multi-tenant database schema with a shared database and shared schema approach. All tables (except `clinics` and `personal_access_tokens`) contain a `clinic_id` foreign key for data isolation.

## Tables

### 1. clinics
Stores clinic/tenant information.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED | Primary key |
| name | VARCHAR(255) | Clinic name |
| address | TEXT | Clinic address |
| phone | VARCHAR(20) | Phone number |
| whatsapp | VARCHAR(20) | WhatsApp number |
| patient_prefix | VARCHAR(10) | Patient ID prefix (default: MC) |
| reference_counter | INTEGER | Auto-increment counter |
| is_active | BOOLEAN | Clinic active status |
| expires_at | TIMESTAMP | Subscription expiry |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 2. users
Stores doctor and super admin accounts.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED | Primary key |
| clinic_id | BIGINT UNSIGNED | Foreign key to clinics |
| name | VARCHAR(255) | User name |
| email | VARCHAR(255) | Unique email |
| password | VARCHAR(255) | Hashed password |
| role | ENUM('doctor', 'super_admin') | User role |
| phone | VARCHAR(20) | Phone number |
| is_active | BOOLEAN | Account status |
| last_login_at | TIMESTAMP | Last login time |
| last_login_ip | VARCHAR(45) | Last login IP |
| device_info | TEXT | Device information |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 3. patients
Stores patient information with reference numbers.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED | Primary key |
| clinic_id | BIGINT UNSIGNED | Foreign key to clinics |
| reference_number | VARCHAR(20) | Unique reference (MC-0001) |
| reference_counter | INTEGER | Counter for generation |
| name | VARCHAR(255) | Patient name |
| phone | VARCHAR(20) | Phone number |
| whatsapp | VARCHAR(20) | WhatsApp number |
| address | TEXT | Full address |
| country | VARCHAR(100) | Country (default: Pakistan) |
| gender | ENUM('male', 'female', 'other') | Gender |
| age | INTEGER | Age in years |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 4. visits
Stores visit records with payment tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED | Primary key |
| clinic_id | BIGINT UNSIGNED | Foreign key to clinics |
| patient_id | BIGINT UNSIGNED | Foreign key to patients |
| visit_date | DATE | Date of visit |
| visit_time | DATETIME | Time of visit |
| prescription | TEXT | Prescription details |
| notes | VISIT notes | Additional notes |
| total_amount | DECIMAL(10,2) | Total bill amount |
| received_amount | DECIMAL(10,2) | Amount received |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 5. diseases
Stores disease types specific to each clinic.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED | Primary key |
| clinic_id | BIGINT UNSIGNED | Foreign key to clinics |
| name | VARCHAR(255) | Disease name |
| description | TEXT | Disease description |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 6. patient_diseases
Pivot table for patient-disease relationship.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED | Primary key |
| patient_id | BIGINT UNSIGNED | Foreign key to patients |
| disease_id | BIGINT UNSIGNED | Foreign key to diseases |
| diagnosed_at | DATE | Diagnosis date |

### 7. report_types
Stores report types (BP, CBC, Sugar, etc.) per clinic.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED | Primary key |
| clinic_id | BIGINT UNSIGNED | Foreign key to clinics |
| name | VARCHAR(255) | Report name (e.g., "Blood Pressure") |
| unit | VARCHAR(50) | Unit of measurement (e.g., "mmHg") |
| normal_range | VARCHAR(100) | Normal range reference |
| is_active | BOOLEAN | Active status |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 8. reports
Stores patient lab reports.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED | Primary key |
| clinic_id | BIGINT UNSIGNED | Foreign key to clinics |
| patient_id | BIGINT UNSIGNED | Foreign key to patients |
| visit_id | BIGINT UNSIGNED | Foreign key to visits |
| report_type_id | BIGINT UNSIGNED | Foreign key to report_types |
| value | VARCHAR(255) | Report value |
| notes | TEXT | Additional notes |
| report_date | DATE | Date of report |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 9. files
Stores uploaded files (images, PDFs).

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED | Primary key |
| clinic_id | BIGINT UNSIGNED | Foreign key to clinics |
| patient_id | BIGINT UNSIGNED | Foreign key to patients (nullable) |
| visit_id | BIGINT UNSIGNED | Foreign key to visits (nullable) |
| file_name | VARCHAR(255) | Original file name |
| file_path | VARCHAR(500) | Storage path |
| file_type | ENUM('image', 'pdf', 'other') | File type |
| file_size | INTEGER | File size in bytes |
| mime_type | VARCHAR(100) | MIME type |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 10. audit_logs
Tracks all data changes for security.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED | Primary key |
| clinic_id | BIGINT UNSIGNED | Foreign key to clinics (nullable) |
| user_id | BIGINT UNSIGNED | Foreign key to users (nullable) |
| action | VARCHAR(50) | Action type (create, update, delete) |
| entity_type | VARCHAR(100) | Model type |
| entity_id | BIGINT UNSIGNED | Record ID |
| ip_address | VARCHAR(45) | IP address |
| user_agent | TEXT | Browser/User agent |
| old_values | JSON | Previous values |
| new_values | JSON | New values |
| created_at | TIMESTAMP | |

### 11. personal_access_tokens
Laravel Sanctum tokens for API authentication.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED | Primary key |
| tokenable_type | VARCHAR(255) | Model type |
| tokenable_id | BIGINT UNSIGNED | Model ID |
| name | VARCHAR(255) | Token name |
| token | VARCHAR(64) | Hashed token |
| abilities | JSON | Token abilities |
| last_used_at | TIMESTAMP | Last usage |
| expires_at | TIMESTAMP | Expiry (nullable) |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

## Relationships

```
Clinic (1) ─────< (N) User
Clinic (1) ─────< (N) Patient
Clinic (1) ─────< (N) Visit
Clinic (1) ─────< (N) Disease
Clinic (1) ─────< (N) ReportType
Clinic (1) ─────< (N) File
Clinic (1) ─────< (N) AuditLog

Patient (1) ─────< (N) Visit
Patient (1) ─────< (N) Report
Patient (1) ─────< (N) File
Patient (N) >────< (N) Disease

Visit (1) ─────< (N) Report
Visit (1) ─────< (N) File

ReportType (1) ─────< (N) Report
```

## Indexes

- All foreign keys are indexed
- `patients.reference_number` is unique per clinic
- `users.email` is unique globally
- `clinics.name` is indexed for search
- `visits.visit_date` is indexed for date filtering

## Data Integrity

- Soft deletes NOT enabled (hard deletes only)
- Cascade delete: When clinic deleted → all related data deleted
- Cascade delete: When patient deleted → visits, reports, files deleted
- All timestamps use UTC

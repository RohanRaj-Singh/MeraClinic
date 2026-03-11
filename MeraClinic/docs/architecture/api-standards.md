# Mera Clinic - API Standards

## Base URL

```
Production: https://api.meraclinic.com/v1
Development: http://localhost:8000/api/v1
```

## Versioning

- All endpoints prefixed with `/api/v1/`
- Version header: `Accept: application/json`
- Response header: `API-Version: 1.0`

## Authentication

### Sanctum Token Authentication

All authenticated requests require:
```
Authorization: Bearer {token}
```

### Public Endpoints
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/verify-otp`

### Protected Endpoints
All other endpoints require authentication.

## Request Format

### Headers
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}
X-Locale: en|ur
```

### Body (JSON)
```json
{
  "field": "value",
  "nested": {
    "key": "value"
  }
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": 1,
    "name": "John Doe"
  },
  "meta": {
    "pagination": {
      "current_page": 1,
      "last_page": 5,
      "per_page": 15,
      "total": 75
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  },
  "code": "VALIDATION_ERROR"
}
```

### Not Found Response
```json
{
  "success": false,
  "message": "Resource not found",
  "code": "NOT_FOUND"
}
```

### Unauthorized Response
```json
{
  "success": false,
  "message": "Unauthenticated",
  "code": "UNAUTHENTICATED"
}
```

### Forbidden Response
```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "code": "FORBIDDEN"
}
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | User login |
| POST | /auth/logout | User logout |
| POST | /auth/register | Register new clinic |
| POST | /auth/forgot-password | Request password reset |
| POST | /auth/reset-password | Reset password |
| POST | /auth/verify-otp | Verify OTP |
| POST | /auth/resend-otp | Resend OTP |
| GET | /auth/me | Get current user |

### Clinics (Super Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /clinics | List all clinics |
| POST | /clinics | Create clinic |
| GET | /clinics/{id} | Get clinic details |
| PUT | /clinics/{id} | Update clinic |
| DELETE | /clinics/{id} | Delete clinic |
| POST | /clinics/{id}/activate | Activate clinic |
| POST | /clinics/{id}/deactivate | Deactivate clinic |
| POST | /clinics/{id}/reset-password | Reset clinic password |

### Patients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /patients | List patients |
| POST | /patients | Create patient |
| GET | /patients/{id} | Get patient details |
| PUT | /patients/{id} | Update patient |
| DELETE | /patients/{id} | Delete patient |
| GET | /patients/{id}/visits | Get patient visits |
| GET | /patients/{id}/reports | Get patient reports |
| GET | /patients/{id}/files | Get patient files |

### Visits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /visits | List visits |
| POST | /visits | Create visit |
| GET | /visits/{id} | Get visit details |
| PUT | /visits/{id} | Update visit |
| DELETE | /visits/{id} | Delete visit |
| GET | /visits/today | Get today's visits |
| GET | /visits/date/{date} | Get visits by date |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /report-types | List report types |
| POST | /report-types | Create report type |
| PUT | /report-types/{id} | Update report type |
| DELETE | /report-types/{id} | Delete report type |
| GET | /reports | List reports |
| POST | /reports | Create report |
| GET | /reports/{id} | Get report details |
| PUT | /reports/{id} | Update report |
| DELETE | /reports/{id} | Delete report |

### Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /files | List files |
| POST | /files | Upload file |
| GET | /files/{id} | Get file details |
| DELETE | /files/{id} | Delete file |
| GET | /files/{id}/download | Download file |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /dashboard/stats | Get dashboard statistics |
| GET | /dashboard/revenue | Get revenue data |
| GET | /dashboard/patients | Get patient stats |

### Reports (Financial)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /reports/balance | Get balance report |
| GET | /reports/income | Get income report |
| GET | /reports/visits | Get visit report |

## Pagination

Default: 15 items per page
Max: 100 items per page

Query parameters:
```
?page=1&per_page=15
```

## Filtering

Query parameters:
```
?search=john
?status=active
?from_date=2024-01-01&to_date=2024-12-31
```

## Sorting

Query parameters:
```
?sort=created_at
?sort=-created_at (descending)
?sort=name,email
```

## Rate Limiting

- 60 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Request validation failed |
| UNAUTHENTICATED | Not authenticated |
| FORBIDDEN | Permission denied |
| NOT_FOUND | Resource not found |
| METHOD_NOT_ALLOWED | HTTP method not allowed |
| SERVER_ERROR | Internal server error |
| OTP_REQUIRED | OTP verification required |
| OTP_INVALID | Invalid OTP |
| TOKEN_EXPIRED | Token expired |

## Localization

### Supported Languages
- `en` - English (default)
- `ur` - Urdu

### Setting Locale
Header: `X-Locale: ur`

or query: `?locale=ur`

## Webhooks (Future)

```
POST /webhooks/{event}
```

Events:
- `patient.created`
- `visit.created`
- `subscription.expired`
- `clinic.created`

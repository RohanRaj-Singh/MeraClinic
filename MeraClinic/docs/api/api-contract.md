# Mera Clinic - API Contract

## Base URL

```
Development: http://localhost:8000/api/v1
Production: https://api.meraclinic.com/v1
```

## Authentication

All requests require Bearer token in header:
```
Authorization: Bearer {token}
```

---

## Endpoints

### Authentication

#### POST /auth/login

Login with email and password.

**Request:**
```json
{
  "email": "doctor@demo.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Dr. Ahmed",
      "email": "doctor@demo.com",
      "role": "doctor",
      "clinic_id": 1
    },
    "token": "1|abc123xyz..."
  },
  "requires_otp": false
}
```

**Response (Requires OTP):**
```json
{
  "success": true,
  "message": "OTP sent to email",
  "requires_otp": true,
  "otp_token": "temp_token_abc123"
}
```

---

#### POST /auth/verify-otp

Verify OTP sent to email.

**Request:**
```json
{
  "otp_token": "temp_token_abc123",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "1|abc123xyz..."
  }
}
```

---

#### POST /auth/logout

Logout current user.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### GET /auth/me

Get current authenticated user.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "User retrieved",
  "data": {
    "id": 1,
    "name": "Dr. Ahmed",
    "email": "doctor@demo.com",
    "role": "doctor",
    "phone": "+92-300-1234567",
    "clinic": {
      "id": 1,
      "name": "Demo Clinic",
      "subscription_status": "active"
    }
  }
}
```

---

### Patients

#### GET /patients

List all patients for current clinic.

**Query Parameters:**
```
?page=1&per_page=15&search=john
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Patients retrieved",
  "data": [
    {
      "id": 1,
      "reference_number": "MC-0001",
      "name": "John Doe",
      "phone": "+92-300-1234567",
      "whatsapp": "+92-300-1234568",
      "address": "Lahore, Pakistan",
      "country": "Pakistan",
      "date_of_birth": "1990-01-15",
      "gender": "male",
      "notes": "Regular patient",
      "created_at": "2024-01-15T10:30:00Z",
      "visits_count": 5,
      "balance": 500
    }
  ],
  "meta": {
    "pagination": {
      "current_page": 1,
      "last_page": 3,
      "per_page": 15,
      "total": 45
    }
  }
}
```

---

#### POST /patients

Create new patient.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "name": "John Doe",
  "phone": "+92-300-1234567",
  "whatsapp": "+92-300-1234568",
  "address": "Lahore, Pakistan",
  "country": "Pakistan",
  "date_of_birth": "1990-01-15",
  "gender": "male",
  "notes": "Regular patient",
  "diseases": [1, 2]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Patient created",
  "data": {
    "id": 1,
    "reference_number": "MC-0001",
    "name": "John Doe",
    "phone": "+92-300-1234567",
    ...
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

#### GET /patients/{id}

Get single patient with visits.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Patient retrieved",
  "data": {
    "id": 1,
    "name": "John Doe",
    "phone": "+92-300-1234567",
    ...
    "visits": [
      {
        "id": 1,
        "visit_number": "1-1",
        "visit_date": "2024-01-15",
        "visit_time": "10:30:00",
        "prescription": "...",
        "total_amount": 500,
        "received_amount": 500,
        "balance": 0
      }
    ],
    "balance": 0
  }
}
```

---

#### PUT /patients/{id}

Update patient.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "name": "John Doe Updated",
  "phone": "+92-300-1234567",
  ...
}
```

**Response:**
```json
{
  "success": true,
  "message": "Patient updated",
  "data": { ... }
}
```

---

#### DELETE /patients/{id}

Delete patient.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Patient deleted"
}
```

---

### Visits

#### POST /visits

Create new visit.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "patient_id": 1,
  "visit_date": "2024-01-15",
  "visit_time": "10:30:00",
  "prescription": "Take this medicine twice a day...",
  "notes": "Follow up after 1 week",
  "total_amount": 500,
  "received_amount": 300
}
```

**Response:**
```json
{
  "success": true,
  "message": "Visit created",
  "data": {
    "id": 1,
    "visit_number": "1-3",
    "patient_id": 1,
    "visit_date": "2024-01-15",
    "visit_time": "10:30:00",
    "prescription": "...",
    "total_amount": 500,
    "received_amount": 300,
    "balance": 200,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

#### GET /visits/today

Get today's visits.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Today's visits",
  "data": [
    { "id": 1, "visit_number": "1-1", ... },
    { "id": 2, "visit_number": "2-1", ... }
  ],
  "meta": {
    "total": 10,
    "total_amount": 5000,
    "received_amount": 3500
  }
}
```

---

#### GET /patients/{id}/visits

Get patient's visit history.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Patient visits",
  "data": [
    {
      "id": 1,
      "visit_number": "1-1",
      "visit_date": "2024-01-15",
      "prescription": "...",
      "total_amount": 500,
      "received_amount": 500,
      "balance": 0
    }
  ]
}
```

---

### Reports

#### GET /report-types

List report types for clinic.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Report types",
  "data": [
    {
      "id": 1,
      "name": "Blood Pressure",
      "unit": "mmHg",
      "reference_range": "120/80",
      "is_active": true
    },
    {
      "id": 2,
      "name": "Blood Sugar",
      "unit": "mg/dL",
      "reference_range": "70-100",
      "is_active": true
    }
  ]
}
```

---

#### POST /report-types

Create report type.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "name": "CBC",
  "unit": "g/dL",
  "reference_range": "12-17"
}
```

---

#### POST /reports

Add report to patient/visit.

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "patient_id": 1,
  "visit_id": 1,
  "report_type_id": 1,
  "value": {
    "systolic": 120,
    "diastolic": 80,
    "status": "normal"
  },
  "notes": "Patient resting"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report created",
  "data": {
    "id": 1,
    "patient_id": 1,
    "visit_id": 1,
    "report_type": "Blood Pressure",
    "value": { "systolic": 120, "diastolic": 80 },
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Files

#### POST /files

Upload file.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
```
file: [binary]
patient_id: 1
visit_id: 1 (optional)
type: image|pdf
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded",
  "data": {
    "id": 1,
    "file_name": "abc123.jpg",
    "file_path": "/storage/clinic_1/patients/1/abc123.jpg",
    "type": "image",
    "size": 1024000,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

#### GET /visits/{id}/files

Get files for visit.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Files retrieved",
  "data": [
    {
      "id": 1,
      "file_name": "prescription.jpg",
      "type": "image",
      "url": "/storage/clinic_1/patients/1/prescription.jpg"
    }
  ]
}
```

---

### Admin (Super Admin)

#### GET /admin/clinics

List all clinics.

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Clinics retrieved",
  "data": [
    {
      "id": 1,
      "name": "Demo Clinic",
      "slug": "demo-clinic",
      "email": "demo@meraclinic.com",
      "subscription_status": "active",
      "subscription_expires_at": "2024-02-15T00:00:00Z",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### POST /admin/clinics

Create new clinic.

**Request:**
```json
{
  "name": "New Clinic",
  "email": "new@clinic.com",
  "phone": "+92-300-1234567",
  "address": "Address here",
  "admin_name": "Dr. New",
  "admin_email": "dr@new.com",
  "admin_password": "Password123!"
}
```

---

#### POST /admin/clinics/{id}/activate

Activate clinic.

---

#### POST /admin/clinics/{id}/deactivate

Deactivate clinic.

---

## Error Responses

### 422 Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": ["The name field is required."],
    "phone": ["The phone has already been taken."]
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthenticated",
  "code": "UNAUTHENTICATED"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Access denied",
  "code": "FORBIDDEN"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Patient not found",
  "code": "NOT_FOUND"
}
```

### 429 Too Many Requests

```json
{
  "success": false,
  "message": "Too many requests",
  "code": "RATE_LIMITED"
}
```

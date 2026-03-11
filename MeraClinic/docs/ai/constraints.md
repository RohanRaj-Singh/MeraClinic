# Mera Clinic - Constraints

## Development Constraints

### Code Size
- **Controllers**: Max 150 lines
- **React Pages**: Max 150 lines
- **Functions**: Keep under 30 lines when possible

### Architecture
- **Backend**: Must use Service + Repository pattern
- **Frontend**: Must use hooks for business logic
- **Database**: Must use clinic_id for isolation

---

## Technical Constraints

### PHP
- Version: 8.3+
- Framework: Laravel 11
- Auth: Laravel Sanctum

### React
- Version: 18+
- Meta-framework: Inertia.js
- Styling: TailwindCSS
- State: React Query + Zustand

### Database
- MySQL 8.0
- Shared database, shared schema (multi-tenant)

---

## Security Constraints

### Authentication
- Token-based (Sanctum)
- OTP required for suspicious logins
- Token expires in 1 year

### Authorization
- Role-based: super_admin, admin, doctor
- Super admin cannot access patient data
- All queries filtered by clinic_id

### Data Protection
- No patient data to super admin
- Audit logging for all operations
- Secure file storage

---

## Business Constraints

### Patient Rules
- Phone must be unique per clinic
- Name and phone required
- Soft delete only

### Visit Rules
- Visit number auto-increment per patient
- Balance = total_amount - received_amount

### Financial Rules
- Currency: PKR
- Decimal(10,2) for amounts

### File Rules
- Max size: 10MB
- Allowed: jpg, jpeg, png, pdf

---

## API Constraints

### Rate Limiting
- Authenticated: 60 requests/minute
- Unauthenticated: 20 requests/minute

### Pagination
- Default: 15 items
- Max: 100 items

### Versioning
- All endpoints: /api/v1/
- Response header: API-Version: 1.0

---

## Design Constraints

### Brand Colors
- Primary: #2E7D32
- Secondary: #81C784
- Accent: #1565C0
- Background: #F7FAF8

### Typography
- English: Inter
- Urdu: Noto Nastaliq Urdu

### Mobile-First
- Bottom navigation on mobile
- Large touch targets (44px minimum)
- Full-width buttons on mobile

---

## Language Constraints

### Supported
- English (en) - LTR
- Urdu (ur) - RTL

### Translation Scope
- All UI text
- Error messages
- Validation messages
- Button labels
- Placeholders

---

## File Organization Constraints

### Backend
```
app/
├── Http/Controllers/Api/V1/
├── Services/
├── Repositories/
├── Models/
└── Http/Requests/
```

### Frontend
```
src/
├── pages/
├── components/
├── hooks/
├── services/
├── store/
└── utils/
```

---

## Performance Constraints

### Database
- Index on clinic_id, user_id, patient_id
- Index on (clinic_id, phone) for patients
- Eager load relationships

### Frontend
- Lazy load routes
- Optimize images before upload
- Cache with React Query

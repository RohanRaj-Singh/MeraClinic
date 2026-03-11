# Mera Clinic - Features

## Core Features

### 1. Authentication

- [x] Email/password login
- [x] Registration with clinic creation
- [x] Password reset via email
- [x] OTP verification for security
- [x] Remember me functionality
- [x] Session management

### 2. Patient Management

- [x] Create patient record
- [x] Edit patient information
- [x] Delete patient (soft delete)
- [x] View patient list with search
- [x] View patient details
- [x] Track diseases/conditions
- [x] Add patient notes
- [x] Patient photo upload

**Patient Fields:**
- Name (required)
- Phone number
- WhatsApp number
- Address
- Country
- Date of birth
- Gender
- Notes

### 3. Visit Management

- [x] Create visit record
- [x] Edit visit information
- [x] Delete visit
- [x] View visit list by date
- [x] Today's visits overview
- [x] Visit calendar view

**Visit Fields:**
- Visit date
- Visit time
- Prescription (rich text)
- Notes
- Total amount
- Received amount

### 4. Prescription

- [x] Create prescription text
- [x] Rich text editor
- [x] Print prescription (future)
- [x] Prescription history per patient

### 5. Reports System

- [x] Create custom report types
- [x] Report categories (BP, CBC, Sugar, etc.)
- [x] Key-value report values
- [x] Reference ranges
- [x] Report history per patient

**Report Type Fields:**
- Name
- Unit
- Reference range
- Active status

**Report Fields:**
- Report type
- Value (JSON - flexible)
- Notes

### 6. File Management

- [x] Upload images
- [x] Upload PDF documents
- [x] File organization by patient
- [x] File organization by visit
- [x] Download files
- [x] Delete files

**Supported Types:**
- Images: jpg, jpeg, png
- Documents: pdf

**Max File Size:** 10MB

### 7. Financial Tracking

- [x] Total amount per visit
- [x] Received amount tracking
- [x] Balance calculation (total - received)
- [x] Payment status per visit
- [x] Revenue reports
- [x] Outstanding balance tracking

### 8. Communication

- [x] WhatsApp contact link
- [x] Phone call link
- [x] Email contact

### 9. Dashboard

- [x] Today's visit count
- [x] Total patients count
- [x] Today's revenue
- [x] Outstanding balance
- [x] Recent visits
- [x] Quick actions

### 10. Search

- [x] Search patients by name
- [x] Search patients by phone
- [x] Filter visits by date
- [x] Filter by status

## Admin Features (Super Admin)

### Clinic Management

- [x] Create new clinic
- [x] Edit clinic details
- [x] View all clinics
- [x] Activate/deactivate clinic
- [x] Delete clinic

### Subscription Management

- [x] Set trial period
- [x] Activate subscription
- [x] Expire subscription
- [x] View subscription status

### User Management

- [x] Create users for clinic
- [x] Reset user passwords
- [x] View user activity

### Security

- [x] Access audit logs
- [x] Monitor suspicious activity
- [x] Cannot access patient data

## User Roles

| Role | Permissions |
|------|-------------|
| super_admin | Full system access, cannot access patient data |
| admin | Clinic management, all patient data |
| doctor | Own patient data, visits, prescriptions |

## Language Support

### English (en)
- Full UI translation
- Default language

### Urdu (ur)
- Full UI translation
- RTL layout support
- Noto Nastaliq Urdu font

## Mobile Features

- [x] Responsive design
- [x] Touch-friendly interface
- [x] Bottom navigation
- [x] Pull to refresh
- [x] Mobile-friendly forms

## Future Features

### Phase 2
- [ ] Appointments scheduling
- [ ] SMS reminders
- [ ] Email notifications
- [ ] Patient history timeline
- [ ] Prescription templates

### Phase 3
- [ ] Multi-branch support
- [ ] Staff management
- [ ] Inventory management
- [ ] Billing/invoicing
- [ ] Analytics dashboard

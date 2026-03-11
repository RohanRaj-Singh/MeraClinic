# Mera Clinic - Users

## User Roles

### 1. Super Admin

**Description**: System administrator who manages the SaaS platform.

**Responsibilities**:
- Create and manage clinics
- Manage subscriptions
- Reset user passwords
- Monitor system health
- Access audit logs
- Disable/enable clinics

**Constraints**:
- CANNOT access patient medical data
- CANNOT create patients or visits
- CANNOT view patient details

**Access Level**: Full system access (except patient data)

---

### 2. Admin

**Description**: Clinic administrator who manages the doctor's practice.

**Responsibilities**:
- Manage clinic settings
- Create/manage doctors
- Reset doctor passwords
- View all clinic data
- Manage subscriptions

**Access Level**: Full clinic access

---

### 3. Doctor / Hakeem

**Description**: Primary user - the healthcare provider.

**Responsibilities**:
- Create patients
- Record visits
- Write prescriptions
- Upload reports
- Track payments
- Contact patients via WhatsApp

**Access Level**: Own clinic data only

---

## User Personas

### Dr. Ahmed - The Traditional Hakeem

```
Age: 52
Location: Lahore, Pakistan
Experience: 25 years in Unani medicine
Tech Level: Basic smartphone user

Needs:
- Simple interface
- Urdu language support
- Quick patient lookup
- Easy prescription writing

Pain Points:
- Paper register is messy
- Can't read own handwriting later
- Losing patient history
- Difficulty tracking payments
```

### Dr. Fatima - The Modern Doctor

```
Age: 35
Location: Karachi, Pakistan
Experience: 10 years MBBS, 3 years private practice
Tech Level: Comfortable with apps

Needs:
- Fast data entry
- Professional appearance
- Patient history timeline
- Financial reports

Pain Points:
- Time wasted on paperwork
- Difficult to find old records
- No financial insights
- Can't show patients their history
```

### Admin User - Clinic Manager

```
Age: 28
Location: Islamabad, Pakistan
Experience: 5 years clinic management
Tech Level: Proficient computer user

Needs:
- Multiple doctor support
- Revenue reports
- Patient statistics
- Easy onboarding
```

---

## User Flows

### Doctor: Add New Patient

```
1. Tap "Add Patient" button
2. Enter name (required)
3. Enter phone number (required, unique per clinic)
4. Enter WhatsApp (optional)
5. Enter address (optional)
6. Select date of birth (optional)
7. Select gender (optional)
8. Add notes (optional)
9. Tap "Save"
10. Patient added successfully
```

### Doctor: Record Visit

```
1. Select patient from list OR tap "Quick Add"
2. Tap "New Visit"
3. Visit date auto-filled (today)
4. Visit time auto-filled (now)
5. Enter prescription (rich text)
6. Enter notes (optional)
7. Enter total amount
8. Enter received amount
9. Tap "Save"
10. Visit recorded, balance updated
```

### Doctor: Upload Report

```
1. Open patient
2. Tap "Add Report"
3. Select report type OR create new
4. Enter report values
5. Optionally upload image/PDF
6. Tap "Save"
7. Report added to patient history
```

### Doctor: Contact Patient via WhatsApp

```
1. Open patient
2. Tap WhatsApp icon
3. Opens WhatsApp with pre-filled message
4. Send message
```

---

## Accessibility

| User Type | Accessibility Features |
|-----------|----------------------|
| All | Large text option |
| All | High contrast mode |
| All | Keyboard navigation |
| Urdu users | RTL layout |
| Senior users | Simple navigation |

---

## Mobile Navigation

### Bottom Tab Bar (Mobile)

```
┌────────────────────────────────────────┐
│                                        │
│              [Content]                 │
│                                        │
├────────────────────────────────────────┤
│  Patients │ Visits │ + Add │ Reports │ Profile │
└────────────────────────────────────────┘
```

### Primary Actions (Floating)

```
┌─────────┐
│ 📞 Call │
├─────────┤
│ 💬 WhatsApp │
├─────────┤
│ ➕ Add Visit │
├─────────┤
│ 📎 Upload │
└─────────┘
```

---

## Permissions Matrix

| Feature | Super Admin | Admin | Doctor |
|---------|-------------|-------|--------|
| Manage Clinics | ✓ | ✗ | ✗ |
| Manage Users | ✗ | ✓ | ✗ |
| View Patients | ✗ | ✓ | ✓ |
| Create Patients | ✗ | ✓ | ✓ |
| View Visits | ✗ | ✓ | ✓ |
| Create Visits | ✗ | ✓ | ✓ |
| View Reports | ✗ | ✓ | ✓ |
| Upload Files | ✗ | ✓ | ✓ |
| View Financials | ✗ | ✓ | ✓ |
| Manage Settings | ✗ | ✓ | ✓ |

# Mera Clinic - Business Rules

## Patient Rules

### Patient Creation

1. **Name** is required
2. **Phone** is required
3. **Phone** must be unique within the clinic (`clinic_id + phone` unique)
4. **Reference Number** is auto-generated (format: `{PREFIX}-{NUMBER}`)
5. **Reference Number** example: `MC-0001`, `ABC-0002`
6. **Reference Counter** auto-increments per clinic
7. **WhatsApp** is optional
8. **Address** is optional
9. **Country** defaults to "Pakistan"
10. **Date of birth** must be in the past
11. **Gender** must be: male, female, or other
12. Patient is linked to the current user's clinic
13. Patient is created by the current user

### Patient Reference Number

```
Format: {CLINIC_PREFIX}-{4_DIGIT_NUMBER}
Examples:
- MC-0001 (first patient, prefix MC)
- MC-0002 (second patient)
- DR-0100 (100th patient, prefix DR)
```

### Reference Number Generation

```php
// In PatientService
$prefix = $clinic->patient_prefix ?? 'PT';
$counter = $clinic->patient_counter + 1;
$referenceNumber = sprintf('%s-%04d', $prefix, $counter);

// Update clinic counter
$clinic->update(['patient_counter' => $counter]);
```

### Patient Editing

1. User can only edit patients in their clinic
2. Phone uniqueness must be maintained
3. Super admin cannot access patient data

### Patient Deletion

1. Soft delete (not permanent)
2. Deletes associated visits, reports, and files
3. Deleted patient can be restored (future)

---

## Visit Rules

### Visit Creation

1. **Patient** is required (selected from existing or quick-create)
2. **Visit date** defaults to today
3. **Visit time** defaults to now
4. **Prescription** is optional (rich text)
5. **Notes** is optional
6. **Total amount** defaults to 0
7. **Received amount** defaults to 0
8. Visit number auto-increments per patient

### Visit Numbering

- Format: `{patient_id}-{sequential_number}`
- Example: `Patient 5, Visit 3 = 5-3`

### Visit Balance

```typescript
// Balance = total_amount - received_amount
balance = visit.total_amount - visit.received_amount
```

### Patient Balance (Computed)

```typescript
// Sum of all visit balances
patientBalance = Σ(visit.total_amount - visit.received_amount)
```

---

## Financial Rules

### Amount Handling

1. Amounts stored as decimal(10,2)
2. Currency: PKR (Pakistani Rupees)
3. Display format: ₨ 1,234.00

### Payment Status

| Status | Condition |
|--------|-----------|
| Unpaid | received_amount = 0 |
| Partial | 0 < received_amount < total_amount |
| Paid | received_amount >= total_amount |

---

## Report Rules

### Report Types

1. Doctor can create custom report types
2. Report type has: name, unit, reference_range
3. Report types are clinic-specific

### Report Values

1. Value stored as JSON (flexible)
2. Examples:
   ```json
   { "value": "120/80", "status": "normal" }
   { "value": 7.5, "unit": "mg/dL" }
   { "value": "Positive", "notes": "Some notes" }
   ```

---

## File Rules

### Upload Rules

1. **Max size**: 10MB
2. **Allowed types**: jpg, jpeg, png, pdf
3. Files organized by: `clinic_{id}/patients/{patient_id}/`
4. UUID-based filenames

### File Links

- Can be linked to patient
- Can be linked to visit (optional)
- Visit deletion doesn't delete files

---

## User Rules

### Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| super_admin | System admin | All clinics, no patient data |
| admin | Clinic admin | Full clinic access |
| doctor | Healthcare provider | Own clinic data |

### Password Rules

1. Minimum 8 characters
2. At least one uppercase letter
3. At least one number
4. At least one special character
5. Passwords hashed with bcrypt

### Session Rules

1. Token-based authentication (Sanctum)
2. Token expires in 1 year
3. OTP required for suspicious activity

---

## Security Rules

### OTP Requirements

OTP is required when:
1. **IP Change**: Login from different IP
2. **Time Gap**: No login for 3+ days
3. **Device Change**: New device/browser

### Data Isolation

1. All queries filtered by clinic_id
2. Global scopes on all models
3. Super admin bypasses clinic scope
4. Super admin cannot access patient data

---

## API Rules

### Rate Limiting

- Authenticated: 60 requests/minute
- Unauthenticated: 20 requests/minute

### Response Limits

- Default pagination: 15 items
- Max pagination: 100 items

### Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Request validation failed |
| UNAUTHENTICATED | Not logged in |
| FORBIDDEN | No permission |
| NOT_FOUND | Resource not found |
| OTP_REQUIRED | OTP verification needed |
| OTP_INVALID | Wrong OTP |
| DUPLICATE_PHONE | Phone already exists |

---

## Subscription Rules

### Trial Period

- Duration: 14 days
- Features: Full access
- After expiry: Account locked

### Subscription Status

| Status | Description |
|--------|-------------|
| trial | Trial period active |
| active | Subscription active |
| expired | Subscription expired |
| cancelled | Subscription cancelled |

---

## Internationalization

### Supported Languages

| Code | Language | Direction |
|------|----------|-----------|
| en | English | LTR |
| ur | Urdu | RTL |

### Translation Scope

- All UI text
- Error messages
- Validation messages
- Button labels
- Placeholders

---

## Mobile Rules

### Touch Targets

- Minimum: 44x44px
- Recommended: 48x48px
- Primary actions: Full-width on mobile

### Navigation

- Bottom tab bar for mobile
- Sidebar for desktop
- Consistent icons across platforms

---

## Audit Rules

### Logged Actions

- User login/logout
- Patient CRUD
- Visit CRUD
- Report access
- File upload/download
- Settings changes

### Log Fields

- User ID
- Action type
- Description
- IP address
- Device info
- Timestamp

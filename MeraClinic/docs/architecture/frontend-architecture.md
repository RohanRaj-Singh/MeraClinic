# Mera Clinic - Frontend Architecture

## Project Overview

The frontend is a **React + Inertia.js** application with **mobile-first** design.

### Technology Stack

| Category | Technology |
|----------|------------|
| Framework | React 18+ |
| SSR/Meta-Framework | Inertia.js |
| Styling | TailwindCSS |
| UI Components | ShadCN UI |
| State Management | Zustand |
| Data Fetching | React Query (TanStack Query) |
| HTTP Client | Axios |
| Types | TypeScript |
| Build Tool | Vite |
| i18n | i18next |

---

## Directory Structure

```
frontend/src/
├── pages/                    ← Screen components (Inertia)
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── dashboard/
│   │   └── Index.tsx
│   ├── patients/
│   │   ├── Index.tsx         ← Patient list
│   │   ├── Show.tsx          ← Patient detail
│   │   ├── Create.tsx        ← Add patient form
│   │   └── Edit.tsx          ← Edit patient form
│   ├── visits/
│   │   ├── Index.tsx
│   │   ├── Create.tsx
│   │   └── Edit.tsx
│   ├── reports/
│   │   └── Index.tsx
│   ├── settings/
│   │   └── Index.tsx
│   └── Error.tsx             ← Error page
│
├── components/               ← Reusable components
│   ├── ui/                  ← ShadCN base components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   └── ...
│   │
│   ├── layout/              ← Layout components
│   │   ├── AppLayout.tsx    ← Main app layout
│   │   ├── AuthLayout.tsx   ← Auth pages layout
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── BottomNav.tsx    ← Mobile navigation
│   │   └── MobileNav.tsx
│   │
│   ├── patients/           ← Patient-specific components
│   │   ├── PatientForm.tsx
│   │   ├── PatientCard.tsx
│   │   ├── PatientList.tsx
│   │   └── PatientSearch.tsx
│   │
│   ├── visits/             ← Visit-specific components
│   │   ├── VisitForm.tsx
│   │   ├── VisitCard.tsx
│   │   └── VisitTimeline.tsx
│   │
│   ├── reports/            ← Report-specific components
│   │   ├── ReportForm.tsx
│   │   └── ReportCard.tsx
│   │
│   └── shared/             ← Shared utilities
│       ├── DataTable.tsx
│       ├── PageHeader.tsx
│       ├── EmptyState.tsx
│       ├── LoadingSpinner.tsx
│       └── FloatingActions.tsx
│
├── hooks/                  ← Custom React hooks
│   ├── useAuth.ts
│   ├── usePatients.ts
│   ├── useVisits.ts
│   └── useMediaQuery.ts
│
├── services/               ← API services
│   ├── api.ts             ← Axios instance
│   ├── auth.service.ts
│   ├── patient.service.ts
│   ├── visit.service.ts
│   ├── report.service.ts
│   └── file.service.ts
│
├── store/                  ← Zustand stores
│   ├── authStore.ts
│   ├── uiStore.ts
│   └── patientStore.ts
│
├── layouts/                ← Inertia layouts
│   ├── AppLayout.tsx
│   └── AuthLayout.tsx
│
├── utils/                  ← Utility functions
│   ├── cn.ts              ← classnames utility
│   ├── formatters.ts      ← Date/currency formatters
│   └── validators.ts
│
├── i18n/                   ← Translations
│   ├── index.ts
│   ├── config.ts
│   ├── en/
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── patients.json
│   │   ├── visits.json
│   │   └── settings.json
│   └── ur/
│       ├── common.json
│       ├── auth.json
│       ├── patients.json
│       ├── visits.json
│       └── settings.json
│
├── types/                  ← TypeScript types
│   ├── index.ts
│   ├── patient.ts
│   ├── visit.ts
│   ├── report.ts
│   └── api.ts
│
├── styles/
│   └── globals.css
│
├── App.tsx
├── main.tsx
└── env.d.ts
```

---

## Page Structure

### Maximum Lines: 150

Pages should be thin. Delegate logic to hooks and components.

### Example: Patients Index Page

```tsx
// pages/patients/Index.tsx
import { Head, Link } from '@inertiajs/react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/shared/data-table';
import { PatientColumns } from './columns';
import { patients } from '@/types/patient';

interface Props {
  patients: PaginatedData<patients>;
}

export default function PatientsIndex({ patients }: Props) {
  return (
    <>
      <Head title="Patients" />
      
      <div className="container mx-auto p-4">
        <PageHeader
          title="Patients"
          description="Manage your patients"
          actions={
            <Link
              href={route('patients.create')}
              className="bg-primary text-white px-4 py-2 rounded-lg"
            >
              Add Patient
            </Link>
          }
        />
        
        <DataTable
          data={patients.data}
          columns={PatientColumns}
          pagination={patients}
          searchPlaceholder="Search patients..."
        />
      </div>
    </>
  );
}
```

---

## Component Structure

### Maximum Responsibility

Components should:
- Be reusable
- Have single purpose
- Accept props for customization
- Handle own UI state

### Example: Patient Form

```tsx
// components/patients/PatientForm.tsx
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

interface PatientFormProps {
  patient?: Patient;
  onSuccess?: () => void;
}

export function PatientForm({ patient, onSuccess }: PatientFormProps) {
  const { t } = useTranslation();
  const form = useForm({
    name: patient?.name || '',
    phone: patient?.phone || '',
    whatsapp: patient?.whatsapp || '',
    address: patient?.address || '',
    country: patient?.country || 'Pakistan',
    date_of_birth: patient?.date_of_birth || '',
    gender: patient?.gender || '',
    notes: patient?.notes || '',
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const routeMethod = patient 
      ? route('patients.update', patient.id)
      : route('patients.store');
      
    form.post(routeMethod, {
      onSuccess: () => onSuccess?.(),
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t('patients.name')} *</Label>
        <Input
          id="name"
          value={form.data.name}
          onChange={(e) => form.setData('name', e.target.value)}
          error={form.errors.name}
        />
      </div>
      
      {/* More fields... */}
      
      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={form.processing}
          className="bg-primary hover:bg-primary-dark"
        >
          {patient ? t('common.update') : t('common.save')}
        </Button>
      </div>
    </form>
  );
}
```

---

## API Services

### Pattern

```ts
// services/patient.service.ts
import api from './api';
import { Patient, PaginatedResponse, ApiError } from '@/types';

export const patientService = {
  list: (params?: QueryParams) =>
    api.get<PaginatedResponse<Patient>>('/patients', { params }),
  
  show: (id: string) =>
    api.get<Patient>(`/patients/${id}`),
  
  create: (data: CreatePatientDto) =>
    api.post<Patient>('/patients', data),
  
  update: (id: string, data: UpdatePatientDto) =>
    api.put<Patient>(`/patients/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/patients/${id}`),
  
  getVisits: (patientId: string) =>
    api.get<PaginatedResponse<Visit>>(`/patients/${patientId}/visits`),
};
```

---

## Hooks

### Custom Hook Pattern

```ts
// hooks/usePatients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '@/services/patient.service';
import { useTranslation } from 'react-i18next';

export function usePatients(params?: QueryParams) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => patientService.list(params),
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => patientService.show(id),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  
  return useMutation({
    mutationFn: patientService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success(t('patients.created'));
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientDto }) =>
      patientService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients', id] });
      toast.success(t('patients.updated'));
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  
  return useMutation({
    mutationFn: patientService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success(t('patients.deleted'));
    },
  });
}
```

---

## Store (Zustand)

### Auth Store

```ts
// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      }),
    }),
    { name: 'auth-storage' }
  )
);
```

---

## Mobile-First Design

### Bottom Navigation

```tsx
// components/layout/BottomNav.tsx
import { Link, usePage } from '@inertiajs/react';
import { Home, Users, Calendar, FileText, User } from 'lucide-react';

export function BottomNav() {
  const { url } = usePage();
  
  const navItems = [
    { href: '/patients', icon: Users, label: 'Patients' },
    { href: '/visits', icon: Calendar, label: 'Visits' },
    { href: '/visits/create', icon: Home, label: 'Add', primary: true },
    { href: '/reports', icon: FileText, label: 'Reports' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full
              ${item.primary ? 'text-primary' : ''}
              ${url.startsWith(item.href) ? 'text-primary' : 'text-gray-500'}`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

### Floating Action Button

```tsx
// components/shared/FloatingActions.tsx
import { Phone, MessageCircle, Plus, Upload } from 'lucide-react';

export function FloatingActions() {
  return (
    <div className="fixed bottom-20 right-4 flex flex-col gap-2 md:hidden">
      <button className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center shadow-lg">
        <Phone className="w-5 h-5" />
      </button>
      <button className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
        <MessageCircle className="w-5 h-5" />
      </button>
      <button className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
        <Plus className="w-6 h-6" />
      </button>
      <button className="w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center shadow-lg">
        <Upload className="w-5 h-5" />
      </button>
    </div>
  );
}
```

---

## Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Laptops |
| xl | 1280px | Desktops |
| 2xl | 1536px | Large screens |

---

## TailwindCSS Classes

### Brand Colors

```tsx
// Primary actions
className="bg-primary hover:bg-primary-dark text-white"

// Secondary actions  
className="bg-secondary hover:bg-secondary-dark"

// Accent
className="bg-accent hover:bg-accent-dark"

// Background
className="bg-background"
```

---

## i18n Structure

### Translation Files

```json
// i18n/en/common.json
{
  "save": "Save",
  "update": "Update",
  "delete": "Delete",
  "cancel": "Cancel",
  "confirm": "Confirm",
  "loading": "Loading...",
  "error": "Error",
  "success": "Success"
}
```

```json
// i18n/ur/common.json
{
  "save": "محفوظ کریں",
  "update": "اپڈیٹ کریں",
  "delete": "حذف کریں",
  "cancel": "منسوخ کریں",
  "confirm": "تصدیق کریں",
  "loading": "لوڈ ہو رہا ہے...",
  "error": "خرابی",
  "success": "کامیاب"
}
```

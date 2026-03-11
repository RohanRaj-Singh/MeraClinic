export { authService } from './auth';
export { patientService } from './patient';
export { visitService } from './visit';
export { dashboardService } from './dashboard';
export { reportTypeService } from './reportType';

export type { 
  User, 
  AuthResponse, 
  LoginCredentials, 
  RegisterData 
} from './auth';

export type { 
  Patient, 
  Disease, 
  PatientFilters, 
  CreatePatientData, 
  UpdatePatientData 
} from './patient';

export type { 
  Visit, 
  Report, 
  ReportType, 
  File, 
  VisitFilters, 
  CreateVisitData, 
  UpdateVisitData 
} from './visit';

export type { 
  DashboardData, 
  DashboardStats, 
  RecentPatient, 
  RecentVisit, 
  ChartData, 
  SuperAdminDashboard, 
  SuperAdminStats,
  Clinic as SuperAdminClinic 
} from './dashboard';

<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Visit;
use App\Models\Clinic;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Get dashboard data
     */
    public function getDashboardData(): array
    {
        $clinicId = auth()->user()->clinic_id;

        // Get counts
        $totalPatients = Patient::where('clinic_id', $clinicId)->count();
        $totalVisits = Visit::where('clinic_id', $clinicId)->count();
        
        // Get revenue
        $totalRevenue = Visit::where('clinic_id', $clinicId)->sum('total_amount');
        $totalReceived = Visit::where('clinic_id', $clinicId)->sum('received_amount');
        $totalBalance = $totalRevenue - $totalReceived;

        // Get today's visits
        $todayVisits = Visit::where('clinic_id', $clinicId)
            ->where('visit_date', now()->toDateString())
            ->count();

        // Get monthly stats
        $monthlyPatients = Patient::where('clinic_id', $clinicId)
            ->whereMonth('created_at', now()->month)
            ->count();

        $monthlyVisits = Visit::where('clinic_id', $clinicId)
            ->whereMonth('visit_date', now()->month)
            ->count();

        $monthlyRevenue = Visit::where('clinic_id', $clinicId)
            ->whereMonth('visit_date', now()->month)
            ->sum('total_amount');

        // Get recent patients
        $recentPatients = Patient::where('clinic_id', $clinicId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get recent visits
        $recentVisits = Visit::where('clinic_id', $clinicId)
            ->with(['patient'])
            ->orderBy('visit_date', 'desc')
            ->orderBy('visit_time', 'desc')
            ->limit(5)
            ->get();

        // Get unpaid visits
        $unpaidVisits = Visit::where('clinic_id', $clinicId)
            ->with(['patient'])
            ->whereRaw('total_amount - received_amount > 0')
            ->orderBy('visit_date', 'desc')
            ->limit(5)
            ->get();

        // Get chart data (last 7 days)
        $chartData = $this->getChartData($clinicId);

        return [
            'stats' => [
                'total_patients' => $totalPatients,
                'total_visits' => $totalVisits,
                'total_revenue' => $totalRevenue,
                'total_received' => $totalReceived,
                'total_balance' => $totalBalance,
                'today_visits' => $todayVisits,
                'monthly_patients' => $monthlyPatients,
                'monthly_visits' => $monthlyVisits,
                'monthly_revenue' => $monthlyRevenue,
            ],
            'recent_patients' => $recentPatients,
            'recent_visits' => $recentVisits,
            'unpaid_visits' => $unpaidVisits,
            'chart_data' => $chartData,
        ];
    }

    /**
     * Get chart data for last 7 days
     */
    private function getChartData(int $clinicId): array
    {
        $data = [];
        
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            
            $visits = Visit::where('clinic_id', $clinicId)
                ->whereDate('visit_date', $date)
                ->count();

            $revenue = Visit::where('clinic_id', $clinicId)
                ->whereDate('visit_date', $date)
                ->sum('total_amount');

            $data[] = [
                'date' => $date->format('Y-m-d'),
                'day' => $date->format('D'),
                'visits' => $visits,
                'revenue' => $revenue,
            ];
        }

        return $data;
    }

    /**
     * Get super admin dashboard data
     */
    public function getSuperAdminDashboard(): array
    {
        // Get all clinic stats
        $totalClinics = Clinic::count();
        $activeClinics = Clinic::where('is_active', true)->count();
        
        // Get total patients across all clinics
        $totalPatients = DB::table('patients')->count();
        
        // Get total visits across all clinics
        $totalVisits = DB::table('visits')->count();
        
        // Get total revenue
        $totalRevenue = DB::table('visits')->sum('total_amount');
        
        // Get recent clinics
        $recentClinics = Clinic::orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Get expiring clinics (within 30 days)
        $expiringClinics = Clinic::whereNotNull('expires_at')
            ->where('expires_at', '<=', now()->addDays(30))
            ->where('is_active', true)
            ->get();

        return [
            'stats' => [
                'total_clinics' => $totalClinics,
                'active_clinics' => $activeClinics,
                'total_patients' => $totalPatients,
                'total_visits' => $totalVisits,
                'total_revenue' => $totalRevenue,
            ],
            'recent_clinics' => $recentClinics,
            'expiring_clinics' => $expiringClinics,
        ];
    }
}

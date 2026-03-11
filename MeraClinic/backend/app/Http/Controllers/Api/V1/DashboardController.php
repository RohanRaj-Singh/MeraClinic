<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService
    ) {}

    /**
     * Get dashboard data for doctor
     */
    public function index(): JsonResponse
    {
        $data = $this->dashboardService->getDashboardData();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Get super admin dashboard
     */
    public function superAdmin(): JsonResponse
    {
        $data = $this->dashboardService->getSuperAdminDashboard();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}

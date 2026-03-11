<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PatientController;
use App\Http\Controllers\Api\V1\VisitController;
use App\Http\Controllers\Api\V1\DiseaseController;
use App\Http\Controllers\Api\V1\ReportTypeController;
use App\Http\Controllers\Api\V1\FileController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\ClinicController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Mera Clinic API v1 Routes
|
*/

// Public Routes
Route::prefix('v1')->group(function () {
    // Auth
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/otp/verify', [AuthController::class, 'verifyOtp']);
    Route::post('/auth/password/reset', [AuthController::class, 'resetPassword']);
});

// Protected Routes (require authentication)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Patients
    Route::get('/patients', [PatientController::class, 'index']);
    Route::post('/patients', [PatientController::class, 'store']);
    Route::get('/patients/{patient}', [PatientController::class, 'show']);
    Route::put('/patients/{patient}', [PatientController::class, 'update']);
    Route::delete('/patients/{patient}', [PatientController::class, 'destroy']);
    Route::get('/patients/{patient}/balance', [PatientController::class, 'balance']);

    // Visits
    Route::get('/visits', [VisitController::class, 'index']);
    Route::post('/visits', [VisitController::class, 'store']);
    Route::get('/visits/{visit}', [VisitController::class, 'show']);
    Route::put('/visits/{visit}', [VisitController::class, 'update']);
    Route::delete('/visits/{visit}', [VisitController::class, 'destroy']);
    Route::post('/visits/{visit}/payment', [VisitController::class, 'recordPayment']);

    // Patient Visits
    Route::get('/patients/{patient}/visits', [VisitController::class, 'index']);

    // Diseases
    Route::get('/diseases', [DiseaseController::class, 'index']);
    Route::post('/diseases', [DiseaseController::class, 'store']);
    Route::get('/diseases/{disease}', [DiseaseController::class, 'show']);
    Route::put('/diseases/{disease}', [DiseaseController::class, 'update']);
    Route::delete('/diseases/{disease}', [DiseaseController::class, 'destroy']);

    // Report Types
    Route::get('/report-types', [ReportTypeController::class, 'index']);
    Route::get('/report-types/active', [ReportTypeController::class, 'active']);
    Route::post('/report-types', [ReportTypeController::class, 'store']);
    Route::get('/report-types/{reportType}', [ReportTypeController::class, 'show']);
    Route::put('/report-types/{reportType}', [ReportTypeController::class, 'update']);
    Route::delete('/report-types/{reportType}', [ReportTypeController::class, 'destroy']);

    // Files
    Route::get('/files', [FileController::class, 'index']);
    Route::post('/files', [FileController::class, 'store']);
    Route::get('/files/{file}', [FileController::class, 'show']);
    Route::delete('/files/{file}', [FileController::class, 'destroy']);
    Route::get('/files/{file}/download', [FileController::class, 'download']);
});

// Admin Routes (super_admin only)
Route::prefix('v1/admin')->middleware(['auth:sanctum', 'role:super_admin'])->group(function () {
    // Clinics
    Route::get('/clinics', [ClinicController::class, 'index']);
    Route::post('/clinics', [ClinicController::class, 'store']);
    Route::get('/clinics/{clinic}', [ClinicController::class, 'show']);
    Route::put('/clinics/{clinic}', [ClinicController::class, 'update']);
    Route::delete('/clinics/{clinic}', [ClinicController::class, 'destroy']);
    Route::post('/clinics/{clinic}/toggle-status', [ClinicController::class, 'toggleStatus']);
    Route::post('/clinics/{clinic}/reset-password', [ClinicController::class, 'resetPassword']);
    Route::get('/clinics/{clinic}/stats', [ClinicController::class, 'stats']);

    // Super Admin Dashboard
    Route::get('/dashboard', [DashboardController::class, 'superAdmin']);
});

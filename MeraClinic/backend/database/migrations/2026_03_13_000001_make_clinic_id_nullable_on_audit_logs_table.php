<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropForeign(['clinic_id']);
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->foreignId('clinic_id')->nullable()->change();
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->foreign('clinic_id')->references('id')->on('clinics')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropForeign(['clinic_id']);
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->foreignId('clinic_id')->nullable(false)->change();
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->foreign('clinic_id')->references('id')->on('clinics')->cascadeOnDelete();
        });
    }
};

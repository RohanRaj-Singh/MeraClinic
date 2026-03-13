<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropUnique('patients_reference_number_unique');
            $table->unique(['clinic_id', 'reference_number'], 'patients_clinic_id_reference_number_unique');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropUnique('patients_clinic_id_reference_number_unique');
            $table->unique('reference_number');
        });
    }
};

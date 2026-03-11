<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained()->onDelete('cascade');
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('visit_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('report_type_id')->constrained()->onDelete('cascade');
            $table->json('value')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('clinic_id');
            $table->index('patient_id');
            $table->index('visit_id');
            $table->index('report_type_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};

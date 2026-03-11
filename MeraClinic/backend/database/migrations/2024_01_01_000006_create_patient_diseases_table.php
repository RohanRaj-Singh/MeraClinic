<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_diseases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('disease_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['patient_id', 'disease_id']);
            $table->index('patient_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_diseases');
    }
};

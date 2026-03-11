<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinic_id')->constrained()->onDelete('cascade');
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('visit_number', 20);
            $table->integer('visit_counter')->default(1);
            $table->date('visit_date');
            $table->time('visit_time');
            $table->longText('prescription')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('received_amount', 10, 2)->default(0);
            $table->timestamps();

            $table->index('clinic_id');
            $table->index('patient_id');
            $table->index('user_id');
            $table->index('visit_date');
            $table->index(['clinic_id', 'visit_date']);
            $table->unique(['patient_id', 'visit_counter']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visits');
    }
};

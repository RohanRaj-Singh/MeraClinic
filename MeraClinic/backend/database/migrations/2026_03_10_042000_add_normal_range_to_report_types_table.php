<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('report_types', function (Blueprint $table) {
            if (!Schema::hasColumn('report_types', 'normal_range')) {
                $table->string('normal_range')->nullable()->after('unit');
            }
        });
    }

    public function down(): void
    {
        Schema::table('report_types', function (Blueprint $table) {
            $table->dropColumn(['unit', 'normal_range']);
        });
    }
};

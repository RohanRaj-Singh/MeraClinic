<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Make clinic_id nullable for super_admin
        DB::statement('ALTER TABLE users MODIFY COLUMN clinic_id BIGINT UNSIGNED NULL');

        // Create a default super admin user
        DB::table('users')->updateOrInsert(
            ['email' => 'mrsinghdev13@gmail.com'],
            [
                'name' => 'Super Admin',
                'email' => 'mrsinghdev13@gmail.com',
                'password' => Hash::make('mrsingh@1313'),
                'role' => 'super_admin',
                'clinic_id' => null, // Super admin doesn't belong to any clinic
                'phone' => '+923001234567',
                'is_active' => true,
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $this->command->info('Super admin user created successfully!');
        $this->command->info('Email: mrsinghdev13@gmail.com');
        $this->command->info('Password: mrsingh@1313');
    }
}

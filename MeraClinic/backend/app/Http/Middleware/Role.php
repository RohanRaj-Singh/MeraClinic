<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Role
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        if ($request->user()->role !== $role && $role !== 'any') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. This action requires ' . $role . ' role.',
            ], 403);
        }

        return $next($request);
    }
}

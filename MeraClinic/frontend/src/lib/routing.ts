import type { User } from '@/services/auth';

export function getDefaultRoute(user: Pick<User, 'role'> | null | undefined): string {
  return user?.role === 'super_admin' ? '/admin' : '/dashboard';
}

export function canAccessPath(user: Pick<User, 'role'> | null | undefined, path: string): boolean {
  if (!user) {
    return false;
  }

  if (path.startsWith('/admin')) {
    return user.role === 'super_admin';
  }

  if (path === '/' || path.startsWith('/dashboard') || path.startsWith('/patients') || path.startsWith('/visits') || path.startsWith('/settings')) {
    return user.role === 'doctor';
  }

  return false;
}

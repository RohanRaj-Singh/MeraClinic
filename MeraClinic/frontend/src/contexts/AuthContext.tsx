import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    clinic_name: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = authService.getToken();
    if (token) {
      authService.me()
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          authService.setToken('');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await authService.login({ email, password });
    
    if ('otp_required' in response && response.otp_required) {
      throw new Error('OTP_REQUIRED');
    }

    authService.setToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    clinic_name: string;
    phone?: string;
  }) => {
    const response = await authService.register(data);
    authService.setToken(response.data.token);
    setUser(response.data.user);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      authService.setToken('');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const response = await authService.me();
    setUser(response.data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

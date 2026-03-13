import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthResponse, OtpChallengeResponse, RegisterResponse, User } from '@/services/auth';
import { AUTH_EXPIRED_EVENT } from '@/lib/api';

interface LoginResult {
  user?: User;
  otpRequired: boolean;
  challenge?: OtpChallengeResponse;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    clinic_name: string;
    phone?: string;
  }) => Promise<RegisterResponse>;
  verifyOtp: (email: string, otp: string) => Promise<User>;
  resendOtp: (email: string) => Promise<OtpChallengeResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isOtpChallengeResponse(data: AuthResponse | OtpChallengeResponse): data is OtpChallengeResponse {
  return 'otp_expires_at' in data && !('token' in data);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    if (token && !authService.isSessionExpired()) {
      authService.me()
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          authService.setToken(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      authService.setToken(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      authService.setToken(null);
      setUser(null);
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    const response = await authService.login({ email, password });
    
    if (response.otp_required && isOtpChallengeResponse(response.data)) {
      return {
        otpRequired: true,
        challenge: response.data,
      };
    }

    if (isOtpChallengeResponse(response.data)) {
      throw new Error('Unable to complete login challenge');
    }

    authService.setToken(response.data.token, response.data.expires_at);
    setUser(response.data.user);
    return {
      otpRequired: false,
      user: response.data.user,
    };
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
    return response.data;
  };

  const verifyOtp = async (email: string, otp: string): Promise<User> => {
    const response = await authService.verifyOtp(email, otp);
    authService.setToken(response.data.token, response.data.expires_at);
    setUser(response.data.user);
    return response.data.user;
  };

  const resendOtp = async (email: string): Promise<OtpChallengeResponse> => {
    const response = await authService.resendOtp(email);
    return response.data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      authService.setToken(null);
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
        verifyOtp,
        resendOtp,
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

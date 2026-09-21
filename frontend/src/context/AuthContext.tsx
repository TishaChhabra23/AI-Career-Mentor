import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/auth';

interface AuthContextType {
  user: authService.User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  login: (data: Record<string, string>) => Promise<void>;
  register: (data: Record<string, string>) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (data: Record<string, string>) => Promise<string>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<authService.User | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const res = await authService.getMeApi();
      setUser(res.data.user);
      
      try {
        const edu = await authService.getEducationApi();
        const prof = await authService.getProfileApi();
        setIsOnboarded(!!edu.data && !!prof.data?.profile);
      } catch (e) {
        setIsOnboarded(false);
      }
    } catch (err) {
      setUser(null);
      setIsOnboarded(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (data: Record<string, string>) => {
    const res = await authService.loginApi(data);
    setUser(res.data.user);
    // Fetch onboarding status
    try {
      const edu = await authService.getEducationApi();
      const prof = await authService.getProfileApi();
      setIsOnboarded(!!edu.data && !!prof.data?.profile);
    } catch (e) {
      setIsOnboarded(false);
    }
  };

  const register = async (data: Record<string, string>) => {
    const res = await authService.registerApi(data);
    setUser(res.data.user);
    setIsOnboarded(false); // Brand new user has not completed onboarding
  };

  const logout = async () => {
    await authService.logoutApi();
    setUser(null);
    setIsOnboarded(false);
  };

  const forgotPassword = async (email: string) => {
    const res = await authService.forgotPasswordApi(email);
    return res.message;
  };

  const resetPassword = async (data: Record<string, string>) => {
    const res = await authService.resetPasswordApi(data);
    return res.message;
  };

  const deleteAccount = async () => {
    await authService.deleteAccountApi();
    setUser(null);
    setIsOnboarded(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isOnboarded,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        deleteAccount,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { API_BASE } from '../config/api.config';

export type UserRole = 'student' | 'teacher' | 'superuser';

export interface Student {
  id: string;
  email: string | null;
  studentId: string | null;
  name: string;
  role: UserRole;
  teacherId: string | null;
  mustChangePassword: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

interface AuthContextType {
  student: Student | null;
  isAuthenticated: boolean;
  isTeacher: boolean;
  isSuperuser: boolean;
  isAdmin: boolean; // true for both teacher and superuser
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      fetchCurrentUser(storedToken)
        .then((user) => {
          if (user) {
            setStudent(user);
            setToken(storedToken);
          } else {
            localStorage.removeItem('authToken');
            setToken(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('authToken');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (authToken: string): Promise<Student | null> => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.student;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      return null;
    }
  };

  const login = useCallback(async (identifier: string, password: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    setToken(data.token);
    setStudent(data.student);
  }, []);

  const changePassword = useCallback(async (newPassword: string): Promise<void> => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to change password');
    }

    // After successful password change, update local student state to clear mustChangePassword
    if (student) {
      setStudent({ ...student, mustChangePassword: false });
    }
  }, [token, student]);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setStudent(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        student,
        isAuthenticated: !!student,
        isTeacher: student?.role === 'teacher',
        isSuperuser: student?.role === 'superuser',
        isAdmin: student?.role === 'teacher' || student?.role === 'superuser',
        isLoading,
        login,
        changePassword,
        logout,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

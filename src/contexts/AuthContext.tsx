// src/contexts/AuthContext.tsx
"use client";
import type React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/lib/types';
import { 
  getUsersFromLocalStorage, 
  saveUsersToLocalStorage,
  getAuthenticatedUserFromLocalStorage,
  saveAuthenticatedUserToLocalStorage,
  removeAuthenticatedUserFromLocalStorage 
} from '@/lib/localStorageService';
import { useRouter } from 'next/navigation';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, passwordAttempt: string) => Promise<boolean>;
  signup: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const authenticatedUser = getAuthenticatedUserFromLocalStorage();
    if (authenticatedUser) {
      setUser(authenticatedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, passwordAttempt: string): Promise<boolean> => {
    setIsLoading(true);
    const users = getUsersFromLocalStorage();
    const foundUser = users.find(u => u.email === email);

    // Simulate password check (in real app, this is backend/hashing)
    if (foundUser && foundUser.password === passwordAttempt) {
      setUser(foundUser);
      saveAuthenticatedUserToLocalStorage(foundUser);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  }, []);

  const signup = useCallback(async (userData: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
    setIsLoading(true);
    const users = getUsersFromLocalStorage();
    if (users.find(u => u.email === userData.email)) {
      setIsLoading(false);
      return false; // User already exists
    }

    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsersToLocalStorage(users);
    setUser(newUser);
    saveAuthenticatedUserToLocalStorage(newUser);
    setIsLoading(false);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    removeAuthenticatedUserFromLocalStorage();
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

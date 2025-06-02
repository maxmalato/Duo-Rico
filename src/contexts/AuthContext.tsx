// src/contexts/AuthContext.tsx
"use client";
import type React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile, ProfileData } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import type { AuthError, Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  // Funções de usuário do localStorage não são mais primárias para auth, 
  // mas podem ser necessárias para migração ou outras funcionalidades.
  // Por enquanto, vamos focar na integração com Supabase.
  // getUsersFromLocalStorage, 
  // saveUsersToLocalStorage,
  // getAuthenticatedUserFromLocalStorage, // Substituído por Supabase session
  // saveAuthenticatedUserToLocalStorage, // Substituído por Supabase session
  // removeAuthenticatedUserFromLocalStorage // Substituído por Supabase signOut
} from '@/lib/localStorageService';


export interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, passwordAttempt: string) => Promise<{ success: boolean, error?: AuthError | null }>;
  signup: (userData: { fullName: string; email: string; password?: string; optInMarketing: boolean; }) => Promise<{ success: boolean, error?: AuthError | null }>;
  logout: () => Promise<void>;
  session: Session | null; // Adicionado para expor a sessão
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = useCallback(async (authUser: SupabaseAuthUser): Promise<UserProfile | null> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('name, opt_in_marketing, couple_id')
      .eq('id', authUser.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: "Row to retrieve was not found" - perfil pode não existir ainda
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return {
      id: authUser.id,
      email: authUser.email || '',
      fullName: profile?.name || '', // Pegar nome do perfil
      optInMarketing: profile?.opt_in_marketing || false,
      couple_id: profile?.couple_id || null,
    };
  }, []);


  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user);
        setUser(userProfile);
      }
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setIsLoading(true);
      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = useCallback(async (email: string, passwordAttempt: string): Promise<{ success: boolean, error?: AuthError | null }> => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: passwordAttempt,
    });
    setIsLoading(false);
    if (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
    // onAuthStateChange vai lidar com a atualização do estado do usuário/perfil
    return { success: true };
  }, []);

  const signup = useCallback(async (
    userData: { fullName: string; email: string; password?: string; optInMarketing: boolean; }
    ): Promise<{ success: boolean, error?: AuthError | null }> => {
    setIsLoading(true);
    if (!userData.password) {
      setIsLoading(false);
      console.error("Password is required for signup.");
      // Retornar um objeto de erro compatível com AuthError do Supabase (simulado)
      return { success: false, error: { name: 'AuthApiError', message: 'Password is required', status: 400 } as AuthError };
    }

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (signUpError) {
      setIsLoading(false);
      console.error('Signup error:', signUpError);
      return { success: false, error: signUpError };
    }

    if (authData.user) {
      // Usuário criado no Supabase Auth, agora criar perfil em public.profiles
      const profileToInsert: ProfileData & { id: string } = {
        id: authData.user.id,
        name: userData.fullName,
        opt_in_marketing: userData.optInMarketing,
        // couple_id pode ser definido posteriormente
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileToInsert);

      if (profileError) {
        setIsLoading(false);
        console.error('Error creating profile:', profileError);
        // Aqui pode ser necessário lidar com o caso de usuário criado no Auth mas perfil falhou
        // Por simplicidade, retornamos o erro do perfil.
        return { success: false, error: { name: 'ProfileError', message: profileError.message, details: profileError.details } as AuthError };
      }
      // onAuthStateChange vai lidar com a atualização do estado do usuário/perfil
    }
    setIsLoading(false);
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
    setUser(null); // Limpa o usuário localmente também
    setSession(null);
    router.push('/login'); // Redireciona após logout
    setIsLoading(false);
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, session }}>
      {children}
    </AuthContext.Provider>
  );
};

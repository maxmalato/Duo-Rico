// src/contexts/AuthContext.tsx
"use client";
import type React from 'react';
import { createContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile, ProfileData } from '@/lib/types';
import { supabase } from '@/lib/supabaseClient';
import type { AuthError, Session, User as SupabaseAuthUser, PostgrestError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, passwordAttempt: string) => Promise<{ success: boolean, error?: AuthError | null }>;
  signup: (userData: { fullName: string; email: string; password?: string; }) => Promise<{ success: boolean, error?: AuthError | null }>;
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
      .select('name, couple_id')
      .eq('id', authUser.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: "Row to retrieve was not found" - perfil pode não existir ainda
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return {
      id: authUser.id,
      email: authUser.email || '',
      fullName: profile?.name || '', 
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
    return { success: true };
  }, []);

  const signup = useCallback(async (
    userData: { fullName: string; email: string; password?: string; }
    ): Promise<{ success: boolean, error?: AuthError | null }> => {
    setIsLoading(true);
    if (!userData.password) {
      setIsLoading(false);
      console.error("Password is required for signup.");
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
      const profileToInsert: ProfileData & { id: string } = {
        id: authData.user.id,
        name: userData.fullName,
        // couple_id pode ser definido posteriormente
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileToInsert) as { error: PostgrestError | null }; // Explicitly type profileError

      if (profileError) {
        setIsLoading(false);
        console.error('Error creating profile. Supabase error:', JSON.stringify(profileError, null, 2));
        
        // Construct a more detailed error message for the client
        let clientErrorMessage = 'Não foi possível criar o perfil de usuário após o registro. ';
        clientErrorMessage += `Detalhe do Supabase: ${profileError.message || 'Erro desconhecido.'}`;
        if (profileError.code) {
          clientErrorMessage += ` (Código: ${profileError.code})`;
        }
        if (profileError.details) {
          clientErrorMessage += ` Detalhes: ${profileError.details}`;
        }
        clientErrorMessage += ' Por favor, verifique as RLS policies e a estrutura da tabela "profiles" no Supabase.';

        return { 
          success: false, 
          error: { 
            name: 'ProfileError', // Custom name to identify profile creation errors
            message: clientErrorMessage,
            // Supabase's AuthError has specific fields, we're creating a similar structure
            // 'details' and 'code' might not directly map to AuthError fields but are useful for our custom error
          } as unknown as AuthError // Cast to AuthError, acknowledge it's a custom structure for 'message'
        };
      }
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
    setUser(null); 
    setSession(null);
    router.push('/login'); 
    setIsLoading(false);
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, session }}>
      {children}
    </AuthContext.Provider>
  );
};

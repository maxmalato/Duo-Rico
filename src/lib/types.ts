
// src/lib/types.ts

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  couple_id?: string | null;
}

export interface ProfileData {
  name: string;
  couple_id?: string | null;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string; // Gerado pelo Supabase (UUID)
  user_id: string; // UUID do Supabase Auth user que criou originalmente
  type: TransactionType;
  description: string;
  amount: number; // Armazenado como NUMERIC no Supabase, mas tratado como number no frontend
  category: string;
  month: number; // 1-12
  year: number;
  createdAt: string; // Gerado pelo Supabase (TIMESTAMPTZ), string ISO no frontend
  isRecurring?: boolean;
  recurringGroupId?: string | null; // UUID para agrupar transações recorrentes
  installmentNumber?: number | null;
  totalInstallments?: number | null;
  couple_id?: string | null; // Para compartilhamento, UUID
}


export interface Category {
  value: string;
  label: string;
}

// LegacyUser não é mais necessário, pois UserProfile cobre os dados do usuário logado.
// O gerenciamento de usuários está agora totalmente integrado com Supabase Auth e a tabela 'profiles'.

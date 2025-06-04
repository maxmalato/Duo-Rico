// src/lib/types.ts

// Representa o perfil do usuário combinado com dados de autenticação
// Usado no AuthContext e em toda a aplicação para o usuário logado
export interface UserProfile {
  id: string; // UUID do Supabase Auth user
  fullName: string; // Da tabela 'profiles'
  email: string; // Do Supabase Auth user
  couple_id?: string | null; // Da tabela 'profiles', para futuras implementações
  // createdAt é gerenciado pelo Supabase e pode ser acessado via auth.user.created_at
}


// Tipo para os dados que são armazenados na tabela 'profiles'
// Excluindo 'id' e 'email' que vêm diretamente do Supabase Auth user
export interface ProfileData {
  name: string; // Corresponde a 'fullName'
  couple_id?: string | null;
}


// Tipos para transações permanecem os mesmos por enquanto
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string; // Deverá ser o ID do usuário do Supabase que criou originalmente
  type: TransactionType;
  description: string;
  amount: number;
  category: string;
  month: number; // 1-12
  year: number;
  createdAt: string; // ISO date string
  isRecurring?: boolean;
  recurringGroupId?: string; 
  installmentNumber?: number; 
  totalInstallments?: number; 
  couple_id?: string | null; // Adicionado para compartilhamento
}

export interface Category {
  value: string;
  label: string;
}


// Tipo User original, usado pelo localStorageService (será gradualmente substituído)
// Mantido por enquanto para não quebrar o localStorageService para transações.
export interface LegacyUser {
  id: string;
  fullName: string;
  email: string;
  password?: string; 
  optInMarketing: boolean; // Mantido aqui apenas para LegacyUser, não mais usado no UserProfile
  createdAt: string;
}

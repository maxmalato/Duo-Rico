export interface User {
  id: string;
  fullName: string; // Adicionado campo para nome completo
  email: string;
  password?: string; // Password stored hashed in a real DB, plain for localStorage simulation
  optInMarketing: boolean;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: string;
  month: number; // 1-12
  year: number;
  createdAt: string; // ISO date string
  isRecurring?: boolean;
  recurringGroupId?: string; // ID linking all transactions in a recurring series
  installmentNumber?: number; // e.g., 1 of 12
  totalInstallments?: number; // e.g., 12
}

export interface Category {
  value: string;
  label: string;
}

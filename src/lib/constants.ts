
import type { Category } from './types';

export const LOCAL_STORAGE_USERS_KEY = 'duoRicoUsers';
export const LOCAL_STORAGE_TRANSACTIONS_KEY = 'duoRicoTransactions';
export const LOCAL_STORAGE_AUTH_USER_KEY = 'duoRicoAuthUser';

export const INCOME_CATEGORIES: Category[] = [
  { value: 'bonus', label: 'Bônus' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'gifts', label: 'Presentes' },
  { value: 'investments', label: 'Investimentos' },
  { value: 'other', label: 'Outro' },
  { value: 'salary', label: 'Salário' },
].sort((a, b) => a.label.localeCompare(b.label));

export const EXPENSE_CATEGORIES: Category[] = [
  { value: 'rent_mortgage', label: 'Aluguel/Moradia' },
  { value: 'subscriptions', label: 'Assinaturas (Streaming, Apps)' },
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'utilities', label: 'Contas (Gás, Luz, Água)' },
  { value: 'personal_care', label: 'Cuidados Pessoais' },
  { value: 'debt_payment', label: 'Pagamento de Dívidas' },
  { value: 'tithes', label: 'Dízimos' },
  { value: 'gifts_donations', label: 'Presentes/Doações' },
  { value: 'education', label: 'Educação' },
  { value: 'internet_phone', label: 'Internet/Telefone' },
  { value: 'entertainment', label: 'Lazer/Entretenimento' },
  { value: 'other', label: 'Outro' },
  { value: 'pets', label: 'Animais de Estimação' },
  { value: 'savings', label: 'Poupança/Investimentos' },
  { value: 'healthcare', label: 'Saúde' },
  { value: 'groceries', label: 'Supermercado' },
  { value: 'transportation', label: 'Transporte' },
  { value: 'clothing', label: 'Vestuário' },
  { value: 'travel', label: 'Viagens' },
].sort((a, b) => a.label.localeCompare(b.label));

export const MONTHS: { value: number; label: string }[] = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

export const CURRENT_YEAR = new Date().getFullYear();
export const YEARS: { value: number; label: string }[] = Array.from({ length: 10 }, (_, i) => ({
  value: CURRENT_YEAR - 5 + i,
  label: (CURRENT_YEAR - 5 + i).toString(),
}));

// Helper function to get category label
export const getCategoryLabel = (value: string, type: 'income' | 'expense'): string => {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const category = categories.find(cat => cat.value === value);
  return category ? category.label : value.replace(/_/g, " ");
};


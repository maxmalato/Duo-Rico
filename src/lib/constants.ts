import type { Category } from './types';

export const LOCAL_STORAGE_USERS_KEY = 'duoRicoUsers';
export const LOCAL_STORAGE_TRANSACTIONS_KEY = 'duoRicoTransactions';
export const LOCAL_STORAGE_AUTH_USER_KEY = 'duoRicoAuthUser';

export const INCOME_CATEGORIES: Category[] = [
  { value: 'salary', label: 'Salário' },
  { value: 'bonus', label: 'Bônus' },
  { value: 'gifts', label: 'Presentes' },
  { value: 'investments', label: 'Investimentos' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'other', label: 'Outro' },
];

export const EXPENSE_CATEGORIES: Category[] = [
  { value: 'rent_mortgage', label: 'Aluguel/Hipoteca' },
  { value: 'utilities', label: 'Contas (Gás, Luz, Água)' },
  { value: 'internet_phone', label: 'Internet/Telefone' },
  { value: 'groceries', label: 'Supermercado' },
  { value: 'dining_out', label: 'Restaurantes' },
  { value: 'transportation', label: 'Transporte (Carro, Público)' },
  { value: 'healthcare', label: 'Saúde (Plano, Contas Médicas)' },
  { value: 'entertainment', label: 'Entretenimento' },
  { value: 'clothing', label: 'Vestuário' },
  { value: 'education', label: 'Educação' },
  { value: 'debt_payment', label: 'Pagamento de Dívidas' },
  { value: 'savings', label: 'Poupança' },
  { value: 'gifts_donations', label: 'Presentes/Doações' },
  { value: 'personal_care', label: 'Cuidados Pessoais' },
  { value: 'other', label: 'Outro' },
];

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

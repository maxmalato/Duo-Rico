import type { Category } from './types';

export const LOCAL_STORAGE_USERS_KEY = 'duoRicoUsers';
export const LOCAL_STORAGE_TRANSACTIONS_KEY = 'duoRicoTransactions';
export const LOCAL_STORAGE_AUTH_USER_KEY = 'duoRicoAuthUser';

export const INCOME_CATEGORIES: Category[] = [
  { value: 'salary', label: 'Salary' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'gifts', label: 'Gifts' },
  { value: 'investments', label: 'Investments' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'other', label: 'Other' },
];

export const EXPENSE_CATEGORIES: Category[] = [
  { value: 'rent_mortgage', label: 'Rent/Mortgage' },
  { value: 'utilities', label: 'Utilities (Gas, Electric, Water)' },
  { value: 'internet_phone', label: 'Internet/Phone' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'dining_out', label: 'Dining Out' },
  { value: 'transportation', label: 'Transportation (Car, Public Transit)' },
  { value: 'healthcare', label: 'Healthcare (Insurance, Medical Bills)' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'education', label: 'Education' },
  { value: 'debt_payment', label: 'Debt Payment' },
  { value: 'savings', label: 'Savings' },
  { value: 'gifts_donations', label: 'Gifts/Donations' },
  { value: 'personal_care', label: 'Personal Care' },
  { value: 'other', label: 'Other' },
];

export const MONTHS: { value: number; label: string }[] = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export const CURRENT_YEAR = new Date().getFullYear();
export const YEARS: { value: number; label: string }[] = Array.from({ length: 10 }, (_, i) => ({
  value: CURRENT_YEAR - 5 + i,
  label: (CURRENT_YEAR - 5 + i).toString(),
}));

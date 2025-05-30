// src/lib/localStorageService.ts
import type { User, Transaction } from './types';
import { LOCAL_STORAGE_USERS_KEY, LOCAL_STORAGE_TRANSACTIONS_KEY, LOCAL_STORAGE_AUTH_USER_KEY } from './constants';

// Generic getter
const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

// Generic setter
const saveToLocalStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
  }
};

// User specific functions
export const getUsersFromLocalStorage = (): User[] => getFromLocalStorage<User[]>(LOCAL_STORAGE_USERS_KEY, []);
export const saveUsersToLocalStorage = (users: User[]): void => saveToLocalStorage<User[]>(LOCAL_STORAGE_USERS_KEY, users);

export const getAuthenticatedUserFromLocalStorage = (): User | null => getFromLocalStorage<User | null>(LOCAL_STORAGE_AUTH_USER_KEY, null);
export const saveAuthenticatedUserToLocalStorage = (user: User): void => saveToLocalStorage<User | null>(LOCAL_STORAGE_AUTH_USER_KEY, user);
export const removeAuthenticatedUserFromLocalStorage = (): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(LOCAL_STORAGE_AUTH_USER_KEY);
}

// Transaction specific functions
export const getTransactionsFromLocalStorage = (): Transaction[] => getFromLocalStorage<Transaction[]>(LOCAL_STORAGE_TRANSACTIONS_KEY, []);
export const saveTransactionsToLocalStorage = (transactions: Transaction[]): void => saveToLocalStorage<Transaction[]>(LOCAL_STORAGE_TRANSACTIONS_KEY, transactions);

export const addTransactionToLocalStorage = (transaction: Transaction): void => {
  const transactions = getTransactionsFromLocalStorage();
  transactions.push(transaction);
  saveTransactionsToLocalStorage(transactions);
};

export const updateTransactionInLocalStorage = (updatedTransaction: Transaction): void => {
  let transactions = getTransactionsFromLocalStorage();
  transactions = transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t);
  saveTransactionsToLocalStorage(transactions);
};

export const deleteTransactionFromLocalStorage = (transactionId: string): void => {
  let transactions = getTransactionsFromLocalStorage();
  transactions = transactions.filter(t => t.id !== transactionId);
  saveTransactionsToLocalStorage(transactions);
};

export const deleteFutureRecurringTransactions = (recurringGroupId: string, currentMonth: number, currentYear: number): void => {
  let transactions = getTransactionsFromLocalStorage();
  transactions = transactions.filter(t => {
    if (t.recurringGroupId === recurringGroupId) {
      // Check if transaction date is same or after currentMonth/Year
      const transactionDate = new Date(t.year, t.month - 1); // month is 0-indexed
      const currentDate = new Date(currentYear, currentMonth - 1);
      return transactionDate < currentDate;
    }
    return true;
  });
  saveTransactionsToLocalStorage(transactions);
};

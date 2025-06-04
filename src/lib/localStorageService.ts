
// src/lib/transactionService.ts (Conteúdo do antigo localStorageService.ts, agora focado em Supabase para transações)
import type { Transaction } from './types';
import { supabase } from './supabaseClient';

// Helper function to map frontend Transaction (camelCase where applicable) to DB transaction (snake_case)
const mapToDbTransaction = (transaction: Partial<Omit<Transaction, 'id' | 'createdAt'>>): any => {
  const {
    isRecurring,
    recurringGroupId,
    installmentNumber,
    totalInstallments,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    id, // id should not be sent for insert, handled by update
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createdAt, // createdAt is set by db and should not be sent for insert/update typically
    ...rest // rest will include user_id, couple_id directly as they are named in Transaction type
  } = transaction;

  const dbTransaction: any = { ...rest }; // Copies fields like description, amount, category, type, month, year, user_id, couple_id
  
  // Map camelCase frontend fields to snake_case DB fields
  if (isRecurring !== undefined) dbTransaction.is_recurring = isRecurring; else if (isRecurring === null) dbTransaction.is_recurring = undefined; // Or false based on DB default
  if (recurringGroupId !== undefined) dbTransaction.recurring_group_id = recurringGroupId; else if (recurringGroupId === null) dbTransaction.recurring_group_id = null;
  if (installmentNumber !== undefined) dbTransaction.installment_number = installmentNumber; else if (installmentNumber === null) dbTransaction.installment_number = null;
  if (totalInstallments !== undefined) dbTransaction.total_installments = totalInstallments; else if (totalInstallments === null) dbTransaction.total_installments = null;
  
  return dbTransaction;
};

// Helper function to map DB transaction (snake_case) to frontend Transaction (camelCase where applicable)
const mapFromDbTransaction = (dbData: any): Transaction => {
  const {
    // Destructure all snake_case fields from DB that need mapping or specific handling
    created_at,
    is_recurring,
    recurring_group_id,
    installment_number,
    total_installments,
    amount,
    // user_id and couple_id from dbData will be in 'rest' if not destructured
    ...rest // Contains fields like id, description, category, type, month, year, user_id, couple_id
  } = dbData;

  // Initialize with fields that don't need name transformation (or are already correct in 'rest')
  const transaction: Partial<Transaction> = { ...rest }; 

  // Explicitly map snake_case from DB to camelCase for frontend type
  if (created_at) transaction.createdAt = created_at;
  if (is_recurring !== undefined) transaction.isRecurring = is_recurring; else if (is_recurring === null) transaction.isRecurring = undefined;
  if (recurring_group_id !== undefined) transaction.recurringGroupId = recurring_group_id;
  if (installment_number !== undefined) transaction.installmentNumber = installment_number;
  if (total_installments !== undefined) transaction.totalInstallments = total_installments;
  
  transaction.amount = Number(amount); // Ensure amount is a number

  // Ensure user_id and couple_id from db (which are in 'rest' if names match Transaction type) are correctly assigned.
  // If Transaction type used camelCase (e.g., userId), explicit mapping would be needed here too.
  // Since Transaction type uses user_id and couple_id, they are correctly picked by '...rest'.
  
  return transaction as Transaction;
};

/**
 * Busca todas as transações do Supabase.
 * As RLS policies no Supabase garantirão que o usuário veja apenas transações permitidas.
 */
export const getTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*');

  if (error) {
    console.error('Error fetching transactions from Supabase:', JSON.stringify(error, null, 2));
    return [];
  }
  return data.map(mapFromDbTransaction);
};

/**
 * Adiciona uma nova transação ao Supabase.
 */
export const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction | null> => {
  const dbReadyData = mapToDbTransaction(transactionData);
  const { data, error } = await supabase
    .from('transactions')
    .insert([dbReadyData])
    .select()
    .single();

  if (error) {
    console.error('Error adding transaction to Supabase:', JSON.stringify(error, null, 2));
    return null;
  }
  return data ? mapFromDbTransaction(data) : null;
};

/**
 * Atualiza uma transação existente no Supabase.
 */
export const updateTransaction = async (updatedTransaction: Transaction): Promise<Transaction | null> => {
  const { id, ...transactionData } = updatedTransaction; // Destructure id
  const dbReadyData = mapToDbTransaction(transactionData); // Pass data without id and createdAt for mapping

  const { data, error } = await supabase
    .from('transactions')
    .update(dbReadyData)
    .eq('id', id) // Use the original id for the 'eq' clause
    .select()
    .single();

  if (error) {
    console.error('Error updating transaction in Supabase:', JSON.stringify(error, null, 2));
    return null;
  }
  return data ? mapFromDbTransaction(data) : null;
};

/**
 * Exclui uma transação do Supabase pelo ID.
 */
export const deleteTransaction = async (transactionId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId);

  if (error) {
    console.error('Error deleting transaction from Supabase:', JSON.stringify(error, null, 2));
    return false;
  }
  return true;
};

/**
 * Exclui futuras transações recorrentes de um grupo específico,
 * a partir de um mês e ano de referência.
 */
export const deleteFutureRecurringTransactions = async (
  recurringGroupId: string,
  currentMonth: number,
  currentYear: number
): Promise<boolean> => {
  // Fetch transactions to identify specific IDs based on date logic
  const { data: transactionsToDelete, error: fetchError } = await supabase
    .from('transactions')
    .select('id, month, year') // Only select necessary fields
    .eq('recurring_group_id', recurringGroupId);

  if (fetchError) {
    console.error('Error fetching recurring transactions to delete:', JSON.stringify(fetchError, null, 2));
    return false;
  }

  const idsToDelete: string[] = [];
  const referenceDate = new Date(currentYear, currentMonth - 1); // Month is 0-indexed for Date constructor

  transactionsToDelete.forEach(t => {
    const transactionDate = new Date(t.year, t.month - 1); // Month from DB is 1-indexed
    if (transactionDate >= referenceDate) {
      idsToDelete.push(t.id);
    }
  });

  if (idsToDelete.length === 0) {
    return true; // No transactions to delete
  }

  const { error: deleteError } = await supabase
    .from('transactions')
    .delete()
    .in('id', idsToDelete);

  if (deleteError) {
    console.error('Error deleting future recurring transactions from Supabase:', JSON.stringify(deleteError, null, 2));
    return false;
  }
  return true;
};

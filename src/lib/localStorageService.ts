
// src/lib/transactionService.ts (Conteúdo do antigo localStorageService.ts, agora focado em Supabase para transações)
import type { Transaction } from './types';
import { supabase } from './supabaseClient';

// As funções relacionadas ao LocalStorage para usuários foram removidas,
// pois o AuthContext agora lida com perfis de usuário diretamente do Supabase.

// --- Funções de Transação com Supabase ---

/**
 * Busca todas as transações do Supabase.
 * As RLS policies no Supabase garantirão que o usuário veja apenas transações permitidas.
 */
export const getTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*');

  if (error) {
    console.error('Error fetching transactions from Supabase:', error);
    return [];
  }
  // O Supabase retorna amount como string se for NUMERIC, precisa converter.
  // E created_at é uma string ISO, o que está ok.
  return data.map(t => ({ ...t, amount: Number(t.amount) })) as Transaction[];
};

/**
 * Adiciona uma nova transação ao Supabase.
 * A coluna 'id' será gerada pelo Supabase.
 * A coluna 'created_at' será definida pelo Supabase.
 */
export const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction | null> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transactionData])
    .select()
    .single(); // .single() para retornar o objeto inserido

  if (error) {
    console.error('Error adding transaction to Supabase:', error);
    return null;
  }
  return data ? { ...data, amount: Number(data.amount) } as Transaction : null;
};

/**
 * Atualiza uma transação existente no Supabase.
 */
export const updateTransaction = async (updatedTransaction: Transaction): Promise<Transaction | null> => {
  const { id, ...updateData } = updatedTransaction;
  const { data, error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating transaction in Supabase:', error);
    return null;
  }
  return data ? { ...data, amount: Number(data.amount) } as Transaction : null;
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
    console.error('Error deleting transaction from Supabase:', error);
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
  // Esta lógica é um pouco complexa para RLS diretas, então faremos em duas etapas:
  // 1. Buscar IDs das transações a serem deletadas.
  // 2. Deletar essas transações pelos IDs.

  // Busca transações do grupo recorrente que são do mês/ano atual ou futuros
  const { data: transactionsToDelete, error: fetchError } = await supabase
    .from('transactions')
    .select('id, month, year')
    .eq('recurring_group_id', recurringGroupId);

  if (fetchError) {
    console.error('Error fetching recurring transactions to delete:', fetchError);
    return false;
  }

  const idsToDelete: string[] = [];
  const referenceDate = new Date(currentYear, currentMonth - 1); // Mês é 0-indexado no Date

  transactionsToDelete.forEach(t => {
    const transactionDate = new Date(t.year, t.month - 1);
    if (transactionDate >= referenceDate) {
      idsToDelete.push(t.id);
    }
  });

  if (idsToDelete.length === 0) {
    return true; // Nenhuma transação futura para deletar
  }

  const { error: deleteError } = await supabase
    .from('transactions')
    .delete()
    .in('id', idsToDelete);

  if (deleteError) {
    console.error('Error deleting future recurring transactions from Supabase:', deleteError);
    return false;
  }
  return true;
};

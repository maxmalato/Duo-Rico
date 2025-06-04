// src/app/expenses/page.tsx
"use client";

import { ProtectedPageLayout } from "@/components/layout/ProtectedPageLayout";
import { TransactionForm } from "@/components/common/TransactionForm";
import { TransactionList } from "@/components/common/TransactionList";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { EXPENSE_CATEGORIES, MONTHS, CURRENT_YEAR, YEARS } from "@/lib/constants";
import { getTransactionsFromLocalStorage } from "@/lib/localStorageService";
import { useAuth } from "@/hooks/useAuth";
import type { Transaction } from "@/lib/types";
import { useEffect, useState, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyBRL } from "@/lib/utils";

export default function ExpensesPage() {
  const { user } = useAuth();
  const [allExpenses, setAllExpenses] = useState<Transaction[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Transaction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);

  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(CURRENT_YEAR);
  
  const fetchExpenses = useCallback(() => {
    if (user) {
      const allTransactions = getTransactionsFromLocalStorage();
      let userVisibleTransactions: Transaction[];

      if (user.couple_id) {
        userVisibleTransactions = allTransactions.filter(t => t.type === 'expense' && t.couple_id === user.couple_id);
      } else {
        userVisibleTransactions = allTransactions.filter(t => t.type === 'expense' && t.userId === user.id && (!t.couple_id || t.couple_id === user.couple_id));
      }
      setAllExpenses(userVisibleTransactions);
    }
  }, [user]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    const filtered = allExpenses.filter(t => t.month === filterMonth && t.year === filterYear)
                                .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setFilteredExpenses(filtered);
  }, [allExpenses, filterMonth, filterYear]);

  const handleFormSubmit = () => {
    fetchExpenses(); 
  };

  const openAddDialog = () => {
    setEditingTransaction(undefined);
    setIsDialogOpen(true);
  };

  const openEditDialog = (transaction: Transaction) => {
    if (user && ((user.couple_id && transaction.couple_id === user.couple_id) || transaction.userId === user.id)) {
      setEditingTransaction(transaction);
      setIsDialogOpen(true);
    } else {
      console.warn("Tentativa de editar transação não permitida.");
    }
  };

  const totalFilteredExpenses = filteredExpenses.reduce((sum, t) => sum + t.amount, 0);
  const currentMonthLabel = MONTHS.find(m => m.value === filterMonth)?.label || "";

  return (
    <ProtectedPageLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Gerenciamento de Despesas</h1>
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="w-full md:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTransaction ? 'Editar' : 'Adicionar Nova'} Despesa</DialogTitle>
              </DialogHeader>
              <TransactionForm
                type="expense"
                categories={EXPENSE_CATEGORIES}
                existingTransaction={editingTransaction}
                onFormSubmit={handleFormSubmit}
                dialogClose={() => setIsDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Filtro e Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex flex-col md:flex-row gap-4 items-center">
              <Select onValueChange={(val) => setFilterMonth(parseInt(val))} defaultValue={String(filterMonth)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Selecione o Mês" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select onValueChange={(val) => setFilterYear(parseInt(val))} defaultValue={String(filterYear)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Selecione o Ano" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(y => <SelectItem key={y.value} value={String(y.value)}>{y.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <p className="text-lg font-semibold">
              Total de Despesas para {currentMonthLabel} {filterYear}: 
              <span className="text-destructive ml-2">{formatCurrencyBRL(totalFilteredExpenses)}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Lançamentos de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList
              transactions={filteredExpenses}
              type="expense"
              onEdit={openEditDialog}
              onDelete={handleFormSubmit} // A lógica de permissão de delete está no TransactionList
            />
          </CardContent>
        </Card>
      </div>
    </ProtectedPageLayout>
  );
}

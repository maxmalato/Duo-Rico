
// src/app/dashboard/page.tsx
"use client";

import { ProtectedPageLayout } from "@/components/layout/ProtectedPageLayout";
import { FinancialOverview } from "@/components/dashboard/FinancialOverview";
import { RecentExpenses } from "@/components/dashboard/RecentExpenses";
// Atualizado para usar o novo serviço (que agora interage com Supabase)
import { getTransactions } from "@/lib/localStorageService"; // Renomear este arquivo/serviço mentalmente para transactionService
import { useAuth } from "@/hooks/useAuth";
import type { Transaction } from "@/lib/types";
import { useEffect, useState, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MONTHS, YEARS, CURRENT_YEAR } from "@/lib/constants";
import { Loader2 } from "lucide-react";


export default function DashboardPage() {
  const { user } = useAuth();
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [recentExpensesList, setRecentExpensesList] = useState<Transaction[]>([]);

  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(CURRENT_YEAR);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (user) {
      setIsLoadingTransactions(true);
      const allTransactions = await getTransactions(); // Agora é async

      // A lógica de filtragem por couple_id ou user_id já é feita pelas RLS do Supabase.
      // O frontend filtra apenas pelo período selecionado e tipo.

      const transactionsCurrentPeriod = allTransactions.filter(t => t.month === filterMonth && t.year === filterYear);

      const incomeCurrentPeriod = transactionsCurrentPeriod
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expensesCurrentPeriod = transactionsCurrentPeriod
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const lastThreeExpensesFromPeriod = transactionsCurrentPeriod
        .filter(t => t.type === 'expense')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);

      setMonthlyIncome(incomeCurrentPeriod);
      setMonthlyExpenses(expensesCurrentPeriod);
      setRecentExpensesList(lastThreeExpensesFromPeriod);
      setIsLoadingTransactions(false);
    }
  }, [user, filterMonth, filterYear]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const balance = monthlyIncome - monthlyExpenses;
  const currentMonthLabel = MONTHS.find(m => m.value === filterMonth)?.label || "";

  return (
    <ProtectedPageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Painel</h1>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Filtro de Período do Painel</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4 items-center">
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
          </CardContent>
        </Card>

        {isLoadingTransactions ? (
          <div className="flex justify-center items-center py-10">
             <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <FinancialOverview
              income={monthlyIncome}
              expenses={monthlyExpenses}
              balance={balance}
              monthLabel={currentMonthLabel}
              year={filterYear}
            />
            <RecentExpenses expenses={recentExpensesList} />
          </>
        )}
      </div>
    </ProtectedPageLayout>
  );
}

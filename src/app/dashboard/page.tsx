// src/app/dashboard/page.tsx
"use client";

import { ProtectedPageLayout } from "@/components/layout/ProtectedPageLayout";
import { FinancialOverview } from "@/components/dashboard/FinancialOverview";
import { RecentExpenses } from "@/components/dashboard/RecentExpenses";
import { getTransactionsFromLocalStorage } from "@/lib/localStorageService";
import { useAuth } from "@/hooks/useAuth";
import type { Transaction } from "@/lib/types";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [recentExpenses, setRecentExpenses] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) {
      const transactions = getTransactionsFromLocalStorage().filter(t => t.userId === user.id);
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const incomeCurrentMonth = transactions
        .filter(t => t.type === 'income' && t.month === currentMonth && t.year === currentYear)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expensesCurrentMonth = transactions
        .filter(t => t.type === 'expense' && t.month === currentMonth && t.year === currentYear)
        .reduce((sum, t) => sum + t.amount, 0);

      const lastThreeExpenses = transactions
        .filter(t => t.type === 'expense')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
      
      setMonthlyIncome(incomeCurrentMonth);
      setMonthlyExpenses(expensesCurrentMonth);
      setRecentExpenses(lastThreeExpenses);
    }
  }, [user]);

  const balance = monthlyIncome - monthlyExpenses;

  return (
    <ProtectedPageLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <FinancialOverview income={monthlyIncome} expenses={monthlyExpenses} balance={balance} />
        <RecentExpenses expenses={recentExpenses} />
      </div>
    </ProtectedPageLayout>
  );
}

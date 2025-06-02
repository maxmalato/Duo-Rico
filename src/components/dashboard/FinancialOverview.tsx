// src/components/dashboard/FinancialOverview.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Scale } from "lucide-react";

interface FinancialOverviewProps {
  income: number;
  expenses: number;
  balance: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export function FinancialOverview({ income, expenses, balance }: FinancialOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <TrendingUp className="h-5 w-5 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">{formatCurrency(income)}</div>
          <p className="text-xs text-muted-foreground">Este mês</p>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesa Total</CardTitle>
          <TrendingDown className="h-5 w-5 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{formatCurrency(expenses)}</div>
          <p className="text-xs text-muted-foreground">Este mês</p>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          <Scale className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{formatCurrency(balance)}</div>
          <p className="text-xs text-muted-foreground">Este mês</p>
        </CardContent>
      </Card>
    </div>
  );
}

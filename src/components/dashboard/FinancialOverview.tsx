// src/components/dashboard/FinancialOverview.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Scale } from "lucide-react";
import { formatCurrencyBRL } from "@/lib/utils";

interface FinancialOverviewProps {
  income: number;
  expenses: number;
  balance: number;
  monthLabel: string;
  year: number;
}

export function FinancialOverview({ income, expenses, balance, monthLabel, year }: FinancialOverviewProps) {
  const periodText = monthLabel && year ? `${monthLabel} de ${year}` : "Período selecionado";
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <TrendingUp className="h-5 w-5 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">{formatCurrencyBRL(income)}</div>
          <p className="text-xs text-muted-foreground">{periodText}</p>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesa Total</CardTitle>
          <TrendingDown className="h-5 w-5 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{formatCurrencyBRL(expenses)}</div>
          <p className="text-xs text-muted-foreground">{periodText}</p>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          <Scale className={`h-5 w-5 ${balance < 0 ? 'text-foreground' : 'text-primary'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance < 0 ? 'text-foreground' : 'text-primary'}`}>
            {formatCurrencyBRL(balance)}
          </div>
          <p className="text-xs text-muted-foreground">{periodText}</p>
        </CardContent>
      </Card>
    </div>
  );
}

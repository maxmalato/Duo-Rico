
// src/components/dashboard/RecentExpenses.tsx
"use client";

import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MONTHS, getCategoryLabel } from "@/lib/constants";
import { formatCurrencyBRL } from "@/lib/utils";

interface RecentExpensesProps {
  expenses: Transaction[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const monthLabel = MONTHS.find(m => m.value === date.getMonth() + 1)?.label.substring(0,3) || (date.getMonth() + 1).toString().padStart(2, '0');
  return `${date.getDate()} ${monthLabel}`;
};

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Despesas Recentes</CardTitle>
        <CardDescription>Suas últimas três despesas registradas para o período selecionado.</CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma despesa recente para exibir para o período selecionado.</p>
        ) : (
          <ScrollArea className="h-[200px]">
            <ul className="space-y-3">
              {expenses.map((expense) => (
                <li key={expense.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(expense.createdAt)} - <Badge variant="outline" className="capitalize">{getCategoryLabel(expense.category, 'expense')}</Badge>
                      {expense.isRecurring && expense.installmentNumber && expense.totalInstallments && (
                        <span className="ml-1 text-xs">
                          (Parcela {expense.installmentNumber}/{expense.totalInstallments})
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="font-semibold text-destructive">{formatCurrencyBRL(expense.amount)}</p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

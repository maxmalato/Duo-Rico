// src/components/dashboard/RecentExpenses.tsx
"use client";

import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MONTHS } from "@/lib/constants"; // Import MONTHS

interface RecentExpensesProps {
  expenses: Transaction[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  // Find month label from constants
  const monthLabel = MONTHS.find(m => m.value === date.getMonth() + 1)?.label.substring(0,3) || (date.getMonth() + 1).toString().padStart(2, '0');
  return `${date.getDate()} ${monthLabel}`; // e.g., 15 Jan
};

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Despesas Recentes</CardTitle>
        <CardDescription>Suas últimas três despesas registradas.</CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma despesa recente para exibir.</p>
        ) : (
          <ScrollArea className="h-[200px]">
            <ul className="space-y-3">
              {expenses.map((expense) => (
                <li key={expense.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(expense.createdAt)} - <Badge variant="outline" className="capitalize">{expense.category.replace(/_/g, " ")}</Badge>
                    </p>
                  </div>
                  <p className="font-semibold text-destructive">{formatCurrency(expense.amount)}</p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

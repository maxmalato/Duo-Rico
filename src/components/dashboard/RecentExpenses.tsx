// src/components/dashboard/RecentExpenses.tsx
"use client";

import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface RecentExpensesProps {
  expenses: Transaction[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
        <CardDescription>Your last three recorded expenses.</CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent expenses to display.</p>
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

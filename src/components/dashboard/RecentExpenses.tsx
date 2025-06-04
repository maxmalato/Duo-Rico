
// src/components/dashboard/RecentExpenses.tsx
"use client";

import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getCategoryLabel } from "@/lib/constants"; // MONTHS não é mais usado aqui para formatDate
import { formatCurrencyBRL } from "@/lib/utils";
import { isValid, format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentExpensesProps {
  expenses: Transaction[];
}

const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) {
    return 'Data N/A'; // Lida com string de data nula ou indefinida
  }
  try {
    const date = parseISO(dateString); // Supabase normalmente retorna strings ISO 8601
    if (!isValid(date)) {
      // Tenta um fallback para strings não ISO, embora menos provável com Supabase
      const fallbackDate = new Date(dateString);
      if (!isValid(fallbackDate)) {
        console.warn(`String de data inválida recebida em RecentExpenses: ${dateString}`);
        return 'Data Inválida';
      }
      // Formata a data de fallback
      return format(fallbackDate, 'dd MMM', { locale: ptBR });
    }
    // Formata a data ISO parseada corretamente
    return format(date, 'dd MMM', { locale: ptBR }); // ex: "23 Jun"
  } catch (error) {
    console.error(`Erro ao formatar string de data: ${dateString}`, error);
    return 'Erro Data';
  }
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


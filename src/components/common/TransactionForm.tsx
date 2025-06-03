
// src/components/common/TransactionForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, PlusCircle, Edit3 } from "lucide-react";
import type { Transaction, TransactionType, Category } from "@/lib/types";
import { MONTHS, YEARS, CURRENT_YEAR } from "@/lib/constants";
import { addTransactionToLocalStorage, updateTransactionInLocalStorage } from "@/lib/localStorageService";
import { useAuth } from "@/hooks/useAuth";

const transactionFormSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória."),
  amount: z.coerce.number({invalid_type_error: "Valor deve ser um número."}).positive("O valor deve ser positivo.").finite("O valor deve ser finito."),
  category: z.string().min(1, "Categoria é obrigatória."),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number(),
  isRecurring: z.boolean().default(false),
  installments: z.coerce.number().min(1, "Parcelas devem ser no mínimo 1.").max(48, "Parcelas devem ser no máximo 48.").optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  type: TransactionType;
  categories: Category[];
  existingTransaction?: Transaction; // For editing
  onFormSubmit: () => void; // Callback to refresh list
  dialogClose?: () => void; // To close dialog after submit
}

export function TransactionForm({ type, categories, existingTransaction, onFormSubmit, dialogClose }: TransactionFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const typeInPortuguese = type === 'income' ? 'Receita' : 'Despesa';
  const typeInPortugueseSingular = type === 'income' ? 'receita' : 'despesa';

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: existingTransaction ? {
      description: existingTransaction.description,
      amount: existingTransaction.amount,
      category: existingTransaction.category,
      month: existingTransaction.month,
      year: existingTransaction.year,
      isRecurring: existingTransaction.isRecurring || false,
      installments: existingTransaction.totalInstallments || undefined, 
    } : {
      description: "",
      amount: undefined, // Initialize as undefined so placeholder shows
      category: "",
      month: new Date().getMonth() + 1,
      year: CURRENT_YEAR,
      isRecurring: false,
      installments: undefined, 
    },
  });

  const isRecurring = form.watch("isRecurring");

  // Helper to format the numeric value (e.g., 8.88) to a display string (e.g., "8,88")
  const formatAmountForDisplay = (value: number | undefined): string => {
    if (value === undefined || isNaN(value)) {
      return '';
    }
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Helper to parse the display string (e.g., "8,88" or "888") to a numeric value (e.g., 8.88)
  const parseDisplayToAmount = (displayValue: string): number | undefined => {
    const digits = displayValue.replace(/\D/g, ''); // Remove all non-digits
    if (digits === '') {
      return undefined;
    }
    const numericValueInCents = parseInt(digits, 10);
    return numericValueInCents / 100; // Convert cents to Reais
  };


  async function onSubmit(values: TransactionFormValues) {
    if (!user) {
      toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    try {
      if (values.isRecurring && (!values.installments || values.installments < 1)) {
        form.setError("installments", { type: "manual", message: "Parcelas devem ser no mínimo 1 para transações recorrentes." });
        setIsLoading(false);
        return;
      }
      
      const baseTransactionData = {
        userId: user.id,
        type,
        description: values.description,
        amount: values.amount, // amount is already the correct numeric value
        category: values.category,
        createdAt: existingTransaction ? existingTransaction.createdAt : new Date().toISOString(),
      };

      if (values.isRecurring && values.installments && values.installments > 0) {
        const recurringGroupId = existingTransaction?.recurringGroupId || crypto.randomUUID();
        // Delete existing recurring transactions if editing and installments changed
        // This part is complex and depends on how updates to recurring series should be handled.
        // For simplicity, this example might overwrite or create new series.
        // A more robust solution would manage updates to individual installments or the series.
        for (let i = 0; i < values.installments; i++) {
          const transactionDate = new Date(values.year, values.month -1 + i); 
          const transaction: Transaction = {
            ...baseTransactionData,
            id: existingTransaction && i === 0 ? existingTransaction.id : crypto.randomUUID(), 
            month: transactionDate.getMonth() + 1,
            year: transactionDate.getFullYear(),
            isRecurring: true,
            recurringGroupId: recurringGroupId,
            installmentNumber: i + 1,
            totalInstallments: values.installments,
          };
          if (existingTransaction && i===0) {
             updateTransactionInLocalStorage(transaction); 
          } else {
             addTransactionToLocalStorage(transaction); 
          }
        }
         toast({ title: `Série de ${typeInPortugueseSingular} ${existingTransaction ? 'Atualizada' : 'Adicionada'}`, description: `Série ${values.description} processada com sucesso.` });

      } else {
        const transaction: Transaction = {
          ...baseTransactionData,
          id: existingTransaction?.id || crypto.randomUUID(),
          month: values.month,
          year: values.year,
          isRecurring: false, // Explicitly false if not recurring or installments not set
        };
        if (existingTransaction) {
          updateTransactionInLocalStorage(transaction);
        } else {
          addTransactionToLocalStorage(transaction);
        }
        toast({ title: `${typeInPortuguese} ${existingTransaction ? 'Atualizada' : 'Adicionada'}`, description: `${values.description} processada com sucesso.` });
      }

      onFormSubmit(); 
      dialogClose?.(); 
      form.reset({ 
        description: "", amount: undefined, category: "", 
        month: new Date().getMonth() + 1, year: CURRENT_YEAR, 
        isRecurring: false, installments: undefined
      });

    } catch (error) {
      console.error("Error submitting form:", error);
      toast({ title: "Erro", description: `Falha ao ${existingTransaction ? 'atualizar' : 'adicionar'} ${typeInPortugueseSingular}.`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder={`Ex: Salário Mensal, Compras`} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="text" // Changed to text for custom formatting
                    inputMode="decimal" // Hint for mobile numeric keyboard
                    placeholder="0,00" 
                    value={formatAmountForDisplay(field.value)}
                    onChange={(e) => {
                      const numericValue = parseDisplayToAmount(e.target.value);
                      field.onChange(numericValue);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mês</FormLabel>
                <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o mês" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MONTHS.map(m => (
                      <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ano</FormLabel>
                <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o ano" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {YEARS.map(y => (
                      <SelectItem key={y.value} value={String(y.value)}>{y.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="isRecurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">
                Esta é uma {typeInPortugueseSingular} recorrente?
              </FormLabel>
            </FormItem>
          )}
        />
        {isRecurring && (
          <FormField
            control={form.control}
            name="installments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Parcelas (1-48)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    max="48" 
                    placeholder="Ex: 12" 
                    {...field} 
                    value={(field.value === undefined || isNaN(field.value)) ? '' : field.value}
                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                  />
                </FormControl>
                <FormDescription>
                  Esta {typeInPortugueseSingular} será repetida por esta quantidade de meses. Se for uma transação única, pode deixar este campo em branco ou com o valor 1 caso não seja recorrente.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (existingTransaction ? <Edit3 className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />)}
          {existingTransaction ? `Atualizar ${typeInPortuguese}` : `Adicionar ${typeInPortuguese}`}
        </Button>
      </form>
    </Form>
  );
}


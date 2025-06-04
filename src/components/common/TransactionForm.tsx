
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
// Atualizado para usar o novo serviço (que agora interage com Supabase)
import { addTransaction, updateTransaction } from "@/lib/localStorageService"; // Renomear este arquivo/serviço mentalmente para transactionService
import { useAuth } from "@/hooks/useAuth";

const transactionFormSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória."),
  amount: z.coerce.number({invalid_type_error: "Valor deve ser um número."}).positive("O valor deve ser positivo.").finite("O valor deve ser finito."),
  category: z.string().min(1, "Categoria é obrigatória."),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number(),
  isRecurring: z.boolean().default(false),
  installments: z.coerce.number().min(1, "Mínimo de 1 parcela.").max(48, "Máximo de 48 parcelas.").optional(),
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
      amount: undefined,
      category: "",
      month: new Date().getMonth() + 1,
      year: CURRENT_YEAR,
      isRecurring: false,
      installments: undefined,
    },
  });

  const isRecurring = form.watch("isRecurring");

  const formatAmountForDisplay = (value: number | undefined): string => {
    if (value === undefined || isNaN(value)) {
      return '';
    }
    // Converte para string, formata com vírgula como separador decimal
    const [integerPart, decimalPart = ""] = String(value.toFixed(2)).split('.');
    return `${integerPart},${decimalPart.padEnd(2, '0')}`;
  };

  const parseDisplayToAmount = (displayValue: string): number | undefined => {
    const digits = displayValue.replace(/\D/g, ''); // Remove tudo exceto dígitos
    if (digits === '') {
      return undefined;
    }
    const numericValueInCents = parseInt(digits, 10);
    return numericValueInCents / 100; // Converte centavos para Reais
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

      // Não precisamos mais de `id` e `createdAt` aqui, Supabase cuidará disso na inserção.
      // Para atualização, `existingTransaction.id` e `existingTransaction.createdAt` serão usados.
      const baseTransactionData: Omit<Transaction, 'id' | 'createdAt'> = {
        user_id: user.id,
        type,
        description: values.description,
        amount: values.amount,
        category: values.category,
        couple_id: user.couple_id || null, // Adiciona o couple_id do usuário atual
        // month, year, isRecurring, etc., serão adicionados abaixo
      };


      if (values.isRecurring && values.installments && values.installments > 0) {
        // Para novas séries recorrentes, o recurringGroupId é gerado.
        // Para editar uma série, manteríamos o recurringGroupId existente se aplicável (não totalmente implementado para edição de série)
        const recurringGroupId = existingTransaction?.recurringGroupId || crypto.randomUUID();

        let allSuccessful = true;
        for (let i = 0; i < values.installments; i++) {
          const transactionDate = new Date(values.year, values.month - 1 + i);
          const transactionToSave: Omit<Transaction, 'id' | 'createdAt'> = {
            ...baseTransactionData,
            month: transactionDate.getMonth() + 1,
            year: transactionDate.getFullYear(),
            isRecurring: true,
            recurringGroupId: recurringGroupId,
            installmentNumber: i + 1,
            totalInstallments: values.installments,
          };

          // Se estiver editando uma transação que ERA recorrente e estamos na primeira "nova" parcela,
          // podemos tentar atualizar a original. Caso contrário, sempre adicionamos.
          // Esta lógica de edição de série é simplificada.
          if (existingTransaction && i === 0 && existingTransaction.isRecurring && existingTransaction.recurringGroupId === recurringGroupId) {
            const result = await updateTransaction({
                ...transactionToSave,
                id: existingTransaction.id, // Mantém o ID da primeira parcela original
                createdAt: existingTransaction.createdAt // Mantém o createdAt original
            });
            if (!result) allSuccessful = false;
          } else {
            const result = await addTransaction(transactionToSave);
            if (!result) allSuccessful = false;
          }
        }
        if (allSuccessful) {
          toast({ title: `Série de ${typeInPortugueseSingular} ${existingTransaction?.isRecurring ? 'Atualizada' : 'Adicionada'}`, description: `Série ${values.description} processada com sucesso.` });
        } else {
          toast({ title: "Erro Parcial", description: `Algumas ${typeInPortugueseSingular}s da série podem não ter sido salvas.`, variant: "destructive" });
        }

      } else {
        // Transação única ou editando uma única
        if (existingTransaction) {
          const transactionToUpdate: Transaction = {
            ...baseTransactionData, // Contém user_id, couple_id
            id: existingTransaction.id, // ID da transação existente
            month: values.month,
            year: values.year,
            isRecurring: false, // Se não for recorrente, zera campos de recorrência
            recurringGroupId: undefined,
            installmentNumber: undefined,
            totalInstallments: undefined,
            createdAt: existingTransaction.createdAt, // Mantém o createdAt original
          };
          const result = await updateTransaction(transactionToUpdate);
          if (result) {
            toast({ title: `${typeInPortuguese} Atualizada`, description: `${values.description} atualizada com sucesso.` });
          } else {
            toast({ title: "Erro", description: `Falha ao atualizar ${typeInPortugueseSingular}.`, variant: "destructive" });
          }
        } else {
          // Nova transação única
          const transactionToSave: Omit<Transaction, 'id' | 'createdAt'> = {
            ...baseTransactionData,
            month: values.month,
            year: values.year,
            isRecurring: false,
          };
          const result = await addTransaction(transactionToSave);
          if (result) {
            toast({ title: `${typeInPortuguese} Adicionada`, description: `${values.description} adicionada com sucesso.` });
          } else {
            toast({ title: "Erro", description: `Falha ao adicionar ${typeInPortugueseSingular}.`, variant: "destructive" });
          }
        }
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
      toast({ title: "Erro Inesperado", description: `Falha ao ${existingTransaction ? 'atualizar' : 'adicionar'} ${typeInPortugueseSingular}.`, variant: "destructive" });
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
                    type="text"
                    inputMode="decimal"
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
                    value={field.value === undefined || isNaN(field.value) ? '' : field.value}
                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                  />
                </FormControl>
                <FormDescription>
                  A {typeInPortugueseSingular} será replicada por este número de meses. Para uma {typeInPortugueseSingular} única não recorrente, desmarque a opção acima.
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

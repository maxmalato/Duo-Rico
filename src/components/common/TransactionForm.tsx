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
import { Textarea } from "@/components/ui/textarea";
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
  description: z.string().min(1, "Description is required."),
  amount: z.coerce.number().positive("Amount must be positive."),
  category: z.string().min(1, "Category is required."),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number(),
  isRecurring: z.boolean().default(false),
  installments: z.coerce.number().min(1).max(48).optional(),
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

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: existingTransaction ? {
      description: existingTransaction.description,
      amount: existingTransaction.amount,
      category: existingTransaction.category,
      month: existingTransaction.month,
      year: existingTransaction.year,
      isRecurring: existingTransaction.isRecurring || false,
      installments: existingTransaction.totalInstallments || 1,
    } : {
      description: "",
      amount: 0,
      category: "",
      month: new Date().getMonth() + 1,
      year: CURRENT_YEAR,
      isRecurring: false,
      installments: 1,
    },
  });

  const isRecurring = form.watch("isRecurring");

  async function onSubmit(values: TransactionFormValues) {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    try {
      if (values.isRecurring && (!values.installments || values.installments < 1)) {
        form.setError("installments", { type: "manual", message: "Installments must be at least 1 for recurring transactions." });
        setIsLoading(false);
        return;
      }
      
      const baseTransactionData = {
        userId: user.id,
        type,
        description: values.description,
        amount: values.amount,
        category: values.category,
        createdAt: existingTransaction ? existingTransaction.createdAt : new Date().toISOString(),
      };

      if (values.isRecurring && values.installments && values.installments > 0) {
        const recurringGroupId = existingTransaction?.recurringGroupId || crypto.randomUUID();
        for (let i = 0; i < values.installments; i++) {
          const transactionDate = new Date(values.year, values.month -1 + i); // month is 0-indexed
          const transaction: Transaction = {
            ...baseTransactionData,
            id: existingTransaction && i === 0 ? existingTransaction.id : crypto.randomUUID(), // Preserve ID for first installment if editing
            month: transactionDate.getMonth() + 1,
            year: transactionDate.getFullYear(),
            isRecurring: true,
            recurringGroupId: recurringGroupId,
            installmentNumber: i + 1,
            totalInstallments: values.installments,
          };
          // For simplicity, if editing a recurring transaction, we assume it replaces the old series.
          // A more complex system would handle updating individual installments or the series.
          // Here we are just creating new ones or one.
          if (existingTransaction && i===0) {
             updateTransactionInLocalStorage(transaction); // Update the first one
          } else {
             addTransactionToLocalStorage(transaction); // Add subsequent or new ones
          }
        }
         toast({ title: `${type === 'income' ? 'Income' : 'Expense'} Series ${existingTransaction ? 'Updated' : 'Added'}`, description: `${values.description} series handled successfully.` });

      } else {
        const transaction: Transaction = {
          ...baseTransactionData,
          id: existingTransaction?.id || crypto.randomUUID(),
          month: values.month,
          year: values.year,
          isRecurring: false,
        };
        if (existingTransaction) {
          updateTransactionInLocalStorage(transaction);
        } else {
          addTransactionToLocalStorage(transaction);
        }
        toast({ title: `${type === 'income' ? 'Income' : 'Expense'} ${existingTransaction ? 'Updated' : 'Added'}`, description: `${values.description} handled successfully.` });
      }

      onFormSubmit(); // Refresh the list
      dialogClose?.(); // Close the dialog
      form.reset(existingTransaction ? undefined : { // Reset to new defaults or keep editing
        description: "", amount: 0, category: "", 
        month: new Date().getMonth() + 1, year: CURRENT_YEAR, 
        isRecurring: false, installments: 1
      });

    } catch (error) {
      console.error("Error submitting form:", error);
      toast({ title: "Error", description: `Failed to ${existingTransaction ? 'update' : 'add'} ${type}.`, variant: "destructive" });
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder={`e.g., Monthly Salary, Groceries`} {...field} />
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
                <FormLabel>Amount ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
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
                <FormLabel>Month</FormLabel>
                <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
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
                <FormLabel>Year</FormLabel>
                <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
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
                Is this a recurring {type}?
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
                <FormLabel>Number of Installments (up to 48)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="48" placeholder="e.g., 12" {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormDescription>
                  This {type} will be repeated for this many months.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (existingTransaction ? <Edit3 className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />)}
          {existingTransaction ? `Update ${type}` : `Add ${type}`}
        </Button>
      </form>
    </Form>
  );
}

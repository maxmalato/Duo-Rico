// src/components/common/TransactionList.tsx
"use client";

import type { Transaction, TransactionType } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { deleteTransactionFromLocalStorage, deleteFutureRecurringTransactions } from "@/lib/localStorageService";
import { useToast } from "@/hooks/use-toast";
import { MONTHS } from "@/lib/constants";

interface TransactionListProps {
  transactions: Transaction[];
  type: TransactionType;
  onEdit: (transaction: Transaction) => void;
  onDelete: () => void; // Callback to refresh list
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export function TransactionList({ transactions, type, onEdit, onDelete }: TransactionListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'single' | 'future' | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  const handleDelete = (transaction: Transaction, delType: 'single' | 'future') => {
    setSelectedTransaction(transaction);
    setDeleteType(delType);
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedTransaction || !deleteType) return;

    try {
      if (deleteType === 'single') {
        deleteTransactionFromLocalStorage(selectedTransaction.id);
        toast({ title: "Deleted", description: `${type === 'income' ? 'Income' : 'Expense'} entry deleted.` });
      } else if (deleteType === 'future' && selectedTransaction.recurringGroupId) {
        deleteFutureRecurringTransactions(selectedTransaction.recurringGroupId, selectedTransaction.month, selectedTransaction.year);
        toast({ title: "Deleted", description: `Future recurring ${type === 'income' ? 'income entries' : 'expense entries'} deleted.` });
      }
      onDelete(); // Refresh list
    } catch (error) {
      toast({ title: "Error", description: `Failed to delete.`, variant: "destructive" });
    } finally {
      setDialogOpen(false);
      setSelectedTransaction(null);
      setDeleteType(null);
    }
  };
  
  const getMonthName = (monthNumber: number) => MONTHS.find(m => m.value === monthNumber)?.label || 'N/A';

  if (transactions.length === 0) {
    return <p className="text-muted-foreground mt-4 text-center">No {type} entries yet for the selected period. Add one to get started!</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Recurring</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{transaction.description}</TableCell>
              <TableCell><Badge variant="outline" className="capitalize">{transaction.category.replace(/_/g, " ")}</Badge></TableCell>
              <TableCell>{getMonthName(transaction.month)} {transaction.year}</TableCell>
              <TableCell className={`text-right font-semibold ${type === 'income' ? 'text-accent' : 'text-destructive'}`}>
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell className="text-center">
                {transaction.isRecurring ? `Yes (${transaction.installmentNumber}/${transaction.totalInstallments})` : 'No'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(transaction)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(transaction, 'single')} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete This Entry
                    </DropdownMenuItem>
                    {transaction.isRecurring && (
                      <DropdownMenuItem onClick={() => handleDelete(transaction, 'future')}  className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                        <AlertTriangle className="mr-2 h-4 w-4" /> Delete Future Entries
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === 'single' && "This action will permanently delete this transaction entry. This cannot be undone."}
              {deleteType === 'future' && "This action will permanently delete this and all future entries for this recurring transaction. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

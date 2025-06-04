
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
import { MONTHS, getCategoryLabel } from "@/lib/constants";
import { formatCurrencyBRL } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth"; // Importar useAuth

interface TransactionListProps {
  transactions: Transaction[];
  type: TransactionType;
  onEdit: (transaction: Transaction) => void;
  onDelete: () => void; // Callback to refresh list after deletion
}

export function TransactionList({ transactions, type, onEdit, onDelete }: TransactionListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'single' | 'future' | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();
  const { user } = useAuth(); // Obter usuário atual

  const typeInPortugueseSingular = type === 'income' ? 'receita' : 'despesa';

  const canPerformAction = (transaction: Transaction): boolean => {
    if (!user) return false;
    // Usuário pode editar/excluir se a transação pertencer ao seu couple_id
    // OU se a transação pertencer diretamente a ele (e não houver couple_id ou o couple_id da transação for o seu)
    return (user.couple_id && transaction.couple_id === user.couple_id) || 
           (transaction.userId === user.id && (!transaction.couple_id || transaction.couple_id === user.couple_id));
  };

  const handleDelete = (transaction: Transaction, delType: 'single' | 'future') => {
    if (!canPerformAction(transaction)) {
      toast({ title: "Não Permitido", description: `Você não tem permissão para excluir esta ${typeInPortugueseSingular}.`, variant: "destructive" });
      return;
    }
    setSelectedTransaction(transaction);
    setDeleteType(delType);
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedTransaction || !deleteType) return;

    try {
      if (deleteType === 'single') {
        deleteTransactionFromLocalStorage(selectedTransaction.id);
        toast({ title: "Excluído", description: `Lançamento de ${typeInPortugueseSingular} excluído.` });
      } else if (deleteType === 'future' && selectedTransaction.recurringGroupId) {
        deleteFutureRecurringTransactions(selectedTransaction.recurringGroupId, selectedTransaction.month, selectedTransaction.year);
        toast({ title: "Excluído", description: `Futuros lançamentos recorrentes de ${typeInPortugueseSingular} excluídos.` });
      }
      onDelete(); // Refresh list
    } catch (error) {
      toast({ title: "Erro", description: `Falha ao excluir.`, variant: "destructive" });
    } finally {
      setDialogOpen(false);
      setSelectedTransaction(null);
      setDeleteType(null);
    }
  };
  
  const getMonthName = (monthNumber: number) => MONTHS.find(m => m.value === monthNumber)?.label || 'N/A';

  if (transactions.length === 0) {
    return <p className="text-muted-foreground mt-4 text-center">Nenhum lançamento de {typeInPortugueseSingular} ainda para o período selecionado. Adicione um para começar!</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-center">Recorrente</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{transaction.description}</TableCell>
              <TableCell><Badge variant="outline" className="capitalize">{getCategoryLabel(transaction.category, transaction.type)}</Badge></TableCell>
              <TableCell>{getMonthName(transaction.month)} {transaction.year}</TableCell>
              <TableCell className={`text-right font-semibold ${type === 'income' ? 'text-accent' : 'text-destructive'}`}>
                {formatCurrencyBRL(transaction.amount)}
              </TableCell>
              <TableCell className="text-center">
                {transaction.isRecurring ? `Sim (${transaction.installmentNumber}/${transaction.totalInstallments})` : 'Não'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={!canPerformAction(transaction)}>
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  {canPerformAction(transaction) && (
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(transaction)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(transaction, 'single')} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir Este Lançamento
                      </DropdownMenuItem>
                      {transaction.isRecurring && (
                        <DropdownMenuItem onClick={() => handleDelete(transaction, 'future')}  className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                          <AlertTriangle className="mr-2 h-4 w-4" /> Excluir Lançamentos Futuros
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === 'single' && "Esta ação excluirá permanentemente este lançamento. Isso não pode ser desfeito."}
              {deleteType === 'future' && "Esta ação excluirá permanentemente este e todos os futuros lançamentos desta transação recorrente. Isso não pode ser desfeito."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// src/app/income/page.tsx
"use client";

import { ProtectedPageLayout } from "@/components/layout/ProtectedPageLayout";
import { TransactionForm } from "@/components/common/TransactionForm";
import { TransactionList } from "@/components/common/TransactionList";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { INCOME_CATEGORIES, MONTHS, CURRENT_YEAR, YEARS } from "@/lib/constants";
import { getTransactionsFromLocalStorage } from "@/lib/localStorageService";
import { useAuth } from "@/hooks/useAuth";
import type { Transaction } from "@/lib/types";
import { useEffect, useState, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function IncomePage() {
  const { user } = useAuth();
  const [allIncome, setAllIncome] = useState<Transaction[]>([]);
  const [filteredIncome, setFilteredIncome] = useState<Transaction[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(CURRENT_YEAR);

  const fetchIncome = useCallback(() => {
    if (user) {
      const transactions = getTransactionsFromLocalStorage();
      const userIncome = transactions.filter(t => t.userId === user.id && t.type === 'income');
      setAllIncome(userIncome);
    }
  }, [user]);

  useEffect(() => {
    fetchIncome();
  }, [fetchIncome]);

  useEffect(() => {
    const filtered = allIncome.filter(t => t.month === filterMonth && t.year === filterYear)
                              .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setFilteredIncome(filtered);
  }, [allIncome, filterMonth, filterYear]);

  const handleFormSubmit = () => {
    fetchIncome(); // Refreshes the list
    // setIsDialogOpen(false); // Dialog will be closed by TransactionForm's dialogClose prop
    // setEditingTransaction(undefined);
  };
  
  const openAddDialog = () => {
    setEditingTransaction(undefined);
    setIsDialogOpen(true);
  };

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };
  
  const totalFilteredIncome = filteredIncome.reduce((sum, t) => sum + t.amount, 0);
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <ProtectedPageLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Income Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog} className="w-full md:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Income
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTransaction ? 'Edit' : 'Add New'} Income</DialogTitle>
              </DialogHeader>
              <TransactionForm
                type="income"
                categories={INCOME_CATEGORIES}
                existingTransaction={editingTransaction}
                onFormSubmit={handleFormSubmit}
                dialogClose={() => setIsDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Filter & Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <Select onValueChange={(val) => setFilterMonth(parseInt(val))} defaultValue={String(filterMonth)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select onValueChange={(val) => setFilterYear(parseInt(val))} defaultValue={String(filterYear)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(y => <SelectItem key={y.value} value={String(y.value)}>{y.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <p className="text-lg font-semibold">
              Total Income for {MONTHS.find(m=>m.value === filterMonth)?.label} {filterYear}: 
              <span className="text-accent ml-2">{formatCurrency(totalFilteredIncome)}</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Income Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionList
              transactions={filteredIncome}
              type="income"
              onEdit={openEditDialog}
              onDelete={handleFormSubmit}
            />
          </CardContent>
        </Card>
      </div>
    </ProtectedPageLayout>
  );
}

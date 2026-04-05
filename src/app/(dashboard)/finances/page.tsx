"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DollarSign, Plus, TrendingUp, TrendingDown, PiggyBank,
  Filter, Loader2, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(2, "Description is required"),
  amount: z.string().min(1, "Amount is required"),
  date: z.string().min(1, "Date is required"),
});

type TransactionForm = z.infer<typeof transactionSchema>;

const INCOME_CATEGORIES = ["Classic Haircut", "Beard Trim & Shape", "Full Service Package", "Fade Haircut", "Hot Towel Shave", "Kids Haircut", "Walk-in", "Other"];
const EXPENSE_CATEGORIES = ["Rent", "Utilities", "Supplies", "Equipment", "Marketing", "Cleaning", "Insurance", "Other"];

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function FinancesPage() {
  const { toast } = useToast();
  const [data, setData] = useState<{ transactions: any[]; summary: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [defaultType, setDefaultType] = useState<"INCOME" | "EXPENSE">("INCOME");

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type: "INCOME", date: new Date().toISOString().split("T")[0] },
  });

  const watchType = watch("type");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = typeFilter !== "all" ? `?type=${typeFilter}` : "";
      const res = await fetch(`/api/finances${params}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching finances:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [typeFilter]);

  const openModal = (type: "INCOME" | "EXPENSE") => {
    setDefaultType(type);
    reset({ type, date: new Date().toISOString().split("T")[0] });
    setValue("type", type);
    setModalOpen(true);
  };

  const onSubmit = async (formData: TransactionForm) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/finances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save transaction");

      toast({ title: "Transaction saved", description: "The transaction has been recorded." });
      setModalOpen(false);
      fetchData();
    } catch {
      toast({ title: "Error", description: "Failed to save transaction.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const totalIncome = data?.summary?.find((s: any) => s.type === "INCOME")?._sum?.amount || 0;
  const totalExpenses = data?.summary?.find((s: any) => s.type === "EXPENSE")?._sum?.amount || 0;
  const netProfit = totalIncome - totalExpenses;

  // Build chart data by month
  const monthlyData: Record<string, { month: string; Income: number; Expenses: number }> = {};
  data?.transactions?.forEach((tx: any) => {
    const month = new Date(tx.date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    if (!monthlyData[month]) monthlyData[month] = { month, Income: 0, Expenses: 0 };
    if (tx.type === "INCOME") monthlyData[month].Income += tx.amount;
    else monthlyData[month].Expenses += tx.amount;
  });
  const chartData = Object.values(monthlyData).slice(-6).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // Expense breakdown for pie chart
  const expenseByCategory: Record<string, number> = {};
  data?.transactions?.filter((t: any) => t.type === "EXPENSE").forEach((tx: any) => {
    expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
  });
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finances</h1>
          <p className="text-gray-500 mt-1">Track income, expenses, and profitability</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => openModal("EXPENSE")} className="border-red-200 text-red-600 hover:bg-red-50">
            <ArrowDownRight className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
          <Button onClick={() => openModal("INCOME")} className="bg-green-600 hover:bg-green-700">
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Add Income
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Total Income</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            <div className="text-xs text-gray-500 mt-1">All time income</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Total Expenses</span>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            <div className="text-xs text-gray-500 mt-1">All time expenses</div>
          </CardContent>
        </Card>
        <Card className={`border-l-4 ${netProfit >= 0 ? "border-l-blue-500" : "border-l-orange-500"}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">Net Profit</span>
              <PiggyBank className={`w-5 h-5 ${netProfit >= 0 ? "text-blue-500" : "text-orange-500"}`} />
            </div>
            <div className={`text-3xl font-bold ${netProfit >= 0 ? "text-blue-600" : "text-orange-600"}`}>
              {formatCurrency(netProfit)}
            </div>
            <div className="text-xs text-gray-500 mt-1">{netProfit >= 0 ? "Profitable" : "In deficit"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Monthly Income vs Expenses</CardTitle>
            <CardDescription>Financial performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expense Breakdown</CardTitle>
            <CardDescription>By category</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : pieData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p className="text-sm">No expense data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false} labelLine={false} fontSize={10}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Transactions</CardTitle>
              <CardDescription>All income and expense records</CardDescription>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="INCOME">Income Only</SelectItem>
                <SelectItem value="EXPENSE">Expenses Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.transactions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                      <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No transactions found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.transactions?.map((tx: any) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-gray-600 text-sm">{formatDate(tx.date)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                          tx.type === "INCOME"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {tx.type === "INCOME" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {tx.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">{tx.category}</TableCell>
                      <TableCell className="text-gray-800 text-sm">{tx.description}</TableCell>
                      <TableCell className={`text-right font-bold ${tx.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                        {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Transaction Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {defaultType === "INCOME" ? "Add Income" : "Add Expense"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select onValueChange={(v) => setValue("type", v as "INCOME" | "EXPENSE")} defaultValue={defaultType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(watchType === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Enter description..." {...register("description")} className={errors.description ? "border-red-500" : ""} />
              {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount ($)</Label>
                <Input type="number" step="0.01" min="0" placeholder="0.00" {...register("amount")} className={errors.amount ? "border-red-500" : ""} />
                {errors.amount && <p className="text-red-500 text-xs">{errors.amount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" {...register("date")} className={errors.date ? "border-red-500" : ""} />
                {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                className={defaultType === "INCOME" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                disabled={submitting}
              >
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : `Save ${defaultType === "INCOME" ? "Income" : "Expense"}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

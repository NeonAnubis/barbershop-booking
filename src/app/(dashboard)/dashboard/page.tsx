"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar, Users, DollarSign, Clock, TrendingUp,
  ArrowUpRight, ArrowDownRight, Plus, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDateTime, formatTime } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";

interface Stats {
  todayAppointments: number;
  pendingAppointments: number;
  totalClients: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  upcomingAppointments: any[];
  recentTransactions: any[];
  monthlyRevenue: any[];
}

const statusColors: Record<string, string> = {
  PENDING: "warning",
  CONFIRMED: "info",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        {
          title: "Today's Appointments",
          value: stats.todayAppointments,
          icon: Calendar,
          color: "text-blue-600",
          bg: "bg-blue-50",
          change: "+2 from yesterday",
          positive: true,
        },
        {
          title: "Monthly Revenue",
          value: formatCurrency(stats.monthlyIncome),
          icon: DollarSign,
          color: "text-green-600",
          bg: "bg-green-50",
          change: formatCurrency(stats.monthlyProfit) + " profit",
          positive: true,
        },
        {
          title: "Total Clients",
          value: stats.totalClients,
          icon: Users,
          color: "text-purple-600",
          bg: "bg-purple-50",
          change: "Active client base",
          positive: true,
        },
        {
          title: "Pending Appointments",
          value: stats.pendingAppointments,
          icon: Clock,
          color: "text-orange-600",
          bg: "bg-orange-50",
          change: "Awaiting confirmation",
          positive: false,
        },
      ]
    : [];

  const chartData = stats?.monthlyRevenue?.map((row: any) => ({
    month: row.month,
    Income: parseFloat(row.income) || 0,
    Expenses: parseFloat(row.expenses) || 0,
    Profit: (parseFloat(row.income) || 0) - (parseFloat(row.expenses) || 0),
  })) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/appointments">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              View Calendar
            </Button>
          </Link>
          <Link href="/appointments">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))
          : statCards.map((card, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">{card.title}</span>
                    <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center`}>
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{card.value}</div>
                  <div className={`flex items-center gap-1 text-xs ${card.positive ? "text-green-600" : "text-orange-600"}`}>
                    {card.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {card.change}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Revenue Overview</CardTitle>
                <CardDescription>Income vs Expenses (last 6 months)</CardDescription>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="Income" stroke="#3b82f6" strokeWidth={2} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Summary</CardTitle>
            <CardDescription>Financial breakdown this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : (
              <>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-xs text-green-700 font-medium mb-1">Total Income</div>
                  <div className="text-2xl font-bold text-green-700">{formatCurrency(stats?.monthlyIncome || 0)}</div>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <div className="text-xs text-red-700 font-medium mb-1">Total Expenses</div>
                  <div className="text-2xl font-bold text-red-700">{formatCurrency(stats?.monthlyExpenses || 0)}</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-xs text-blue-700 font-medium mb-1">Net Profit</div>
                  <div className="text-2xl font-bold text-blue-700">{formatCurrency(stats?.monthlyProfit || 0)}</div>
                </div>
                <Link href="/finances">
                  <Button variant="outline" className="w-full text-sm">
                    View Full Report
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Upcoming Appointments</CardTitle>
                <CardDescription>Next scheduled appointments</CardDescription>
              </div>
              <Link href="/appointments">
                <Button variant="ghost" size="sm" className="text-blue-600 h-8">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : stats?.upcomingAppointments?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.upcomingAppointments?.map((apt: any) => (
                  <div key={apt.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{apt.client.name}</p>
                      <p className="text-xs text-gray-500">{apt.service.name} • {apt.barber.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-gray-900">
                        {formatTime(apt.scheduledAt)}
                      </p>
                      <Badge variant={statusColors[apt.status] as any} className="text-xs mt-0.5">
                        {apt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Transactions</CardTitle>
                <CardDescription>Latest financial activity</CardDescription>
              </div>
              <Link href="/finances">
                <Button variant="ghost" size="sm" className="text-blue-600 h-8">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.recentTransactions?.map((tx: any) => (
                  <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.type === "INCOME" ? "bg-green-100" : "bg-red-100"}`}>
                      <DollarSign className={`w-5 h-5 ${tx.type === "INCOME" ? "text-green-600" : "text-red-600"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{tx.description}</p>
                      <p className="text-xs text-gray-500">{tx.category}</p>
                    </div>
                    <div className={`font-bold text-sm flex-shrink-0 ${tx.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                      {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

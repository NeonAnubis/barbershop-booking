import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);

  const [
    todayAppointments,
    pendingAppointments,
    totalClients,
    monthlyIncome,
    monthlyExpenses,
    upcomingAppointments,
    recentTransactions,
    monthlyRevenue,
  ] = await Promise.all([
    prisma.appointment.count({
      where: { scheduledAt: { gte: today, lte: todayEnd } },
    }),
    prisma.appointment.count({
      where: { status: { in: ["PENDING", "CONFIRMED"] } },
    }),
    prisma.client.count(),
    prisma.transaction.aggregate({
      where: {
        type: "INCOME",
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        type: "EXPENSE",
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    }),
    prisma.appointment.findMany({
      where: {
        scheduledAt: { gte: today },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: {
        client: true,
        service: true,
        barber: { select: { name: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.transaction.findMany({
      orderBy: { date: "desc" },
      take: 5,
    }),
    // Revenue for last 6 months
    prisma.$queryRaw`
      SELECT
        TO_CHAR(date, 'Mon YYYY') as month,
        DATE_TRUNC('month', date) as month_date,
        SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expenses
      FROM "Transaction"
      WHERE date >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', date), TO_CHAR(date, 'Mon YYYY')
      ORDER BY month_date ASC
    `,
  ]);

  return NextResponse.json({
    todayAppointments,
    pendingAppointments,
    totalClients,
    monthlyIncome: monthlyIncome._sum.amount || 0,
    monthlyExpenses: monthlyExpenses._sum.amount || 0,
    monthlyProfit: (monthlyIncome._sum.amount || 0) - (monthlyExpenses._sum.amount || 0),
    upcomingAppointments,
    recentTransactions,
    monthlyRevenue,
  });
}

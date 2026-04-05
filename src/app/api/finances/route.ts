import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: any = {};
  if (type && type !== "all") where.type = type;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { appointment: { include: { client: true } } },
    orderBy: { date: "desc" },
  });

  const summary = await prisma.transaction.groupBy({
    by: ["type"],
    _sum: { amount: true },
  });

  return NextResponse.json({ transactions, summary });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { type, category, description, amount, date } = body;

  const transaction = await prisma.transaction.create({
    data: {
      type,
      category,
      description,
      amount: parseFloat(amount),
      date: new Date(date),
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}

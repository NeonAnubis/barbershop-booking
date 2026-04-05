import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const lowStock = searchParams.get("lowStock");

  const where: any = {};
  if (category && category !== "all") where.category = category;
  if (lowStock === "true") {
    where.quantity = { lte: prisma.inventoryItem.fields.minStock };
  }

  const items = await prisma.inventoryItem.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, category, quantity, unit, minStock, price, supplier } = body;

  const item = await prisma.inventoryItem.create({
    data: {
      name,
      category,
      quantity: parseFloat(quantity),
      unit,
      minStock: parseFloat(minStock),
      price: parseFloat(price),
      supplier,
      lastRestocked: new Date(),
    },
  });

  return NextResponse.json(item, { status: 201 });
}

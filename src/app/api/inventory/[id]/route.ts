import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, category, quantity, unit, minStock, price, supplier } = body;

  const item = await prisma.inventoryItem.update({
    where: { id: params.id },
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

  return NextResponse.json(item);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.inventoryItem.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Deleted" });
}

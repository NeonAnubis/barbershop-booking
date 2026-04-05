import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  const clients = await prisma.client.findMany({
    where,
    include: {
      appointments: {
        include: { service: true, barber: { select: { name: true } } },
        orderBy: { scheduledAt: "desc" },
        take: 5,
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(clients);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, email, phone, birthDate, notes } = body;

  const client = await prisma.client.create({
    data: {
      name,
      email: email || undefined,
      phone,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      notes,
    },
  });

  return NextResponse.json(client, { status: 201 });
}

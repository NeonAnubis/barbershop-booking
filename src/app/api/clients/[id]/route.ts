import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      appointments: {
        include: { service: true, barber: { select: { name: true } } },
        orderBy: { scheduledAt: "desc" },
      },
    },
  });

  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(client);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, email, phone, birthDate, notes } = body;

  const client = await prisma.client.update({
    where: { id: params.id },
    data: {
      name,
      email: email || undefined,
      phone,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      notes,
    },
  });

  return NextResponse.json(client);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.client.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Deleted" });
}

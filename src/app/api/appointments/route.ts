import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const date = searchParams.get("date");
  const barberId = searchParams.get("barberId");

  const where: any = {};
  if (status && status !== "all") where.status = status;
  if (barberId && barberId !== "all") where.barberId = barberId;
  if (date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    where.scheduledAt = { gte: startDate, lte: endDate };
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      client: true,
      barber: { select: { id: true, name: true, email: true } },
      service: true,
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json(appointments);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { clientId, barberId, serviceId, scheduledAt, notes } = body;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const appointment = await prisma.appointment.create({
    data: {
      clientId,
      barberId,
      serviceId,
      scheduledAt: new Date(scheduledAt),
      notes,
      totalAmount: service.price,
      status: "PENDING",
    },
    include: {
      client: true,
      barber: { select: { id: true, name: true, email: true } },
      service: true,
    },
  });

  return NextResponse.json(appointment, { status: 201 });
}

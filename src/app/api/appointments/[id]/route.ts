import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { client: true, barber: true, service: true },
  });

  if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(appointment);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { status, notes, scheduledAt, serviceId, barberId } = body;

  const updateData: any = {};
  if (status) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;
  if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);
  if (serviceId) {
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (service) {
      updateData.serviceId = serviceId;
      updateData.totalAmount = service.price;
    }
  }
  if (barberId) updateData.barberId = barberId;

  const appointment = await prisma.appointment.update({
    where: { id: params.id },
    data: updateData,
    include: { client: true, barber: true, service: true },
  });

  // If completed, create income transaction
  if (status === "COMPLETED") {
    const existing = await prisma.transaction.findFirst({
      where: { appointmentId: params.id },
    });
    if (!existing) {
      await prisma.transaction.create({
        data: {
          type: "INCOME",
          category: appointment.service.name,
          description: `Payment for ${appointment.service.name} - ${appointment.client.name}`,
          amount: appointment.totalAmount,
          date: new Date(),
          appointmentId: appointment.id,
        },
      });
      await prisma.client.update({
        where: { id: appointment.clientId },
        data: {
          totalVisits: { increment: 1 },
          lastVisit: new Date(),
        },
      });
    }
  }

  return NextResponse.json(appointment);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.appointment.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Deleted" });
}

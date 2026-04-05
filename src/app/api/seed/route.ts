import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Clean up existing data
    await prisma.transaction.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.inventoryItem.deleteMany();
    await prisma.service.deleteMany();
    await prisma.client.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash("password123", 10);

    const admin = await prisma.user.create({
      data: {
        name: "Michael Lee",
        email: "admin@barbershop.com",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    const barber1 = await prisma.user.create({
      data: {
        name: "Marcus Johnson",
        email: "marcus@barbershop.com",
        password: hashedPassword,
        role: "BARBER",
      },
    });

    const barber2 = await prisma.user.create({
      data: {
        name: "Diego Rivera",
        email: "diego@barbershop.com",
        password: hashedPassword,
        role: "BARBER",
      },
    });

    const services = await Promise.all([
      prisma.service.create({ data: { name: "Classic Haircut", description: "Traditional scissor cut", price: 25.0, duration: 30 } }),
      prisma.service.create({ data: { name: "Beard Trim & Shape", description: "Precision beard trimming", price: 15.0, duration: 20 } }),
      prisma.service.create({ data: { name: "Full Service Package", description: "Haircut, beard, hot towel", price: 45.0, duration: 60 } }),
      prisma.service.create({ data: { name: "Fade Haircut", description: "Clean fade with blending", price: 30.0, duration: 45 } }),
      prisma.service.create({ data: { name: "Hot Towel Shave", description: "Traditional straight razor shave", price: 35.0, duration: 40 } }),
      prisma.service.create({ data: { name: "Kids Haircut", description: "Haircut for children under 12", price: 18.0, duration: 25 } }),
    ]);

    const clients = await Promise.all([
      prisma.client.create({ data: { name: "James Wilson", email: "james.wilson@email.com", phone: "+1-555-0101", totalVisits: 12 } }),
      prisma.client.create({ data: { name: "Robert Thompson", email: "rob.thompson@email.com", phone: "+1-555-0102", totalVisits: 8 } }),
      prisma.client.create({ data: { name: "Michael Davis", email: "m.davis@email.com", phone: "+1-555-0103", totalVisits: 24 } }),
      prisma.client.create({ data: { name: "Anthony Martinez", email: "tony.martinez@email.com", phone: "+1-555-0104", totalVisits: 6 } }),
      prisma.client.create({ data: { name: "David Brown", email: "d.brown@email.com", phone: "+1-555-0105", totalVisits: 18 } }),
      prisma.client.create({ data: { name: "Christopher Garcia", email: "chris.garcia@email.com", phone: "+1-555-0106", totalVisits: 10 } }),
      prisma.client.create({ data: { name: "Daniel Lee", email: "dan.lee@email.com", phone: "+1-555-0107", totalVisits: 15 } }),
      prisma.client.create({ data: { name: "Kevin Anderson", email: "k.anderson@email.com", phone: "+1-555-0108", totalVisits: 3 } }),
      prisma.client.create({ data: { name: "Jason White", email: "j.white@email.com", phone: "+1-555-0109", totalVisits: 30 } }),
      prisma.client.create({ data: { name: "Eric Harris", email: "eric.harris@email.com", phone: "+1-555-0110", totalVisits: 5 } }),
    ]);

    const barbers = [barber1, barber2];
    const pastDates = [
      new Date("2026-02-10T09:00:00"), new Date("2026-02-12T10:30:00"), new Date("2026-02-15T11:00:00"),
      new Date("2026-02-18T14:00:00"), new Date("2026-02-20T15:30:00"), new Date("2026-02-24T09:30:00"),
      new Date("2026-02-26T11:30:00"), new Date("2026-03-01T10:00:00"), new Date("2026-03-03T13:00:00"),
      new Date("2026-03-05T14:30:00"), new Date("2026-03-08T09:00:00"), new Date("2026-03-10T10:00:00"),
      new Date("2026-03-12T11:30:00"), new Date("2026-03-15T15:00:00"), new Date("2026-03-18T09:30:00"),
      new Date("2026-03-20T10:30:00"), new Date("2026-03-22T13:30:00"), new Date("2026-03-25T14:00:00"),
      new Date("2026-03-28T09:00:00"), new Date("2026-03-31T11:00:00"), new Date("2026-04-01T10:00:00"),
      new Date("2026-04-02T13:00:00"), new Date("2026-04-03T14:30:00"),
    ];

    const futureDates = [
      new Date("2026-04-06T09:00:00"), new Date("2026-04-06T10:30:00"), new Date("2026-04-07T11:00:00"),
      new Date("2026-04-08T14:00:00"), new Date("2026-04-09T15:00:00"), new Date("2026-04-10T09:30:00"),
      new Date("2026-04-12T10:00:00"), new Date("2026-04-14T13:00:00"), new Date("2026-04-16T11:30:00"),
      new Date("2026-04-18T14:30:00"),
    ];

    const createdAppointments = [];
    for (let i = 0; i < pastDates.length; i++) {
      const service = services[i % services.length];
      const apt = await prisma.appointment.create({
        data: {
          clientId: clients[i % clients.length].id,
          barberId: barbers[i % 2].id,
          serviceId: service.id,
          scheduledAt: pastDates[i],
          status: i % 10 === 0 ? "CANCELLED" : "COMPLETED",
          totalAmount: service.price,
        },
      });
      createdAppointments.push({ appointment: apt, service });
    }

    for (let i = 0; i < futureDates.length; i++) {
      const service = services[(i + 2) % services.length];
      await prisma.appointment.create({
        data: {
          clientId: clients[(i + 3) % clients.length].id,
          barberId: barbers[i % 2].id,
          serviceId: service.id,
          scheduledAt: futureDates[i],
          status: i % 3 === 0 ? "CONFIRMED" : "PENDING",
          totalAmount: service.price,
        },
      });
    }

    for (const { appointment, service } of createdAppointments) {
      if (appointment.status === "COMPLETED") {
        await prisma.transaction.create({
          data: {
            type: "INCOME",
            category: service.name,
            description: `Payment for ${service.name}`,
            amount: service.price,
            date: appointment.scheduledAt,
            appointmentId: appointment.id,
          },
        });
      }
    }

    const expenses = [
      { category: "Rent", description: "Monthly shop rent", amount: 1500, date: new Date("2026-02-01") },
      { category: "Supplies", description: "Hair products", amount: 145.50, date: new Date("2026-02-05") },
      { category: "Utilities", description: "Electric bill", amount: 180.00, date: new Date("2026-02-10") },
      { category: "Rent", description: "Monthly shop rent", amount: 1500, date: new Date("2026-03-01") },
      { category: "Supplies", description: "Razor blades", amount: 89.99, date: new Date("2026-03-10") },
      { category: "Utilities", description: "Electric bill", amount: 165.00, date: new Date("2026-03-12") },
      { category: "Rent", description: "Monthly shop rent", amount: 1500, date: new Date("2026-04-01") },
      { category: "Supplies", description: "Monthly restocking", amount: 220.00, date: new Date("2026-04-03") },
    ];

    for (const exp of expenses) {
      await prisma.transaction.create({ data: { type: "EXPENSE", ...exp } });
    }

    const inventoryItems = [
      { name: "Oster Classic 76 Clippers", category: "Equipment", quantity: 3, unit: "units", minStock: 2, price: 89.99, supplier: "BarberPro Supply" },
      { name: "Wahl Magic Clip", category: "Equipment", quantity: 2, unit: "units", minStock: 2, price: 129.99, supplier: "BarberPro Supply" },
      { name: "Barbicide Disinfectant", category: "Sanitation", quantity: 5, unit: "liters", minStock: 3, price: 12.99, supplier: "CleanShop Inc" },
      { name: "Disposable Razor Blades", category: "Supplies", quantity: 200, unit: "units", minStock: 50, price: 0.25, supplier: "SharpEdge Co" },
      { name: "Shaving Cream Premium", category: "Supplies", quantity: 8, unit: "cans", minStock: 5, price: 8.99, supplier: "GentlemanGrooming" },
      { name: "Hair Pomade - Strong Hold", category: "Products", quantity: 15, unit: "jars", minStock: 10, price: 14.99, supplier: "StylePro" },
      { name: "Neck Strips", category: "Supplies", quantity: 4, unit: "boxes", minStock: 5, price: 6.99, supplier: "BarberPro Supply" },
      { name: "Barber Capes", category: "Equipment", quantity: 8, unit: "units", minStock: 6, price: 24.99, supplier: "BarberPro Supply" },
      { name: "Sanitizing Wipes", category: "Sanitation", quantity: 3, unit: "boxes", minStock: 5, price: 15.99, supplier: "CleanShop Inc" },
      { name: "Barber Scissors 7\"", category: "Equipment", quantity: 5, unit: "units", minStock: 3, price: 79.99, supplier: "BarberPro Supply" },
      { name: "Hair Gel Extra Hold", category: "Products", quantity: 20, unit: "tubes", minStock: 12, price: 7.99, supplier: "StylePro" },
    ];

    for (const item of inventoryItems) {
      await prisma.inventoryItem.create({ data: { ...item, lastRestocked: new Date("2026-03-15") } });
    }

    return NextResponse.json({
      message: "Database seeded successfully",
      credentials: {
        admin: "admin@barbershop.com / password123",
        barber1: "marcus@barbershop.com / password123",
        barber2: "diego@barbershop.com / password123",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

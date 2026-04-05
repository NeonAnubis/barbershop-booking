import { PrismaClient, Role, AppointmentStatus, TransactionType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
dotenv.config();

const connectionString = (process.env.DATABASE_URL || "").replace("sslmode=require", "sslmode=verify-full");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding database...");

  // Clean up existing data
  await prisma.transaction.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.service.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Michael Lee",
      email: "admin@barbershop.com",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const barber1 = await prisma.user.create({
    data: {
      name: "Marcus Johnson",
      email: "marcus@barbershop.com",
      password: hashedPassword,
      role: Role.BARBER,
    },
  });

  const barber2 = await prisma.user.create({
    data: {
      name: "Diego Rivera",
      email: "diego@barbershop.com",
      password: hashedPassword,
      role: Role.BARBER,
    },
  });

  console.log("Users created");

  // Create services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: "Classic Haircut",
        description: "Traditional scissor cut with styling",
        price: 25.0,
        duration: 30,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Beard Trim & Shape",
        description: "Precision beard trimming and shaping",
        price: 15.0,
        duration: 20,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Full Service Package",
        description: "Haircut, beard trim, hot towel and styling",
        price: 45.0,
        duration: 60,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Fade Haircut",
        description: "Clean fade with detailed blending",
        price: 30.0,
        duration: 45,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Hot Towel Shave",
        description: "Traditional straight razor shave with hot towel",
        price: 35.0,
        duration: 40,
        isActive: true,
      },
    }),
    prisma.service.create({
      data: {
        name: "Kids Haircut",
        description: "Haircut for children under 12",
        price: 18.0,
        duration: 25,
        isActive: true,
      },
    }),
  ]);

  console.log("Services created");

  // Create clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: "James Wilson",
        email: "james.wilson@email.com",
        phone: "+1-555-0101",
        birthDate: new Date("1985-03-15"),
        notes: "Prefers short sides, longer on top",
        totalVisits: 12,
        lastVisit: new Date("2026-03-28"),
      },
    }),
    prisma.client.create({
      data: {
        name: "Robert Thompson",
        email: "rob.thompson@email.com",
        phone: "+1-555-0102",
        birthDate: new Date("1990-07-22"),
        notes: "Regular fade customer",
        totalVisits: 8,
        lastVisit: new Date("2026-03-20"),
      },
    }),
    prisma.client.create({
      data: {
        name: "Michael Davis",
        email: "m.davis@email.com",
        phone: "+1-555-0103",
        birthDate: new Date("1978-11-08"),
        notes: "Beard maintenance every 2 weeks",
        totalVisits: 24,
        lastVisit: new Date("2026-04-01"),
      },
    }),
    prisma.client.create({
      data: {
        name: "Anthony Martinez",
        email: "tony.martinez@email.com",
        phone: "+1-555-0104",
        birthDate: new Date("1995-05-30"),
        notes: "Full service package always",
        totalVisits: 6,
        lastVisit: new Date("2026-03-15"),
      },
    }),
    prisma.client.create({
      data: {
        name: "David Brown",
        email: "d.brown@email.com",
        phone: "+1-555-0105",
        birthDate: new Date("1982-09-12"),
        notes: "Hot towel shave specialist",
        totalVisits: 18,
        lastVisit: new Date("2026-03-31"),
      },
    }),
    prisma.client.create({
      data: {
        name: "Christopher Garcia",
        email: "chris.garcia@email.com",
        phone: "+1-555-0106",
        birthDate: new Date("1993-01-25"),
        notes: "Comes in monthly",
        totalVisits: 10,
        lastVisit: new Date("2026-03-10"),
      },
    }),
    prisma.client.create({
      data: {
        name: "Daniel Lee",
        email: "dan.lee@email.com",
        phone: "+1-555-0107",
        birthDate: new Date("1988-06-18"),
        notes: "Classic cut every 3 weeks",
        totalVisits: 15,
        lastVisit: new Date("2026-03-25"),
      },
    }),
    prisma.client.create({
      data: {
        name: "Kevin Anderson",
        email: "k.anderson@email.com",
        phone: "+1-555-0108",
        birthDate: new Date("1997-12-05"),
        notes: "New customer, likes fades",
        totalVisits: 3,
        lastVisit: new Date("2026-03-18"),
      },
    }),
    prisma.client.create({
      data: {
        name: "Jason White",
        email: "j.white@email.com",
        phone: "+1-555-0109",
        birthDate: new Date("1975-04-14"),
        notes: "Old school barber style",
        totalVisits: 30,
        lastVisit: new Date("2026-04-02"),
      },
    }),
    prisma.client.create({
      data: {
        name: "Eric Harris",
        email: "eric.harris@email.com",
        phone: "+1-555-0110",
        birthDate: new Date("2000-08-20"),
        notes: "Student discount applied",
        totalVisits: 5,
        lastVisit: new Date("2026-03-22"),
      },
    }),
  ]);

  console.log("Clients created");

  // Create appointments over past 2 months and next 2 weeks
  const now = new Date("2026-04-05");
  const appointmentsData = [];

  // Past appointments (completed)
  const pastDates = [
    new Date("2026-02-10T09:00:00"),
    new Date("2026-02-12T10:30:00"),
    new Date("2026-02-15T11:00:00"),
    new Date("2026-02-18T14:00:00"),
    new Date("2026-02-20T15:30:00"),
    new Date("2026-02-24T09:30:00"),
    new Date("2026-02-26T11:30:00"),
    new Date("2026-03-01T10:00:00"),
    new Date("2026-03-03T13:00:00"),
    new Date("2026-03-05T14:30:00"),
    new Date("2026-03-08T09:00:00"),
    new Date("2026-03-10T10:00:00"),
    new Date("2026-03-12T11:30:00"),
    new Date("2026-03-15T15:00:00"),
    new Date("2026-03-18T09:30:00"),
    new Date("2026-03-20T10:30:00"),
    new Date("2026-03-22T13:30:00"),
    new Date("2026-03-25T14:00:00"),
    new Date("2026-03-28T09:00:00"),
    new Date("2026-03-31T11:00:00"),
    new Date("2026-04-01T10:00:00"),
    new Date("2026-04-02T13:00:00"),
    new Date("2026-04-03T14:30:00"),
  ];

  // Future appointments (pending/confirmed)
  const futureDates = [
    new Date("2026-04-06T09:00:00"),
    new Date("2026-04-06T10:30:00"),
    new Date("2026-04-07T11:00:00"),
    new Date("2026-04-08T14:00:00"),
    new Date("2026-04-09T15:00:00"),
    new Date("2026-04-10T09:30:00"),
    new Date("2026-04-12T10:00:00"),
    new Date("2026-04-14T13:00:00"),
    new Date("2026-04-16T11:30:00"),
    new Date("2026-04-18T14:30:00"),
  ];

  const barbers = [barber1, barber2];

  // Create past appointments
  const createdAppointments = [];
  for (let i = 0; i < pastDates.length; i++) {
    const client = clients[i % clients.length];
    const barber = barbers[i % 2];
    const service = services[i % services.length];
    const apt = await prisma.appointment.create({
      data: {
        clientId: client.id,
        barberId: barber.id,
        serviceId: service.id,
        scheduledAt: pastDates[i],
        status: i % 10 === 0 ? AppointmentStatus.CANCELLED : AppointmentStatus.COMPLETED,
        totalAmount: service.price,
        notes: i % 3 === 0 ? "Regular customer" : undefined,
      },
    });
    createdAppointments.push({ appointment: apt, service });
  }

  // Create future appointments
  for (let i = 0; i < futureDates.length; i++) {
    const client = clients[(i + 3) % clients.length];
    const barber = barbers[i % 2];
    const service = services[(i + 2) % services.length];
    const apt = await prisma.appointment.create({
      data: {
        clientId: client.id,
        barberId: barber.id,
        serviceId: service.id,
        scheduledAt: futureDates[i],
        status: i % 3 === 0 ? AppointmentStatus.CONFIRMED : AppointmentStatus.PENDING,
        totalAmount: service.price,
      },
    });
    createdAppointments.push({ appointment: apt, service });
  }

  console.log("Appointments created");

  // Create financial transactions
  const incomeCategories = ["Haircut Service", "Beard Service", "Full Package", "Shave Service", "Walk-in"];
  const expenseCategories = ["Supplies", "Rent", "Utilities", "Equipment", "Marketing", "Cleaning"];

  // Income transactions from completed appointments
  for (let i = 0; i < createdAppointments.length; i++) {
    const { appointment, service } = createdAppointments[i];
    if (appointment.status === AppointmentStatus.COMPLETED) {
      await prisma.transaction.create({
        data: {
          type: TransactionType.INCOME,
          category: service.name,
          description: `Payment for ${service.name}`,
          amount: service.price,
          date: appointment.scheduledAt,
          appointmentId: appointment.id,
        },
      });
    }
  }

  // Additional expense transactions
  const expenseData = [
    { category: "Rent", description: "Monthly shop rent", amount: 1500, date: new Date("2026-02-01") },
    { category: "Supplies", description: "Hair products and shampoo", amount: 145.50, date: new Date("2026-02-05") },
    { category: "Utilities", description: "Electric bill", amount: 180.00, date: new Date("2026-02-10") },
    { category: "Equipment", description: "New clippers set", amount: 320.00, date: new Date("2026-02-15") },
    { category: "Supplies", description: "Razor blades and shaving cream", amount: 89.99, date: new Date("2026-02-20") },
    { category: "Marketing", description: "Social media advertising", amount: 75.00, date: new Date("2026-02-25") },
    { category: "Rent", description: "Monthly shop rent", amount: 1500, date: new Date("2026-03-01") },
    { category: "Cleaning", description: "Professional cleaning service", amount: 120.00, date: new Date("2026-03-05") },
    { category: "Supplies", description: "Towels and capes", amount: 95.00, date: new Date("2026-03-10") },
    { category: "Utilities", description: "Electric bill", amount: 165.00, date: new Date("2026-03-12") },
    { category: "Equipment", description: "Barber chair maintenance", amount: 250.00, date: new Date("2026-03-18") },
    { category: "Supplies", description: "Hair color products", amount: 175.50, date: new Date("2026-03-22") },
    { category: "Marketing", description: "Business cards printing", amount: 45.00, date: new Date("2026-03-28") },
    { category: "Rent", description: "Monthly shop rent", amount: 1500, date: new Date("2026-04-01") },
    { category: "Supplies", description: "Monthly supplies restocking", amount: 220.00, date: new Date("2026-04-03") },
  ];

  for (const expense of expenseData) {
    await prisma.transaction.create({
      data: {
        type: TransactionType.EXPENSE,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
      },
    });
  }

  // Additional cash income (walk-ins)
  const walkInData = [
    { date: new Date("2026-02-08T11:00:00"), amount: 25 },
    { date: new Date("2026-02-14T13:00:00"), amount: 30 },
    { date: new Date("2026-02-22T15:00:00"), amount: 25 },
    { date: new Date("2026-03-07T10:00:00"), amount: 45 },
    { date: new Date("2026-03-14T11:30:00"), amount: 25 },
    { date: new Date("2026-03-21T14:00:00"), amount: 35 },
    { date: new Date("2026-03-29T09:30:00"), amount: 30 },
    { date: new Date("2026-04-04T10:00:00"), amount: 25 },
  ];

  for (const walkIn of walkInData) {
    await prisma.transaction.create({
      data: {
        type: TransactionType.INCOME,
        category: "Walk-in",
        description: "Walk-in customer payment",
        amount: walkIn.amount,
        date: walkIn.date,
      },
    });
  }

  console.log("Transactions created");

  // Create inventory items
  const inventoryItems = [
    { name: "Oster Classic 76 Clippers", category: "Equipment", quantity: 3, unit: "units", minStock: 2, price: 89.99, supplier: "BarberPro Supply" },
    { name: "Wahl Magic Clip", category: "Equipment", quantity: 2, unit: "units", minStock: 2, price: 129.99, supplier: "BarberPro Supply" },
    { name: "Andis T-Outliner", category: "Equipment", quantity: 4, unit: "units", minStock: 2, price: 59.99, supplier: "BarberPro Supply" },
    { name: "Barbicide Disinfectant", category: "Sanitation", quantity: 5, unit: "liters", minStock: 3, price: 12.99, supplier: "CleanShop Inc" },
    { name: "Disposable Razor Blades", category: "Supplies", quantity: 200, unit: "units", minStock: 50, price: 0.25, supplier: "SharpEdge Co" },
    { name: "Shaving Cream Premium", category: "Supplies", quantity: 8, unit: "cans", minStock: 5, price: 8.99, supplier: "GentlemanGrooming" },
    { name: "Hair Pomade - Strong Hold", category: "Products", quantity: 15, unit: "jars", minStock: 10, price: 14.99, supplier: "StylePro" },
    { name: "After Shave Balm", category: "Products", quantity: 12, unit: "bottles", minStock: 8, price: 9.99, supplier: "GentlemanGrooming" },
    { name: "Neck Strips", category: "Supplies", quantity: 4, unit: "boxes", minStock: 5, price: 6.99, supplier: "BarberPro Supply" },
    { name: "Barber Capes", category: "Equipment", quantity: 8, unit: "units", minStock: 6, price: 24.99, supplier: "BarberPro Supply" },
    { name: "Hot Towel Machine", category: "Equipment", quantity: 1, unit: "units", minStock: 1, price: 149.99, supplier: "SalonTech" },
    { name: "Hair Clipping Oil", category: "Supplies", quantity: 6, unit: "bottles", minStock: 4, price: 5.99, supplier: "BarberPro Supply" },
    { name: "Styling Powder", category: "Products", quantity: 10, unit: "containers", minStock: 6, price: 11.99, supplier: "StylePro" },
    { name: "Sanitizing Wipes", category: "Sanitation", quantity: 3, unit: "boxes", minStock: 5, price: 15.99, supplier: "CleanShop Inc" },
    { name: "Barber Scissors 7\"", category: "Equipment", quantity: 5, unit: "units", minStock: 3, price: 79.99, supplier: "BarberPro Supply" },
    { name: "Hair Gel Extra Hold", category: "Products", quantity: 20, unit: "tubes", minStock: 12, price: 7.99, supplier: "StylePro" },
    { name: "Talcum Powder", category: "Supplies", quantity: 7, unit: "containers", minStock: 4, price: 4.99, supplier: "GentlemanGrooming" },
    { name: "Straight Razor", category: "Equipment", quantity: 6, unit: "units", minStock: 4, price: 45.99, supplier: "SharpEdge Co" },
  ];

  for (const item of inventoryItems) {
    await prisma.inventoryItem.create({
      data: {
        ...item,
        lastRestocked: new Date("2026-03-15"),
      },
    });
  }

  console.log("Inventory created");
  console.log("Database seeded successfully!");
  console.log("\nLogin credentials:");
  console.log("  Admin: admin@barbershop.com / password123");
  console.log("  Barber 1: marcus@barbershop.com / password123");
  console.log("  Barber 2: diego@barbershop.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

# BarberPro

**The all-in-one management platform built specifically for modern barbershops.**

![BarberPro Hero](public/Screenshot%20from%202026-04-05%2015-34-25.png)

---

## What Is BarberPro?

Most barbershops still run on paper appointment books, cash-only registers, and word-of-mouth reminders. BarberPro was built to change that. It is a web-based management system that brings appointments, client history, finances, inventory, and WhatsApp communication into a single dashboard that any barber can learn in minutes.

The goal is simple: let barbers focus on their craft, not on admin work.

---

## Screenshots

### Feature Overview
![Features](public/Screenshot%20from%202026-04-05%2015-35-06.png)

### Smart Appointment Scheduling
![Scheduling](public/Screenshot%20from%202026-04-05%2015-35-24.png)

### Financial Control
![Finances](public/Screenshot%20from%202026-04-05%2015-35-36.png)

### WhatsApp Client Communication
![WhatsApp Integration](public/Screenshot%20from%202026-04-05%2015-35-47.png)

### Dashboard
![Dashboard](public/Screenshot%20from%202026-04-05%2015-37-07.png)

### Appointments
![Appointments](public/Screenshot%20from%202026-04-05%2015-37-45.png)

### WhatsApp Reminder in Action
![WhatsApp Message](public/Screenshot%20from%202026-04-05%2015-38-32.png)

### Client Management
![Clients](public/Screenshot%20from%202026-04-05%2015-39-02.png)

### Finances and Reports
![Finance Overview](public/Screenshot%20from%202026-04-05%2015-39-15.png)

### Transaction History
![Transactions](public/Screenshot%20from%202026-04-05%2015-39-33.png)

### Inventory with Low Stock Alerts
![Inventory](public/Screenshot%20from%202026-04-05%2015-39-50.png)

---

## Core Features

### Appointment Management
Book, confirm, reschedule, and cancel appointments from a single view. Each appointment is linked to a specific barber and service, so scheduling conflicts are caught automatically. Status badges (Pending, Confirmed, Completed, Cancelled) make it easy to see the state of the entire day at a glance.

### Client Profiles and Visit History
Every client has a profile that tracks their full visit history, preferred services, contact details, and notes. The system automatically calculates how long it has been since a client's last visit and surfaces suggestions for when to invite them back.

### WhatsApp Reminders
Sending appointment reminders takes one click. BarberPro generates a pre-filled WhatsApp message with the client's name, appointment time, and a friendly call to action. No third-party messaging fees, no SMS credits. It opens directly in WhatsApp Web, which every barber already uses.

### Financial Tracking
Track every peso or dollar that comes in and goes out. The finance module separates income by service type and expense by category, produces monthly profit reports, and shows a live net profit figure. No accounting background required.

### Inventory Control
Know exactly what products and tools are in stock. Set minimum stock thresholds and BarberPro will flag items that are running low before they run out. Restock costs can be logged directly as expenses, keeping the financial record complete.

### Business Analytics
The dashboard shows today's appointments, monthly revenue, total active clients, and pending confirmations at a glance. Revenue charts compare income and expenses across months so owners can spot trends without opening a spreadsheet.

### Role-Based Access
Staff accounts can be created with different roles: Admin, Barber, and Receptionist. Each role sees what they need and nothing more.

---

## What Makes BarberPro Different

Most booking tools on the market are generic. They were built for spas, salons, dental clinics, and barbershops at the same time, which means they do everything adequately and nothing exceptionally well.

BarberPro is vertical. Every feature, every label, every workflow was designed with a barbershop in mind. The language matches how barbers talk. The flows match how barbershops operate.

A few specific differences:

**WhatsApp-first communication.** In Latin America, Southeast Asia, and across the world, WhatsApp is how people communicate with local businesses. Instead of building a proprietary notification system that clients ignore, BarberPro integrates directly with the app clients already use every day.

**No subscription lock-in for clients.** Clients do not need an account. They do not need to download an app. The barber handles everything on their end, and the client just shows up.

**Offline-ready architecture.** The system is designed to handle unstable internet connections gracefully. Data is committed on the server, not in the browser, so a brief network drop does not lose a booking.

**Built for one-chair shops and multi-barber studios alike.** A solo barber can run BarberPro without ever touching the multi-user features. A shop with five barbers can assign appointments to specific staff and track revenue per barber.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS, Shadcn/ui |
| Authentication | NextAuth.js v5 with JWT |
| Database ORM | Prisma |
| Database | PostgreSQL (Aiven Cloud) |
| Charts | Recharts |
| Messaging | WhatsApp Web (wa.me deep links) |

---

## Getting Started

### Prerequisites
- Node.js 18 or later
- A PostgreSQL database (the project is pre-configured for Aiven Cloud)

### Installation

```bash
git clone https://github.com/your-username/barbershop-system.git
cd barbershop-system
npm install
```

### Configure Environment

Create a `.env` file in the root directory:

```env
DATABASE_URL=your_postgresql_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
```

### Set Up the Database

```bash
npx prisma db push
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Default Login

```
Email:    admin@barbershop.com
Password: password123
```

---

## Scalability

BarberPro is built on infrastructure that scales without architectural changes.

**Database.** PostgreSQL on Aiven Cloud supports horizontal read replicas and connection pooling out of the box. A single database instance can comfortably serve hundreds of concurrent barbershop tenants.

**Application layer.** Next.js 14 with the App Router supports both static and dynamic rendering. Static pages (landing, pricing) are served from the edge with zero server load. Dynamic pages (dashboard, appointments) render on demand.

**Multi-tenancy path.** The current schema supports a single barbershop per deployment. Adding a `shopId` field to each model and a tenant-resolution layer in middleware is the only change needed to turn BarberPro into a full SaaS platform serving thousands of shops from one codebase.

**Authentication.** NextAuth.js with JWT sessions means the server does not need to maintain session state. Each request is self-contained, which is important when scaling horizontally behind a load balancer.

**API design.** All data operations go through typed REST API routes. Swapping the database layer, adding a caching layer (Redis), or exposing a public API for third-party integrations requires changes in one place.

---

## Profitability

BarberPro is designed with clear monetization paths.

**SaaS subscription.** The most direct model. Charge barbershops a monthly fee based on the number of barbers or bookings. At $29/month per shop, 500 shops generates $14,500 MRR. At $49/month, the same 500 shops generates $24,500 MRR.

**Freemium conversion.** Offer a free tier limited to one barber and 30 appointments per month. Shops that grow past that threshold upgrade naturally without a sales call.

**WhatsApp automation upsell.** The current WhatsApp integration uses manual one-click messages. A premium tier with automated scheduled reminders (via WhatsApp Business API) is a high-value feature that justifies a price bump and creates clear upgrade pressure.

**Inventory supplier partnerships.** Barbershop owners buying clippers, razors, and styling products through the platform creates a commission-based revenue stream on top of the subscription.

**Data insights for brands.** Aggregated, anonymized data on which services are most popular, peak booking hours, and product consumption rates is valuable to suppliers and brands targeting the barbershop market.

The unit economics are favorable. Customer acquisition cost is low because barbershops are concentrated in physical communities and respond to peer recommendations. Churn is low because switching management software is painful and barbers build habits quickly.

---

## Roadmap

- Mobile app for barbers (React Native)
- WhatsApp Business API integration for automated reminders
- Online client booking page (no login required)
- Multi-location support for barbershop chains
- Payroll tracking per barber
- Loyalty points system for clients
- Tax report export (PDF)

---

## License

MIT License. See [LICENSE](LICENSE) for details.

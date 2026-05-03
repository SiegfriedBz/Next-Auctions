[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://next-auctions.vercel.app/en)


# Next Auctions – Real-Time Full-Stack Auction Platform

A real-time auction platform built with Next.js, TypeScript, Supabase, Lingui, and Stripe. Features live bidding, payments, notifications, and responsive design.

> I built GavL – Next Auctions to challenge myself with **real-time full-stack development**: **Next.js** + **TypeScript** for the frontend, **Supabase** for **live data** and **notifications**, and **Stripe** for payments. The goal was to create a complete, production-style auction platform handling **multi-user bidding**, **server-side filters**, **real-time notifications**, and a **responsive**, **multilingual** UI. This project covers the full auction lifecycle—from creation to payment—showcasing backend workflows, frontend UX, and live updates across multiple clients.

---

## 🚀 Quick Start

### 1. Try the Demo: [🌐 Live Demo](https://next-auctions.vercel.app/en)

### 2. Create new auctions & Bid on existing ones

💡 Tip: Use Stripe test mode with the card number 4242 4242 4242 4242 for testing payments.

---

## 🎬 Demo & GIF Walkthrough

### **Desktop View**
<div align="center">

![Desktop View](assets/desktop-view.01.gif)

</div>

### **Mobile View**
<div align="center">

**Login Flow**

![Login Flow](assets/login.02.gif)

</div>

<div align="center">

**Create Auctions**

![Create Auctions](assets/create-auctions.03.gif)

</div>

<div align="center">

**Real-time Bidding (2 Users)**

![Bid - 2 Users](assets/bid-2-users.04.gif)

</div>

<div align="center">

**Real-time Bidding (3 Users)**

![Bid - 3 Users](assets/bid-3-users.05.gif)

</div>

<div align="center">

**Auction Won Notifications**

![Auction Won Notifications](assets/auction-won-notifications.06.gif)

</div>

<div align="center">

**Stripe Payment Flow**

![Stripe Flow](assets/stripe-flow.07.gif)

</div>

<div align="center">

**Payments Dashboard**

![Payments Dashboard](assets/payments-dashboard.08.gif)

</div>

## 🧱 Tech Stack

- **Frontend:** React, Next.js, TypeScript  
- **Internationalization:** Lingui (French, English, German)
- **Linting & Formatting:** Biome
- **Backend & Database:** Supabase (Realtime, Edge Functions, CRON)  
- **Payments:** Stripe (Checkout & Webhooks)  
- **UI & Validation:** Shadcn/UI, React-Hook-Form, Zod  
- **Data Display:** TanStack Table
- **Nuqs:** Server-side Filters, Sorting & Pagination
- **File Uploads:** Uppy  
- **Testing:** Jest  
- **UX Enhancements:** React Suspense & skeleton loaders for smooth transitions  

## ⚙️ Architecture Overview

GavL – Next Auctions follows a lightweight domain-driven design structure to separate business logic from infrastructure concerns, ensuring clarity and maintainability.

- **Domains:** Core types and Zod schemas for all entities (Auction, Bid, Notification, Payment, User)  
- **Ports:** Repository interfaces defining all data access methods  
- **Services:** Business logic and workflows  
- **Instances:** Service instances wired with Supabase repository implementations  
- **Infra (Supabase):** Implements data repositories that map DB rows to domain models and safely handle RLS-protected operations  
- **Supabase Realtime:** Broadcasts live notifications for `NEW_BID`, `NEW_AUCTION_WON`, and `NEW_PAYMENT` events.  
- **Supabase CRON + Edge Function:** Closes auctions automatically when `endAt` is reached  
- **Stripe Webhook:** Updates auctions’ `paidAt` via Service Role to safely bypass RLS

## 🧩 Key Features

- Real-time bidding for multiple users  
- Live notifications (bids, auction wins, payments)  
- Stripe Checkout integration for secure payments  
- Auction creation and editing
- Payments Dashboard with charts and totals  
- Multilingual support (_French_, _English_, _German_)  
- Responsive mobile & desktop UI
- Smooth loading states with React Suspense and skeleton placeholders  

## 🔁 Key Workflows

This project covers full auction lifecycles, multi-user interactions, real-time notifications, payments, and responsive UI across multiple devices.

### 1. Authentication

Supabase email/password sign-up and login (no email confirmation for simplicity).

### 2. Server-side Filter / Sort / Pagination on Auctions Tables

Filters, sorting, and pagination are URL-driven via **nuqs**.  
The server reads `searchParams` and performs filtering, ordering, and pagination via the `auctions().listing` service, which delegates to the `SupabaseAuctionRepository`.
This approach allows users to share URLs and ensures consistent results between client and server.

### 3. Auction Creation & Management

Authenticated users can create draft auctions, add images, edit auctions, and open them for bidding.  
Owners cannot edit auctions that already have bids or are closed.

### 4. Real-time Bidding

Multiple users can place bids simultaneously.
When a new bid is submitted, the auction’s highest bid and highest bidder are updated, and relevant users (owner and previous bidders) are notified (`NEW_BID` notification) in real time via **Supabase Realtime**.

```mermaid
sequenceDiagram
    participant User as Logged-in User
    participant Bids as Bids Table
    participant Auctions as Auctions Table
    participant Notifications as Notifications Table
    participant Clients as Connected Clients

    User ->> Bids: Insert new bid
    Bids ->> Auctions: Update highest bid info (Trigger: New Bid)
    Bids ->> Notifications: Insert NEW_BID for owner & previous bidders (Trigger: New Bid)
    Notifications ->> Clients: Broadcast changes via Supabase Realtime
```

### 5. Auction End (CRON + Edge Function)

Auctions close automatically at their scheduled end time via a Supabase CRON job that periodically triggers the `close-auctions` Edge Function.
If the auction had any bids, both the auction owner and the winner are notified (`NEW_AUCTION_WON`) in real time.

```mermaid
sequenceDiagram
    participant CRON as Supabase CRON
    participant Edge as close-auctions Edge Function
    participant Auctions as Auctions Table
    participant Notifications as Notifications Table
    participant Clients as Connected Clients

    CRON ->> Edge: Trigger close-auctions function
    Edge ->> Auctions: Update auction status to CLOSED
    Auctions ->> Notifications: Insert NEW_AUCTION_WON for owner & highest bidder (Trigger: Auction Closed with Bid)
    Notifications ->> Clients: Broadcast changes via Supabase Realtime
```

### 6. Stripe Checkout & Webhook

Winning bidders complete payment via Stripe Checkout.
Once a payment succeeds, the `/api/stripe/webhook` updates the auction’s `paidAt` field (via a Service Role Supabase client to bypass RLS), and sends a `NEW_PAYMENT` notification to the auction owner in real time.

```mermaid
sequenceDiagram
    participant Winner as Auction Winner
    participant Stripe as Stripe Checkout
    participant Webhook as /api/stripe/webhook
    participant Auctions as Auctions Table
    participant Notifications as Notifications Table
    participant Clients as Connected Clients

    Winner ->> Stripe: Complete payment
    Stripe ->> Webhook: Send payment event
    Webhook ->> Auctions: Update paidAt (using Service Role)
    Auctions ->> Notifications: Insert NEW_PAYMENT for auction owner (Trigger: Auction Paid)
    Notifications ->> Clients: Broadcast changes via Supabase Realtime
```

### 7. Stats & Charts

Dashboards display user-specific and global statistics, totals, and charts for payments received or made.  
All data is fetched through the same domain-driven service/repository layer for consistency.
UI transitions leverage `React Suspense` and `skeleton loaders` for smooth user experience during data fetching.

## 🚀 How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/SiegfriedBz/next_auctions.git
cd next_auctions
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file and set the following variables (based on .env.example):

```bash
# Application
NEXT_PUBLIC_APP_URL= # Base URL of your app (e.g., http://localhost:3000)

# Supabase
DATABASE_URL= # Full database connection URL (used by Supabase CLI / server)
NEXT_PUBLIC_SUPABASE_URL= # Supabase project URL for client-side access
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY= # Public anon key for client-side API calls
SUPABASE_SERVICE_ROLE_KEY= # Secret service role key for server-side actions (keep private!)

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= # Public key for Stripe JS (client-side)
STRIPE_SECRET_KEY= # Secret key for server-side Stripe actions (keep private!)
STRIPE_WEBHOOK_SECRET= # Secret used to verify Stripe webhooks (keep private!)

# Footer (optional)
ADMIN_LINK= # URL for the footer credit link (defaults to https://github.com/SiegfriedBz if unset)
```

### 4.Push Supabase database migrations & deploy Supabase Edge Function

```bash
supabase db push
supabase functions deploy close-auctions
```

### 5.Set up **CRON**

Schedule the close-auctions **Supabase Edge Function** to run periodically to automatically close auctions at their endAt time.

### 6.Realtime Notifications (**Supabase Realtime**)

Live notifications are sent for the following events:

- New bid on an auction → auction owner & all previous bidders (`NEW_BID` notification)
- Auction closed with bids → auction owner & auction winner (`NEW_AUCTION_WON` notification)
- Auction winner has paid → auction owner (`NEW_PAYMENT` notification)

### 7.Start the development server

```bash
pnpm dev
```

## 🧪 Testing - Backend

```bash
pnpm test
```

---

## Author

Built solo by **Siegfried Bozza**.
Full-Stack Developer   React/Next.js & Web3 Enthusiast

💼 [LinkedIn](https://www.linkedin.com/in/siegfriedbozza/)
🐙 [GitHub](https://github.com/SiegfriedBz)

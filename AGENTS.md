# FixMate - Smart Device & Home Appliance Repair Service Platform
**Assignment 9 - Category: 006**

---

## 🚀 Project Overview
**FixMate** is a full-stack, role-based repair service platform built with Next.js (App Router), Express.js, MongoDB, BetterAuth, JWT, and Stripe. It connects customers with verified technicians for on-demand home appliance and device repairs with a transparent, trackable workflow and pay-after-service model.

---

## 👥 Stakeholders & Roles
1. **Customer**: Browse approved services, send repair requests, track job status, cancel pending requests, pay securely via Stripe after job completion, view payment history, and manage profile.
2. **Technician**: Add repair services (ImgBB upload), manage service inventory (CRUD & availability toggle), accept/reject incoming requests, advance job status pipeline (`requested` → `accepted` → `in-progress` → `completed`), and set final billing amounts.
3. **Admin**: Moderate services (approve/reject), manage user roles, monitor all platform bookings and transactions, and view aggregated platform revenue.

---

## 🗄️ Logical Data Design & Database Architecture (4 Core Collections)

### 1. `users` (Managed by BetterAuth + Additional Fields)
* **Fields**: `_id`, `name`, `email` (unique), `image` (ImgBB URL), `role` (`'customer' | 'technician' | 'admin'`), `phone`, `area`, `bio`.

### 2. `services` (Managed by Technicians & Admins)
* **Fields**: `_id`, `title`, `category` (`'Smartphone' | 'Laptop & PC' | 'AC' | 'Refrigerator' | 'TV' | 'Washing Machine' | 'Electrical'`), `description`, `image`, `basePrice`, `estimatedDuration`, `serviceMode` (`'Home Visit' | 'Shop Drop-off'`), `serviceArea`, `technicianName`, `technicianEmail`, `approvalStatus` (`'pending' | 'approved' | 'rejected'`), `isAvailable` (Boolean), `createdAt`.

### 3. `bookings` (Repair Requests / Jobs)
* **Fields**: `_id`, `serviceId`, `serviceTitle`, `serviceImage`, `category`, `basePrice`, `technicianName`, `technicianEmail`, `customerName`, `customerEmail`, `customerPhone`, `address`, `preferredDate`, `problemDescription`, `status` (`'requested' | 'accepted' | 'rejected' | 'in-progress' | 'completed' | 'cancelled'`), `finalAmount`, `paymentStatus` (`'unpaid' | 'paid'`).

### 4. `payments` (Stripe Records)
* **Fields**: `_id`, `bookingId`, `serviceTitle`, `customerName`, `customerEmail`, `technicianName`, `technicianEmail`, `amount`, `currency` (`'usd'`), `transactionId`, `stripeSessionId`, `paymentStatus` (`'paid'`), `paidAt`.

---

## 🔄 Core Workflows & Business Rules

### 1. Job Status Pipeline Rules
* `requested` ➔ `accepted` or `rejected` (by Technician) OR `cancelled` (by Customer).
* `accepted` ➔ `in-progress` (by Technician).
* `in-progress` ➔ `completed` (by Technician, requires entering `finalAmount` > 0).
* `completed` + `unpaid` ➔ `paid` (via Stripe Checkout).

### 2. Validation & Security Rules
* Customers cannot create duplicate active requests (`requested`, `accepted`, `in-progress`) for the same service simultaneously.
* Technicians cannot request their own service; Technicians and Admins cannot send repair requests.
* Strict Server-Side Route Protection & Role-Based Custom Middlewares (`verifyToken`, `verifyCustomer`, `verifyTechnician`, `verifyAdmin`).

---

## 🖥️ Page & Routing Architecture

### Public Routes (`/`)
* **Home (`/`)**: Hero section, dynamic latest approved featured services (6 items), "How FixMate Works" flow, popular categories & trust points.
* **Browse Services (`/services`)**: Responsive grid with Server-Side Search, Filter (Category, Service Mode), and Sort (Price & Date).
* **Service Details (`/services/[id]`)**: Full information view, technician details, and role-restricted request form.
* **About / How It Works (`/about`)**: Platform overview and guidelines.
* **Auth Pages (`/sign-up`, `/sign-in`)**: BetterAuth credential flow with validation and role selection.
* **Payment Results (`/payment/success`, `/payment/cancel`)**: Handle Stripe redirect verification and record completion.

### Dashboard Routes (Protected)
* **Customer (`/dashboard/customer/...`)**: Overview stats, My Bookings (Cancel, Pay Now), Payment History.
* **Technician (`/dashboard/technician/...`)**: Overview stats, Add Service (ImgBB file upload), My Services (CRUD & availability toggle), Manage Requests (Status updates & final amount modal).
* **Admin (`/dashboard/admin/...`)**: Overview stats, Manage Users (Role changes), Service Approval, All Bookings monitoring, Transactions & Total Revenue.
* **Shared Profile (`/dashboard/profile`)**: Edit name, phone, area, bio, and avatar with live navbar sync.

---

## 🌟 Technical Stack
* **Frontend**: Next.js (App Router), TypeScript / JavaScript, Tailwind CSS, DaisyUI / HeroUI / shadcn/ui.
* **Backend**: Node.js, Express.js, MongoDB (Native Driver / Mongoose).
* **Authentication**: BetterAuth with MongoDB adapter + JWT custom role middlewares.
* **Payments & Media**: Stripe Checkout (Test Mode), ImgBB API for image hosting.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

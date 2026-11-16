# CampusCare: Campus Maintenance and Complaint Management System

> **Tagline:** *"Report. Track. Resolve."*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20Postgres%20%7C%20Storage-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel%20Ready-000000?style=flat&logo=vercel)](https://vercel.com/)

---

## 1. Project Purpose

**CampusCare** is a modern, cloud-based web application engineered for university campuses, colleges, and educational institutions. It replaces outdated, slow paper-based logs and fragmented email threads with an intuitive, centralized digital platform that connects students directly to campus estate and facilities maintenance teams.

### Core Value Proposition:
1. **Report:** Students report physical defects (electrical hazards, plumbing leaks, AC failures, damaged furniture, Wi-Fi dead zones, sanitation needs) with photo evidence, exact locations, and priority levels.
2. **Track:** Every complaint is assigned a formatted Ticket ID (e.g., `#CC-2026-1048`) with a live 3-stage lifecycle stepper (*Submitted → In Progress → Resolved*).
3. **Resolve:** Facilities staff and technicians communicate progress transparently through official **Admin Remarks**, assigned maintenance personnel, and inspection records.

---

## 2. Technology Stack

- **Framework:** Next.js 15 (App Router, Server & Client Components)
- **Language:** TypeScript 5.7 (Strict Type Safety)
- **Styling & Theme:** Tailwind CSS with a modern Blue & Purple palette (`#1e40af` to `#6b21a8`), responsive layouts, and glassmorphic elements.
- **Icons:** Lucide React
- **Cloud Backend & Database:** Supabase
  - **Authentication:** Supabase Auth (Email & Password, role metadata support for Student and Admin)
  - **Database:** PostgreSQL with Row Level Security (RLS) policies and automatic trigger functions for ticket sequence generation
  - **Storage:** Supabase Storage (`complaint-attachments` bucket) for defect photo uploads
- **Deployment Compatibility:** Vercel-compatible zero-configuration deployment with optimized Edge & Node.js runtimes.
- **Resilience / Offline Fallback:** Integrated local fallback mode with pre-populated sample complaints and `localStorage` persistence, allowing full local evaluation before Supabase credentials are configured.

---

## 3. Student Module (Implemented Phase)

The Student Module provides an intuitive self-service portal:

### 1. Authentication & Role Switcher
- **Login (`/login`):** University email and password credentials, role selector (Student / Admin), and 1-click evaluation shortcuts (`⚡ Demo Student`, `⚡ Demo Admin`).
- **Registration (`/register`):** Student ID/Matric number, full name, faculty/department, phone, campus email, and password.

### 2. Student Dashboard (`/dashboard`)
- **Welcome Banner:** Student greeting, matric number, and department.
- **Real-time Analytics Cards:**
  - **Total Complaints:** Total count of tickets submitted by the student.
  - **Submitted:** Complaints awaiting facilities supervisor triage.
  - **In Progress:** Issues actively assigned to an on-site technician.
  - **Resolved:** Successfully completed and verified maintenance tickets.
- **Search & Filter:** Instant search by ticket number, location, or subject, plus category pills.
- **Recent Complaints Grid:** Complaint cards displaying ticket IDs, status pills, category icons, locations, and direct links to tracking details.
- **Emergency Facility Hotline:** 24/7 campus control room phone numbers for critical incidents.

### 3. Submit Complaint (`/complaints/submit`)
- **Subject / Title:** Summary of the maintenance incident.
- **Category Picker:** Visual 10-category picker (Electrical, Plumbing, HVAC / Air Conditioning, Furniture & Carpentry, Cleanliness & Sanitation, Internet & Wi-Fi, Security & Safety, Pest Control, Civil Infrastructure, Other).
- **Severity / Priority:** Low, Medium, High, and Emergency.
- **Location Selector:** Campus building dropdown, room/floor/lab number, and specific landmark notes.
- **Description:** Multi-line text field with character counter.
- **Photo Upload:** Drag-and-drop dropzone supporting PNG/JPG/WebP with client-side preview, file size check, and Supabase Storage upload handler.
- **Submission Confirmation:** Modal dialog showcasing the newly minted Ticket ID (e.g., `#CC-2026-8941`) and direct navigation to track the ticket.

### 4. Complaint Tracking (`/complaints` and `/complaints/[id]`)
- **Complaints Directory (`/complaints`):** Filter by status tabs (*All*, *Submitted*, *In Progress*, *Resolved*), filter by category, sort by date (newest/oldest), and search.
- **Detailed Ticket View (`/complaints/[id]`):**
  - Unique Ticket ID header with 1-click clipboard copy.
  - Category, location, lodgment date, and resolution date.
  - **Visual Timeline Stepper:** Step-by-step progress tracking with audit logs.
  - **Official Facilities Administration Remarks:** Prominently styled admin remarks card showing technician notes and repair updates.
  - Attached defect photo with lightbox zoom modal.
  - Print receipt / summary button for student documentation.

---

## 4. Planned Admin Module & Handover Architecture

The system is designed with modularity so the next developer can build out the Admin Module without refactoring core services:

- **Handover Hub (`/admin`):** An architectural handover console and interactive dispatcher located at `/admin`.
- **Pre-configured Service Handlers:** `src/lib/services/complaintService.ts` contains:
  ```typescript
  updateComplaintStatus(
    complaintId: string,
    newStatus: ComplaintStatus,
    adminRemarks?: string,
    assignedTo?: string,
    adminName?: string
  ): Promise<Complaint | null>
  ```
- **Database Triggers & Sequence:** The PostgreSQL migration script (`supabase/schema.sql`) contains ticket generation sequences (`CC-YYYY-XXXX`), automated timestamp triggers, and RLS policies for `role = 'admin'`.
- **Planned Admin Features for Phase 2:**
  - Admin Master Dashboard with campus-wide defect heatmap and breakdown.
  - Facility Supervisor Work Order Dispatcher (assign tickets to technicians/vendors).
  - Bulk status transitions and priority escalation.
  - Department export (PDF/Excel maintenance reports).

---

## 5. Local Setup Instructions

### Prerequisites
- **Node.js:** v18.17+ or v20+ / v22+
- **npm** or **pnpm**

### Step 1: Clone Repository & Install Dependencies
```bash
git clone <repository-url>
cd CampusCare
npm install
```

### Step 2: Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Inside `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
> **Note:** If you run the project without Supabase credentials, CampusCare runs in **Local Mock Mode** with pre-populated realistic campus complaints and `localStorage` persistence.

### Step 3: Supabase Database Migration (When connecting to Supabase)
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open the file [`supabase/schema.sql`](supabase/schema.sql) in this repo, paste its entire content into the SQL Editor, and click **Run**.
4. In your Supabase Dashboard, navigate to **Storage** and ensure the `complaint-attachments` bucket is marked as public.
5. Copy your **Project URL** and **anon public API Key** from **Project Settings → API** and paste them into `.env.local`.

### Step 4: Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Step 5: Production Build & Vercel Deployment
To build for production:
```bash
npm run build
npm run start
```
To deploy to Vercel:
1. Push your repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Set the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables.
4. Deploy!

---

## 6. Directory Structure

```text
CampusCare/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx          # Login & Demo quick logins
│   │   │   └── register/page.tsx       # Student & Admin registration
│   │   ├── admin/
│   │   │   └── page.tsx                # Admin Handover Hub & Dispatch Console
│   │   ├── complaints/
│   │   │   ├── [id]/page.tsx           # Ticket detail, timeline & admin remarks
│   │   │   ├── submit/page.tsx         # Submit complaint with photo upload
│   │   │   └── page.tsx                # Complaints search & filter directory
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Student Dashboard with stats & recents
│   │   ├── globals.css                 # Tailwind base styles & scrollbars
│   │   ├── layout.tsx                  # Root layout with Navbar & Footer
│   │   └── page.tsx                    # Landing / Hero introduction page
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx              # Blue/purple responsive navbar
│   │   │   └── Footer.tsx              # Campus hotline, brand, tech credits
│   │   ├── student/
│   │   │   ├── ComplaintCard.tsx       # Complaint card component
│   │   │   ├── StatsCard.tsx           # Stat metric card with gradient top
│   │   │   └── TimelineStepper.tsx     # 3-step lifecycle progress tracker
│   │   └── ui/
│   │   │   ├── CategoryIcon.tsx        # Dynamic Lucide category icons
│   │   │   ├── PriorityBadge.tsx       # Low/Medium/High/Emergency pills
│   │   │   └── StatusBadge.tsx         # Submitted/In Progress/Resolved badges
│   ├── context/
│   │   └── AuthContext.tsx             # Supabase & Local Mock Auth provider
│   ├── lib/
│   │   ├── services/
│   │   │   └── complaintService.ts     # Unified CRUD, stats & photo service
│   │   ├── supabase/
│   │   │   ├── client.ts               # Browser Supabase client
│   │   │   └── server.ts               # Server Supabase helper
│   │   ├── constants.ts                # Categories, buildings, statuses
│   │   └── mock-data.ts                # Initial mock student & complaint data
│   └── types/
│       └── index.ts                    # TypeScript types & interfaces
├── supabase/
│   └── schema.sql                      # Complete PostgreSQL DDL, triggers & RLS
├── .env.example                        # Template environment variables
├── .env.local                          # Local environment variables
├── package.json                        # Project dependencies & scripts
├── tailwind.config.ts                  # Blue & Purple custom color configurations
└── tsconfig.json                       # TypeScript compiler settings
```

---

## 7. License & Credits

Developed with modern web engineering standards for the **CampusCare** project.
Tagline: *"Report. Track. Resolve."*

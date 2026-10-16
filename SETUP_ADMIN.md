# RK DIGITAL STUDIO — Admin Panel, CRM & CMS Setup Guide

> **Official Documentation for Rishabh Pal & RK DIGITAL STUDIO Administrators**  
> Location: Chunar, Mirzapur, Uttar Pradesh, India

---

## 🌟 Overview & Architecture

The **RK DIGITAL STUDIO Admin Panel + CRM + Portfolio CMS** is built directly into the existing website architecture. It connects to **Supabase PostgreSQL** with **Row Level Security (RLS)**, **Supabase Auth**, and **Supabase Storage**, with intelligent offline resilience.

- **Admin Login Route:** `/admin/login`
- **Dashboard Overview:** `/admin/`
- **Portfolio CMS:** `/admin/projects`
- **Leads Management CRM:** `/admin/leads`
- **Follow-up Scheduler:** `/admin/followups`
- **Settings & Exports:** `/admin/settings`
- **Public Portfolio Sync:** `/#portfolio` (live sync with category filtering)

---

## 🚀 1. Supabase Project Setup (One-Time)

### Step 1: Create a Free Supabase Project
1. Log in to [https://supabase.com/](https://supabase.com/)
2. Click **New Project**
3. Set:
   - **Name:** `rk-digital-studio`
   - **Database Password:** (choose a strong, secure password)
   - **Region:** South Asia (Mumbai) `ap-south-1` for lowest latency in India

### Step 2: Run the Database Migration
1. In your Supabase dashboard, navigate to the **SQL Editor** (icon on left menu).
2. Open or paste the contents of [`schema.sql`](file:///c:/Users/hp/.gemini/antigravity-ide/scratch/rk-digital-studio/schema.sql) into the editor.
3. Click **Run** (Cmd/Ctrl + Enter).
4. This automatically creates:
   - `public.projects` (Portfolio CMS with slug indexing and category checks)
   - `public.leads` (CRM with full contact details, priority, and follow-ups)
   - `public.lead_notes` (internal communication notes)
   - `public.lead_activities` (status change audit trail)
   - Row Level Security (RLS) policies allowing public inserts for enquiries and authenticated-only management for admins.
   - Storage bucket `project-images` with public read and authenticated write access.
   - Initial verified seed records (including Sunbeam English School Bhagwanpur).

### Step 3: Create Your Initial Admin User Safely
1. In Supabase dashboard, go to **Authentication** → **Users**.
2. Click **Add User** → **Create User**.
3. Enter:
   - **User Email:** `rishabhpal549@gmail.com` (or your studio administrator email)
   - **User Password:** (choose a strong password)
   - **Auto Confirm User:** Toggle **ON** (so email verification is not required for first login).
4. Click **Create User**.

---

## 🔑 2. Environment Variables & Credentials

Retrieve your credentials from Supabase:
- Go to **Project Settings** → **API**.
- Copy:
  1. **Project URL** (`https://<project-ref>.supabase.co`)
  2. **Project API Keys** → `anon` `public` (starts with `eyJhbGciOi...`)

> [!CAUTION]
> **Never** expose the `service_role` key in frontend code or commit it to Git. The frontend only uses the public `anon` key, protected by database Row Level Security (RLS).

### A. Local Configuration (Browser Session)
1. Visit `http://localhost:8089/admin/settings` (or open `/admin/settings.html`).
2. Paste the **Supabase Project URL** and **Anon Public Key**.
3. Click **Save & Test Connection**.
4. Both keys are saved securely in browser storage and sync with live PostgreSQL.

### B. Vercel Production Deployment Configuration
In your Vercel project dashboard:
1. Go to **Settings** → **Environment Variables**.
2. Add the following variables:
   - `SUPABASE_URL`: `https://<your-project-ref>.supabase.co`
   - `SUPABASE_ANON_KEY`: `<your-anon-public-key>`
3. Set Environment to **Production**, **Preview**, and **Development**.
4. Click **Save**.

---

## 🛠️ 3. How the Systems Work

### 1. Admin Authentication (`/admin/login`)
- Unauthenticated visitors attempting to access `/admin/`, `/admin/projects`, `/admin/leads`, `/admin/followups`, or `/admin/settings` are automatically redirected to `/admin/login`.
- Persistent authenticated sessions using Supabase Auth JWT tokens.
- Secure sign-out with confirmation.

### 2. Portfolio CMS (`/admin/projects`)
- Add, edit, publish, unpublish, and soft-delete projects.
- Upload project cover images to Supabase Storage bucket `project-images` or supply an image URL/local asset path.
- Public website automatically reflects published projects with category filters ("All", "School Website", "Coaching Website", "Business Website", "E-commerce Website").
- Preserves the verified **Sunbeam English School Bhagwanpur** portfolio entry.

### 3. Leads CRM (`/admin/leads`)
- Automatic capture: Enquiries submitted on the website form appear immediately in the CRM.
- Search by customer name, phone, email, or business name.
- Filter by status (`New`, `Contacted`, `Interested`, `Proposal Sent`, `Converted`, `Lost`).
- Filter by requested service and sort by date or follow-up due date.
- One-click contact actions:
  - **WhatsApp:** opens `wa.me/91<phone>` with pre-filled greeting.
  - **Call:** opens `tel:+91<phone>`.
  - **Email:** opens `mailto:<email>`.
- Slide-over detail drawer:
  - View full project requirements.
  - Update lead status (automatically logs in activity audit history).
  - Add internal conversation notes.
  - Set next follow-up date and time.
- Manual Lead Creation: Add direct walk-ins or phone calls to the CRM.

### 4. Follow-up Management (`/admin/followups`)
- Dedicated follow-up board with tabs for **Due Today**, **Overdue ⚠️**, and **Upcoming 📅**.
- One-click actions to reschedule or mark completed.

### 5. Data Backup & Export (`/admin/settings`)
- Export all CRM leads as clean `.csv` for Excel or Google Sheets.
- Export all projects as `.json`.

---

## 💻 4. Running Locally

To run the local server on Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1 -port 8089
```

Open in browser:
- Public Website: [http://localhost:8089/](http://localhost:8089/)
- Admin Login: [http://localhost:8089/admin/login](http://localhost:8089/admin/login)
- Admin Dashboard: [http://localhost:8089/admin/](http://localhost:8089/admin/)

---

## ✅ 5. Verification Checklist

- [x] Public website loads fast and responsive
- [x] Public enquiry form validates phone numbers (10-digit Indian numbers `^[6-9]\d{9}$`)
- [x] Honeypot anti-spam blocks automated bot submissions
- [x] Enquiries save to real database and appear in CRM
- [x] Unauthenticated users are redirected to `/admin/login`
- [x] Admin login authenticates securely
- [x] Dashboard calculates real KPI metrics
- [x] Admin can add, edit, and toggle project publication
- [x] Public portfolio renders published projects dynamically with category filters
- [x] Lead details slide-over drawer saves notes and logs status changes
- [x] Follow-ups board tracks overdue and upcoming client calls
- [x] CSV export downloads complete leads dataset
- [x] All 10 admin and public endpoints verified with HTTP 200 responses

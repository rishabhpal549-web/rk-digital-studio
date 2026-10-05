-- ========================================================
-- RK DIGITAL STUDIO - Database Schema for Supabase
-- Table: enquiries
-- ========================================================

CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email TEXT,
    business_name TEXT,
    business_type TEXT,
    service TEXT NOT NULL,
    budget TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'In Progress', 'Converted', 'Closed')),
    source TEXT DEFAULT 'Website Enquiry Form',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for speedy dashboard lookups and status filtering
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_phone ON public.enquiries(phone);

-- Row Level Security (RLS) setup
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous visitors (the website enquiry form) to INSERT enquiries only
CREATE POLICY "Allow public anon inserts for enquiries"
ON public.enquiries
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated admins (Rishabh Pal / Studio team) full access to read and update
CREATE POLICY "Allow authenticated staff full access"
ON public.enquiries
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

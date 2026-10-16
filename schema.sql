-- ========================================================
-- RK DIGITAL STUDIO - Master Production Database Schema
-- Supabase PostgreSQL with Row Level Security (RLS)
-- Tables: projects, leads, lead_notes, lead_activities
-- Storage: project-images bucket
-- ========================================================

-- Enable UUID extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- 1. PROJECTS TABLE (Portfolio CMS)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'School Website',
        'Coaching Website',
        'Business Website',
        'E-commerce Website',
        'Other'
    )),
    short_description TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT NOT NULL,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    live_url TEXT,
    client_name TEXT,
    is_featured BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for fast querying on public portfolio & admin CMS
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(is_featured) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- ========================================================
-- 2. LEADS TABLE (Lead Management CRM)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email TEXT,
    business_name TEXT,
    business_type TEXT,
    service TEXT NOT NULL,
    requirements TEXT NOT NULL,
    budget TEXT,
    preferred_contact TEXT DEFAULT 'WhatsApp' CHECK (preferred_contact IN ('WhatsApp', 'Phone Call', 'Email')),
    source TEXT DEFAULT 'Website Enquiry Form',
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN (
        'New',
        'Contacted',
        'Interested',
        'Proposal Sent',
        'Converted',
        'Lost'
    )),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    assigned_to TEXT,
    next_follow_up_at TIMESTAMP WITH TIME ZONE,
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for CRM filtering, search & follow-up tracking
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_follow_up ON public.leads(next_follow_up_at) WHERE status NOT IN ('Converted', 'Lost');

-- ========================================================
-- 3. LEAD NOTES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.lead_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    author_email TEXT,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON public.lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_created_at ON public.lead_notes(created_at DESC);

-- ========================================================
-- 4. LEAD ACTIVITIES TABLE (Audit Trail of Status Changes)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.lead_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL DEFAULT 'status_change',
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON public.lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON public.lead_activities(created_at DESC);

-- ========================================================
-- 5. AUTO-UPDATE TRIGGER FOR updated_at TIMESTAMPS
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON public.projects;
CREATE TRIGGER trigger_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_leads_updated_at ON public.leads;
CREATE TRIGGER trigger_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ========================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- PROJECTS POLICIES
-- --------------------------------------------------------
-- Public visitors (anon) can ONLY view published, non-deleted projects
DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;
CREATE POLICY "Public can view published projects"
ON public.projects
FOR SELECT
TO anon, authenticated
USING (status = 'published' AND deleted_at IS NULL);

-- Authenticated admins have full control to SELECT, INSERT, UPDATE, DELETE all projects
DROP POLICY IF EXISTS "Authenticated admins have full access to projects" ON public.projects;
CREATE POLICY "Authenticated admins have full access to projects"
ON public.projects
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- --------------------------------------------------------
-- LEADS POLICIES
-- --------------------------------------------------------
-- Public visitors (anon) can submit enquiry forms (INSERT ONLY)
DROP POLICY IF EXISTS "Public can submit enquiries into leads" ON public.leads;
CREATE POLICY "Public can submit enquiries into leads"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (true);

-- Authenticated admins have full access to view, update, delete leads
DROP POLICY IF EXISTS "Authenticated admins have full access to leads" ON public.leads;
CREATE POLICY "Authenticated admins have full access to leads"
ON public.leads
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- --------------------------------------------------------
-- LEAD NOTES POLICIES
-- --------------------------------------------------------
-- Only authenticated admins can read, create, update, delete notes
DROP POLICY IF EXISTS "Authenticated admins have full access to lead notes" ON public.lead_notes;
CREATE POLICY "Authenticated admins have full access to lead notes"
ON public.lead_notes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- --------------------------------------------------------
-- LEAD ACTIVITIES POLICIES
-- --------------------------------------------------------
-- Only authenticated admins can view and record activities
DROP POLICY IF EXISTS "Authenticated admins have full access to lead activities" ON public.lead_activities;
CREATE POLICY "Authenticated admins have full access to lead activities"
ON public.lead_activities
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ========================================================
-- 7. STORAGE BUCKET CONFIGURATION (for project images)
-- Run in Supabase SQL Editor if storage bucket is not created
-- ========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public can view images in project-images bucket
DROP POLICY IF EXISTS "Public can view project images" ON storage.objects;
CREATE POLICY "Public can view project images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'project-images');

-- Only authenticated admins can upload/delete images in project-images bucket
DROP POLICY IF EXISTS "Admins can upload project images" ON storage.objects;
CREATE POLICY "Admins can upload project images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Admins can update project images" ON storage.objects;
CREATE POLICY "Admins can update project images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Admins can delete project images" ON storage.objects;
CREATE POLICY "Admins can delete project images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'project-images');

-- ========================================================
-- 8. INITIAL SEED DATA (Preserving verified portfolio)
-- ========================================================

-- Project 1: Verified Sunbeam English School Bhagwanpur
INSERT INTO public.projects (
    title,
    slug,
    category,
    short_description,
    description,
    cover_image_url,
    gallery_images,
    live_url,
    client_name,
    is_featured,
    status
)
VALUES (
    'Sunbeam English School Bhagwanpur',
    'sunbeam-english-school-bhagwanpur',
    'School Website',
    'Modern responsive school website designed to present school information, facilities, activities and admission-related information online.',
    'Official responsive website developed for Sunbeam English School Bhagwanpur. Built with accessible navigation, structured admissions overview, leadership message, campus facilities gallery, and fast mobile performance.',
    'assets/sunbeam-school-preview.jpg',
    '["assets/sunbeam-school-preview.jpg", "assets/service-school.jpg"]'::jsonb,
    'https://sunbeam-school-mocha.vercel.app/',
    'Sunbeam English School',
    true,
    'published'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    short_description = EXCLUDED.short_description,
    live_url = EXCLUDED.live_url,
    cover_image_url = EXCLUDED.cover_image_url,
    is_featured = true,
    status = 'published';

-- Project 2: Academe Coaching Institute Concept
INSERT INTO public.projects (
    title,
    slug,
    category,
    short_description,
    description,
    cover_image_url,
    gallery_images,
    live_url,
    client_name,
    is_featured,
    status
)
VALUES (
    'Academe Coaching Institute Concept',
    'academe-coaching-institute-concept',
    'Coaching Website',
    'Concept architecture & UI prototype for competitive coaching institutes, featuring batch timetables, faculty credentials, and quick WhatsApp registration.',
    'Designed for regional coaching institutes in Varanasi and Mirzapur. Features course breakdowns for JEE/NEET, batch schedules, faculty profiles, test series highlights, and instant student admission inquiry forms.',
    'assets/service-coaching.jpg',
    '["assets/service-coaching.jpg"]'::jsonb,
    'https://www.rkdigitaistudio.in/services/coaching-website-development',
    'Concept Prototype',
    false,
    'published'
)
ON CONFLICT (slug) DO NOTHING;

-- Project 3: Artisan & Co. Handloom & Pottery Concept
INSERT INTO public.projects (
    title,
    slug,
    category,
    short_description,
    description,
    cover_image_url,
    gallery_images,
    live_url,
    client_name,
    is_featured,
    status
)
VALUES (
    'Artisan & Co. — Handloom & Pottery Demo',
    'artisan-co-handloom-pottery-demo',
    'E-commerce Website',
    'Demonstration catalog & ordering prototype for regional handlooms and Chunar pottery, showcasing rich silk weaves, product filtering, and instant WhatsApp ordering.',
    'Tailored e-commerce showcase highlighting Chunar red clay pottery and Banarasi handloom products. Includes catalog filtering, high-resolution product showcases, cart drawer, and frictionless WhatsApp checkout integration.',
    'assets/service-ecommerce.jpg',
    '["assets/service-ecommerce.jpg"]'::jsonb,
    'https://www.rkdigitaistudio.in/services/ecommerce-website-development',
    'Concept Prototype',
    false,
    'published'
)
ON CONFLICT (slug) DO NOTHING;

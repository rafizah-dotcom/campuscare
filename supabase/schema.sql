-- ====================================================================
-- CampusCare Database Schema
-- Campus Maintenance & Complaint Management System
-- Database: PostgreSQL (Supabase)
-- ====================================================================

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE complaint_status AS ENUM ('Submitted', 'In Progress', 'Resolved', 'Rejected');
CREATE TYPE complaint_priority AS ENUM ('Low', 'Medium', 'High', 'Emergency');
CREATE TYPE complaint_category AS ENUM (
  'Electrical',
  'Plumbing',
  'HVAC / Air Conditioning',
  'Furniture & Carpentry',
  'Cleanliness & Sanitation',
  'Internet & Wi-Fi',
  'Security & Safety',
  'Pest Control',
  'Civil Infrastructure',
  'Other'
);

-- 2. PROFILES TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'student'::user_role NOT NULL,
  student_id TEXT,
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category complaint_category NOT NULL,
  priority complaint_priority DEFAULT 'Medium'::complaint_priority NOT NULL,
  building TEXT NOT NULL,
  room_floor TEXT NOT NULL,
  location_details TEXT,
  description TEXT NOT NULL,
  photo_url TEXT,
  status complaint_status DEFAULT 'Submitted'::complaint_status NOT NULL,
  admin_remarks TEXT,
  assigned_to TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. COMPLAINT TIMELINE / STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.complaint_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  status complaint_status NOT NULL,
  note TEXT,
  action_by TEXT DEFAULT 'Student',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. FUNCTION: Generate Human-Readable Ticket ID (e.g., CC-2026-1001)
CREATE SEQUENCE IF NOT EXISTS ticket_id_seq START 1001;

CREATE OR REPLACE FUNCTION generate_ticket_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_id IS NULL OR NEW.ticket_id = '' THEN
    NEW.ticket_id := 'CC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('ticket_id_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_ticket_id ON public.complaints;
CREATE TRIGGER trigger_generate_ticket_id
  BEFORE INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION generate_ticket_id();

-- 6. FUNCTION: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profiles_timestamp
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_complaints_timestamp
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. FUNCTION: Auto-create profile on auth.user sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, student_id, department, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
    NEW.raw_user_meta_data->>'student_id',
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_timeline ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Complaints Policies
CREATE POLICY "Students can view their own complaints"
  ON public.complaints FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all complaints"
  ON public.complaints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Students can submit complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update complaints"
  ON public.complaints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Timeline Policies
CREATE POLICY "Users can view timeline for complaints they have access to"
  ON public.complaint_timeline FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints 
      WHERE complaints.id = complaint_timeline.complaint_id 
        AND (complaints.user_id = auth.uid() OR EXISTS (
          SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
        ))
    )
  );

CREATE POLICY "System and Admins can insert timeline events"
  ON public.complaint_timeline FOR INSERT
  WITH CHECK (true);

-- 9. SUPABASE STORAGE BUCKET FOR COMPLAINT ATTACHMENTS
-- Run in Supabase SQL editor:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('complaint-attachments', 'complaint-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Anyone authenticated can upload
CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'complaint-attachments' AND auth.role() = 'authenticated');

-- Storage RLS: Public can view photos
CREATE POLICY "Public attachment viewing"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'complaint-attachments');

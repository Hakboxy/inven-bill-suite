-- Phase 1: Add role column to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user'::user_role;

-- Create security definer function to get current user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_role user_role)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = _role
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Phase 2: Enable RLS on tables that don't have it yet

-- Financial Reports table
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins and managers can access financial_reports" ON public.financial_reports;
CREATE POLICY "Admins and managers can access financial_reports" 
ON public.financial_reports FOR ALL 
USING (public.get_current_user_role() IN ('admin', 'manager'));

-- Tax Reports table
ALTER TABLE public.tax_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins and managers can access tax_reports" ON public.tax_reports;
CREATE POLICY "Admins and managers can access tax_reports" 
ON public.tax_reports FOR ALL 
USING (public.get_current_user_role() IN ('admin', 'manager'));

-- Inventory Reports table
ALTER TABLE public.inventory_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can access inventory_reports" ON public.inventory_reports;
CREATE POLICY "Authenticated users can access inventory_reports" 
ON public.inventory_reports FOR ALL 
USING (auth.role() = 'authenticated');

-- Company Settings table (Admin-only)
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can access company_settings" ON public.company_settings;
CREATE POLICY "Admins can access company_settings" 
ON public.company_settings FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- App Settings table (Admin-only)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can access app_settings" ON public.app_settings;
CREATE POLICY "Admins can access app_settings" 
ON public.app_settings FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Integrations table (Admin-only for sensitive API keys)
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can access integrations" ON public.integrations;
CREATE POLICY "Admins can access integrations" 
ON public.integrations FOR ALL 
USING (public.get_current_user_role() = 'admin');
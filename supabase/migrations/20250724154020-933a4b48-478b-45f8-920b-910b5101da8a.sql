-- Phase 1: User Profiles and Roles System (Fixed - skip enum creation)
-- Update profiles table to include role (enum already exists)
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

-- Enable RLS on profiles table and create policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.get_current_user_role() = 'admin');

-- Phase 2: Enable RLS on all business tables with proper policies

-- Categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can access categories" 
ON public.categories FOR ALL 
USING (auth.role() = 'authenticated');

-- Customer Groups table  
ALTER TABLE public.customer_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can access customer_groups" 
ON public.customer_groups FOR ALL 
USING (auth.role() = 'authenticated');

-- Customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can access customers" 
ON public.customers FOR ALL 
USING (auth.role() = 'authenticated');

-- Products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can access products" 
ON public.products FOR ALL 
USING (auth.role() = 'authenticated');

-- Vendors table
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can access vendors" 
ON public.vendors FOR ALL 
USING (auth.role() = 'authenticated');

-- Invoices table
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can access invoices" 
ON public.invoices FOR ALL 
USING (auth.role() = 'authenticated');

-- Invoice Items table
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can access invoice_items" 
ON public.invoice_items FOR ALL 
USING (auth.role() = 'authenticated');

-- Sales Orders table
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can access sales_orders" 
ON public.sales_orders FOR ALL 
USING (auth.role() = 'authenticated');

-- Sales Order Items table
ALTER TABLE public.sales_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can access sales_order_items" 
ON public.sales_order_items FOR ALL 
USING (auth.role() = 'authenticated');

-- Payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can access payments" 
ON public.payments FOR ALL 
USING (auth.role() = 'authenticated');

-- Phase 3: Secure sensitive data tables (Admin-only access)

-- Financial Reports table
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins and managers can access financial_reports" 
ON public.financial_reports FOR ALL 
USING (public.get_current_user_role() IN ('admin', 'manager'));

-- Tax Reports table
ALTER TABLE public.tax_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins and managers can access tax_reports" 
ON public.tax_reports FOR ALL 
USING (public.get_current_user_role() IN ('admin', 'manager'));

-- Inventory Reports table
ALTER TABLE public.inventory_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can access inventory_reports" 
ON public.inventory_reports FOR ALL 
USING (auth.role() = 'authenticated');

-- Company Settings table (Admin-only)
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can access company_settings" 
ON public.company_settings FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- App Settings table (Admin-only)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can access app_settings" 
ON public.app_settings FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Integrations table (Admin-only for sensitive API keys)
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can access integrations" 
ON public.integrations FOR ALL 
USING (public.get_current_user_role() = 'admin');

-- Insert a default admin user profile (this should be updated after first admin signs up)
INSERT INTO public.profiles (id, email, first_name, last_name, role) 
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  'admin@invenbill.com', 
  'System', 
  'Admin', 
  'admin'
) ON CONFLICT (id) DO NOTHING;
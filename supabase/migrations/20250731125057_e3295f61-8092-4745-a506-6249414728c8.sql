-- Fix remaining security issues: Enable RLS on products table and update remaining functions
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Update remaining functions to have proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public';

CREATE OR REPLACE FUNCTION public.has_role(_role user_role)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = _role
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public';
-- Fix security issues by enabling RLS on existing tables and updating function
-- Enable RLS on tables that don't have it enabled
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Update the generate_po_number function to have proper search_path
CREATE OR REPLACE FUNCTION public.generate_po_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    po_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(po_number FROM 'PO-(\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.purchase_orders
    WHERE po_number ~ '^PO-\d+$';
    
    po_number := 'PO-' || LPAD(next_number::TEXT, 6, '0');
    RETURN po_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
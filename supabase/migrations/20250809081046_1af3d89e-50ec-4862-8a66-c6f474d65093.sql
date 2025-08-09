-- Fix ambiguous po_number reference in generate_po_number()
CREATE OR REPLACE FUNCTION public.generate_po_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    next_number INTEGER;
    v_po_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(po.po_number FROM 'PO-(\d+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.purchase_orders AS po
    WHERE po.po_number ~ '^PO-\d+$';
    
    v_po_number := 'PO-' || LPAD(next_number::TEXT, 6, '0');
    RETURN v_po_number;
END;
$function$;
-- Function to get low stock products
CREATE OR REPLACE FUNCTION public.get_low_stock_products()
RETURNS TABLE (
    id uuid,
    name text,
    sku text,
    stock integer,
    low_stock_threshold integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT p.id, p.name, p.sku, p.stock, p.low_stock_threshold
    FROM public.products p
    WHERE p.stock <= p.low_stock_threshold
    ORDER BY (p.stock::float / NULLIF(p.low_stock_threshold, 0)) ASC
$$;
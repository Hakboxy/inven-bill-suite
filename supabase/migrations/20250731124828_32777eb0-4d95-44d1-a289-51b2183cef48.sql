-- Create purchase_orders table
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  po_number TEXT NOT NULL UNIQUE,
  vendor_id UUID REFERENCES public.vendors(id),
  vendor_name TEXT NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'received', 'cancelled')),
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase_order_items table
CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_sku TEXT,
  quantity INTEGER NOT NULL,
  unit_cost NUMERIC(10,2) NOT NULL,
  total_cost NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock_movements table
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'adjustment', 'return', 'transfer')),
  quantity_change INTEGER NOT NULL,
  stock_before INTEGER NOT NULL,
  stock_after INTEGER NOT NULL,
  reason TEXT,
  reference_id UUID, -- Can reference purchase_order_id, sales_order_id, etc.
  reference_type TEXT, -- 'purchase_order', 'sales_order', 'manual_adjustment', etc.
  movement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for purchase_orders
CREATE POLICY "Authenticated users can access purchase_orders" 
ON public.purchase_orders 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Create RLS policies for purchase_order_items
CREATE POLICY "Authenticated users can access purchase_order_items" 
ON public.purchase_order_items 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Create RLS policies for stock_movements
CREATE POLICY "Authenticated users can access stock_movements" 
ON public.stock_movements 
FOR ALL 
USING (auth.role() = 'authenticated');

-- Create function to generate PO numbers
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at on purchase_orders
CREATE TRIGGER update_purchase_orders_updated_at
BEFORE UPDATE ON public.purchase_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_purchase_orders_vendor_id ON public.purchase_orders(vendor_id);
CREATE INDEX idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX idx_purchase_order_items_po_id ON public.purchase_order_items(purchase_order_id);
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_date ON public.stock_movements(movement_date);
CREATE INDEX idx_stock_movements_type ON public.stock_movements(movement_type);
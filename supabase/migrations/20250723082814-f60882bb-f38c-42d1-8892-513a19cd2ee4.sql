-- Fix security issues by setting search_path for all functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to generate invoice numbers with secure search path
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    invoice_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.invoices
    WHERE invoice_number ~ '^INV-[0-9]+$';
    
    invoice_number := 'INV-' || LPAD(next_number::TEXT, 3, '0');
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to generate sales order numbers with secure search path
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    order_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.sales_orders
    WHERE order_number ~ '^ORD-[0-9]+$';
    
    order_number := 'ORD-' || LPAD(next_number::TEXT, 3, '0');
    RETURN order_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to generate payment numbers with secure search path
CREATE OR REPLACE FUNCTION public.generate_payment_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    payment_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(payment_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.payments
    WHERE payment_number ~ '^PAY-[0-9]+$';
    
    payment_number := 'PAY-' || LPAD(next_number::TEXT, 3, '0');
    RETURN payment_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update customer totals with secure search path
CREATE OR REPLACE FUNCTION public.update_customer_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.customers 
        SET 
            total_orders = (
                SELECT COUNT(*) 
                FROM public.invoices 
                WHERE customer_id = NEW.customer_id AND status = 'paid'
            ),
            total_spent = (
                SELECT COALESCE(SUM(total_amount), 0) 
                FROM public.invoices 
                WHERE customer_id = NEW.customer_id AND status = 'paid'
            ),
            last_order_date = (
                SELECT MAX(issue_date) 
                FROM public.invoices 
                WHERE customer_id = NEW.customer_id
            )
        WHERE id = NEW.customer_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        UPDATE public.customers 
        SET 
            total_orders = (
                SELECT COUNT(*) 
                FROM public.invoices 
                WHERE customer_id = OLD.customer_id AND status = 'paid'
            ),
            total_spent = (
                SELECT COALESCE(SUM(total_amount), 0) 
                FROM public.invoices 
                WHERE customer_id = OLD.customer_id AND status = 'paid'
            ),
            last_order_date = (
                SELECT MAX(issue_date) 
                FROM public.invoices 
                WHERE customer_id = OLD.customer_id
            )
        WHERE id = OLD.customer_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to handle new user registration with secure search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
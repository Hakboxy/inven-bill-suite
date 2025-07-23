-- Create reports and settings tables

-- Financial Reports table
CREATE TABLE public.financial_reports (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    report_name text NOT NULL,
    report_type text NOT NULL, -- 'profit_loss', 'balance_sheet', 'cash_flow'
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_revenue numeric DEFAULT 0,
    total_expenses numeric DEFAULT 0,
    net_profit numeric DEFAULT 0,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tax Reports table
CREATE TABLE public.tax_reports (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    report_name text NOT NULL,
    tax_period text NOT NULL, -- 'monthly', 'quarterly', 'yearly'
    start_date date NOT NULL,
    end_date date NOT NULL,
    taxable_income numeric DEFAULT 0,
    tax_rate numeric DEFAULT 0,
    tax_amount numeric DEFAULT 0,
    status text DEFAULT 'draft', -- 'draft', 'submitted', 'approved'
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Inventory Reports table
CREATE TABLE public.inventory_reports (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    report_name text NOT NULL,
    report_type text NOT NULL, -- 'stock_levels', 'movements', 'valuation'
    total_products integer DEFAULT 0,
    total_stock_value numeric DEFAULT 0,
    low_stock_items integer DEFAULT 0,
    out_of_stock_items integer DEFAULT 0,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Company Settings table
CREATE TABLE public.company_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name text NOT NULL,
    company_email text,
    company_phone text,
    company_address text,
    tax_id text,
    currency text DEFAULT 'USD',
    timezone text DEFAULT 'UTC',
    fiscal_year_start date,
    logo_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- App Settings table
CREATE TABLE public.app_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key text NOT NULL UNIQUE,
    setting_value text,
    setting_type text DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Integrations table
CREATE TABLE public.integrations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    integration_name text NOT NULL,
    integration_type text NOT NULL, -- 'payment', 'shipping', 'accounting', 'crm'
    api_key text,
    api_secret text,
    webhook_url text,
    is_active boolean DEFAULT false,
    configuration jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_financial_reports_date ON public.financial_reports(start_date, end_date);
CREATE INDEX idx_tax_reports_period ON public.tax_reports(tax_period, start_date);
CREATE INDEX idx_inventory_reports_type ON public.inventory_reports(report_type);
CREATE INDEX idx_app_settings_key ON public.app_settings(setting_key);

-- Add triggers for updated_at
CREATE TRIGGER update_financial_reports_updated_at
    BEFORE UPDATE ON public.financial_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_reports_updated_at
    BEFORE UPDATE ON public.tax_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_reports_updated_at
    BEFORE UPDATE ON public.inventory_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_settings_updated_at
    BEFORE UPDATE ON public.company_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Disable RLS for testing
ALTER TABLE public.financial_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations DISABLE ROW LEVEL SECURITY;
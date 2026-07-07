-- Extend profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vendor_status TEXT DEFAULT 'none'; -- none, pending, approved, rejected
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cni_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vendor_balance NUMERIC DEFAULT 0;

-- Extend products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Extend orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS vendor_earnings NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS vendor_cleared BOOLEAN DEFAULT false; -- becomes true after 3 days

-- Withdrawals Table
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES public.profiles(id) NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, paid, rejected
    crypto_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for withdrawals
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Vendor can view their own withdrawals
CREATE POLICY "Vendors view own withdrawals" ON public.withdrawals
FOR SELECT USING (auth.uid() = vendor_id);

-- Vendor can insert their own withdrawals
CREATE POLICY "Vendors insert own withdrawals" ON public.withdrawals
FOR INSERT WITH CHECK (auth.uid() = vendor_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_withdrawals_updated_at
BEFORE UPDATE ON public.withdrawals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

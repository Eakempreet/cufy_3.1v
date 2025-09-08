-- Fix payment proofs storage - create dedicated bucket for payment proofs
-- This fixes the issue where payment proofs are uploaded to profile-photos bucket

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for payment proofs
CREATE POLICY "Anyone can view payment proofs" ON storage.objects 
    FOR SELECT USING (bucket_id = 'payment-proofs');

CREATE POLICY "Users can upload their payment proofs" ON storage.objects 
    FOR INSERT WITH CHECK (
        bucket_id = 'payment-proofs' AND
        auth.uid()::text IS NOT NULL
    );

CREATE POLICY "Users can update their payment proofs" ON storage.objects 
    FOR UPDATE USING (
        bucket_id = 'payment-proofs' AND
        auth.uid()::text IS NOT NULL
    );

CREATE POLICY "Users can delete their payment proofs" ON storage.objects 
    FOR DELETE USING (
        bucket_id = 'payment-proofs' AND
        auth.uid()::text IS NOT NULL
    );

-- Note: This creates a separate bucket for payment proofs to keep them 
-- organized separately from profile photos
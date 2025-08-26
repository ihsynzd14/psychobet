-- Manual Admin Role Setup Script
-- Run this in your Supabase SQL Editor

-- First, let's see all users and their current roles
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC;

-- If your user doesn't appear above, it means the profile wasn't created
-- Check auth.users to see all authenticated users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- OPTION 1: Update existing profile to admin role
-- Replace 'your-email@example.com' with your actual email
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- OPTION 2: If no profile exists, create one with admin role
-- Replace the email and user ID with your actual values
-- You can get your user ID from the auth.users table above
INSERT INTO public.profiles (id, email, role, full_name)
SELECT 
    id,
    email,
    'admin' as role,
    raw_user_meta_data->>'full_name' as full_name
FROM auth.users 
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE SET
    role = 'admin';

-- Verify the update worked
SELECT 
    p.id,
    p.email,
    p.role,
    p.created_at
FROM public.profiles p
WHERE p.email = 'your-email@example.com';

-- Test the same query that middleware uses
SELECT role 
FROM public.profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
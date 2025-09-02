-- ==========================================
-- PsychoBet Database Schema
-- ==========================================

-- Enable Row Level Security (RLS) and required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. PROFILES TABLE
-- ==========================================
-- Extends auth.users with additional profile information
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- ==========================================
-- 2. LEAGUES TABLE
-- ==========================================
-- Stores available leagues/competitions
CREATE TABLE public.leagues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    country TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- Policies for leagues
CREATE POLICY "Anyone can view active leagues" ON public.leagues
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage leagues" ON public.leagues
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- ==========================================
-- 3. USER_MEMBERSHIPS TABLE
-- ==========================================
-- Tracks user memberships and their status (simplified without plans)
CREATE TABLE public.user_memberships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended', 'cancelled')),
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;

-- Policies for user memberships
CREATE POLICY "Users can view own memberships" ON public.user_memberships
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all memberships" ON public.user_memberships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- ==========================================
-- 4. USER_LEAGUE_ACCESS TABLE
-- ==========================================
-- Manages which leagues users have access to
CREATE TABLE public.user_league_access (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
    membership_id UUID REFERENCES public.user_memberships(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Ensure no duplicate access per user-league combination
    UNIQUE(user_id, league_id)
);

-- Enable RLS
ALTER TABLE public.user_league_access ENABLE ROW LEVEL SECURITY;

-- Policies for user league access
CREATE POLICY "Users can view own league access" ON public.user_league_access
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all league access" ON public.user_league_access
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- ==========================================
-- 5. ACTIVITY_LOGS TABLE
-- ==========================================
-- Tracks important admin actions for auditing
CREATE TABLE public.activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- 'user_created', 'membership_updated', 'league_granted', etc.
    action_description TEXT NOT NULL,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies for activity logs
CREATE POLICY "Admins can view all activity logs" ON public.activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admins can create activity logs" ON public.activity_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- ==========================================
-- 6. FUNCTIONS AND TRIGGERS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_leagues_updated_at 
    BEFORE UPDATE ON public.leagues 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_memberships_updated_at 
    BEFORE UPDATE ON public.user_memberships 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 7. INITIAL DATA
-- ==========================================

-- Insert sample leagues
INSERT INTO public.leagues (name, display_name, country, sort_order) VALUES
('premier_league', 'Premier League', 'England', 1),
('la_liga', 'La Liga', 'Spain', 2),
('bundesliga', 'Bundesliga', 'Germany', 3),
('serie_a', 'Serie A', 'Italy', 4),
('ligue_1', 'Ligue 1', 'France', 5),
('champions_league', 'UEFA Champions League', 'Europe', 6),
('europa_league', 'UEFA Europa League', 'Europe', 7),
('championship', 'EFL Championship', 'England', 8),
('league_one', 'EFL League One', 'England', 9),
('league_two', 'EFL League Two', 'England', 10);

-- ==========================================
-- 8. VIEWS FOR EASY DATA ACCESS
-- ==========================================

-- View for user details without membership plan info
CREATE VIEW public.user_details AS
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at as user_created_at,
    um.id as membership_id,
    um.status as membership_status,
    um.start_date,
    um.expiry_date,
    CASE 
        WHEN um.expiry_date < CURRENT_DATE THEN 'expired'
        WHEN um.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
        ELSE 'active'
    END as membership_health,
    (
        SELECT COUNT(*)
        FROM public.user_league_access ula
        WHERE ula.user_id = p.id
    ) as league_count
FROM public.profiles p
LEFT JOIN public.user_memberships um ON p.id = um.user_id AND um.status = 'active';

-- View for league access summary
CREATE VIEW public.user_league_summary AS
SELECT 
    p.id as user_id,
    p.email,
    p.full_name,
    array_agg(l.display_name ORDER BY l.sort_order) as accessible_leagues,
    COUNT(l.id) as total_leagues
FROM public.profiles p
LEFT JOIN public.user_league_access ula ON p.id = ula.user_id
LEFT JOIN public.leagues l ON ula.league_id = l.id AND l.is_active = TRUE
GROUP BY p.id, p.email, p.full_name;

-- ==========================================
-- 9. INDEXES FOR PERFORMANCE
-- ==========================================

-- Indexes for common queries
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_user_memberships_user_id ON public.user_memberships(user_id);
CREATE INDEX idx_user_memberships_status ON public.user_memberships(status);
CREATE INDEX idx_user_memberships_expiry ON public.user_memberships(expiry_date);
CREATE INDEX idx_user_league_access_user_id ON public.user_league_access(user_id);
CREATE INDEX idx_user_league_access_league_id ON public.user_league_access(league_id);
CREATE INDEX idx_activity_logs_performed_by ON public.activity_logs(performed_by);
CREATE INDEX idx_activity_logs_target_user ON public.activity_logs(target_user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

-- ==========================================
-- 10. USER-FIXTURE ACCESS TABLE
-- ==========================================
-- Manages which fixtures users have access to
CREATE TABLE public.user_fixture_access (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    fixture_id TEXT NOT NULL, -- Using TEXT to accommodate various fixture ID formats
    fixture_name TEXT, -- Added fixture name for better display
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Ensure no duplicate access per user-fixture combination
    UNIQUE(user_id, fixture_id)
);

-- Enable RLS
ALTER TABLE public.user_fixture_access ENABLE ROW LEVEL SECURITY;

-- Policies for user fixture access
CREATE POLICY "Users can view own fixture access" ON public.user_fixture_access
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all fixture access" ON public.user_fixture_access
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Indexes for user-fixture access
CREATE INDEX idx_user_fixture_access_user_id ON public.user_fixture_access(user_id);
CREATE INDEX idx_user_fixture_access_fixture_id ON public.user_fixture_access(fixture_id);

-- ==========================================
-- NOTES FOR IMPLEMENTATION
-- ==========================================
-- 
-- 1. Run this schema in your Supabase SQL editor
-- 2. The auth.users table is automatically created by Supabase Auth
-- 3. Row Level Security (RLS) is enabled for all tables
-- 4. Policies ensure users can only see their own data unless they're admins
-- 5. The handle_new_user() function automatically creates a profile when someone signs up
-- 6. Views provide easy access to complex joined data
-- 7. Activity logs track all admin actions for auditing
-- 8. Indexes optimize common query patterns
--
-- To create your first admin user, after running this schema:
-- 1. Sign up normally through your app
-- 2. Then update your role in the database:
--    UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
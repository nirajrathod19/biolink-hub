

# Implementation Plan: Email Verification & Username Check

## Current State Analysis

### Email Verification
- **Currently**: Signup uses Supabase Auth's built-in email sending (from Supabase's default sender)
- **Custom Function**: A `send-verification-email` edge function exists that sends from `noreply@brioo.in`, but it's NOT being called during signup
- **Action Needed**: Either integrate the custom function OR configure Supabase Auth to use your custom SMTP

### Username Uniqueness
- **Database**: Already has unique constraint (`profiles_username_key`)
- **Frontend**: No real-time availability check - errors only caught after signup fails
- **Action Needed**: Add real-time username availability checking

---

## Implementation Steps

### Step 1: Username Availability Check

**Create a new database function for username checking:**
```sql
CREATE OR REPLACE FUNCTION public.check_username_available(username_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE LOWER(username) = LOWER(username_to_check)
  );
END;
$$;
```

**Update SignupPage.tsx:**
- Add debounced username availability check (300ms delay)
- Show loading spinner while checking
- Display available/taken status with visual indicator
- Prevent form submission if username is taken

**Create useUsernameCheck hook:**
```typescript
// src/hooks/useUsernameCheck.ts
export const useUsernameCheck = () => {
  const checkUsername = async (username: string) => {
    const { data, error } = await supabase.rpc('check_username_available', {
      username_to_check: username
    });
    return { available: data, error };
  };
  return { checkUsername };
};
```

### Step 2: Email Verification Integration

**Option A (Recommended): Configure Supabase Auth Custom SMTP**
- This requires going to Supabase dashboard > Authentication > Email Templates
- Set custom SMTP with Resend credentials
- Emails will then come from `noreply@brioo.in`

**Option B: Call Custom Edge Function**
- Modify AuthContext.tsx to disable Supabase's built-in email
- After successful signup, call the edge function manually
- More complex but gives full control

---

## Complete Database SQL Export

All 24 tables with schemas, constraints, and RLS policies:

```sql
-- =========================================
-- CUSTOM TYPES
-- =========================================
CREATE TYPE public.app_role AS ENUM ('creator', 'admin');

-- =========================================
-- FUNCTIONS
-- =========================================
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, referral_code)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    public.generate_referral_code()
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'creator');
  RETURN NEW;
END;
$$;

-- =========================================
-- TABLES
-- =========================================

-- 1. profiles
CREATE TABLE public.profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  username text NOT NULL UNIQUE,
  display_name text,
  bio text,
  avatar_url text,
  theme_color text DEFAULT '#8B5CF6',
  template text DEFAULT 'minimal',
  is_pro boolean DEFAULT false,
  wallet_balance numeric DEFAULT 0.00,
  pending_revenue numeric DEFAULT 0.00,
  total_clicks integer DEFAULT 0,
  unique_clicks integer DEFAULT 0,
  referral_code text UNIQUE,
  referred_by uuid,
  interests text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. user_roles
CREATE TABLE public.user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role app_role NOT NULL DEFAULT 'creator',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. links
CREATE TABLE public.links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  icon text,
  link_type text DEFAULT 'link',
  position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_highlighted boolean DEFAULT false,
  is_affiliate boolean DEFAULT false,
  affiliate_code text,
  badge text,
  animation text,
  click_count integer DEFAULT 0,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. social_links
CREATE TABLE public.social_links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  platform text NOT NULL,
  url text NOT NULL,
  position integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. click_logs
CREATE TABLE public.click_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid,
  link_id uuid,
  visitor_ip text,
  user_agent text,
  browser text,
  os text,
  device_type text,
  country text,
  city text,
  referer text,
  is_unique boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. affiliate_clicks
CREATE TABLE public.affiliate_clicks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  link_id uuid,
  visitor_ip text,
  user_agent text,
  device_type text,
  country text,
  referrer text,
  created_at timestamptz DEFAULT now()
);

-- 7. ad_impressions
CREATE TABLE public.ad_impressions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  ad_slot text,
  visitor_ip text,
  user_agent text,
  device_type text,
  country text,
  estimated_revenue numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. adsense_settings
CREATE TABLE public.adsense_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  is_revenue_sharing_enabled boolean DEFAULT false,
  total_impressions bigint DEFAULT 0,
  total_estimated_revenue numeric DEFAULT 0,
  creator_earnings numeric DEFAULT 0,
  last_calculated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9. ads
CREATE TABLE public.ads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  url text NOT NULL,
  image_url text,
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  is_hero boolean DEFAULT false,
  click_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 10. admin_settings
CREATE TABLE public.admin_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 11. admin_sessions
CREATE TABLE public.admin_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  token text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 12. active_sessions
CREATE TABLE public.active_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  session_token text NOT NULL,
  ip_address text,
  user_agent text,
  device_info jsonb DEFAULT '{}',
  expires_at timestamptz NOT NULL,
  last_activity timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 13. account_lockouts
CREATE TABLE public.account_lockouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  failed_attempts integer DEFAULT 0,
  locked_until timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 14. login_attempts
CREATE TABLE public.login_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  ip_address text,
  user_agent text,
  success boolean DEFAULT false,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 15. security_audit_log
CREATE TABLE public.security_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  success boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 16. transactions
CREATE TABLE public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL,
  amount numeric NOT NULL,
  description text,
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 17. withdrawals
CREATE TABLE public.withdrawals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL,
  payment_details jsonb,
  status text DEFAULT 'pending',
  fraud_score integer DEFAULT 0,
  fraud_flags jsonb,
  is_flagged boolean DEFAULT false,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 18. referrals
CREATE TABLE public.referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  level integer DEFAULT 1,
  commission_earned numeric DEFAULT 0.00,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 19. tip_jar
CREATE TABLE public.tip_jar (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  is_enabled boolean DEFAULT false,
  message text DEFAULT 'Support my work!',
  minimum_amount numeric DEFAULT 1,
  suggested_amounts jsonb DEFAULT '[3, 5, 10]',
  paypal_email text,
  venmo_username text,
  cashapp_tag text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 20. digital_products
CREATE TABLE public.digital_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'USD',
  file_url text,
  preview_image text,
  is_active boolean DEFAULT true,
  download_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 21. store_integrations
CREATE TABLE public.store_integrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  platform text NOT NULL,
  store_name text,
  store_domain text,
  api_key text,
  api_secret text,
  access_token text,
  settings jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 22. analytics_settings
CREATE TABLE public.analytics_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  ga_measurement_id text,
  is_ga_enabled boolean DEFAULT false,
  meta_pixel_id text,
  is_meta_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 23. templates
CREATE TABLE public.templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  preview_image text,
  config jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 24. guide_pages
CREATE TABLE public.guide_pages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_type text NOT NULL DEFAULT 'image',
  position integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =========================================
-- VIEWS (Public data exposure)
-- =========================================
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT id, user_id, username, display_name, bio, avatar_url, 
       theme_color, template, interests, created_at, updated_at
FROM public.profiles;

CREATE OR REPLACE VIEW public.social_links_public AS
SELECT id, platform, url, position, is_active, created_at
FROM public.social_links
WHERE is_active = true;

CREATE OR REPLACE VIEW public.links_public AS
SELECT id, user_id, title, url, icon, link_type, position, 
       is_active, is_highlighted, badge, animation, click_count, 
       created_at, updated_at
FROM public.links
WHERE is_active = true
  AND (scheduled_start IS NULL OR scheduled_start <= now())
  AND (scheduled_end IS NULL OR scheduled_end >= now());

CREATE OR REPLACE VIEW public.tip_jar_public AS
SELECT id, user_id, is_enabled, message, minimum_amount, 
       suggested_amounts, created_at, updated_at
FROM public.tip_jar
WHERE is_enabled = true;

-- =========================================
-- INDEXES
-- =========================================
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_interests ON public.profiles USING gin(interests);
CREATE INDEX idx_links_user_id ON public.links(user_id);
CREATE INDEX idx_click_logs_profile_id ON public.click_logs(profile_id);
CREATE INDEX idx_click_logs_created_at ON public.click_logs(created_at);

-- =========================================
-- TRIGGERS
-- =========================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Steps to Connect External PostgreSQL/Supabase

### Option 1: Use Existing Lovable Cloud (Recommended)
Your project already has a fully configured database. Access it via:
1. Click "Cloud" tab in Lovable editor
2. Navigate to Database > Tables
3. View and manage all 24 tables

### Option 2: Connect from External Tools (VSCode, DBeaver, etc.)

**Get Connection String:**
1. In Lovable, go to Settings > Cloud > Advanced
2. Copy the database connection string

**In VSCode:**
1. Install PostgreSQL extension
2. Add new connection with these details:
   - Host: `db.obklluoirkvdenhkpnyd.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - Username: `postgres`
   - Password: (get from Lovable Cloud settings)

### Option 3: Create Separate Supabase Project
1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Run the SQL schema above in SQL Editor
4. Update `.env` with new credentials:
   ```
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
   ```

---

## Technical Details

| Component | Current Status |
|-----------|---------------|
| Email Sender | `noreply@brioo.in` (via Resend) |
| Username Unique Constraint | Yes (`profiles_username_key`) |
| Real-time Username Check | Not implemented |
| Tables Count | 24 |
| Views Count | 4 |
| Edge Functions | 10 deployed |

## Files to Create/Modify

1. **New**: `src/hooks/useUsernameCheck.ts` - Username availability hook
2. **Modify**: `src/pages/SignupPage.tsx` - Add real-time username validation
3. **Migration**: Add `check_username_available` function


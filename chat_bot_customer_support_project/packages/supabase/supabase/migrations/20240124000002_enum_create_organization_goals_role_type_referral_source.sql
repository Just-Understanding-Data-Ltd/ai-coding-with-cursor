CREATE TYPE organization_goal AS ENUM (
    'publish_multiple_platforms',
    'manage_multiple_brands',
    'implement_collaboration',
    'approval_workflow',
    'visual_planning',
    'automate_content',
    'other'
);

-- Create enum for onboarding role types (marketing personas)
CREATE TYPE onboarding_role_type AS ENUM (
    'freelance_marketer',
    'marketing_agency_owner',
    'marketing_agency_employee',
    'in_house_marketer',
    'small_business_owner',
    'other'
);

-- Create enum for referral sources
CREATE TYPE organization_referral_source AS ENUM (
    'google_search',
    'friend_colleague',
    'influencer',
    'newsletter',
    'ads',
    'community',
    'podcast',
    'cant_remember'
);
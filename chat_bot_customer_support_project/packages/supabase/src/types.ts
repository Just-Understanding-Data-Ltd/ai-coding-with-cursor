export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrganizationGoal =
  | "publish_multiple_platforms"
  | "manage_multiple_brands"
  | "implement_collaboration"
  | "approval_workflow"
  | "visual_planning"
  | "automate_content"
  | "other";

export type OrganizationRoleType =
  | "freelance_marketer"
  | "marketing_agency_owner"
  | "marketing_agency_employee"
  | "in_house_marketer"
  | "small_business_owner"
  | "other";

export type OrganizationReferralSource =
  | "google_search"
  | "friend_colleague"
  | "influencer"
  | "newsletter"
  | "ads"
  | "community"
  | "podcast"
  | "cant_remember";

export type OnboardingData = {
  goals: OrganizationGoal[];
  role_type: OrganizationRoleType;
  referral_source: OrganizationReferralSource;
};

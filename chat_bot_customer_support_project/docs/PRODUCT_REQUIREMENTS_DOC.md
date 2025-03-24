# Product Requirements Document (PRD)

A **cross-platform comment management prototype** built using **TypeScript**, **Next.js** (with Server Actions for simple CRUD), **Express.js** for complex integrations, and **Supabase** (local Docker stack) for data/auth. This MVP caters to agencies with multiple brands, each holding multiple social accounts.

---

## 1. Overview

**Product Name**: Cross-Platform Comment Manager (Working Title)  
**Goal**: Provide a single, web-based interface for agencies and teams to manage social media comments across multiple platforms (initially Instagram & Facebook). Leverage AI for spam detection, sentiment analysis, and suggested replies.

### 1.1 Objectives

1. **Aggregate**: Fetch and centralize comments from multiple social accounts into one unified inbox.
2. **AI Tools**: Classify comments (spam, sentiment) and generate draft replies.
3. **Brand & Organization Structure**: Accommodate agencies with multiple brand lines, each linking to distinct social accounts.
4. **MVP Scope**: Focus on read/filter/reply flows. Defer advanced features (DMs, deep analytics) to future sprints.

### 1.2 Target Users

- **Agencies** managing multiple clients or brands.
- **In-house marketing teams** with moderate/high comment volumes across different brand lines.
- Less focus on solo freelancers or single-brand creators for MVP (though they could still use it).

---

## 2. Tech Stack & Architecture

- **Frontend**:

  - **Next.js** (TypeScript)
  - Using **Next.js Server Actions** for basic Supabase CRUD.
  - More advanced calls (AI or complex platform calls) route to an **Express.js** API.

- **Backend**:

  - **Express.js** (TypeScript) microservice for:
    - AI (e.g., calling OpenAI endpoints).
    - Social platform integrations (Meta Graph API).
  - Potentially separate from Next.js deployment or behind an internal route.

- **Database & Auth**:

  - **Supabase** on Docker locally for dev.
  - Production can use a managed Supabase instance or similar Postgres-based system.
  - Row-Level Security (RLS) to enforce multi-tenant rules (organizations, members, roles).

- **AI Integration**:

  - Possibly “Bring Your Own Key” for GPT usage, or store an admin key for the MVP.
  - Classification for spam/sentiment, plus generating quick reply drafts.

- **Deployment**:
  - Local dev: Docker (Supabase + local Next.js + local Express).
  - Production: Next.js on Vercel or similar, Express on AWS/Heroku, Supabase in the cloud.

---

## 3. Feature Requirements

### 3.1 Authentication & User Management

- **Supabase Auth** ensures each user is tied to an organization (via `organization_members`).
- RLS ensures data isolation: only see brands/comments for your org.

### 3.2 Brands & Social Accounts

1. **Brands**:

   - Each `brand` belongs to one `organization`.
   - A brand can have multiple social media accounts (Instagram, Facebook, etc.).

2. **Social Accounts**:
   - Store platform type (e.g. `'facebook'`, `'instagram'`), tokens/credentials for API calls.
   - Linked to a specific brand in `social_accounts`.

### 3.3 Comment Aggregation

1. **Fetching**:

   - An Express-based job or webhook fetches new comments from Meta Graph API (Instagram, FB).
   - Insert into `comments` table (with brand reference via `social_account_id`).

2. **Unified Inbox**:
   - Next.js UI displays all comments, with filters: brand, platform, status (open, resolved), sentiment.

### 3.4 AI Classification

1. **Spam & Sentiment**:

   - Each comment, upon insertion, calls AI to detect spam or label sentiment (positive, negative, neutral).
   - Data stored in `comments.sentiment`.

2. **AI Reply**:
   - A “Generate Reply” button triggers an Express endpoint calling GPT.
   - Draft text returned, user can edit & finalize.

### 3.5 Replying to Comments

- User finalizes the reply, system posts it to the social platform via Express + relevant tokens.
- `comments.status` updated (e.g., “replied”).

### 3.6 Tagging & Status

- Allow manual or auto-tagging (e.g. `'Lead'`, `'Urgent'`).
- Basic status field: `'open'`, `'resolved'`, `'replied'`.

### 3.7 Additional MVP Details

- **Minimal Analytics**: Possibly just # of open vs. replied comments, spam vs. legit ratio.
- **Permissions**: Rely on RLS so that only org members see the relevant data.

---

## 4. Database Schema

Below is a simplified outline (the large snippet has more detail). We assume existing tables like `users`, `organizations`, `organization_members`, plus the new ones (`brands`, `social_accounts`, `comments`, etc.).

```sql
-----------------------------------------------------
-- 1. brands
-----------------------------------------------------
CREATE TABLE public.brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    logo_url TEXT DEFAULT '',
    description TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- RLS policies for read/manage based on org membership

-----------------------------------------------------
-- 2. social_accounts
-----------------------------------------------------
CREATE TABLE public.social_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,   -- e.g. 'facebook','instagram'
    external_page_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

-- RLS policies ensuring only org owners/admins can manage, members can read

-----------------------------------------------------
-- 3. comments
-----------------------------------------------------
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    social_account_id UUID NOT NULL REFERENCES public.social_accounts(id) ON DELETE CASCADE,
    external_comment_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar_url TEXT DEFAULT '',
    text TEXT NOT NULL,
    sentiment TEXT DEFAULT 'neutral',  -- 'positive','negative','neutral','spam'
    status TEXT DEFAULT 'open',        -- 'open','replied','resolved'
    created_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS: Only members of the brand's org can view/edit

-----------------------------------------------------
-- 4. ai_usage_logs (optional)
-----------------------------------------------------
CREATE TABLE public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL,   -- 'classification','reply_generation'
    response_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-----------------------------------------------------
-- 5. social_posts
-----------------------------------------------------
CREATE TABLE public.social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    social_account_id UUID NOT NULL REFERENCES public.social_accounts(id) ON DELETE CASCADE,
    external_post_id TEXT NOT NULL,
    content_type TEXT NOT NULL, -- 'image', 'video', 'carousel', 'text'
    caption TEXT,
    url TEXT NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(social_account_id, external_post_id)
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-----------------------------------------------------
-- 6. post_media
-----------------------------------------------------
CREATE TABLE public.post_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL, -- 'image', 'video'
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    width INTEGER,
    height INTEGER,
    duration_seconds INTEGER, -- for videos
    position INTEGER NOT NULL, -- for carousel order
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;

-- Update comments table to include post reference
ALTER TABLE public.comments
ADD COLUMN post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE;
```

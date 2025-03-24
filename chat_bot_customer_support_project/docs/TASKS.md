1. Initial Project Setup & Authentication
   Set up Next.js project with TypeScript, Tailwind, and Shadcn UI
   Configure Supabase local Docker environment
   Implement database schema and RLS policies
   Set up authentication flow with Supabase
   Create organization creation/joining flow
   Add organization member management
   Write authentication tests (Jest + Playwright)
2. Brand Management
   Create brand creation/edit form
   Implement brand listing page with filters
   Add brand detail view
3. Set up brand deletion with cascading
   Write brand management tests
   Implement brand logo upload with image optimization
4. Social Account Integration
5. Set up Express.js microservice for Meta Graph API
   Implement Meta (Facebook/Instagram) OAuth flow
   Create social account connection UI
   Add social account management interface
   Implement token refresh/management system
   Write social integration tests
6. Comment Management Core
7. Create comment fetching service
8. Implement unified comment inbox UI
   Add comment filtering system (by brand, platform, status, sentiment)
   Create comment detail view with associated post preview
   Implement background post data fetching service
   Add compact post preview component for comment context
   Implement comment reply interface
   Add comment status management (open, replied, resolved)
   Write comment management tests
9. AI Integration
   Set up OpenAI integration in Express service
   Implement spam detection system
   Add sentiment analysis
   Create AI reply generation
   Implement AI usage logging
   Add AI response caching
   Write AI integration tests
10. Analytics & Dashboard
    Create dashboard layout
    Implement basic comment metrics
    Add response time analytics
11. Create sentiment distribution view
    Write analytics tests
12. Performance & Optimization
13. Implement comment pagination
    Add data caching layer
    Optimize image loading for post previews
    Add error boundaries
    Implement retry mechanisms
14. Add loading states
    Write performance tests
15. Final Polish
    Implement dark/light mode
16. Add responsive design fixes
    Create onboarding flow
    Add keyboard shortcuts
    Implement error notifications
17. Write end-to-end tests
    Add documentation
    Key Changes Made:
    Removed the dedicated post management epic
    Integrated post functionality as a supporting feature within comment management
    Added post preview component for comment context
    Simplified analytics to focus on comment-centric metrics
    Added background post data fetching service
    Labels remain the same:
    Priority: P0, P1, P2
    Type: Feature, Bug, Enhancement
    Area: Frontend, Backend, Database, AI
    Effort: Small, Medium, Large
    Would you like me to break down any of these epics into more detailed subtasks?

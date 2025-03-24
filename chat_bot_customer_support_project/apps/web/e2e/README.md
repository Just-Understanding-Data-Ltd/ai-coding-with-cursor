# E2E Test Plan

## Storage State Management

Our E2E tests use Playwright's storage state feature to maintain authentication between tests. Storage states are managed as follows:

### Location

- All storage states are stored in `@e2e/storage/`
- Files follow the pattern: `storage-state-{email-prefix}.json` (e.g., `storage-state-team-admin.json`)

### Helper Functions

- `getStorageStatePath(email)`: Gets the storage state path for a given user email
- Usage in tests:

  ```typescript
  import { getStorageStatePath } from "./supabase-helpers";
  import { test } from "@playwright/test";

  // Use a specific user's storage state
  test.use({
    storageState: getStorageStatePath("team.admin-no-members@example.com"),
  });

  test("admin can access protected route", async ({ page }) => {
    // Your test code here
  });
  ```

### Available Storage States

Storage states are automatically generated during test setup for all users with `shouldLogin: true` in the test scenarios:

- Team Admin (`team.admin-no-members@example.com`)
- Team Member (`team.member@example.com`)
- Client Admin (`client.admin@example.com`)
- Client Member (`client.member@example.com`)
- Internal Admin (`internal.admin@example.com`)
- Internal Member (`internal.member@example.com`)
- Mixed Roles User (`mixed.roles@example.com`)

## 1. Organization Management

### Organization Creation

- [ ] User can create new organization with valid data
- [ ] Organization creation includes default team
- [ ] Onboarding data is properly captured (role, goals, etc.)

### Organization Settings

- [ ] Admin can update organization settings
- [ ] Member cannot update organization settings
- [ ] Client member cannot access organization settings
- [ ] Settings changes are properly persisted

### Organization Access Control

- [ ] Admin can view all organization data
- [ ] Member has appropriate limited access
- [ ] Client member can only access allowed resources
- [ ] Non-members cannot access organization data

## 2. Team Management

### Team Creation & Setup

- [ ] Admin can create new team
- [ ] Member cannot create team
- [ ] Client cannot create team
- [ ] Team creation validates required fields

### Team Membership

- [ ] New team automatically includes org team members
- [ ] Client members are not auto-added to teams
- [ ] Removing org member removes from all teams
- [ ] Team membership respects organization roles

### Role Management

- [ ] Admin can change team member roles
- [ ] Member cannot change roles
- [ ] User can have different roles in different teams
- [ ] Role changes are properly reflected in permissions

## 3. Invitation System

### Sending Invitations

- [ ] Admin can invite team members
- [ ] Admin can invite client members
- [ ] Member cannot send invitations
- [ ] Cannot invite already-member email
- [ ] Invitation emails are properly sent

### Processing Invitations

- [ ] User can accept valid invitation
- [ ] Cannot accept expired invitation
- [ ] Cannot accept already-accepted invitation
- [ ] Accepting adds correct role and membership type
- [ ] Invitation token is single-use

### Invitation Edge Cases

- [ ] Handle invitation to non-existent email
- [ ] Handle expired invitations
- [ ] Handle admin role invitations
- [ ] Handle client vs team member invitations

## 4. Permission & Access Control

### Organization Level

- [ ] Admin can perform all organization actions
- [ ] Member has correct limited permissions
- [ ] Client member has client-specific access
- [ ] Permissions are properly inherited

### Team Level

- [ ] Team admin can manage their team
- [ ] Team member has correct limited access
- [ ] Client cannot access team data
- [ ] Cross-team permissions are properly isolated

### Mixed Access Scenarios

- [ ] User with mixed roles has correct access per context
- [ ] Internal team member can access client org
- [ ] Client admin cannot access internal teams
- [ ] Permission changes take immediate effect

## 5. Client Organization Workflows

### Client Management

- [ ] Can create client organization
- [ ] Can assign client members
- [ ] Can assign internal team members
- [ ] Client vs team member permissions work correctly

### Client Access Control

- [ ] Client admin can manage client resources
- [ ] Client member has limited access
- [ ] Internal team can manage client org
- [ ] Client cannot access internal resources

## 6. Data Integrity & Cascading

### Deletion Workflows

- [ ] Deleting org deletes all related data
- [ ] Deleting team preserves org members
- [ ] Removing member cleans up all associations
- [ ] Cascading deletes maintain referential integrity

### Data Validation

- [ ] Cannot create orphaned team members
- [ ] Cannot create team without organization
- [ ] Cannot create member without valid role
- [ ] All required fields are properly validated

## Test Data Setup

Our test data (`seed.sql`) includes:

### Users

- Team Admin (`team.admin-no-members@example.com`)
- Team Member (`team.member@example.com`)
- Client Admin (`client.admin@example.com`)
- Client Member (`client.member@example.com`)
- Internal Admin (`internal.admin@example.com`)
- Internal Member (`internal.member@example.com`)
- Mixed Roles User (`mixed.roles@example.com`)

### Organizations

- Multi-Team Organization (with Marketing, Design, Development teams)
- No Teams Organization
- Client Organization (with internal teams)

### Invitations

- Pending team invitation
- Pending client invitation
- Pending internal team invitation
- Expired invitation
- Admin role invitation
- Accepted invitation

## Running Tests

```bash
# Reset database to clean state
npx supabase db reset

# Run all tests
npm run test:e2e

# Run specific workflow tests
npm run test:e2e -- authentication.spec.ts
npm run test:e2e -- organization.spec.ts
npm run test:e2e -- team.spec.ts
```

r

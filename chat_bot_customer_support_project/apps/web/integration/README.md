# Integration Testing Strategy

## Overview

Our integration testing approach focuses on testing React components, RLS policies, and database operations together using factory-generated test data. We use `.integration.ts` files to test both component behavior and database access patterns simultaneously.

## Key Concepts

1. **Factory-Generated Test Data**

   - Test data is generated using `@repo/supabase` factories
   - Each factory handles its own dependencies
   - Data is isolated per test run

2. **Authenticated Testing**

   - Each test user gets a JWT token
   - Use `createAuthenticatedClient(token)` for RLS testing
   - Test both successful and failed operations

3. **Component Integration**
   - Test React components with real data
   - Verify RLS policies in component context
   - Ensure proper error handling

## Test Data Factories

### 1. User Creation

```typescript
import { createTestUser, createTestUsers } from "@repo/supabase";

// Create a single test user
const { user, token } = await createTestUser({
  email: "test@example.com", // Optional
});

// Create multiple test users
const users = await createTestUsers({ count: 3 });
```

### 2. Organization Setup

```typescript
import { createTestOrganization } from "@repo/supabase";

// Create organization with admin
const { organization, team, roles } = await createTestOrganization({
  userId: user.id,
  name: "Test Org", // Optional
});
```

### 3. Member Management

```typescript
import { createTestMembers } from "@repo/supabase";

// Add members to organization and team
await createTestMembers({
  organizationId: organization.id,
  teamId: team.id,
  members: [
    { userId: member1.id, isAdmin: false },
    { userId: member2.id, isAdmin: true },
  ],
  roles,
});
```

## Testing Patterns

### 1. Component Integration Tests

```typescript
// organization-page.integration.ts
import { render, screen } from "@testing-library/react";
import { createTestUser, createTestOrganization } from "@repo/supabase";
import { createAuthenticatedClient } from "../test-utils";

describe("OrganizationPage", () => {
  it("should display organization data for members", async () => {
    // 1. Create test data
    const { user, token } = await createTestUser({});
    const { organization } = await createTestOrganization({
      userId: user.id,
    });

    // 2. Create authenticated client
    const client = createAuthenticatedClient(token);

    // 3. Mock server client
    vi.mock("@/utils/supabase/server", () => ({
      createClient: vi.fn().mockResolvedValue(client),
    }));

    // 4. Test component with real data
    render(<OrganizationPage params={{ id: organization.id }} />);

    // 5. Verify component and data access
    expect(await screen.findByText(organization.name)).toBeInTheDocument();
  });
});
```

### 2. RLS Policy Tests

```typescript
// organization-members.integration.ts
import {
  createTestUser,
  createTestOrganization,
  createTestMembers,
} from "@repo/supabase";
import { createAuthenticatedClient } from "../test-utils";

describe("Organization Members RLS", () => {
  it("should enforce member-only access", async () => {
    // 1. Create test users
    const [admin, member, nonMember] = await Promise.all([
      createTestUser({}),
      createTestUser({}),
      createTestUser({}),
    ]);

    // 2. Create organization with admin
    const { organization, team, roles } = await createTestOrganization({
      userId: admin.user.id,
    });

    // 3. Add member to organization
    await createTestMembers({
      organizationId: organization.id,
      teamId: team.id,
      members: [{ userId: member.user.id, isAdmin: false }],
      roles,
    });

    // 4. Test access with different roles
    const adminClient = createAuthenticatedClient(admin.token);
    const memberClient = createAuthenticatedClient(member.token);
    const nonMemberClient = createAuthenticatedClient(nonMember.token);

    // Admin can see all members
    const { data: adminView } = await adminClient
      .from("organization_members")
      .select()
      .eq("organization_id", organization.id);
    expect(adminView).toHaveLength(2);

    // Non-member sees nothing
    const { data: nonMemberView } = await nonMemberClient
      .from("organization_members")
      .select()
      .eq("organization_id", organization.id);
    expect(nonMemberView).toHaveLength(0);
  });
});
```

### 3. API Route Tests

```typescript
// api-routes.integration.ts
import { createTestUser } from "@repo/supabase";
import { createAuthenticatedClient } from "../test-utils";

describe("API Routes", () => {
  it("should handle authenticated requests", async () => {
    // 1. Create test user
    const { user, token } = await createTestUser({});
    const client = createAuthenticatedClient(token);

    // 2. Mock API client
    vi.mock("@/utils/supabase/route", () => ({
      createClient: vi.fn().mockResolvedValue(client),
    }));

    // 3. Test API route
    const response = await fetch("/api/data");
    const data = await response.json();

    expect(response.status).toBe(200);
  });
});
```

## Best Practices

1. **Test File Organization**

   - Use `.integration.ts` for combined component/DB tests
   - Group related tests by feature
   - Keep factory setup in `beforeAll` when possible

2. **Data Management**

   - Use factories for all test data
   - Clean up data between test runs
   - Don't share data between tests

3. **Authentication**

   - Always test with proper authentication
   - Test different user roles
   - Verify access control

4. **Component Testing**

   - Test with real data access
   - Verify loading states
   - Test error scenarios

5. **Database Operations**
   - Test actual RLS policies
   - Verify data integrity
   - Test constraints and validations

## Common Patterns

1. **Setup Helpers**

```typescript
async function setupTestOrg() {
  const admin = await createTestUser({});
  const { organization, team, roles } = await createTestOrganization({
    userId: admin.user.id,
  });
  return { admin, organization, team, roles };
}
```

2. **Role-Based Testing**

```typescript
describe("Role-Based Access", () => {
  let admin, member, nonMember, organization;

  beforeAll(async () => {
    // Setup users and org
  });

  it.each([
    ["admin", () => adminClient, true],
    ["member", () => memberClient, true],
    ["non-member", () => nonMemberClient, false],
  ])("%s should have correct access", async (role, getClient, canAccess) => {
    const client = getClient();
    const { data } = await client.from("organization_members").select();
    expect(data?.length > 0).toBe(canAccess);
  });
});
```

3. **Error Handling**

````typescript
it("should handle errors gracefully", async () => {
  const { token } = await createTestUser({});
  const client = createAuthenticatedClient(token);

  const { error } = await client
    .from("organizations")
    .insert({ invalid: "data" });

  expect(error).toBeDefined();
```typescript
try {
  await Component();
  throw new Error("Should have redirected");
} catch (error) {
  const redirectUrl = (error as Error).message.replace("NEXT_REDIRECT:", "");
  expect(redirectUrl).toBe("/expected-path");
}
````

## Important Notes

1. **SSR vs Tests**
   - Components should use `@supabase/ssr` clients
   - Tests can use `supabase-js` clients
   - We mock the SSR client imports to return our test clients

```typescript
// In components (production)
import { createServerClient } from '@supabase/ssr'
const supabase = createServerClient(...) // Handles cookies

// In tests
const testClient = createAuthenticatedClient(token) // Uses supabase-js
vi.mocked(createClient).mockResolvedValue(testClient)
```

2. **Authentication**

   - Test clients are authenticated via headers
   - Tokens are managed globally across test files

3. **RLS Testing**
   - Uses real database with test data
   - Tests actual RLS policies
   - Different user roles have different access levels

## Best Practices

1. **Clean State**

   ```typescript
   beforeEach(() => {
     clearCommonMocks();
   });
   ```

2. **Error Handling**

   ```typescript
   try {
     await Component();
   } catch (error) {
     // Handle expected errors
   }
   ```

3. **Explicit Mocking**

   - Mock only what's needed for each test
   - Use fine-grained control when needed
   - Document mock behavior

4. **Test Real Flows**
   - Test actual RLS policies
   - Verify proper redirects
   - Check error states

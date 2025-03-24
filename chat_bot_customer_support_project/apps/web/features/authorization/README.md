# Authorization System

This module provides a comprehensive role-based authorization system for managing user permissions across organizations and teams.

## Core Concepts

### Membership Types

- **Organization Members**: Users belonging to an organization with specific roles
- **Team Members**: Users belonging to teams within organizations with specific roles

### Roles and Permissions

Each member (organization or team) has:

- A role (e.g., 'admin', 'member')
- Associated permissions based on their role
- Membership type (for organization members)

## Directory Structure

```
authorization/
├── actions/
│   └── get-member-roles.ts    # Core data fetching logic for roles
├── components/
│   └── withRoleCheck.tsx      # HOC for role-based component rendering
├── hooks/
│   └── use-member-roles.ts    # React Query hook for role data
└── lib/
    └── roles.ts              # Utility functions for role checking
```

## Usage Examples

### Fetching Member Roles

```typescript
// Using the React Query hook
const { data: roles } = useMemberRoles({
  userId: "user-123",
  supabase,
});

// Access organization memberships
roles.organizationMemberships.forEach((membership) => {
  console.log("Organization:", membership.organization_id);
  console.log("Role:", membership.role.name);
  console.log("Permissions:", membership.role.permissions);
});

// Access team memberships
roles.teamMemberships.forEach((membership) => {
  console.log("Team:", membership.team_id);
  console.log("Role:", membership.role.name);
  console.log("Permissions:", membership.role.permissions);
});
```

### Role-Based Component Rendering

```typescript
import { withRoleCheck } from './components/withRoleCheck';

// Define permission requirements
const requirement = {
  requiredRole: 'admin',
  requiredPermissions: ['manage_team_members'],
  requiredMembershipType: 'team'
};

// Create a protected component
const ProtectedButton = withRoleCheck(Button, requirement);

// Use the protected component
<ProtectedButton
  currentMember={memberData}
  showIfUnauthorized={false}
  onClick={handleClick}
>
  Manage Team
</ProtectedButton>
```

### Permission Checking

```typescript
import { meetsRequirements } from "./lib/roles";

const canManageTeam = meetsRequirements(member, {
  requiredRole: "admin",
  requiredPermissions: ["manage_team_members"],
});

if (canManageTeam) {
  // Perform team management action
}
```

## Database Schema

### Organization Members

```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  role_id UUID REFERENCES roles(id),
  membership_type membership_type NOT NULL,
  UNIQUE(organization_id, user_id)
);
```

### Team Members

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  user_id UUID REFERENCES users(id),
  role_id UUID REFERENCES roles(id),
  UNIQUE(team_id, user_id)
);
```

### Roles and Permissions

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id),
  permission_id UUID REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);
```

## Error Handling

The system includes custom error handling through the `MemberRoleOperationError` class:

```typescript
try {
  const roles = await getMemberRoles({
    supabase,
    userId: "user-123",
  });
} catch (error) {
  if (error instanceof MemberRoleOperationError) {
    // Handle specific role-related errors
    console.error(error.toastMessage);
  }
}
```

## Best Practices

1. **Always Use Type Guards**: When working with role data, use the provided type guards to ensure data validity:

   - `isValidOrgMember`
   - `isValidTeamMember`

2. **Prefer Higher-Level Components**: Use the provided HOC (`withRoleCheck`) for consistent role-based rendering:

   ```typescript
   const AdminOnlyComponent = withRoleCheck(Component, {
     requiredRole: "admin",
   });
   ```

3. **Cache Considerations**: The `useMemberRoles` hook uses React Query for efficient caching. Configure the cache duration based on your needs:

   ```typescript
   const { data } = useMemberRoles({
     userId,
     supabase,
     options: {
       staleTime: 5 * 60 * 1000, // 5 minutes
     },
   });
   ```

4. **Error Boundaries**: Implement error boundaries to handle role-related errors gracefully:
   ```typescript
   <ErrorBoundary fallback={<UnauthorizedView />}>
     <ProtectedComponent />
   </ErrorBoundary>
   ```

## Security Considerations

1. **Row Level Security**: The database uses RLS policies to ensure users can only access their authorized data.
2. **Type Safety**: All role checks are type-safe and validated at both compile and runtime.
3. **Null Handling**: The system carefully handles null values and invalid data through type guards.
4. **Permission Inheritance**: Team permissions are scoped to their organization context.

## Contributing

When adding new features to the authorization system:

1. Add appropriate type guards for new data structures
2. Update the database schema if needed
3. Add tests for new role checks
4. Document changes in this README
5. Follow the existing patterns for error handling and type safety

# Supabase Package

This package provides a type-safe interface for interacting with our Supabase backend, including database operations, authentication, and API integrations.

## Setup Process

### 1. Base Schema Setup

The base schema (`migrations/00000000000000_base_schema.sql`) establishes our foundational database structure. This needs to be run first as it sets up:

- Core tables
- Essential relationships
- Base functions and triggers
- RLS (Row Level Security) policies

### 2. Environment Configuration

Required environment variables:

```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

### 3. Client Initialization

## Available Modules

The package exports several modules for different functionalities:

- **API Services**: Manage API service configurations
- **API Usage**: Track and monitor API usage
- **Credit Pools**: Handle credit allocation and management
- **Credit Transactions**: Track credit-related transactions
- **OAuth**: Handle OAuth integrations
- **Onboarding**: Manage user onboarding flows
- **Organizations**: Organization management
- **Profiles**: User profile management
- **Projects**: Project-related operations

### Subscription Management

Special exports for handling subscriptions:

```typescript
import {
  createSubscription,
  getSubscription,
  updateSubscription,
  allocateSubscriptionCredits,
} from "@repo/supabase";
```

## Type Safety

The package provides full TypeScript support with:

- Generated database types (`Database`)
- Function types (`DbFunctions`)
- Utility types:
  - `Json`
  - `ResourceType`
  - `Role`
  - `SubscriberType`
  - `OwnerType`

## Best Practices

1. Always use the exported types for type safety
2. Initialize the client once and reuse the instance
3. Handle errors appropriately in async operations
4. Use RLS policies defined in the base schema for security

## Module Usage Examples

### Organizations

```typescript
import { createOrganization } from "@repo/supabase";

const org = await createOrganization({
  name: "My Org",
  // ... other properties
});
```

### Projects

```typescript
import { createProject } from "@repo/supabase";

const project = await createProject({
  organizationId: "org_id",
  name: "My Project",
  // ... other properties
});
```

## Contributing

When adding new functionality:

1. Add migrations in sequential order
2. Update types if schema changes
3. Add new modules in `src/module/`
4. Export new functionality in `src/index.ts`
5. Update this documentation

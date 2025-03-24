When you are implementing a new server component page.tsx and a client component.

The server component page.tsx should be similar to this:

```tsx
import Dashboard from "@/components/dashboard/Dashboard";
import { dehydrate } from "@tanstack/react-query";
import { queryClient } from "@/lib/react-query";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{
    orgId: string;
  }>;
}) {
  const { orgId } = await params;

  //   TODO - Implement the required queries here:
  //   await queryClient.prefetchQuery({
  //     queryKey: [],
  //     queryFn: ,
  //   });
  //  END OF TODO
  const dehydratedState = dehydrate(queryClient);
  return <ClientComponent dehydratedState={dehydratedState} />;
}
```

The client component should be within the apps/web/features/components/component-name.tsx file.

You must use all of the react query hooks from packages/supabase/src for the specific feature in question.

I would suggest using the useSuspenseQuery hook for the queries that are not required to be rendered immediately.

```tsx
"use client";

import { HydrationBoundary, DehydratedState } from "@tanstack/react-query";
import { LoadingSkeleton } from "@/components/loading/loading-skeleton";
import { Suspense } from "react";
import { useUsers } from "@repo/supabase";
import { createClient } from "@/utils/supabase/client";

interface DashboardProps {
  dehydratedState: DehydratedState;
}

function ChildComponentSkeleton() {
  return (
    <div className="space-y-6 mb-8">
      <div className="space-y-4">
        <LoadingSkeleton variant="text" width="200px" />
        <LoadingSkeleton variant="button" />
      </div>
    </div>
  );
}

function ChildComponentContent() {
  const supabase = createClient();
  //  TODO - Implement the required queries + tanstack queries here:
  //  END OF TODO
  return <>
}

export default function Dashboard({ dehydratedState }: DashboardProps) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <Suspense fallback={<ChildComponentSkeleton />}>
        <ChildComponentContent />
      </Suspense>
    </HydrationBoundary>
  );
}
```

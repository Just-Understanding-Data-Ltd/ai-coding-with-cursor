import WorkspacesPage from "@/features/workspaces/page";

export default async function WorkspacesPageWrapper({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  return <WorkspacesPage params={{ orgId }} />;
}

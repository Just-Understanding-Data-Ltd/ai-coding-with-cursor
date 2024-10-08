import { redirect } from "next/navigation";

export default function InvoiceAccessPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const token = searchParams.token as string;

  if (!token) {
    redirect("/invoice/login");
  }

  // In a real implementation, you would validate the token here
  // and fetch the customer's invoices based on the token

  console.log(`Accessing private invoices page with token: ${token}`);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Invoices</h1>
      <p>This is a placeholder for the private invoices page.</p>
      <p>Access Token: {token}</p>
    </div>
  );
}

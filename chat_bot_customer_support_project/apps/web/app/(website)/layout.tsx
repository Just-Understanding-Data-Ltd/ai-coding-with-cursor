import Header from "@/components/website-layout/Header";
import Footer from "@/components/website-layout/Footer";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header hidePricing={true} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

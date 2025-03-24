import Header from "@/components/website-layout/Header";
import { ReactNode } from "react";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header hidePricing hideFAQ />
      <main>{children}</main>
    </>
  );
}

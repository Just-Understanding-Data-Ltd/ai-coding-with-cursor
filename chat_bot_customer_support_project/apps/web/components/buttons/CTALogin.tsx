import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CTALoginProps {
  href?: string;
  text?: string;
}

export const CTALogin = ({
  href = "/login",
  text = "Get Started",
}: CTALoginProps) => {
  return (
    <Button
      asChild
      className="w-full min-w-[200px] max-w-[300px] bg-white text-green-600 hover:bg-green-100 hover:text-green-700 transition-colors duration-300 shadow-lg hover:shadow-xl font-semibold text-lg py-6"
    >
      <Link href={href}>{text}</Link>
    </Button>
  );
};

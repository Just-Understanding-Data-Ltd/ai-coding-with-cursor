import { Button } from "@/components/ui/button";
import { LifeBuoy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { config } from "@/config";

export default function ContactSupportButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LifeBuoy className="mr-2 h-4 w-4" />
          Contact Support
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contact Support</DialogTitle>
          <DialogDescription>
            Need help? Our support team is here for you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>
            Please email us at:{" "}
            <a
              href={`mailto:support@${config.domainName}`}
              className="text-primary hover:underline"
            >
              support@{config.domainName}
            </a>
          </p>
          <p>
            Or call us during business hours at:{" "}
            <a
              href={`tel:${config.company.phone}`}
              className="text-primary hover:underline"
            >
              {config.company.phone}
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

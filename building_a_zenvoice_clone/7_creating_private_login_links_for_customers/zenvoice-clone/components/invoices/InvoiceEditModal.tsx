import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustomInvoice } from "@/types/customTypes";

interface InvoiceEditModalProps {
  invoice: CustomInvoice;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedInvoice: CustomInvoice) => void;
}

export function InvoiceEditModal({
  invoice,
  isOpen,
  onClose,
  onSave,
}: InvoiceEditModalProps) {
  const [editedInvoice, setEditedInvoice] = useState(invoice);
  const [additionalInfo, setAdditionalInfo] = useState(
    invoice.additionalInfo || ""
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedInvoice((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave({ ...editedInvoice, additionalInfo });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Edit Invoice</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-2">Invoice Details</h3>
            <Input
              name="customerName"
              value={editedInvoice.customerName}
              onChange={handleInputChange}
              placeholder="Customer Name"
              className="mb-2"
            />
            <Input
              name="customerEmail"
              value={editedInvoice.customerEmail}
              onChange={handleInputChange}
              placeholder="Customer Email"
              className="mb-2"
            />
            <Input
              name="amount"
              value={editedInvoice.amount / 100}
              onChange={handleInputChange}
              placeholder="Amount"
              type="number"
              className="mb-2"
            />
            <Textarea
              name="additionalInfo"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Additional Information (e.g., VAT, business details)"
              className="mb-2"
            />
          </div>
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-2">Invoice Preview</h3>
            <div className="border p-4 rounded-md text-sm">
              <div className="mb-4">
                <h4 className="font-semibold">Bill To:</h4>
                <p>{editedInvoice.customerName || "N/A"}</p>
                <p>{editedInvoice.customerEmail || "N/A"}</p>
              </div>
              {editedInvoice.billingDetails && (
                <div className="mb-4">
                  <h4 className="font-semibold">Billing Details:</h4>
                  {editedInvoice.billingDetails.name &&
                    editedInvoice.billingDetails.name !==
                      editedInvoice.customerName && (
                      <p>Name: {editedInvoice.billingDetails.name}</p>
                    )}
                  {editedInvoice.billingDetails.email &&
                    editedInvoice.billingDetails.email !==
                      editedInvoice.customerEmail && (
                      <p>Email: {editedInvoice.billingDetails.email}</p>
                    )}
                  {editedInvoice.billingDetails.phone && (
                    <p>Phone: {editedInvoice.billingDetails.phone}</p>
                  )}
                  {editedInvoice.billingDetails.address && (
                    <div>
                      <p>Address:</p>
                      {editedInvoice.billingDetails.address.line1 && (
                        <p>{editedInvoice.billingDetails.address.line1}</p>
                      )}
                      {editedInvoice.billingDetails.address.line2 && (
                        <p>{editedInvoice.billingDetails.address.line2}</p>
                      )}
                      <p>
                        {[
                          editedInvoice.billingDetails.address.city,
                          editedInvoice.billingDetails.address.state,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      <p>
                        {[
                          editedInvoice.billingDetails.address.postal_code,
                          editedInvoice.billingDetails.address.country,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                    </div>
                  )}
                </div>
              )}
              <div className="mb-4">
                <h4 className="font-semibold">Invoice Details:</h4>
                <p>Invoice ID: {editedInvoice.id}</p>
                <p>
                  Date:{" "}
                  {new Date(editedInvoice.created * 1000).toLocaleDateString()}
                </p>
                <p>Status: {editedInvoice.status}</p>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold">Payment Details:</h4>
                <p>
                  Amount: {(editedInvoice.amount / 100).toFixed(2)}{" "}
                  {editedInvoice.currency.toUpperCase()}
                </p>
              </div>
              {additionalInfo && (
                <div>
                  <h4 className="font-semibold">Additional Information:</h4>
                  <p>{additionalInfo}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

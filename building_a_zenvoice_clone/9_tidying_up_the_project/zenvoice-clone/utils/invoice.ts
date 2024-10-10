import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { CustomInvoice } from "@/types/customTypes";

interface AutoTableOutput {
  finalY: number;
}

const formatDate = (timestamp: number) =>
  new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);

export function downloadInvoice(
  invoice: CustomInvoice,
  type: "single-payment" | "subscription",
  companyInfo: {
    name: string;
    address: string;
    phone: string;
  }
) {
  const doc = new jsPDF() as JsPDFWithAutoTable;
  const { width, height } = doc.internal.pageSize;
  const margin = 20;
  const contentWidth = width - 2 * margin;

  // Page border
  doc.setDrawColor(230);
  doc.rect(margin, margin, contentWidth, height - 2 * margin);

  // Header
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, margin, contentWidth, 60); // Increased height for more padding

  // Company info
  console.log(companyInfo);
  if (companyInfo) {
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text(companyInfo.name, margin + 10, margin + 20);
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(companyInfo.address, margin + 10, margin + 30);
    doc.text(companyInfo.phone, margin + 10, margin + 35);
  }

  // Invoice details
  doc.setFontSize(22);
  doc.setTextColor(66, 139, 202);
  doc.text("INVOICE", width - margin - 60, margin + 20);

  doc.setFontSize(9);
  doc.setTextColor(80);
  const invoiceDetails = [
    `#${invoice.id}`,
    `Date: ${formatDate(invoice.created)}`,
    `Due: ${formatDate(invoice.created + 2592000)}`,
  ];
  invoiceDetails.forEach((detail, index) => {
    doc.text(detail, width - margin - 60, margin + 30 + index * 5);
  });

  // Customer info
  let yPos = margin + 80; // Start "Bill To" section lower
  doc.setFontSize(11);
  doc.setTextColor(40);
  doc.text("Bill To:", margin + 10, yPos);

  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text(invoice.customerName || "N/A", margin + 10, yPos + 7);
  doc.text(invoice.customerEmail || "N/A", margin + 10, yPos + 12);

  yPos += 25; // Move down for additional info

  // Billing details
  if (invoice.billingDetails) {
    doc.setFontSize(11);
    doc.setTextColor(40);
    doc.text("Billing Details:", margin + 10, yPos);
    yPos += 7;

    doc.setFontSize(9);
    doc.setTextColor(80);
    const { name, email, phone, address } = invoice.billingDetails;

    const addDetailIfPresent = (
      label: string,
      value: string | null | undefined
    ) => {
      if (
        value &&
        value !== invoice.customerName &&
        value !== invoice.customerEmail
      ) {
        doc.text(`${label}: ${value}`, margin + 10, yPos);
        yPos += 5;
      }
    };

    addDetailIfPresent("Name", name);
    addDetailIfPresent("Email", email);
    addDetailIfPresent("Phone", phone);

    if (address) {
      const addressLines = [
        address.line1,
        address.line2,
        [address.city, address.state].filter(Boolean).join(", "),
        [address.postal_code, address.country].filter(Boolean).join(" "),
      ].filter(Boolean);

      if (addressLines.length > 0) {
        doc.text("Address:", margin + 10, yPos);
        yPos += 5;
        addressLines.forEach((line) => {
          doc.text(line || "", margin + 10, yPos); // Changed from margin + 15 to margin + 10
          yPos += 5;
        });
      }
    }

    yPos += 10; // Add some space after billing details
  }

  // Additional info
  if (invoice.additionalInfo) {
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text("Additional Information:", margin + 10, yPos);
    yPos += 6;
    doc.setFontSize(9);
    doc.setTextColor(80);
    const splitText = doc.splitTextToSize(
      invoice.additionalInfo,
      contentWidth - 20
    );
    doc.text(splitText, margin + 10, yPos);
    yPos += splitText.length * 5 + 15; // Increase space after additional info
  }

  // Invoice table
  autoTable(doc, {
    startY: yPos,
    head: [["Description", "Quantity", "Unit Price", "Amount"]],
    body: [
      [
        type === "single-payment" ? "One-time Payment" : "Subscription Fee",
        "1",
        formatCurrency(invoice.amount, invoice.currency),
        formatCurrency(invoice.amount, invoice.currency),
      ],
    ],
    foot: [["", "", "Total", formatCurrency(invoice.amount, invoice.currency)]],
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [66, 139, 202], textColor: 255 },
    footStyles: {
      fillColor: [245, 245, 245],
      textColor: [40, 40, 40],
      fontStyle: "bold",
    },
    margin: { left: margin + 10, right: margin + 10 },
  });

  // Replace the use of 'any' with a more specific type
  const autoTableOutput = doc.lastAutoTable;
  yPos = autoTableOutput ? autoTableOutput.finalY + 15 : yPos;

  // Payment status
  doc.setFontSize(10);
  doc.setTextColor(40);
  doc.text(`Payment Status: ${invoice.status || "N/A"}`, margin + 10, yPos);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    "Thank you for your business. Payment is due within 30 days.",
    margin + 10,
    height - 15
  );

  doc.save(`invoice_${invoice.id}.pdf`);
}

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: AutoTableOutput;
}

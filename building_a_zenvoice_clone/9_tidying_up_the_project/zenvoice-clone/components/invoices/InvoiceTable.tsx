"use client";

import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { downloadInvoice } from "@/utils/invoice";
import { InvoiceEditModal } from "./InvoiceEditModal";
import { CustomInvoice } from "@/types/customTypes";

interface InvoiceTableProps {
  invoices: CustomInvoice[];
  type: "single-payment" | "subscription";
  onInvoiceUpdate: (updatedInvoices: CustomInvoice[]) => void;
}

const columnHelper = createColumnHelper<CustomInvoice>();

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toISOString().split("T")[0];
};

export function InvoiceTable({
  invoices: initialInvoices,
  type,
  onInvoiceUpdate,
}: InvoiceTableProps) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [editableInvoice, setEditableInvoice] = useState<CustomInvoice | null>(
    null
  );

  const columns: ColumnDef<CustomInvoice>[] = [
    columnHelper.accessor("id", {
      header: "Invoice ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      cell: (info) =>
        `${(info.getValue() / 100).toFixed(
          2
        )} ${info.row.original.currency.toUpperCase()}`,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("created", {
      header: "Date",
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("customerName", {
      header: "Customer Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("customerEmail", {
      header: "Customer Email",
      cell: (info) => info.getValue(),
    }),
    {
      id: "actions",
      cell: (info) => (
        <div className="space-x-2">
          <Button onClick={() => setEditableInvoice(info.row.original)}>
            Edit
          </Button>
          <Button onClick={() => handleDownload(info.row.original)}>
            Download
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: invoices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (invoices.length === 0) {
    return <p>No invoices found.</p>;
  }

  const handleSave = (updatedInvoice: CustomInvoice) => {
    const updatedInvoices = invoices.map((inv) =>
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    );
    setInvoices(updatedInvoices);
    onInvoiceUpdate(updatedInvoices);
    setEditableInvoice(null);
  };

  const handleDownload = (invoice: CustomInvoice) => {
    console.log(`This is the account info: ${invoice.accountInfo}`);
    downloadInvoice(invoice, type, {
      name: invoice.accountInfo.company_name,
      address: invoice.accountInfo.company_address || "",
      phone: invoice.accountInfo.company_phone || "",
    });
  };

  return (
    <div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-between">
        <Button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      {editableInvoice && (
        <InvoiceEditModal
          invoice={editableInvoice}
          isOpen={!!editableInvoice}
          onClose={() => setEditableInvoice(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

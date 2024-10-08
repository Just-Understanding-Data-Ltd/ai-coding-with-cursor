"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface Notification {
  id: number;
  type: "gmail" | "stripe";
  name: string;
  message: string;
  time: string;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: "stripe",
    name: "Stripe Support",
    message: "Reason: Customer requested VAT adjustment",
    time: "now",
  },
  {
    id: 2,
    type: "gmail",
    name: "Emma Thompson",
    message: "Urgent: Need invoice with correct VAT for tax filing",
    time: "yesterday",
  },
  {
    id: 3,
    type: "gmail",
    name: "Liam O'Connor",
    message: "Please can I edit the invoice?",
    time: "1m",
  },
  {
    id: 4,
    type: "gmail",
    name: "Sophia Chen",
    message: "Invoice query: VAT rate seems incorrect",
    time: "now",
  },
  {
    id: 5,
    type: "gmail",
    name: "Hans Mueller",
    message: "Benötige Rechnung mit korrekter Mehrwertsteuer",
    time: "2m",
  },
  {
    id: 7,
    type: "gmail",
    name: "Olivia Martinez",
    message: "VAT exemption status not reflected on invoice",
    time: "3m",
  },
  {
    id: 8,
    type: "gmail",
    name: "Ethan Nguyen",
    message: "Need updated invoice for cross-border VAT claim",
    time: "15m",
  },
  {
    id: 9,
    type: "stripe",
    name: "Stripe Notice",
    message: "VAT ID validation failed for recent transaction",
    time: "20m",
  },
  {
    id: 10,
    type: "gmail",
    name: "Isabella Rossi",
    message: "Invoice needed with Italian VAT number, per favore",
    time: "7m",
  },
  {
    id: 12,
    type: "gmail",
    name: "Noah Patel",
    message: "Urgent: Need corrected invoice for VAT return deadline",
    time: "1h",
  },
  {
    id: 13,
    type: "gmail",
    name: "Ava Kowalski",
    message: "VAT reverse charge mechanism query for B2B transaction",
    time: "30m",
  },
  {
    id: 14,
    type: "gmail",
    name: "Lucas Dubois",
    message: "I need an invoice for my purchase.",
    time: "45m",
  },
  {
    id: 15,
    type: "stripe",
    name: "Stripe Tax Alert",
    message: "New tax jurisdiction detected. VAT rates updated.",
    time: "1h",
  },
];

export default function InvoiceRequestToast() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [usedNotifications, setUsedNotifications] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) => {
        if (prev.length >= 3) return prev;

        let nextNotificationIndex;
        do {
          nextNotificationIndex = Math.floor(
            Math.random() * initialNotifications.length
          );
        } while (usedNotifications.has(nextNotificationIndex));

        const newNotifications = [
          ...prev,
          initialNotifications[nextNotificationIndex],
        ];

        setUsedNotifications((prevUsed) => {
          const newUsed = new Set(prevUsed);
          newUsed.add(nextNotificationIndex);
          if (newUsed.size === initialNotifications.length) {
            return new Set();
          }
          return newUsed;
        });

        return newNotifications;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [usedNotifications]);

  const removeNotification = (id: number) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const getIcon = (type: Notification["type"]) => {
    return type === "gmail" ? "/gmail-icon.png" : "/stripe-icon.png";
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden animate-slide-in-from-right"
        >
          <div className="p-3 flex items-start">
            <div className="flex-shrink-0 mr-3">
              <Image
                src={getIcon(notification.type)}
                alt={notification.type}
                width={24}
                height={24}
                className="rounded"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {notification.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {notification.message}
              </p>
            </div>
            <div className="ml-3 flex-shrink-0 flex items-center">
              <p className="text-xs text-gray-400 dark:text-gray-500 mr-2">
                {notification.time}
              </p>
              <button
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                onClick={() => removeNotification(notification.id)}
              >
                <span className="sr-only">Close</span>
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

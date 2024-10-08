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
    name: "Stripe Refund",
    message: "Reason: No invoice provided",
    time: "now",
  },
  {
    id: 2,
    type: "gmail",
    name: "Elias X.",
    message: "Invoice or refund 😡",
    time: "yesterday",
  },
  {
    id: 3,
    type: "gmail",
    name: "Pierre Quiroule",
    message: "Add my VAT to invoice please",
    time: "1m",
  },
  {
    id: 4,
    type: "gmail",
    name: "Annoying Customer",
    message: "Can I have an invoice?",
    time: "now",
  },
  {
    id: 5,
    type: "gmail",
    name: "Georg Borg",
    message: "Schicken Sie mir jetzt eine INVOICE?",
    time: "2m",
  },
  {
    id: 6,
    type: "stripe",
    name: "Stripe Alert",
    message: "New chargeback received",
    time: "5m",
  },
  {
    id: 7,
    type: "gmail",
    name: "Jane Doe",
    message: "Invoice query - urgent!",
    time: "3m",
  },
  {
    id: 8,
    type: "gmail",
    name: "John Smith",
    message: "Where's my receipt?",
    time: "15m",
  },
  {
    id: 9,
    type: "stripe",
    name: "Stripe Notice",
    message: "Failed payment attempt",
    time: "20m",
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

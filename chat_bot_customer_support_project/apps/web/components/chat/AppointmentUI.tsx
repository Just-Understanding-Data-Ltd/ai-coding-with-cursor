"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  CalendarDays,
  Clock,
  CheckCircle,
  Loader2,
  Mail,
  User,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAvailableTimeSlots } from "@repo/supabase";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AppointmentUIProps {
  teamId: string;
  initialDate?: Date;
  initialTime?: string;
  initialService?: string;
  initialName?: string;
  initialEmail?: string;
  onBook: (
    date: string,
    time: string,
    service: string,
    name: string,
    email: string
  ) => void;
  onCancel: () => void;
}

const SERVICES = [
  "Product Consultation",
  "Technical Support",
  "Sales Inquiry",
  "Product Demo",
  "Account Review",
];

export default function AppointmentUI({
  teamId,
  initialDate,
  initialTime,
  initialService,
  initialName = "",
  initialEmail = "",
  onBook,
  onCancel,
}: AppointmentUIProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate || new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(
    initialTime || null
  );
  const [selectedService, setSelectedService] = useState<string>(
    initialService || SERVICES[0]
  );
  const [fullName, setFullName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  // Format the date for the API call (YYYY-MM-DD)
  const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  // Fetch available time slots for the selected date
  const {
    data: timeSlots,
    isLoading: isSlotsLoading,
    isError: isSlotsError,
  } = useAvailableTimeSlots({
    teamId,
    date: formattedDate,
    supabase,
    options: {
      enabled: !!selectedDate && !!teamId,
    },
  });

  const handleSubmit = () => {
    if (
      !selectedDate ||
      !selectedTime ||
      !selectedService ||
      !fullName ||
      !email
    )
      return;

    setIsSubmitting(true);

    // Format date as YYYY-MM-DD for the API
    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    // Call the parent component's onBook callback
    onBook(formattedDate, selectedTime, selectedService, fullName, email);
  };

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

  // Only allow dates from today onwards
  const disabledDays = { before: new Date() };

  return (
    <Card className="w-full max-w-[500px]">
      <CardHeader>
        <CardTitle className="text-lg">Book an Appointment</CardTitle>
        <CardDescription>
          Select a date, time, and service for your appointment.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Full Name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
            {email && !isValidEmail(email) && (
              <p className="text-sm text-red-500">
                Please enter a valid email address
              </p>
            )}
          </div>
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium">Select Date</h3>
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={disabledDays}
            initialFocus
            className="rounded-md border"
          />
        </div>

        {/* Time Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium">Select Time</h3>
          </div>

          {isSlotsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading available times...
              </span>
            </div>
          ) : isSlotsError ? (
            <div className="text-sm text-red-500">
              Error loading available time slots. Please try again.
            </div>
          ) : !timeSlots || timeSlots.length === 0 ? (
            <div className="text-sm text-amber-500">
              No available time slots for this date. Please select another date.
            </div>
          ) : (
            <ScrollArea className="h-60 rounded-md border p-2">
              <div className="grid grid-cols-3 gap-2 p-1">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    size="sm"
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`flex items-center justify-center ${
                      !slot.available ? "opacity-50" : ""
                    }`}
                  >
                    {slot.time}
                    {selectedTime === slot.time && (
                      <CheckCircle className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Service Selection */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Select Service</h3>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((service) => (
              <Badge
                key={service}
                variant={selectedService === service ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedService(service)}
              >
                {service}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            !selectedDate ||
            !selectedTime ||
            !selectedService ||
            !fullName ||
            !email ||
            (email && !isValidEmail(email)) ||
            isSubmitting
          }
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            "Book Appointment"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

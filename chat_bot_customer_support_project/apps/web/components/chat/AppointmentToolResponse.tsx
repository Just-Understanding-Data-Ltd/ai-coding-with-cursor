import { CalendarDays, Clock, Info, X, Check, Trash } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { memo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { cancelAppointment } from "@repo/supabase";

interface AppointmentToolResponseProps {
  toolInvocation: {
    name: string;
    parameters: any;
    output: {
      success: boolean;
      message: string;
      appointmentId?: string;
      details?: {
        date?: string;
        time?: string;
        service?: string;
        customerName?: string;
      };
      appointments?: Array<{
        id: string;
        date: string;
        time: string;
        service: string;
        status: string;
      }>;
      count?: number;
      showForm?: boolean;
    };
  };
}

// Generate a more robust key for list items
const generateStableKey = (
  prefix: string,
  id: string,
  index: number
): string => {
  return `${prefix}-${id}-${index}`;
};

const AppointmentToolResponse = memo(function AppointmentToolResponse({
  toolInvocation,
}: AppointmentToolResponseProps) {
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
  const [deletionResults, setDeletionResults] = useState<
    Record<string, { success: boolean; message: string }>
  >({});
  const queryClient = useQueryClient();
  const supabase = createClient();

  // If the toolInvocation is completely missing or has no output, don't render anything
  if (!toolInvocation || !toolInvocation.output) {
    return null;
  }

  // If name is undefined (likely a processing state from streaming), don't render
  // This prevents duplicate "Unknown tool response" messages
  if (!toolInvocation.name) {
    return null;
  }

  const { name, output } = toolInvocation;

  // Handle appointment deletion
  const handleDeleteAppointment = async (appointmentId: string) => {
    setDeletingIds((prev) => ({ ...prev, [appointmentId]: true }));

    try {
      // Call the cancelAppointment function
      const reason = "Deleted via chat interface";
      const result = await cancelAppointment({
        supabase,
        appointmentId,
        reason,
      });

      // Update status for success UI feedback
      setDeletionResults((prev) => ({
        ...prev,
        [appointmentId]: {
          success: true,
          message: "Appointment successfully cancelled!",
        },
      }));

      // Also update the display of the appointment in the toolInvocation
      if (name === "viewAppointments" && output.appointments) {
        // Create a new modified output to update the appointment status
        const updatedAppointments = output.appointments.map((apt) => {
          if (apt.id === appointmentId) {
            return { ...apt, status: "cancelled" };
          }
          return apt;
        });

        // This is a hack to update the render without mutating props
        // Force a re-render with the updated status
        output.appointments = updatedAppointments;
      }

      // Invalidate any related queries
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      setDeletionResults((prev) => ({
        ...prev,
        [appointmentId]: {
          success: false,
          message: "Failed to cancel appointment.",
        },
      }));
    } finally {
      setDeletingIds((prev) => ({ ...prev, [appointmentId]: false }));
    }
  };

  // Helper function to format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Invalid date";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateStr; // Fallback to original string if parsing fails
    }
  };

  // Render different content based on the tool type
  const renderContent = () => {
    switch (name) {
      case "showAppointmentForm":
        // This case is handled differently in the ChatClient component
        // We don't render anything for this tool directly in this component
        return null;

      case "bookAppointment":
      case "rescheduleAppointment":
        if (!output.success) {
          return (
            <div className="flex items-center text-red-500 gap-2">
              <X className="h-5 w-5" />
              <p>{output.message}</p>
            </div>
          );
        }
        return (
          <div className="space-y-4">
            <div className="flex items-center text-green-500 gap-2">
              <Check className="h-5 w-5" />
              <p>{output.message}</p>
            </div>
            {output.details && (
              <div className="grid gap-3">
                {output.details.date && (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(output.details.date)}</span>
                  </div>
                )}
                {output.details.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{output.details.time}</span>
                  </div>
                )}
                {output.details.service && (
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span>{output.details.service}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "cancelAppointment":
        return (
          <div className="flex items-center gap-2">
            {output.success ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <X className="h-5 w-5 text-red-500" />
            )}
            <p>{output.message}</p>
          </div>
        );

      case "viewAppointments":
        if (!output.appointments?.length) {
          return <p>No appointments found.</p>;
        }
        return (
          <div className="space-y-4">
            {output.appointments.map((apt, index) => {
              // Check if this appointment has been cancelled either from the API or locally
              const isAlreadyCancelled =
                apt.status === "cancelled" ||
                (deletionResults[apt.id] && deletionResults[apt.id].success);

              return (
                <Card key={generateStableKey("apt", apt.id, index)}>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {apt.service}
                      </CardTitle>
                      <Badge
                        variant={
                          isAlreadyCancelled
                            ? "destructive"
                            : apt.status === "confirmed"
                              ? "default"
                              : "outline"
                        }
                      >
                        {isAlreadyCancelled ? "Cancelled" : apt.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(apt.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{apt.time}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <span>ID: {apt.id}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    {
                      deletionResults[apt.id] ? (
                        <div
                          className={`text-sm ${
                            deletionResults[apt.id].success
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {deletionResults[apt.id].message}
                        </div>
                      ) : !isAlreadyCancelled ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleDeleteAppointment(apt.id)}
                          disabled={deletingIds[apt.id]}
                        >
                          {deletingIds[apt.id] ? (
                            <span>Cancelling...</span>
                          ) : (
                            <>
                              <Trash className="h-4 w-4 mr-1" />
                              <span>Cancel Appointment</span>
                            </>
                          )}
                        </Button>
                      ) : null /* No button for cancelled appointments */
                    }
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        );

      default:
        return (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Info className="h-5 w-5" />
            <p>Unknown tool response: {name}</p>
          </div>
        );
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 w-full">
      {renderContent()}
    </div>
  );
});

export default AppointmentToolResponse;

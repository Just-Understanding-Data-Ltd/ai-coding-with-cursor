import { streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { createClient } from "@/utils/supabase/server";
import {
  createMessage,
  getChat,
  createAppointment,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  getAppointments,
  getAvailableTimeSlots,
  type TimeSlot,
  type Appointment,
} from "@repo/supabase";
import { UIMessage } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Track most recent tool calls
let recentToolCalls: any[] = [];

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check if user is authenticated
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Please sign in" }),
        { status: 401 }
      );
    }

    const { messages, chatId }: { messages: UIMessage[]; chatId: string } =
      await req.json();

    // Verify user has access to this chat
    const chat = await getChat({ supabase, chatId });
    if (!chat) {
      return new Response(JSON.stringify({ error: "Chat not found" }), {
        status: 404,
      });
    }

    // Get the last message (the user's input)
    const userMessage = messages[messages.length - 1];

    // Save the user's message to the database with user ID
    await createMessage({
      supabase,
      chatId,
      content: userMessage.content,
      role: "user",
      userId: user.id,
    });

    // Reset tool calls
    recentToolCalls = [];

    // Get the team ID from the chat
    const teamId = chat.team_id;

    // Use streamText for better streaming support
    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: `You are a friendly and professional customer service chat bot for Cursor Industries.
        I am here to help you with:
        - Booking new appointments for product consultations
        - Rescheduling existing appointments
        - Cancelling appointments
        - Answering questions about our products and services
        - General customer support inquiries

        Business Information:
        - Business hours: 8:00am to 5:00pm UK time
        - Location: United Kingdom
        - Company: Cursor Industries

        When helping with appointments:
        1. Use the showAppointmentForm tool when a user wants to book an appointment
        2. Do not ask for information like date, time, email, etc. directly - just use the form
        3. After the form is completed, I'll confirm the details
        4. IMPORTANT: When canceling or rescheduling, NEVER use simple IDs like "1" or "2" 
        5. ALWAYS use the exact UUID format IDs (like "74ef5e89-254b-437c-969f-53b2815f31ad")
        6. Tell users they can directly cancel appointments using the buttons on the appointment cards
        
        Use the showAppointmentForm tool anytime a user indicates they want to book, schedule, or make an appointment.
        
       When you receive an input like this, you should use the bookAppointment tool:
       I'd like to book an appointment for Technical Support on 2025-03-27 at 13:00. My name is James Phoenix and my email is jamesaphoenix@googlemail.com.
        
        `,
      messages: messages.slice(-50).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      maxSteps: 5,
      tools: {
        showAppointmentForm: tool({
          description:
            "Show an interactive form for the user to book an appointment",
          parameters: z.object({}),
          execute: async () => {
            const result = {
              showForm: true,
              message:
                "Please complete the appointment form to book your appointment.",
            };

            // Store tool call for persistence
            recentToolCalls.push({
              type: "showAppointmentForm",
              parameters: {},
              result,
            });

            return result;
          },
        }),
        bookAppointment: tool({
          description: "Book a new appointment for a customer",
          parameters: z.object({
            date: z
              .string()
              .describe("The date for the appointment (YYYY-MM-DD)"),
            time: z.string().describe("The time for the appointment (HH:mm)"),
            service: z.string().describe("The type of service/consultation"),
            customerName: z.string().describe("Customer's full name"),
            email: z.string().email().describe("Customer's email address"),
          }),
          execute: async ({ date, time, service, customerName, email }) => {
            try {
              // Check availability using the real database function
              const timeSlots = await getAvailableTimeSlots({
                supabase,
                teamId,
                date,
              });

              const requestedSlot = timeSlots.find(
                (slot: TimeSlot) => slot.time === time
              );
              const isAvailable = requestedSlot && requestedSlot.available;

              if (!isAvailable) {
                const result = {
                  success: false,
                  message:
                    "This time slot is not available. Please try another time.",
                };

                // Store tool call for persistence
                recentToolCalls.push({
                  type: "bookAppointment",
                  parameters: { date, time, service, customerName, email },
                  result,
                });

                return result;
              }

              // Create the appointment in the real database
              const appointment = await createAppointment({
                supabase,
                teamId,
                customerEmail: email,
                customerName,
                date,
                time,
                service,
                userId: user.id,
              });

              const result = {
                success: true,
                appointmentId: appointment.id,
                message: "Appointment successfully booked!",
                details: {
                  date,
                  time,
                  service,
                  customerName,
                },
              };

              // Store tool call for persistence
              recentToolCalls.push({
                type: "bookAppointment",
                parameters: { date, time, service, customerName, email },
                result,
              });

              return result;
            } catch (error) {
              console.error("Error booking appointment:", error);

              const result = {
                success: false,
                message: "Failed to book appointment. Please try again later.",
              };

              // Store tool call for persistence
              recentToolCalls.push({
                type: "bookAppointment",
                parameters: { date, time, service, customerName, email },
                result,
              });

              return result;
            }
          },
        }),
        rescheduleAppointment: tool({
          description: "Reschedule an existing appointment",
          parameters: z.object({
            appointmentId: z
              .string()
              .describe("The ID of the appointment to reschedule"),
            newDate: z.string().describe("The new date (YYYY-MM-DD)"),
            newTime: z.string().describe("The new time (HH:mm)"),
          }),
          execute: async ({ appointmentId, newDate, newTime }) => {
            try {
              // Get the appointment from the database
              const appointment = await getAppointment({
                supabase,
                appointmentId,
              });

              if (!appointment) {
                const result = {
                  success: false,
                  message: "Appointment not found.",
                };

                // Store tool call for persistence
                recentToolCalls.push({
                  type: "rescheduleAppointment",
                  parameters: { appointmentId, newDate, newTime },
                  result,
                });

                return result;
              }

              // Check availability for the new time slot
              const timeSlots = await getAvailableTimeSlots({
                supabase,
                teamId: appointment.team_id,
                date: newDate,
              });

              const requestedSlot = timeSlots.find(
                (slot: TimeSlot) => slot.time === newTime
              );
              const isAvailable = requestedSlot && requestedSlot.available;

              if (!isAvailable) {
                const result = {
                  success: false,
                  message:
                    "The requested time slot is not available. Please try another time.",
                };

                // Store tool call for persistence
                recentToolCalls.push({
                  type: "rescheduleAppointment",
                  parameters: { appointmentId, newDate, newTime },
                  result,
                });

                return result;
              }

              // Update the appointment in the database
              const updatedAppointment = await updateAppointment({
                supabase,
                appointmentId,
                appointment: {
                  date: newDate,
                  time: newTime,
                },
              });

              const result = {
                success: true,
                message: "Appointment successfully rescheduled!",
                details: {
                  date: newDate,
                  time: newTime,
                  service: updatedAppointment.service,
                  customerName: updatedAppointment.customer_name,
                },
              };

              // Store tool call for persistence
              recentToolCalls.push({
                type: "rescheduleAppointment",
                parameters: { appointmentId, newDate, newTime },
                result,
              });

              return result;
            } catch (error) {
              console.error("Error rescheduling appointment:", error);

              const result = {
                success: false,
                message:
                  "Failed to reschedule appointment. Please try again later.",
              };

              // Store tool call for persistence
              recentToolCalls.push({
                type: "rescheduleAppointment",
                parameters: { appointmentId, newDate, newTime },
                result,
              });

              return result;
            }
          },
        }),
        cancelAppointment: tool({
          description: "Cancel an existing appointment",
          parameters: z.object({
            appointmentId: z
              .string()
              .describe("The ID of the appointment to cancel"),
            reason: z.string().optional().describe("Reason for cancellation"),
          }),
          execute: async ({ appointmentId, reason }) => {
            try {
              // Get the appointment to check if it exists
              const appointment = await getAppointment({
                supabase,
                appointmentId,
              });

              if (!appointment) {
                const result = {
                  success: false,
                  message: "Appointment not found.",
                };

                // Store tool call for persistence
                recentToolCalls.push({
                  type: "cancelAppointment",
                  parameters: { appointmentId, reason },
                  result,
                });

                return result;
              }

              // Cancel the appointment in the database
              const cancelledAppointment = await cancelAppointment({
                supabase,
                appointmentId,
                reason,
              });

              const result = {
                success: true,
                message: "Appointment successfully cancelled!",
                details: {
                  date: cancelledAppointment.date,
                  time: cancelledAppointment.time,
                  service: cancelledAppointment.service,
                  customerName: cancelledAppointment.customer_name,
                  status: cancelledAppointment.status,
                },
              };

              // Store tool call for persistence
              recentToolCalls.push({
                type: "cancelAppointment",
                parameters: { appointmentId, reason },
                result,
              });

              return result;
            } catch (error) {
              console.error("Error cancelling appointment:", error);

              const result = {
                success: false,
                message:
                  "Failed to cancel appointment. Please try again later.",
              };

              // Store tool call for persistence
              recentToolCalls.push({
                type: "cancelAppointment",
                parameters: { appointmentId, reason },
                result,
              });

              return result;
            }
          },
        }),
        viewAppointments: tool({
          description: "View all appointments for a customer",
          parameters: z.object({
            email: z.string().email().describe("Customer's email address"),
          }),
          execute: async ({ email }) => {
            try {
              // Get appointments from the database
              const appointments = await getAppointments({
                supabase,
                teamId,
                customerEmail: email,
              });

              // Format appointments for display
              const formattedAppointments = appointments.map(
                (apt: Appointment) => ({
                  id: apt.id,
                  date: apt.date,
                  time: apt.time,
                  service: apt.service,
                  status: apt.status,
                })
              );

              const result = {
                success: true,
                appointments: formattedAppointments,
                count: formattedAppointments.length,
                message:
                  "You can use the cancel buttons on each appointment card or use the exact appointment ID shown when cancelling.",
              };

              // Store tool call for persistence
              recentToolCalls.push({
                type: "viewAppointments",
                parameters: { email },
                result,
              });

              return result;
            } catch (error) {
              console.error("Error viewing appointments:", error);

              const result = {
                success: false,
                message:
                  "Failed to retrieve appointments. Please try again later.",
                appointments: [],
                count: 0,
              };

              // Store tool call for persistence
              recentToolCalls.push({
                type: "viewAppointments",
                parameters: { email },
                result,
              });

              return result;
            }
          },
        }),
      },
      onFinish: async ({ response }) => {
        // Store all assistant messages with their tool calls
        const assistantMessages = response.messages.filter(
          (m) => m.role === "assistant"
        );

        // Process each message separately in sequence
        for (let i = 0; i < assistantMessages.length; i++) {
          const message = assistantMessages[i];

          // Get the content as string
          const content =
            typeof message.content === "string"
              ? message.content
              : message.content
                  .map((part) => (part.type === "text" ? part.text : ""))
                  .join("");

          // Save the message with the recent tool calls
          await createMessage({
            supabase,
            chatId,
            content,
            role: "assistant",
            userId: user.id,
            tool_calls:
              recentToolCalls.length > 0
                ? JSON.parse(JSON.stringify(recentToolCalls))
                : null,
          });

          // Reset tool calls for the next message
          recentToolCalls = [];
        }
      },
    });

    // Return the stream response with tool calls preserved
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);

    // Check if error is an authentication error
    if (
      error instanceof Error &&
      (error.message.includes("not authenticated") ||
        error.message.includes("auth"))
    ) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Please sign in" }),
        { status: 401 }
      );
    }

    return new Response(
      JSON.stringify({ error: "Failed to process chat message" }),
      { status: 500 }
    );
  }
}

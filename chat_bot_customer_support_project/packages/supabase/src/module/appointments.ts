import { SupabaseOperationError, SupabaseErrorCode } from "../errors";
import { SupabaseClient } from "../index";
import { Tables, TablesInsert, TablesUpdate } from "../database.types";

/**
 * Represents an appointment.
 */
export type Appointment = Tables<"appointments">;

/**
 * Represents the data required to insert a new appointment.
 */
export type AppointmentInsert = TablesInsert<"appointments">;

/**
 * Represents the data required to update an existing appointment.
 */
export type AppointmentUpdate = TablesUpdate<"appointments">;

/**
 * Time slot representation
 */
export interface TimeSlot {
  time: string;
  available: boolean;
}

/**
 * Custom error class for appointment operations.
 */
export class AppointmentOperationError extends SupabaseOperationError {
  constructor(
    operation: string,
    context: string,
    toastMessage: string,
    errorCode: SupabaseErrorCode,
    cause?: unknown
  ) {
    super(operation, context, toastMessage, errorCode, cause);
    this.name = "AppointmentOperationError";
  }
}

/**
 * Create a new appointment
 * @param params - Parameters for creating an appointment
 * @returns The created appointment
 */
export async function createAppointment({
  supabase,
  teamId,
  customerEmail,
  customerName,
  date,
  time,
  service,
  userId,
}: {
  supabase: SupabaseClient;
  teamId: string;
  customerEmail: string;
  customerName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  service: string;
  userId?: string;
}): Promise<Appointment> {
  try {
    // Convert time to a proper time object and calculate end time (30 min appointments)
    const startTime = time;
    const timeParts = time.split(":");

    // Calculate end time (30 min later)
    let hours = parseInt(timeParts[0]);
    let minutes = parseInt(timeParts[1]) + 30;

    if (minutes >= 60) {
      hours += 1;
      minutes -= 60;
    }

    const endTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        team_id: teamId,
        customer_email: customerEmail,
        customer_name: customerName,
        date,
        time: startTime,
        end_time: endTime,
        service,
        status: "confirmed",
        created_by: userId,
      })
      .select("*")
      .single();

    if (error) {
      throw new AppointmentOperationError(
        "createAppointment",
        `Failed to create appointment for team ${teamId}`,
        "Failed to create appointment",
        SupabaseErrorCode.CREATE_FAILED,
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof AppointmentOperationError) {
      throw error;
    }

    throw new AppointmentOperationError(
      "createAppointment",
      "Unexpected error while creating appointment",
      "Failed to create appointment",
      SupabaseErrorCode.UNKNOWN_ERROR,
      error
    );
  }
}

/**
 * Get an appointment by its ID
 * @param params - Parameters for getting an appointment
 * @returns The appointment or null if not found
 */
export async function getAppointment({
  supabase,
  appointmentId,
}: {
  supabase: SupabaseClient;
  appointmentId: string;
}): Promise<Appointment | null> {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }

      throw new AppointmentOperationError(
        "getAppointment",
        `Failed to get appointment ${appointmentId}`,
        "Failed to load appointment",
        SupabaseErrorCode.READ_FAILED,
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof AppointmentOperationError) {
      throw error;
    }

    throw new AppointmentOperationError(
      "getAppointment",
      "Unexpected error while getting appointment",
      "Failed to load appointment",
      SupabaseErrorCode.UNKNOWN_ERROR,
      error
    );
  }
}

/**
 * Get all appointments for a team
 * @param params - Parameters for getting appointments
 * @returns Array of appointments
 */
export async function getAppointments({
  supabase,
  teamId,
  customerEmail,
  status,
  startDate,
  endDate,
}: {
  supabase: SupabaseClient;
  teamId: string;
  customerEmail?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Appointment[]> {
  try {
    let query = supabase.from("appointments").select("*").eq("team_id", teamId);

    // Apply filters if provided
    if (customerEmail) {
      query = query.eq("customer_email", customerEmail);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (startDate) {
      query = query.gte("date", startDate);
    }

    if (endDate) {
      query = query.lte("date", endDate);
    }

    // Order by date and time
    query = query
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new AppointmentOperationError(
        "getAppointments",
        `Failed to get appointments for team ${teamId}`,
        "Failed to load appointments",
        SupabaseErrorCode.READ_FAILED,
        error
      );
    }

    return data || [];
  } catch (error) {
    if (error instanceof AppointmentOperationError) {
      throw error;
    }

    throw new AppointmentOperationError(
      "getAppointments",
      "Unexpected error while getting appointments",
      "Failed to load appointments",
      SupabaseErrorCode.UNKNOWN_ERROR,
      error
    );
  }
}

/**
 * Update an appointment
 * @param params - Parameters for updating an appointment
 * @returns The updated appointment
 */
export async function updateAppointment({
  supabase,
  appointmentId,
  appointment,
}: {
  supabase: SupabaseClient;
  appointmentId: string;
  appointment: Omit<AppointmentUpdate, "id">;
}): Promise<Appointment> {
  try {
    // If updating time, also update end_time
    if (appointment.time) {
      const timeParts = appointment.time.split(":");

      // Calculate end time (30 min later)
      let hours = parseInt(timeParts[0]);
      let minutes = parseInt(timeParts[1]) + 30;

      if (minutes >= 60) {
        hours += 1;
        minutes -= 60;
      }

      const endTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      appointment.end_time = endTime;
    }

    const { data, error } = await supabase
      .from("appointments")
      .update(appointment)
      .eq("id", appointmentId)
      .select("*")
      .single();

    if (error) {
      throw new AppointmentOperationError(
        "updateAppointment",
        `Failed to update appointment ${appointmentId}`,
        "Failed to update appointment",
        SupabaseErrorCode.UPDATE_FAILED,
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof AppointmentOperationError) {
      throw error;
    }

    throw new AppointmentOperationError(
      "updateAppointment",
      "Unexpected error while updating appointment",
      "Failed to update appointment",
      SupabaseErrorCode.UNKNOWN_ERROR,
      error
    );
  }
}

/**
 * Cancel an appointment
 * @param params - Parameters for canceling an appointment
 * @returns The canceled appointment
 */
export async function cancelAppointment({
  supabase,
  appointmentId,
  reason,
}: {
  supabase: SupabaseClient;
  appointmentId: string;
  reason?: string;
}): Promise<Appointment> {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: "cancelled",
        cancellation_reason: reason || null,
      })
      .eq("id", appointmentId)
      .select("*")
      .single();

    if (error) {
      throw new AppointmentOperationError(
        "cancelAppointment",
        `Failed to cancel appointment ${appointmentId}`,
        "Failed to cancel appointment",
        SupabaseErrorCode.UPDATE_FAILED,
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof AppointmentOperationError) {
      throw error;
    }

    throw new AppointmentOperationError(
      "cancelAppointment",
      "Unexpected error while canceling appointment",
      "Failed to cancel appointment",
      SupabaseErrorCode.UNKNOWN_ERROR,
      error
    );
  }
}

/**
 * Delete an appointment
 * @param params - Parameters for deleting an appointment
 * @returns void
 */
export async function deleteAppointment({
  supabase,
  appointmentId,
}: {
  supabase: SupabaseClient;
  appointmentId: string;
}): Promise<void> {
  try {
    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", appointmentId);

    if (error) {
      throw new AppointmentOperationError(
        "deleteAppointment",
        `Failed to delete appointment ${appointmentId}`,
        "Failed to delete appointment",
        SupabaseErrorCode.DELETE_FAILED,
        error
      );
    }
  } catch (error) {
    if (error instanceof AppointmentOperationError) {
      throw error;
    }

    throw new AppointmentOperationError(
      "deleteAppointment",
      "Unexpected error while deleting appointment",
      "Failed to delete appointment",
      SupabaseErrorCode.UNKNOWN_ERROR,
      error
    );
  }
}

/**
 * Get available time slots for a specific date
 * @param params - Parameters for getting available time slots
 * @returns Array of available time slots
 */
export async function getAvailableTimeSlots({
  supabase,
  teamId,
  date,
}: {
  supabase: SupabaseClient;
  teamId: string;
  date: string; // YYYY-MM-DD
}): Promise<TimeSlot[]> {
  try {
    // First, get all 30-minute slots between 8:00 and 17:00
    const allSlots = generateTimeSlots("08:00", "17:00", 30);

    // Then, get all booked appointments for this date
    const { data: bookedAppointments, error } = await supabase
      .from("appointments")
      .select("time, end_time")
      .eq("team_id", teamId)
      .eq("date", date)
      .eq("status", "confirmed");

    if (error) {
      throw new AppointmentOperationError(
        "getAvailableTimeSlots",
        `Failed to get booked slots for team ${teamId} on date ${date}`,
        "Failed to load available time slots",
        SupabaseErrorCode.READ_FAILED,
        error
      );
    }

    // Mark slots as unavailable if they overlap with booked appointments
    return allSlots.map((slot) => {
      const isBooked = bookedAppointments?.some((appointment) => {
        // Check if this slot overlaps with any appointment
        const slotTime = timeToMinutes(slot.time);
        const apptStartTime = timeToMinutes(appointment.time);
        const apptEndTime = timeToMinutes(appointment.end_time);

        return slotTime >= apptStartTime && slotTime < apptEndTime;
      });

      return {
        ...slot,
        available: !isBooked,
      };
    });
  } catch (error) {
    if (error instanceof AppointmentOperationError) {
      throw error;
    }

    throw new AppointmentOperationError(
      "getAvailableTimeSlots",
      "Unexpected error while getting available time slots",
      "Failed to load available time slots",
      SupabaseErrorCode.UNKNOWN_ERROR,
      error
    );
  }
}

/**
 * Generate time slots between start and end times with a specified interval
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @param intervalMinutes - Interval in minutes between slots
 * @returns Array of time slots
 */
function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  for (let minutes = start; minutes < end; minutes += intervalMinutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    const timeString = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;

    slots.push({
      time: timeString,
      available: true,
    });
  }

  return slots;
}

/**
 * Convert time string (HH:MM) to minutes from midnight
 * @param time - Time string in HH:MM format
 * @returns Minutes from midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

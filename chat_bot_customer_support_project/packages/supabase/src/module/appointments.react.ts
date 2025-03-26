"use client";

import {
  useQuery,
  type UseQueryOptions,
  useMutation,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import { moduleToast } from "../lib/toast";
import { SupabaseClient } from "../index";
import {
  type Appointment,
  type AppointmentInsert,
  type AppointmentUpdate,
  type TimeSlot,
  getAppointment,
  getAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
  getAvailableTimeSlots,
  AppointmentOperationError,
} from "./appointments";

type QueryKey = readonly [string, ...unknown[]];

/**
 * React Query key factory for appointment-related queries
 */
export const appointmentKeys = {
  all: ["appointments"] as const,
  lists: () => [...appointmentKeys.all, "list"] as const,
  list: (teamId: string) => [...appointmentKeys.lists(), teamId] as const,
  listByEmail: (teamId: string, email: string) =>
    [...appointmentKeys.list(teamId), "email", email] as const,
  details: () => [...appointmentKeys.all, "detail"] as const,
  detail: (appointmentId: string) =>
    [...appointmentKeys.details(), appointmentId] as const,
  timeSlots: () => [...appointmentKeys.all, "timeSlots"] as const,
  dateSlots: (teamId: string, date: string) =>
    [...appointmentKeys.timeSlots(), teamId, date] as const,
};

/**
 * Hook to fetch a single appointment by ID
 */
export function useAppointment({
  appointmentId,
  supabase,
  options = {},
}: {
  appointmentId: string;
  supabase: SupabaseClient;
  options?: Partial<
    UseQueryOptions<Appointment | null, AppointmentOperationError>
  >;
}) {
  const queryKey = appointmentKeys.detail(appointmentId);

  const queryFn = async () => getAppointment({ supabase, appointmentId });

  return useQuery<Appointment | null, AppointmentOperationError>({
    queryKey,
    queryFn,
    ...options,
  });
}

/**
 * Hook to fetch all appointments for a team
 */
export function useAppointments({
  teamId,
  customerEmail,
  status,
  startDate,
  endDate,
  supabase,
  options = {},
}: {
  teamId: string;
  customerEmail?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  supabase: SupabaseClient;
  options?: Partial<UseQueryOptions<Appointment[], AppointmentOperationError>>;
}) {
  // Use email-specific key if provided, otherwise use team key
  const queryKey = customerEmail
    ? appointmentKeys.listByEmail(teamId, customerEmail)
    : appointmentKeys.list(teamId);

  const queryFn = async () =>
    getAppointments({
      supabase,
      teamId,
      customerEmail,
      status,
      startDate,
      endDate,
    });

  return useQuery<Appointment[], AppointmentOperationError>({
    queryKey,
    queryFn,
    ...options,
  });
}

/**
 * Hook to fetch available time slots for a specific date
 */
export function useAvailableTimeSlots({
  teamId,
  date,
  supabase,
  options = {},
}: {
  teamId: string;
  date: string; // YYYY-MM-DD
  supabase: SupabaseClient;
  options?: Partial<UseQueryOptions<TimeSlot[], AppointmentOperationError>>;
}) {
  const queryKey = appointmentKeys.dateSlots(teamId, date);

  const queryFn = async () => getAvailableTimeSlots({ supabase, teamId, date });

  return useQuery<TimeSlot[], AppointmentOperationError>({
    queryKey,
    queryFn,
    ...options,
  });
}

/**
 * Hook to create a new appointment
 */
export function useCreateAppointment({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<
      Appointment,
      AppointmentOperationError,
      {
        teamId: string;
        customerEmail: string;
        customerName: string;
        date: string;
        time: string;
        service: string;
        userId?: string;
      }
    >
  >;
}): UseMutationResult<
  Appointment,
  AppointmentOperationError,
  {
    teamId: string;
    customerEmail: string;
    customerName: string;
    date: string;
    time: string;
    service: string;
    userId?: string;
  }
> {
  const queryClient = useQueryClient();

  return useMutation<
    Appointment,
    AppointmentOperationError,
    {
      teamId: string;
      customerEmail: string;
      customerName: string;
      date: string;
      time: string;
      service: string;
      userId?: string;
    }
  >({
    mutationFn: async ({
      teamId,
      customerEmail,
      customerName,
      date,
      time,
      service,
      userId,
    }) =>
      createAppointment({
        supabase,
        teamId,
        customerEmail,
        customerName,
        date,
        time,
        service,
        userId,
      }),

    onSuccess: (data, variables) => {
      // Invalidate appointments list for this team
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.list(variables.teamId),
      });

      // If email is provided, also invalidate email-specific list
      if (variables.customerEmail) {
        queryClient.invalidateQueries({
          queryKey: appointmentKeys.listByEmail(
            variables.teamId,
            variables.customerEmail
          ),
        });
      }

      // Invalidate time slots for this date
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.dateSlots(variables.teamId, variables.date),
      });

      // Add the new appointment to the cache
      queryClient.setQueryData(appointmentKeys.detail(data.id), data);

      moduleToast.success("Appointment created successfully!");
    },

    onError: (error) => {
      moduleToast.error(`${error.toastMessage}`);
    },

    ...options,
  });
}

/**
 * Hook to update an appointment
 */
export function useUpdateAppointment({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<
      Appointment,
      AppointmentOperationError,
      { appointmentId: string; appointment: Omit<AppointmentUpdate, "id"> }
    >
  >;
}): UseMutationResult<
  Appointment,
  AppointmentOperationError,
  { appointmentId: string; appointment: Omit<AppointmentUpdate, "id"> }
> {
  const queryClient = useQueryClient();

  return useMutation<
    Appointment,
    AppointmentOperationError,
    { appointmentId: string; appointment: Omit<AppointmentUpdate, "id"> }
  >({
    mutationFn: async ({ appointmentId, appointment }) =>
      updateAppointment({ supabase, appointmentId, appointment }),

    onSuccess: (data, variables) => {
      // Update the appointment in the cache
      queryClient.setQueryData(
        appointmentKeys.detail(variables.appointmentId),
        data
      );

      // Invalidate appointments list for this team
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.list(data.team_id),
      });

      // If email is provided, also invalidate email-specific list
      if (data.customer_email) {
        queryClient.invalidateQueries({
          queryKey: appointmentKeys.listByEmail(
            data.team_id,
            data.customer_email
          ),
        });
      }

      // If date was updated, invalidate time slots for both old and new dates
      if (variables.appointment.date) {
        // We don't know the old date, so we can't invalidate it specifically
        // Instead, we invalidate all time slots queries
        queryClient.invalidateQueries({
          queryKey: appointmentKeys.timeSlots(),
        });
      }

      moduleToast.success("Appointment updated successfully!");
    },

    onError: (error) => {
      moduleToast.error(`${error.toastMessage}`);
    },

    ...options,
  });
}

/**
 * Hook to cancel an appointment
 */
export function useCancelAppointment({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<
      Appointment,
      AppointmentOperationError,
      { appointmentId: string; reason?: string }
    >
  >;
}): UseMutationResult<
  Appointment,
  AppointmentOperationError,
  { appointmentId: string; reason?: string }
> {
  const queryClient = useQueryClient();

  return useMutation<
    Appointment,
    AppointmentOperationError,
    { appointmentId: string; reason?: string }
  >({
    mutationFn: async ({ appointmentId, reason }) =>
      cancelAppointment({ supabase, appointmentId, reason }),

    onSuccess: (data, variables) => {
      // Update the appointment in the cache
      queryClient.setQueryData(
        appointmentKeys.detail(variables.appointmentId),
        data
      );

      // Invalidate appointments list for this team
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.list(data.team_id),
      });

      // If email is provided, also invalidate email-specific list
      if (data.customer_email) {
        queryClient.invalidateQueries({
          queryKey: appointmentKeys.listByEmail(
            data.team_id,
            data.customer_email
          ),
        });
      }

      // Invalidate time slots for this date
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.dateSlots(data.team_id, data.date),
      });

      moduleToast.success("Appointment cancelled successfully!");
    },

    onError: (error) => {
      moduleToast.error(`${error.toastMessage}`);
    },

    ...options,
  });
}

/**
 * Hook to delete an appointment
 */
export function useDeleteAppointment({
  supabase,
  options = {},
}: {
  supabase: SupabaseClient;
  options?: Partial<
    UseMutationOptions<
      void,
      AppointmentOperationError,
      { appointmentId: string; teamId: string; date?: string }
    >
  >;
}): UseMutationResult<
  void,
  AppointmentOperationError,
  { appointmentId: string; teamId: string; date?: string }
> {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    AppointmentOperationError,
    { appointmentId: string; teamId: string; date?: string }
  >({
    mutationFn: async ({ appointmentId }) =>
      deleteAppointment({ supabase, appointmentId }),

    onSuccess: (_, variables) => {
      // Remove the appointment from the cache
      queryClient.removeQueries({
        queryKey: appointmentKeys.detail(variables.appointmentId),
      });

      // Invalidate appointments list for this team
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.list(variables.teamId),
      });

      // If date is provided, invalidate time slots for this date
      if (variables.date) {
        queryClient.invalidateQueries({
          queryKey: appointmentKeys.dateSlots(variables.teamId, variables.date),
        });
      }

      moduleToast.success("Appointment deleted successfully!");
    },

    onError: (error) => {
      moduleToast.error(`${error.toastMessage}`);
    },

    ...options,
  });
}

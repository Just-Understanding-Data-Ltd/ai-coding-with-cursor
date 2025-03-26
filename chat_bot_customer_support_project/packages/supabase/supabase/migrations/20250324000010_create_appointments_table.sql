-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    end_time TIME NOT NULL,
    service TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled', 'pending', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    cancellation_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Add updated_at trigger to appointments
CREATE TRIGGER set_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_appointments_team_id ON public.appointments(team_id);
CREATE INDEX idx_appointments_customer_email ON public.appointments(customer_email);
CREATE INDEX idx_appointments_date ON public.appointments(date);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- Add RLS for appointments table
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Appointments policies
CREATE POLICY "Users can view their team's appointments"
    ON public.appointments
    FOR SELECT
    USING (
        team_id IN (
            SELECT team_id 
            FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create appointments in their teams"
    ON public.appointments
    FOR INSERT
    WITH CHECK (
        team_id IN (
            SELECT team_id 
            FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update appointments in their teams"
    ON public.appointments
    FOR UPDATE
    USING (
        team_id IN (
            SELECT team_id 
            FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete appointments in their teams"
    ON public.appointments
    FOR DELETE
    USING (
        team_id IN (
            SELECT team_id 
            FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Function to generate time slots
CREATE OR REPLACE FUNCTION public.get_available_time_slots(
    p_date DATE,
    p_team_id UUID
)
RETURNS TABLE (
    time_slot TIME
)
LANGUAGE plpgsql
AS $$
DECLARE
    start_time TIME := '08:00:00';
    end_time TIME := '17:00:00';
    interval_minutes INT := 30;
    slot_time TIME;
BEGIN
    -- Generate time slots from 8am to 5pm
    slot_time := start_time;
    WHILE slot_time < end_time LOOP
        -- Check if the slot is already booked
        IF NOT EXISTS (
            SELECT 1 FROM public.appointments 
            WHERE 
                team_id = p_team_id AND 
                date = p_date AND 
                status = 'confirmed' AND
                (time <= slot_time AND end_time > slot_time)
        ) THEN
            time_slot := slot_time;
            RETURN NEXT;
        END IF;
        
        -- Move to the next time slot
        slot_time := slot_time + (interval_minutes * interval '1 minute');
    END LOOP;
END;
$$;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated; 
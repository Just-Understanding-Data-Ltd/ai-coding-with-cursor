-- Create a table for global settings
CREATE TABLE system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger to update timestamp
CREATE TRIGGER update_system_settings_timestamp
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Only allow service_role to modify settings
CREATE POLICY "Allow service role full access to system settings" ON system_settings
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to read settings
CREATE POLICY "Allow authenticated users to read settings" ON system_settings
    FOR SELECT TO authenticated
    USING (true);
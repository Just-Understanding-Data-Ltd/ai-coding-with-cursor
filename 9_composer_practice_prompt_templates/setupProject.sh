#!/bin/bash

# Kill any running docker containers:
echo "Killing all running docker containers..."
docker stop $(docker ps -aq)

# Function to run command and handle errors
run_command() {
    if ! $@; then
        echo "Error executing command: $@"
        exit 1
    fi
}

# Function to run npm commands with automatic yes to prompts
run_npm_command() {
    if ! yes | $@; then
        echo "Error executing command: $@"
        exit 1
    fi
}

# Set project name
PROJECT_NAME="client"
rm -rf $PROJECT_NAME

mkdir $PROJECT_NAME
cd $PROJECT_NAME

# Create Next.js app with default options
run_npm_command npx create-next-app@latest . --typescript --tailwind --eslint --app --import-alias "@/*" --use-npm

# Install shadcn/ui CLI and initialize
run_npm_command npm install -D @shadcn/ui
run_npm_command npx shadcn-ui@latest init

wait

# Install additional dependencies
run_npm_command npm install @radix-ui/react-icons next-themes

wait 

# Install and add shadcn/ui components asynchronously
components=(
    "accordion" "alert" "alert-dialog" "aspect-ratio" "avatar" "badge" "breadcrumb" "button" "calendar"
    "card" "carousel" "checkbox" "collapsible" "combobox" "command" "context-menu" "data-table" 
    "date-picker" "dialog" "drawer" "dropdown-menu" "form" "hover-card" "input" "label" "menubar" 
    "navigation-menu" "pagination" "popover" "progress" "radio-group" "resizable" "scroll-area" 
    "select" "separator" "sheet" "skeleton" "slider" "sonner" "switch" "table" "tabs" "textarea" 
    "toast" "toggle" "toggle-group" "tooltip"
)

echo "Installing shadcn/ui components..."
component_string=$(printf " %s" "${components[@]}")
component_string=${component_string:1}
run_npm_command npx shadcn-ui@latest add $component_string

# Install supabase client libraries:
run_npm_command npm install @supabase/ssr @supabase/supabase-js

# Supabase setup
echo "Setting up Supabase..."

# Check if Supabase CLI is installed, if not install it
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI not found. Installing it now..."
    run_npm_command npm install -g supabase
fi

# Go up to the root directory
cd ..

# Initialize Supabase project, say N to all prompts
run_command yes n | supabase init

# Start Supabase locally
echo "Starting Supabase locally..."
supabase stop
supabase start

# Create migrations directory
mkdir -p supabase/migrations

# Create SQL file
cat << EOF > supabase/migrations/20240829000000_init.sql
-- Create the profiles table in the public schema
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    image TEXT,
    customer_id TEXT,
    price_id TEXT,
    has_access BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC'),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC')
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = (now() AT TIME ZONE 'UTC');
    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Create a function to automatically add a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS \$\$
BEGIN
  INSERT INTO public.profiles (id, email, name, image, created_at, updated_at)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), 
    NEW.raw_user_meta_data->>'avatar_url',
    (now() AT TIME ZONE 'UTC'), 
    (now() AT TIME ZONE 'UTC')
  );
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the handle_new_user function on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EOF

# Apply the migration
echo "Applying the migration..."
supabase db reset

# Generate types
mkdir client/types
supabase gen types --lang=typescript --local > client/types/types.ts

echo "Setup complete! Your Next.js app with shadcn/ui components and Supabase is ready."
echo "To start your development server, run:"
echo "npm run dev"
echo "Your Supabase instance is running locally. Use 'supabase stop' to stop it when you're done."

# Make a .env.local file with the supabase auth settings:
touch client/.env.local

# Add the following to the .env.local file:
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
NEXT_PUBLIC_BASE_URL=http://localhost:3000

cat << EOF > client/.env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
NEXT_PUBLIC_BASE_URL=http://localhost:3000
EOF

cp dashboard_layout.txt client/
cp supabase_auth_settings.txt client/
cp homepage.txt client/
cp .cursorrules client/

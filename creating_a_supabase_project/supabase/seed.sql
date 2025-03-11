-- Insert sample users
-- Note: In a real environment, users would be created through auth.users first
-- For seeding purposes, we'll insert directly with UUIDs
INSERT INTO public.users (email, full_name, avatar_url)
VALUES
  ('john@example.com', 'John Doe', 'https://randomuser.me/api/portraits/men/1.jpg'),
  ('jane@example.com', 'Jane Smith', 'https://randomuser.me/api/portraits/women/2.jpg'),
  ('bob@example.com', 'Bob Johnson', 'https://randomuser.me/api/portraits/men/3.jpg');

-- Insert sample teams
INSERT INTO public.teams (name, description)
VALUES
  ('Engineering', 'Software development team'),
  ('Marketing', 'Brand and marketing team'),
  ('Design', 'UI/UX design team');

-- Insert sample posts
-- We'll use subqueries to get the IDs since we're using DEFAULT for the primary keys
INSERT INTO public.posts (title, content, user_id, team_id)
SELECT 
  'First Post',
  'This is the content of the first post.',
  (SELECT id FROM public.users WHERE email = 'john@example.com'),
  (SELECT id FROM public.teams WHERE name = 'Engineering');

INSERT INTO public.posts (title, content, user_id, team_id)
SELECT 
  'Second Post',
  'This is the content of the second post.',
  (SELECT id FROM public.users WHERE email = 'jane@example.com'),
  (SELECT id FROM public.teams WHERE name = 'Marketing');

INSERT INTO public.posts (title, content, user_id, team_id)
SELECT 
  'Third Post',
  'This is the content of the third post.',
  (SELECT id FROM public.users WHERE email = 'bob@example.com'),
  (SELECT id FROM public.teams WHERE name = 'Design');

INSERT INTO public.posts (title, content, user_id, team_id)
SELECT 
  'Fourth Post',
  'This is the content of the fourth post.',
  (SELECT id FROM public.users WHERE email = 'john@example.com'),
  (SELECT id FROM public.teams WHERE name = 'Engineering');

INSERT INTO public.posts (title, content, user_id, team_id)
SELECT 
  'Fifth Post',
  'This is the content of the fifth post.',
  (SELECT id FROM public.users WHERE email = 'jane@example.com'),
  (SELECT id FROM public.teams WHERE name = 'Design'); 
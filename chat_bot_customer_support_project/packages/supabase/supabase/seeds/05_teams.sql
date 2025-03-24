/*
05_teams.sql
Inserts teams for multi-team organizations and client organizations.
*/

/* Teams for Multi-Team Organization */
INSERT INTO teams (id, organization_id, name, website) VALUES
  ('44444444-5555-6666-7777-888888888888', '11111111-2222-3333-4444-555555555555', 'Marketing Team', 'https://marketing.example.com'),
  ('55555555-6666-7777-8888-999999999999', '11111111-2222-3333-4444-555555555555', 'Design Team', 'https://design.example.com'),
  ('66666666-7777-8888-9999-aaaaaaaaaaaa', '11111111-2222-3333-4444-555555555555', 'Development Team', 'https://dev.example.com')
ON CONFLICT (id) DO NOTHING;

/* Teams for Client Organization (internal teams) */
INSERT INTO teams (id, organization_id, name, website) VALUES
  ('77777777-8888-9999-aaaa-bbbbbbbbbbbb', '33333333-4444-5555-6666-777777777777', 'Client Success Team', 'https://success.example.com'),
  ('88888888-9999-aaaa-bbbb-cccccccccccc', '33333333-4444-5555-6666-777777777777', 'Client Support Team', 'https://support.example.com'); 
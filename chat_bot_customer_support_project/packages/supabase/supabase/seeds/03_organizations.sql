/*
03_organizations.sql
Inserts test organizations into the organizations table.
*/

/* Organization with multiple teams */
INSERT INTO organizations (id, name, billing_email, credits_balance, auto_recharge_enabled, auto_recharge_threshold, auto_recharge_amount) VALUES
  ('11111111-2222-3333-4444-555555555555', 'Multi-Team Organization', 'billing@multi-team.com', 1000000, true, 100000, 500000)
ON CONFLICT (id) DO NOTHING;

/* Organization with no teams */
INSERT INTO organizations (id, name, billing_email, credits_balance, auto_recharge_enabled, auto_recharge_threshold, auto_recharge_amount) VALUES
  ('22222222-3333-4444-5555-666666666666', 'No Teams Organization', 'billing@no-teams.com', 1000000, true, 100000, 500000)
ON CONFLICT (id) DO NOTHING;

/* Client organization (with internal team) */
INSERT INTO organizations (id, name, billing_email, credits_balance, auto_recharge_enabled, auto_recharge_threshold, auto_recharge_amount) VALUES
  ('33333333-4444-5555-6666-777777777777', 'Client Organization', 'billing@client-org.com', 1000000, true, 100000, 500000)
ON CONFLICT (id) DO NOTHING; 
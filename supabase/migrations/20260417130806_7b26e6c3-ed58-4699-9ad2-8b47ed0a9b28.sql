-- ============================================================
-- Schema
-- ============================================================
create table public.scenarios (
  scenario_id      uuid primary key default gen_random_uuid(),
  scenario_title   text not null,
  starting_node_id uuid not null,
  created_at       timestamptz not null default now()
);

create table public.dialogue_nodes (
  node_id              uuid primary key default gen_random_uuid(),
  scenario_id          uuid not null references public.scenarios(scenario_id) on delete cascade,
  client_text          text not null,
  options_payload_json jsonb not null,
  created_at           timestamptz not null default now()
);
create index dialogue_nodes_scenario_idx on public.dialogue_nodes(scenario_id);

create table public.agent_simulations (
  simulation_id     uuid primary key default gen_random_uuid(),
  scenario_id       uuid not null references public.scenarios(scenario_id) on delete cascade,
  agent_id          uuid,
  final_trust_score int not null check (final_trust_score between 0 and 100),
  result_status     text not null check (result_status in
    ('deal_closed_strong','deal_closed_weak','client_walked_away','compliance_violation','timeout')),
  turns_taken       int not null default 0,
  created_at        timestamptz not null default now()
);
create index agent_simulations_scenario_idx on public.agent_simulations(scenario_id);

create table public.simulation_paths (
  path_id                     uuid primary key default gen_random_uuid(),
  simulation_id               uuid not null references public.agent_simulations(simulation_id) on delete cascade,
  node_id                     uuid not null references public.dialogue_nodes(node_id),
  selected_option_index       int not null,
  time_to_decide_milliseconds int not null,
  step_index                  int not null default 0,
  created_at                  timestamptz not null default now()
);
create index simulation_paths_sim_idx on public.simulation_paths(simulation_id);

-- ============================================================
-- RLS
-- ============================================================
alter table public.scenarios         enable row level security;
alter table public.dialogue_nodes    enable row level security;
alter table public.agent_simulations enable row level security;
alter table public.simulation_paths  enable row level security;

-- Training content is public read
create policy "scenarios_public_read"
  on public.scenarios for select
  using (true);

create policy "dialogue_nodes_public_read"
  on public.dialogue_nodes for select
  using (true);

-- Telemetry: anyone can submit (no auth wired yet); no updates/deletes
create policy "agent_simulations_public_insert"
  on public.agent_simulations for insert
  with check (true);

create policy "simulation_paths_public_insert"
  on public.simulation_paths for insert
  with check (true);

-- ============================================================
-- Seed: "Overcoming ULIP Objections"
-- ============================================================
do $$
declare
  v_scenario_id uuid := '11111111-1111-1111-1111-111111111111';
  n1 uuid := 'a0000001-0000-0000-0000-000000000001';
  n2 uuid := 'a0000001-0000-0000-0000-000000000002';
  n3 uuid := 'a0000001-0000-0000-0000-000000000003';
  n4 uuid := 'a0000001-0000-0000-0000-000000000004';
  n5 uuid := 'a0000001-0000-0000-0000-000000000005';
  n6 uuid := 'a0000001-0000-0000-0000-000000000006';
  n7 uuid := 'a0000001-0000-0000-0000-000000000007';
begin
  insert into public.scenarios (scenario_id, scenario_title, starting_node_id)
  values (v_scenario_id, 'Overcoming ULIP Objections', n1);

  insert into public.dialogue_nodes (node_id, scenario_id, client_text, options_payload_json) values
  (n1, v_scenario_id,
   'I''m not sure about this policy. The premiums seem quite high for an investment-linked product.',
   jsonb_build_array(
     jsonb_build_object('text','I understand. Let''s look at how the flexibility matches your goals.','type','empathetic','trust_delta',10,'next_node_id',n2::text),
     jsonb_build_object('text','Actually, if you calculate the ROI over 20 years, it''s efficient.','type','data','trust_delta',5,'next_node_id',n3::text),
     jsonb_build_object('text','You need to sign now to lock in this rate before the promotion ends.','type','hardsell','trust_delta',-20,'next_node_id',n4::text)
   )),
  (n2, v_scenario_id,
   'Okay, that''s fair. Honestly my main goal is my daughter''s university fund in 15 years. Will this actually grow enough?',
   jsonb_build_array(
     jsonb_build_object('text','Great — let''s map projected fund value against tuition inflation so you can see the gap clearly.','type','data','trust_delta',12,'next_node_id',n5::text),
     jsonb_build_object('text','Most parents I work with feel exactly this. Let''s walk through a goal-based plan together.','type','empathetic','trust_delta',8,'next_node_id',n5::text),
     jsonb_build_object('text','Don''t worry about the numbers, just trust me — it always works out.','type','compliance','trust_delta',-25,'next_node_id',n6::text,'is_violation',true)
   )),
  (n3, v_scenario_id,
   '20 years is a long time. What if the market drops? I can''t afford to lose my premiums.',
   jsonb_build_array(
     jsonb_build_object('text','That concern is valid — let me show you the fund-switching feature that lets us de-risk near maturity.','type','empathetic','trust_delta',12,'next_node_id',n5::text),
     jsonb_build_object('text','Historically the underlying funds have averaged 6–8% over rolling 20-year periods, even through downturns.','type','data','trust_delta',6,'next_node_id',n5::text),
     jsonb_build_object('text','I can guarantee you won''t lose any money on this product.','type','compliance','trust_delta',-40,'next_node_id',null,'is_violation',true)
   )),
  (n4, v_scenario_id,
   'Lock in? That feels like pressure. I came here for advice, not a sales pitch.',
   jsonb_build_array(
     jsonb_build_object('text','You''re absolutely right, I apologise. Let''s slow down and revisit your goals first.','type','empathetic','trust_delta',15,'next_node_id',n2::text),
     jsonb_build_object('text','The promotion really does end Friday — here are the numbers proving the savings.','type','data','trust_delta',-5,'next_node_id',n6::text),
     jsonb_build_object('text','Look, every client says that. Just sign and you''ll thank me later.','type','hardsell','trust_delta',-30,'next_node_id',null)
   )),
  (n5, v_scenario_id,
   'Okay, I''m warming up to this. Before I commit — what are the actual fees and the lock-in period?',
   jsonb_build_array(
     jsonb_build_object('text','Full transparency: here''s the fee schedule and the 5-year surrender charge table side by side.','type','data','trust_delta',15,'next_node_id',n7::text),
     jsonb_build_object('text','I''ll walk you through every charge personally before you sign anything — no surprises.','type','empathetic','trust_delta',10,'next_node_id',n7::text),
     jsonb_build_object('text','The fees are negligible, don''t even worry about them.','type','compliance','trust_delta',-35,'next_node_id',null,'is_violation',true)
   )),
  (n6, v_scenario_id,
   'I think I need time to consider. Can you give me space to think?',
   jsonb_build_array(
     jsonb_build_object('text','Of course. Take a few days, and I''ll send a written summary you can review with family.','type','empathetic','trust_delta',10,'next_node_id',null),
     jsonb_build_object('text','I respect that. Here''s a one-page comparison sheet to support your decision.','type','data','trust_delta',8,'next_node_id',null),
     jsonb_build_object('text','If you walk out now, this rate is gone forever.','type','hardsell','trust_delta',-25,'next_node_id',null)
   )),
  (n7, v_scenario_id,
   'That''s exactly the clarity I needed. I think I''m ready to move forward — what''s next?',
   jsonb_build_array(
     jsonb_build_object('text','Let''s complete a full needs analysis form so the policy structure truly fits your situation.','type','empathetic','trust_delta',10,'next_node_id',null),
     jsonb_build_object('text','I''ll prepare the proposal illustration and email it within 24 hours for your review.','type','data','trust_delta',8,'next_node_id',null)
   ));
end $$;
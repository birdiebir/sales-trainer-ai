-- ============================================================
-- Interactive Client Scenario — Supabase Schema
-- Apply via Lovable Cloud once enabled, or directly in Supabase SQL editor.
-- ============================================================

-- Scenarios catalog
create table if not exists public.scenarios (
  scenario_id        uuid primary key default gen_random_uuid(),
  scenario_title     text not null,
  starting_node_id   uuid not null,
  created_at         timestamptz not null default now()
);

-- Dialogue tree nodes (options stored as JSONB for flexible branching)
create table if not exists public.dialogue_nodes (
  node_id              uuid primary key default gen_random_uuid(),
  scenario_id          uuid not null references public.scenarios(scenario_id) on delete cascade,
  client_text          text not null,
  options_payload_json jsonb not null,
  -- options_payload_json shape:
  -- [{ "text": "...", "type": "empathetic|data|hardsell|compliance",
  --    "trust_delta": 10, "next_node_id": "uuid|null", "is_violation": false }]
  created_at           timestamptz not null default now()
);
create index if not exists dialogue_nodes_scenario_idx on public.dialogue_nodes(scenario_id);

-- Completed simulation runs (one row per attempt)
create table if not exists public.agent_simulations (
  simulation_id      uuid primary key default gen_random_uuid(),
  scenario_id        uuid not null references public.scenarios(scenario_id) on delete cascade,
  agent_id           uuid,                       -- optional: auth.uid() once auth is wired
  final_trust_score  int not null check (final_trust_score between 0 and 100),
  result_status      text not null check (result_status in
    ('deal_closed_strong','deal_closed_weak','client_walked_away','compliance_violation','timeout')),
  turns_taken        int not null default 0,
  created_at         timestamptz not null default now()
);
create index if not exists agent_simulations_scenario_idx on public.agent_simulations(scenario_id);
create index if not exists agent_simulations_agent_idx on public.agent_simulations(agent_id);

-- Per-turn telemetry (one row per decision)
create table if not exists public.simulation_paths (
  path_id                     uuid primary key default gen_random_uuid(),
  simulation_id               uuid not null references public.agent_simulations(simulation_id) on delete cascade,
  node_id                     uuid not null references public.dialogue_nodes(node_id),
  selected_option_index       int not null,
  time_to_decide_milliseconds int not null,
  created_at                  timestamptz not null default now()
);
create index if not exists simulation_paths_sim_idx on public.simulation_paths(simulation_id);

-- ============================================================
-- RLS — enable and allow agents to read scenarios/nodes,
-- and to insert/read only their own simulations + paths.
-- ============================================================
alter table public.scenarios         enable row level security;
alter table public.dialogue_nodes    enable row level security;
alter table public.agent_simulations enable row level security;
alter table public.simulation_paths  enable row level security;

create policy "scenarios_read_all"      on public.scenarios         for select using (true);
create policy "dialogue_nodes_read_all" on public.dialogue_nodes    for select using (true);

create policy "own_sims_select" on public.agent_simulations
  for select using (agent_id = auth.uid());
create policy "own_sims_insert" on public.agent_simulations
  for insert with check (agent_id = auth.uid());

create policy "own_paths_select" on public.simulation_paths
  for select using (exists (
    select 1 from public.agent_simulations s
    where s.simulation_id = simulation_paths.simulation_id and s.agent_id = auth.uid()
  ));
create policy "own_paths_insert" on public.simulation_paths
  for insert with check (exists (
    select 1 from public.agent_simulations s
    where s.simulation_id = simulation_paths.simulation_id and s.agent_id = auth.uid()
  ));

-- ============================================================
-- Seed: "Overcoming ULIP Objections"
-- (Mirrors src/simulation/scenarios.ts — keep in sync.)
-- ============================================================
-- INSERT scenarios + dialogue_nodes here once UUIDs are finalised.

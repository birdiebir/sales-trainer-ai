-- Ensure schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Read access for scenario content
GRANT SELECT ON public.scenarios TO anon, authenticated;
GRANT SELECT ON public.dialogue_nodes TO anon, authenticated;

-- Insert access for telemetry (RLS policies already permit the rows)
GRANT INSERT ON public.agent_simulations TO anon, authenticated;
GRANT INSERT ON public.simulation_paths TO anon, authenticated;

-- Allow reading back the inserted simulation_id via .select() after insert
GRANT SELECT ON public.agent_simulations TO anon, authenticated;
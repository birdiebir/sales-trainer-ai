-- Grant table privileges so PostgREST can hit the RLS policies
GRANT SELECT ON public.scenarios TO anon, authenticated;
GRANT SELECT ON public.dialogue_nodes TO anon, authenticated;
GRANT INSERT ON public.agent_simulations TO anon, authenticated;
GRANT INSERT ON public.simulation_paths TO anon, authenticated;
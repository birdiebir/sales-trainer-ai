import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DialogueOption, Scenario } from "./types";

interface DialogueNodeRow {
  node_id: string;
  client_text: string;
  options_payload_json: DialogueOption[];
}

interface ScenarioRow {
  scenario_id: string;
  scenario_title: string;
  starting_node_id: string;
}

interface UseScenarioResult {
  scenario: Scenario | null;
  loading: boolean;
  error: string | null;
}

/**
 * Loads a scenario + all its dialogue nodes from Lovable Cloud
 * and assembles them into the in-memory Scenario shape the
 * simulation engine expects.
 */
export function useScenarioLoader(scenarioId: string): UseScenarioResult {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const [scenarioRes, nodesRes] = await Promise.all([
        supabase
          .from("scenarios")
          .select("scenario_id, scenario_title, starting_node_id")
          .eq("scenario_id", scenarioId)
          .maybeSingle(),
        supabase
          .from("dialogue_nodes")
          .select("node_id, client_text, options_payload_json")
          .eq("scenario_id", scenarioId),
      ]);

      if (cancelled) return;

      if (scenarioRes.error) {
        setError(scenarioRes.error.message);
        setLoading(false);
        return;
      }
      if (nodesRes.error) {
        setError(nodesRes.error.message);
        setLoading(false);
        return;
      }
      if (!scenarioRes.data) {
        setError("Scenario not found.");
        setLoading(false);
        return;
      }

      const scenarioRow = scenarioRes.data as ScenarioRow;
      const nodeRows = (nodesRes.data ?? []) as DialogueNodeRow[];

      const nodes: Scenario["nodes"] = {};
      for (const row of nodeRows) {
        nodes[row.node_id] = {
          node_id: row.node_id,
          client_text: row.client_text,
          options_payload_json: row.options_payload_json,
        };
      }

      setScenario({
        scenario_id: scenarioRow.scenario_id,
        scenario_title: scenarioRow.scenario_title,
        starting_node_id: scenarioRow.starting_node_id,
        nodes,
      });
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [scenarioId]);

  return { scenario, loading, error };
}

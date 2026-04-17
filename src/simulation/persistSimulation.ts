import { supabase } from "@/integrations/supabase/client";
import type { PathStep, ResultStatus } from "./types";

interface PersistArgs {
  scenarioId: string;
  finalTrustScore: number;
  resultStatus: ResultStatus;
  turnsTaken: number;
  path: PathStep[];
}

/**
 * Persist a completed simulation + its per-turn telemetry.
 * Runs anonymously for now (agent_id stays null until auth is wired).
 * Returns the new simulation_id, or null on failure.
 */
export async function persistSimulation({
  scenarioId,
  finalTrustScore,
  resultStatus,
  turnsTaken,
  path,
}: PersistArgs): Promise<string | null> {
  const { data: simRow, error: simErr } = await supabase
    .from("agent_simulations")
    .insert({
      scenario_id: scenarioId,
      final_trust_score: Math.round(finalTrustScore),
      result_status: resultStatus,
      turns_taken: turnsTaken,
    })
    .select("simulation_id")
    .single();

  if (simErr || !simRow) {
    console.error("[persistSimulation] failed to insert simulation:", simErr);
    return null;
  }

  if (path.length > 0) {
    const rows = path.map((step, i) => ({
      simulation_id: simRow.simulation_id,
      node_id: step.node_id,
      selected_option_index: step.selected_option_index,
      time_to_decide_milliseconds: step.time_to_decide_ms,
      step_index: i,
    }));

    const { error: pathErr } = await supabase.from("simulation_paths").insert(rows);
    if (pathErr) {
      console.error("[persistSimulation] failed to insert paths:", pathErr);
    }
  }

  return simRow.simulation_id;
}

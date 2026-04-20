export type OptionType = "empathetic" | "data" | "hardsell" | "compliance";

export interface DialogueOption {
  text: string;
  type: OptionType;
  trust_delta: number;
  next_node_id: string | null; // null = ends scenario
  is_violation?: boolean;
}

export interface DialogueNode {
  node_id: string;
  client_text: string;
  options_payload_json: DialogueOption[];
}

export interface Scenario {
  scenario_id: string;
  scenario_title: string;
  starting_node_id: string;
  client_name?: string;
  nodes: Record<string, DialogueNode>;
}

export type ResultStatus =
  | "deal_closed_strong"
  | "deal_closed_weak"
  | "client_walked_away"
  | "compliance_violation"
  | "timeout";

export interface PathStep {
  node_id: string;
  selected_option_index: number;
  selected_option_text: string;
  trust_delta: number;
  time_to_decide_ms: number;
}

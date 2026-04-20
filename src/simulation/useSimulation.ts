import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  DialogueOption,
  PathStep,
  ResultStatus,
  Scenario,
} from "./types";

export const TURN_SECONDS = 30;
export const MAX_TURNS = 10;
export const STARTING_TRUST = 50;

export interface ChatMessage {
  id: string;
  side: "client" | "agent";
  text: string;
  /** Absolute epoch ms — monotonically increasing across the conversation. */
  timestamp: number;
}

/**
 * Produces a realistic conversational delay in ms (30s–3min) so timestamps
 * always march forward without looking mechanical.
 */
function nextTimestamp(prev: number, side: "client" | "agent"): number {
  // Agents type faster than the client reflects; keep delay natural.
  const minMs = side === "agent" ? 20_000 : 45_000;   // 20s / 45s
  const maxMs = side === "agent" ? 90_000 : 180_000;  // 1.5m / 3m
  const delay = Math.floor(minMs + Math.random() * (maxMs - minMs));
  return prev + delay;
}

interface SimulationState {
  trustScore: number;
  currentNodeId: string | null;
  turnsTaken: number;
  messages: ChatMessage[];
  path: PathStep[];
  status: "idle" | "running" | "ended";
  result: ResultStatus | null;
  secondsLeft: number;
}

export function useSimulation(scenario: Scenario) {
  const [state, setState] = useState<SimulationState>(() => {
    const startTs = Date.now();
    return {
      trustScore: STARTING_TRUST,
      currentNodeId: scenario.starting_node_id,
      turnsTaken: 0,
      messages: [
        {
          id: `m-${scenario.starting_node_id}`,
          side: "client",
          text: scenario.nodes[scenario.starting_node_id].client_text,
          timestamp: startTs,
        },
      ],
      path: [],
      status: "running",
      result: null,
      secondsLeft: TURN_SECONDS,
    };
  });

  const turnStartRef = useRef<number>(Date.now());
  const tickRef = useRef<number | null>(null);

  const currentNode = useMemo(
    () => (state.currentNodeId ? scenario.nodes[state.currentNodeId] : null),
    [state.currentNodeId, scenario.nodes],
  );

  const endSimulation = useCallback(
    (result: ResultStatus, finalTrust?: number) => {
      setState((s) => ({
        ...s,
        status: "ended",
        result,
        trustScore: finalTrust ?? s.trustScore,
      }));
    },
    [],
  );

  // Timer tick
  useEffect(() => {
    if (state.status !== "running") return;
    if (tickRef.current) window.clearInterval(tickRef.current);
    turnStartRef.current = Date.now();
    setState((s) => ({ ...s, secondsLeft: TURN_SECONDS }));

    tickRef.current = window.setInterval(() => {
      setState((s) => {
        if (s.status !== "running") return s;
        const elapsed = (Date.now() - turnStartRef.current) / 1000;
        const left = Math.max(0, TURN_SECONDS - elapsed);
        if (left <= 0) {
          return { ...s, secondsLeft: 0, status: "ended", result: "timeout" };
        }
        return { ...s, secondsLeft: left };
      });
    }, 100) as unknown as number;

    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
    // re-run timer on each new node
  }, [state.currentNodeId, state.status]);

  const selectOption = useCallback(
    (optionIndex: number) => {
      setState((s) => {
        if (s.status !== "running" || !s.currentNodeId) return s;
        const node = scenario.nodes[s.currentNodeId];
        const option: DialogueOption | undefined =
          node.options_payload_json[optionIndex];
        if (!option) return s;

        const timeToDecide = Date.now() - turnStartRef.current;
        const newTrust = Math.max(0, Math.min(100, s.trustScore + option.trust_delta));
        const nextTurns = s.turnsTaken + 1;

        const pathStep: PathStep = {
          node_id: s.currentNodeId,
          selected_option_index: optionIndex,
          selected_option_text: option.text,
          trust_delta: option.trust_delta,
          time_to_decide_ms: timeToDecide,
        };

        const agentMessage: ChatMessage = {
          id: `m-agent-${nextTurns}`,
          side: "agent",
          text: option.text,
        };

        // End conditions in priority order
        if (option.is_violation) {
          return {
            ...s,
            trustScore: newTrust,
            turnsTaken: nextTurns,
            messages: [...s.messages, agentMessage],
            path: [...s.path, pathStep],
            status: "ended",
            result: "compliance_violation",
            currentNodeId: null,
          };
        }
        if (newTrust <= 0) {
          return {
            ...s,
            trustScore: 0,
            turnsTaken: nextTurns,
            messages: [...s.messages, agentMessage],
            path: [...s.path, pathStep],
            status: "ended",
            result: "client_walked_away",
            currentNodeId: null,
          };
        }

        const nextId = option.next_node_id;
        // Natural end of branch or turn limit reached
        if (!nextId || nextTurns >= MAX_TURNS) {
          const result: ResultStatus =
            newTrust >= 65 ? "deal_closed_strong" : "deal_closed_weak";
          return {
            ...s,
            trustScore: newTrust,
            turnsTaken: nextTurns,
            messages: [...s.messages, agentMessage],
            path: [...s.path, pathStep],
            status: "ended",
            result,
            currentNodeId: null,
          };
        }

        const nextNode = scenario.nodes[nextId];
        const clientMessage: ChatMessage = {
          id: `m-client-${nextId}-${nextTurns}`,
          side: "client",
          text: nextNode.client_text,
        };

        return {
          ...s,
          trustScore: newTrust,
          turnsTaken: nextTurns,
          messages: [...s.messages, agentMessage, clientMessage],
          path: [...s.path, pathStep],
          currentNodeId: nextId,
        };
      });
    },
    [scenario.nodes],
  );

  const reset = useCallback(() => {
    setState({
      trustScore: STARTING_TRUST,
      currentNodeId: scenario.starting_node_id,
      turnsTaken: 0,
      messages: [
        {
          id: `m-${scenario.starting_node_id}-${Date.now()}`,
          side: "client",
          text: scenario.nodes[scenario.starting_node_id].client_text,
        },
      ],
      path: [],
      status: "running",
      result: null,
      secondsLeft: TURN_SECONDS,
    });
  }, [scenario]);

  return {
    ...state,
    currentNode,
    selectOption,
    reset,
    endSimulation,
    turnsRemaining: MAX_TURNS - state.turnsTaken,
  };
}

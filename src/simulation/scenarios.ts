import type { Scenario } from "./types";

/**
 * Seed scenario: "Overcoming ULIP Objections"
 * A 6-node branching tree exercising every option type and end condition.
 */
export const ulipScenario: Scenario = {
  scenario_id: "11111111-1111-1111-1111-111111111111",
  scenario_title: "Overcoming ULIP Objections",
  starting_node_id: "node-1",
  nodes: {
    "node-1": {
      node_id: "node-1",
      client_text:
        "I'm not sure about this policy. The premiums seem quite high for an investment-linked product.",
      options_payload_json: [
        {
          text: "I understand. Let's look at how the flexibility matches your goals.",
          type: "empathetic",
          trust_delta: 10,
          next_node_id: "node-2",
        },
        {
          text: "Actually, if you calculate the ROI over 20 years, it's efficient.",
          type: "data",
          trust_delta: 5,
          next_node_id: "node-3",
        },
        {
          text: "You need to sign now to lock in this rate before the promotion ends.",
          type: "hardsell",
          trust_delta: -20,
          next_node_id: "node-4",
        },
      ],
    },
    "node-2": {
      node_id: "node-2",
      client_text:
        "Okay, that's fair. Honestly my main goal is my daughter's university fund in 15 years. Will this actually grow enough?",
      options_payload_json: [
        {
          text: "Great — let's map projected fund value against tuition inflation so you can see the gap clearly.",
          type: "data",
          trust_delta: 12,
          next_node_id: "node-5",
        },
        {
          text: "Most parents I work with feel exactly this. Let's walk through a goal-based plan together.",
          type: "empathetic",
          trust_delta: 8,
          next_node_id: "node-5",
        },
        {
          text: "Don't worry about the numbers, just trust me — it always works out.",
          type: "compliance",
          trust_delta: -25,
          next_node_id: "node-6",
          is_violation: true,
        },
      ],
    },
    "node-3": {
      node_id: "node-3",
      client_text:
        "20 years is a long time. What if the market drops? I can't afford to lose my premiums.",
      options_payload_json: [
        {
          text: "That concern is valid — let me show you the fund-switching feature that lets us de-risk near maturity.",
          type: "empathetic",
          trust_delta: 12,
          next_node_id: "node-5",
        },
        {
          text: "Historically the underlying funds have averaged 6–8% over rolling 20-year periods, even through downturns.",
          type: "data",
          trust_delta: 6,
          next_node_id: "node-5",
        },
        {
          text: "I can guarantee you won't lose any money on this product.",
          type: "compliance",
          trust_delta: -40,
          next_node_id: null,
          is_violation: true,
        },
      ],
    },
    "node-4": {
      node_id: "node-4",
      client_text:
        "Lock in? That feels like pressure. I came here for advice, not a sales pitch.",
      options_payload_json: [
        {
          text: "You're absolutely right, I apologise. Let's slow down and revisit your goals first.",
          type: "empathetic",
          trust_delta: 15,
          next_node_id: "node-2",
        },
        {
          text: "The promotion really does end Friday — here are the numbers proving the savings.",
          type: "data",
          trust_delta: -5,
          next_node_id: "node-6",
        },
        {
          text: "Look, every client says that. Just sign and you'll thank me later.",
          type: "hardsell",
          trust_delta: -30,
          next_node_id: null,
        },
      ],
    },
    "node-5": {
      node_id: "node-5",
      client_text:
        "Okay, I'm warming up to this. Before I commit — what are the actual fees and the lock-in period?",
      options_payload_json: [
        {
          text: "Full transparency: here's the fee schedule and the 5-year surrender charge table side by side.",
          type: "data",
          trust_delta: 15,
          next_node_id: "node-7",
        },
        {
          text: "I'll walk you through every charge personally before you sign anything — no surprises.",
          type: "empathetic",
          trust_delta: 10,
          next_node_id: "node-7",
        },
        {
          text: "The fees are negligible, don't even worry about them.",
          type: "compliance",
          trust_delta: -35,
          next_node_id: null,
          is_violation: true,
        },
      ],
    },
    "node-6": {
      node_id: "node-6",
      client_text:
        "I think I need time to consider. Can you give me space to think?",
      options_payload_json: [
        {
          text: "Of course. Take a few days, and I'll send a written summary you can review with family.",
          type: "empathetic",
          trust_delta: 10,
          next_node_id: null,
        },
        {
          text: "I respect that. Here's a one-page comparison sheet to support your decision.",
          type: "data",
          trust_delta: 8,
          next_node_id: null,
        },
        {
          text: "If you walk out now, this rate is gone forever.",
          type: "hardsell",
          trust_delta: -25,
          next_node_id: null,
        },
      ],
    },
    "node-7": {
      node_id: "node-7",
      client_text:
        "That's exactly the clarity I needed. I think I'm ready to move forward — what's next?",
      options_payload_json: [
        {
          text: "Let's complete a full needs analysis form so the policy structure truly fits your situation.",
          type: "empathetic",
          trust_delta: 10,
          next_node_id: null,
        },
        {
          text: "I'll prepare the proposal illustration and email it within 24 hours for your review.",
          type: "data",
          trust_delta: 8,
          next_node_id: null,
        },
      ],
    },
  },
};

-- Add metadata columns for dashboard + briefing pages
ALTER TABLE public.scenarios
  ADD COLUMN IF NOT EXISTS difficulty text NOT NULL DEFAULT 'medium'
    CHECK (difficulty IN ('easy','medium','hard')),
  ADD COLUMN IF NOT EXISTS client_name text NOT NULL DEFAULT 'Client',
  ADD COLUMN IF NOT EXISTS client_background text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS objective text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS estimated_minutes int NOT NULL DEFAULT 5;

-- Backfill first scenario with rich metadata
UPDATE public.scenarios
SET
  difficulty = 'medium',
  client_name = 'Mrs. Tan',
  client_background = 'Mrs. Tan, 52, a cautious retail manager nearing retirement. She has heard mixed reviews about ULIPs from friends and is worried about market-linked risk.',
  objective = 'Address her objections about ULIP volatility and fees, and guide her toward a confident, informed decision — without overselling.',
  estimated_minutes = 5
WHERE scenario_id = '11111111-1111-1111-1111-111111111111';

-- Seed a second scenario: "Explaining Policy Exclusions"
INSERT INTO public.scenarios (scenario_id, scenario_title, starting_node_id, difficulty, client_name, client_background, objective, estimated_minutes)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Explaining Policy Exclusions',
  '22222222-0000-0000-0000-00000000000a',
  'hard',
  'Mr. Lin',
  'Mr. Lin, 45, a small business owner comparing three term-life quotes. He is detail-oriented and has already flagged concerns about suicide clauses and pre-existing conditions.',
  'Walk him through policy exclusions honestly and compliantly, so he leaves informed — even if he needs time to think.',
  6
)
ON CONFLICT (scenario_id) DO NOTHING;

-- Seed dialogue nodes for scenario 2
INSERT INTO public.dialogue_nodes (node_id, scenario_id, client_text, options_payload_json) VALUES
  ('22222222-0000-0000-0000-00000000000a', '22222222-2222-2222-2222-222222222222',
   'Before I sign anything — I read online that if something happens in the first two years, the policy might not pay out. Is that true?',
   '[
     {"text":"That''s a fair concern. Most term policies do have a 2-year contestability and suicide clause — let me walk you through exactly what they mean for you.","type":"empathetic","trust_delta":12,"next_node_id":"22222222-0000-0000-0000-00000000000b","is_violation":false},
     {"text":"Statistically, under 0.3% of claims are denied on contestability grounds. You''re overthinking this.","type":"data","trust_delta":-8,"next_node_id":"22222222-0000-0000-0000-00000000000c","is_violation":false},
     {"text":"Honestly, don''t worry about the fine print — nobody reads it anyway. Let''s just get you covered today.","type":"hardsell","trust_delta":-25,"next_node_id":null,"is_violation":true}
   ]'::jsonb),

  ('22222222-0000-0000-0000-00000000000b', '22222222-2222-2222-2222-222222222222',
   'Okay, that sounds reasonable. What about my old back injury? I had surgery six years ago — will they use that to reject a claim?',
   '[
     {"text":"Since you''re disclosing it now, and it''s beyond the look-back window, the underwriter will assess it upfront. Once accepted, they can''t retroactively use it to deny a valid claim.","type":"compliance","trust_delta":15,"next_node_id":"22222222-0000-0000-0000-00000000000d","is_violation":false},
     {"text":"Just don''t mention it on the form and you''ll be fine — they rarely check.","type":"hardsell","trust_delta":-30,"next_node_id":null,"is_violation":true},
     {"text":"Back injuries are usually a non-issue. I wouldn''t stress about it.","type":"empathetic","trust_delta":-5,"next_node_id":"22222222-0000-0000-0000-00000000000d","is_violation":false}
   ]'::jsonb),

  ('22222222-0000-0000-0000-00000000000c', '22222222-2222-2222-2222-222222222222',
   'That number doesn''t really reassure me. I want to actually understand what''s excluded, not just the odds.',
   '[
     {"text":"You''re right, I led with numbers instead of clarity. Let me pull up the exclusions page and go through each one with you.","type":"empathetic","trust_delta":15,"next_node_id":"22222222-0000-0000-0000-00000000000b","is_violation":false},
     {"text":"Fine — the main ones are suicide in year one, material misrepresentation, and pre-existing conditions not disclosed. Any of those a concern?","type":"compliance","trust_delta":8,"next_node_id":"22222222-0000-0000-0000-00000000000b","is_violation":false}
   ]'::jsonb),

  ('22222222-0000-0000-0000-00000000000d', '22222222-2222-2222-2222-222222222222',
   'I appreciate the honesty. Can I take the brochure home and think about it for a couple of days?',
   '[
     {"text":"Of course. Take your time — I''d rather you sign when you''re genuinely comfortable. I''ll follow up on Friday if that works.","type":"empathetic","trust_delta":12,"next_node_id":null,"is_violation":false},
     {"text":"Premiums might be reassessed next week — it''s better to lock in today. Shall we proceed?","type":"hardsell","trust_delta":-15,"next_node_id":null,"is_violation":false},
     {"text":"Absolutely. Here''s my card and the full product summary. No pressure from my end.","type":"compliance","trust_delta":10,"next_node_id":null,"is_violation":false}
   ]'::jsonb)
ON CONFLICT (node_id) DO NOTHING;
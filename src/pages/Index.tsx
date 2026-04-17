import { useEffect, useRef, useState } from "react";
import clientAvatar from "@/assets/client-avatar.jpg";
import { TrustBar } from "@/components/simulation/TrustBar";
import { ChatLog } from "@/components/simulation/ChatLog";
import { ResponseDeck } from "@/components/simulation/ResponseDeck";
import { SummaryModal } from "@/components/simulation/SummaryModal";
import { useSimulation } from "@/simulation/useSimulation";
import { useScenarioLoader } from "@/simulation/useScenarioLoader";
import { persistSimulation } from "@/simulation/persistSimulation";
import { Loader2, AlertTriangle } from "lucide-react";

const CLIENT_NAME = "Mrs. Tan";
const SCENARIO_ID = "11111111-1111-1111-1111-111111111111";

const Index = () => {
  // SEO basics
  useEffect(() => {
    document.title = "Interactive Client Scenario — Life Insurance Sales Sim";
    const desc =
      "Train sales judgment through a branching client dialogue. Mobile-first messaging UI with trust scoring and timed responses.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.origin + "/");
  }, []);

  const { scenario, loading, error } = useScenarioLoader(SCENARIO_ID);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm">Loading scenario…</p>
      </main>
    );
  }

  if (error || !scenario) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <h1 className="text-lg font-semibold">Couldn't load scenario</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error ?? "Scenario not found in the database."}
        </p>
      </main>
    );
  }

  return <SimulationView scenario={scenario} />;
};

function SimulationView({ scenario }: { scenario: NonNullable<ReturnType<typeof useScenarioLoader>["scenario"]> }) {
  const sim = useSimulation(scenario);
  const [showSummary, setShowSummary] = useState(false);
  const persistedRef = useRef<string | null>(null);

  // Persist completed run + open summary modal
  useEffect(() => {
    if (sim.status !== "ended" || !sim.result) {
      setShowSummary(false);
      return;
    }

    const runKey = `${scenario.scenario_id}:${sim.result}:${sim.path.length}:${sim.trustScore}`;
    if (persistedRef.current !== runKey) {
      persistedRef.current = runKey;
      persistSimulation({
        scenarioId: scenario.scenario_id,
        finalTrustScore: sim.trustScore,
        resultStatus: sim.result,
        turnsTaken: sim.path.length,
        path: sim.path,
      });
    }

    const t = setTimeout(() => setShowSummary(true), 600);
    return () => clearTimeout(t);
  }, [sim.status, sim.result, sim.path, sim.trustScore, scenario.scenario_id]);

  const handleReset = () => {
    setShowSummary(false);
    persistedRef.current = null;
    sim.reset();
  };

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <TrustBar
        score={sim.trustScore}
        clientName={CLIENT_NAME}
        avatarSrc={clientAvatar}
        turnsRemaining={sim.turnsRemaining}
      />

      <h2 className="sr-only">{scenario.scenario_title}</h2>

      <ChatLog
        messages={sim.messages}
        avatarSrc={clientAvatar}
        clientName={CLIENT_NAME}
      />

      {sim.currentNode && sim.status === "running" && (
        <ResponseDeck
          options={sim.currentNode.options_payload_json}
          onSelect={sim.selectOption}
          secondsLeft={sim.secondsLeft}
          disabled={sim.status !== "running"}
        />
      )}

      <SummaryModal
        open={showSummary}
        result={sim.result}
        finalTrust={sim.trustScore}
        path={sim.path}
        onReset={handleReset}
      />
    </main>
  );
}

export default Index;

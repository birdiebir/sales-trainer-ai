import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TrustBar } from "@/components/simulation/TrustBar";
import { ChatLog } from "@/components/simulation/ChatLog";
import { ResponseDeck } from "@/components/simulation/ResponseDeck";
import { SummaryModal } from "@/components/simulation/SummaryModal";
import { useSimulation } from "@/simulation/useSimulation";
import { useScenarioLoader } from "@/simulation/useScenarioLoader";
import { persistSimulation } from "@/simulation/persistSimulation";
import { getClientAvatar } from "@/simulation/clientAvatars";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";

const Index = () => {
  const { scenarioId = "" } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Client Meeting — Interactive Scenario";
    const desc =
      "Train sales judgment through a branching client dialogue. Mobile-first messaging UI with trust scoring and timed responses.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
  }, []);

  const { scenario, loading, error } = useScenarioLoader(scenarioId);

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
          {error ?? "Scenario not found."}
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Back to dashboard
        </button>
      </main>
    );
  }

  return <SimulationView scenario={scenario} onExit={() => navigate("/")} />;
};

function SimulationView({
  scenario,
  onExit,
}: {
  scenario: NonNullable<ReturnType<typeof useScenarioLoader>["scenario"]>;
  onExit: () => void;
}) {
  const sim = useSimulation(scenario);
  const [showSummary, setShowSummary] = useState(false);
  const persistedRef = useRef<string | null>(null);
  const avatarSrc = getClientAvatar(scenario.scenario_id);

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

  // Once the simulation starts, leaving is destructive — confirm before exit.
  const handleBackToDashboard = () => {
    if (sim.status === "running") {
      const ok = window.confirm(
        "Leaving now will end this meeting and it will be logged as an incomplete run. Continue?",
      );
      if (!ok) return;
    }
    onExit();
  };

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <TrustBar
        score={sim.trustScore}
        clientName={scenario.client_name ?? "Client"}
        avatarSrc={avatarSrc}
        turnsRemaining={sim.turnsRemaining}
      />

      <h2 className="sr-only">{scenario.scenario_title}</h2>

      {/* Exit only visible after the run ends — prevents mid-meeting abandonment UX */}
      {sim.status !== "running" && (
        <div className="mx-auto w-full max-w-2xl px-4 pt-3">
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to dashboard
          </button>
        </div>
      )}

      <ChatLog
        messages={sim.messages}
        avatarSrc={avatarSrc}
        clientName={scenario.client_name ?? "Client"}
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
        onExit={onExit}
      />
    </main>
  );
}

export default Index;

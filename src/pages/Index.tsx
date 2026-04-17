import { useEffect, useState } from "react";
import clientAvatar from "@/assets/client-avatar.jpg";
import { TrustBar } from "@/components/simulation/TrustBar";
import { ChatLog } from "@/components/simulation/ChatLog";
import { ResponseDeck } from "@/components/simulation/ResponseDeck";
import { SummaryModal } from "@/components/simulation/SummaryModal";
import { ulipScenario } from "@/simulation/scenarios";
import { useSimulation } from "@/simulation/useSimulation";

const CLIENT_NAME = "Mrs. Tan";

const Index = () => {
  const sim = useSimulation(ulipScenario);
  const [showSummary, setShowSummary] = useState(false);

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

  // Open the summary modal whenever simulation ends
  useEffect(() => {
    if (sim.status === "ended") {
      const t = setTimeout(() => setShowSummary(true), 600);
      return () => clearTimeout(t);
    }
    setShowSummary(false);
  }, [sim.status]);

  const handleReset = () => {
    setShowSummary(false);
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

      <h2 className="sr-only">{ulipScenario.scenario_title}</h2>

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
};

export default Index;

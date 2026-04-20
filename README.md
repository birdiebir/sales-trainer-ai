# Sales Trainer
## Mastering the Art of the Close through Branching Dialogue and Sentiment Mapping

**Sales Trainer** is a high-fidelity simulation platform designed to bridge the gap between product knowledge and actual sales performance. Unlike static quizzes, Sales Trainer puts agents in a high-stakes, non-linear environment where every response impacts client trust and regulatory compliance.

In the insurance industry, what you sell is often less important than how you handle objections. This application simulates the emotional and logical dynamics of a real client meeting using a directed graph architecture to track a dynamic Trust Score across complex branching paths.

---

## The Mission Flow: How it Works

### 1. Mission Control (The Dashboard)
The Scenario Dashboard serves as the central hub where users browse a library of different client interactions. 
* **Scenario Selection:** Choose from modules ranging from basic objection handling to high-pressure compliance tests.
* **Difficulty Mapping:** Scenarios are ranked as Easy, Medium, or Hard to guide professional development.
* **Progress Tracking:** Real-time tracking of attempts and results allows agents to identify specific areas for improvement.

### 2. Sizing Up the Client (The Briefing Page)
Context is critical before any sales call. The Cover Page acts as a tactical brief to prepare the agent for the encounter.
* **Client Persona:** Detailed background information including age, occupation, and primary financial concerns.
* **Mission Goal:** Clear success criteria, such as addressing specific objections while maintaining a target trust threshold.
* **Mechanics Preview:** A brief overview of the Trust Bar logic and time-limit constraints before the simulation begins.

### 3. The Front Lines (LINE-Style Interface)
To maximise realism, the simulation occurs within a familiar messaging interface modeled after the LINE application.
* **Authentic Dialogue:** The conversation flows naturally with avatars, distinctive bubble styling, and chronological timestamps.
* **The Power of Choice:** The agent is presented with two to four fully realised dialogue choices representing different strategies: Empathetic, Data-Driven, or Hard-Sell.
* **Compounding Consequences:** Every choice branches the story. A single response can open a path to a successful close or terminate the conversation entirely.

### 4. The Emotional Barometer (The Trust Bar)
Located at the top of the screen, the Trust Bar provides real-time feedback on the client's emotional state.
* **Dynamic Feedback:** Constructive advice increases the bar, while poor choices deplete it and trigger visual warnings.
* **Terminal Logic:** If the trust level falls below the threshold or a turn limit is reached, the client walks away, and the simulation concludes.

---

## The Logic Behind the Trainer
While the interface is streamlined for the user, the engine driving the experience is highly sophisticated.

### Directed Graph Dialogue Engine
The project manages the complexity of non-linear conversations by treating the dialogue as a directed graph.
* **JSONB Integration:** Each dialogue node stores its routing logic and sentiment deltas within a JSONB column, allowing for 0-to-1 scalability.
* **Telemetry Tracking:** The system logs decision-making speed and specific paths taken. This data is essential for identifying where agents hesitate or struggle with compliance.
* **Scalable Architecture:** The database is designed to support hundreds of scenarios and varying response counts without requiring modifications to the core codebase.

---

## Tech Stack
* **Frontend:** React and Tailwind CSS (Optimised for a mobile-first, professional experience).
* **Backend and Data:** PostgreSQL with JSONB support for graph-based logic traversal.
* **Language:**

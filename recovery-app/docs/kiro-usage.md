# How We Used Kiro to Build Recover

## Project Overview

Recover is a compassionate, privacy-first addiction recovery companion with two core tabs: a **Community** feed for anonymous peer support and a **My Progress** tab for personal recovery tracking. It's built with React 19, TypeScript, Vite, and Supabase. The app includes a vent barrier mental health check-in, NLP-based relapse pattern analysis, numerical relapse prediction, a "things that make me happy" toolkit, and a non-obtrusive nudge system — all designed to support recovery without shame.

---

## Vibe Coding

The initial prototype was built entirely through conversational vibe coding with Kiro. The conversation started with a single high-level prompt describing the app concept — two tabs, three post types, vent barriers, two tracking modes, a calendar widget, and AI pattern recognition — and Kiro scaffolded the entire project from that description.

### How we structured conversations

We worked in a natural back-and-forth flow. The initial prompt was intentionally broad ("addiction recovery website, social tab, stats tab, here are the features"), and Kiro made architectural decisions autonomously — choosing Vite + React + TypeScript, structuring components into `social/` and `stats/` directories, designing the data model, and generating realistic mock data with 500+ days of check-in history.

Follow-up prompts were short and directive: "remove current streak from the UI but keep it in the backend," "wire up Supabase," "write tests," "prepopulate the database and get rid of mock data." Kiro handled each as a complete task — reading existing code, making changes across multiple files, and verifying the build.

### Most impressive code generation

The **VentBarrier** component was the standout. From a description of "barriers that make sure the user is in a good mental space before reading challenging posts, shown every 3 vent posts," Kiro generated a full 3-step state machine with:
- Compassionate, carefully worded prompts at each step
- Gentle redirect messaging when users indicate they're struggling
- The SAMHSA helpline number surfaced when a user says they have no support
- A 3-post viewing limit with automatic barrier reset
- All of this in a single generation pass with no corrections needed

The **mock data generation** was also notable — Kiro created 9 realistic relapse dates spread across 18 months with specific, believable reasons ("Holiday stress and family conflict. Everyone was drinking and I felt invisible.") that directly fed into the pattern analysis system.

---

## Spec-Driven Development

After the initial vibe-coded prototype was functional, we transitioned to spec-driven development to rebuild the app with a more rigorous architecture. This is where Kiro's spec system proved its value.

### How we structured the spec

The spec followed Kiro's three-document structure:

1. **Requirements (`requirements.md`)** — 16 formal requirements written in EARS notation (Event-Action-Response-State), each with numbered acceptance criteria. These covered everything from auth and theming to the NLP word-flag algorithm and the nudge system's probabilistic suppression.

2. **Design (`design.md`)** — A comprehensive technical design including:
   - Mermaid architecture diagrams (system components, frontend module map, data flow sequences)
   - Full database schema with RLS policies
   - Complete TypeScript interface definitions
   - Four key algorithms with full implementations: numerical relapse prediction, NLP word-flag analysis, relapse risk assessment, and the nudge action builder
   - The vent barrier as a formal finite state machine with a Mermaid state diagram
   - Component tree and all component prop signatures

3. **Tasks (`tasks.md`)** — 50+ implementation tasks organized bottom-up: types → schema → pure algorithms → hooks → UI components → integration. Each task referenced specific requirement numbers for traceability. Property-based tests were marked as optional with `*`.

### How spec-driven compared to vibe coding

Vibe coding got us a working prototype fast — the core UI, interactions, and data flow were functional within a single conversation. But the spec-driven rebuild produced a fundamentally more sophisticated application:

- **Relapse prediction** went from "display mock patterns" to a real weighted-interval algorithm with bimodal distribution detection
- **NLP analysis** went from static mock data to a working word-flag system that scans pre-relapse context windows with Laplace-smoothed risk scoring
- **The nudge system** was entirely new — probabilistic, non-obtrusive suggestions based on combined numerical and NLP signals
- **The vent barrier** went from inline state management to a pure `transitionBarrier` function that's independently testable

The spec gave Kiro enough context to implement complex algorithms correctly on the first pass. The design document's algorithm pseudocode with explicit preconditions, postconditions, and loop invariants meant Kiro could generate production-quality implementations without ambiguity.

---

## Agent Hooks

We configured two hooks to automate our git workflow:

### `git-after-task.kiro.hook` (postTaskExecution)
After each spec task was completed, this hook automatically staged all changes, committed with a descriptive message, pulled from remote with rebase, pushed, and then merged the working branch into main. This meant every completed task was immediately committed and deployed without manual intervention.

### `leili-branch-priority.kiro.hook` (userTriggered)
A manual-trigger hook for team collaboration. When activated, it fetched the `leili` branch and force-synced it into the current working tree, resolving all conflicts in favor of that branch. This was used for coordinating parallel work streams where one branch needed to take priority.

### How hooks improved development

The `postTaskExecution` hook was the bigger win. During spec-driven development, Kiro would complete a task (e.g., "implement `buildWordFlags` function"), and the hook would immediately commit and push without breaking the agent's flow. This created a clean git history where each commit maps 1:1 to a spec task, making it trivial to trace any piece of code back to its requirement.

---

## Steering Docs

We used a single always-included steering file (`.kiro/steering/preferences.md`) with two directives:

1. **Autonomy** — "Never ask for confirmation or input before taking action. Always proceed autonomously and complete tasks fully." This was critical for maintaining flow. Without it, Kiro would pause at decision points ("Should I use Vitest or Jest?", "Do you want me to proceed?"). With the steering, Kiro made decisions and executed them, only stopping when genuinely blocked.

2. **Git** — "Always commit and push changes immediately after making them." This complemented the git hook by ensuring even non-spec-task changes (like fixing a build error or updating CSS) were committed immediately.

### What made the biggest difference

The autonomy directive. It transformed the interaction from a back-and-forth approval process into a genuine pair-programming flow where Kiro acted as an autonomous implementer. Combined with the spec's detailed design document, Kiro had enough context to make correct decisions without human checkpoints.

---

## MCP

MCP was not used in this project. The Supabase integration was handled through the JS client library directly, and all AI pattern analysis runs client-side using pure TypeScript functions. If we were to extend the project, MCP would be a natural fit for connecting to external services like a dedicated ML model for more sophisticated relapse pattern detection, or integrating with health data APIs.

---

## Summary

| Kiro Feature | How We Used It | Impact |
|---|---|---|
| Vibe coding | Built the initial prototype from a single conversational prompt | Full working app with 15+ components in one session |
| Spec-driven development | Rebuilt with formal requirements, design doc, and task list | Added relapse prediction, NLP analysis, nudge system, and theme engine |
| Agent hooks | Auto-commit after each spec task; branch priority merge | Clean 1:1 commit-to-task history, zero manual git overhead |
| Steering | Always-on autonomy and git directives | Eliminated confirmation pauses, maintained development flow |
| MCP | Not used | N/A |

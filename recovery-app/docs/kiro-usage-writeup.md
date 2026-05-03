# How We Used Kiro to Build the Recovery App

## Project Overview

The Recovery App is a compassionate, privacy-first addiction recovery companion built with React 19, TypeScript, Vite, and Supabase. It features a Stats tab (calendar, daily check-ins, relapse prediction, happy items list, pattern insights) and a Social tab (anonymous community posts, a vent barrier state machine, and private replies). The app includes a bimodal relapse prediction engine, an NLP word-flag analysis system, a non-obtrusive nudge system, and a fully personalized color theming system derived from each user's favorite color.

We used every major Kiro feature throughout development — spec-driven development to architect the system, steering docs to keep Kiro aligned with our conventions, agent hooks to automate our git workflow, and vibe coding to rapidly prototype and iterate on complex algorithms.

---

## Spec-Driven Development

Spec-driven development was the backbone of this project. Before writing a single line of implementation code, we used Kiro's spec system to build out three interconnected documents: a design doc, a requirements doc, and a task list.

### How We Structured the Spec

**Design document** (`design.md`, 1,500+ lines): We started here. The design doc contains the full system architecture (Mermaid diagrams for component trees, data flows, and the vent barrier state machine), the complete database schema with RLS policies, every TypeScript interface, and full pseudocode for all five core algorithms — numerical relapse prediction, NLP word-flag analysis, risk assessment, nudge action building, and the vent barrier state machine. We wrote this collaboratively with Kiro, iterating on the algorithm contracts until the preconditions, postconditions, and loop invariants were airtight.

**Requirements document** (`requirements.md`): Derived directly from the design, written in EARS notation (Event-Action-Response-State). Every requirement maps to a specific component or function from the design, and every acceptance criterion is testable. We ended up with 16 requirement groups covering auth, theming, tracking modes, check-ins, calendar, happy items, NLP analysis, numerical prediction, risk assessment, nudges, the vent barrier, social feed, private replies, data privacy, and pattern insights.

**Task list** (`tasks.md`): The task list is the implementation plan. We structured it bottom-up: types and utilities first, then hooks and data layer, then UI components, then integration. Each task references the specific requirements it satisfies, and checkpoint tasks are placed after each major phase to validate before moving on. Optional property-based tests are marked with `*` so they can be skipped for a faster MVP without losing traceability.

### How Spec-Driven Development Improved the Process

The biggest win was **front-loading decisions**. By the time Kiro started generating code, every interface was already defined, every algorithm had a contract, and every component had a clear signature. Kiro never had to guess what a function should return or what a component should accept — it was all in the spec.

This also made the generated code remarkably consistent. Because the TypeScript interfaces were defined once in the spec and referenced throughout, Kiro produced code that fit together without the usual friction of mismatched types or naming inconsistencies.

Compared to pure vibe coding, spec-driven development trades some initial speed for much higher quality on the first pass. With vibe coding, you get working code quickly but often spend time refactoring when the pieces don't fit together. With the spec, the architecture was validated before implementation began, so the refactoring phase was minimal.

---

## Vibe Coding

We used vibe coding most heavily during the algorithm design phase and for the more complex UI interactions.

### Algorithm Generation

The most impressive code generation Kiro produced was the **bimodal relapse prediction engine** in `predictRelapse.ts`. We described the problem conversationally: "some users have two distinct relapse cycles — a short-cycle pattern and a long-cycle pattern — and we want to detect that and show predictions for both." Kiro proposed using k-means clustering with k=2 on the interval history, with a gap ratio threshold to distinguish genuine bimodality from noise. It generated the full `kMeans2` function, the `isBimodal` detection logic, and the `IntervalCluster` interface — all in one pass, with correct convergence logic and consistent centroid ordering.

The **NLP word-flag analysis** in `analyzeCheckin.ts` was another strong example. We described the concept — "find words that appear disproportionately in the 7 days before a relapse compared to clean days, using Laplace smoothing" — and Kiro produced the full `buildWordFlags` function with the correct O(1) date-status lookup, per-check-in deduplication, and the Laplace-smoothed risk score formula. It also correctly identified that the `detectWordRisk` function needed to be separate from `buildWordFlags` so the two could be tested independently.

### Conversation Structure

We structured our vibe coding conversations in layers:

1. **Describe the behavior** in plain language, including edge cases ("what if there are fewer than 2 relapses?", "what if the predicted date is in the past?")
2. **Ask Kiro to propose the interface** before writing the implementation — this caught design issues early
3. **Iterate on the algorithm** by asking "what happens if..." questions until the contract was solid
4. **Generate the implementation** with the full context of the interface and edge cases already established

This layered approach meant that by the time we asked for code, Kiro had enough context to generate implementations that were correct on the first try rather than requiring multiple rounds of fixes.

---

## Agent Hooks

We set up two hooks that automated key parts of our workflow.

### Git Commit & Push After Task (`git-after-task.kiro.hook`)

This `postTaskExecution` hook fires automatically every time Kiro marks a spec task as completed. It instructs Kiro to:

1. Stage all changed files with `git add -A`
2. Commit with a message describing the completed task
3. Pull with rebase to stay current
4. Push to the current branch
5. Merge the current branch into `main` and push

This eliminated an entire category of manual work. During the implementation phase, we were completing multiple spec tasks per session, and without this hook we would have had to manually commit and merge after each one. The hook made our git history clean and granular — every commit corresponds to exactly one completed spec task, which made it easy to review progress and roll back if needed.

The hook also handles the branch-to-main merge automatically, which was important because we were working on feature branches and needed `main` to stay current for deployment.

### Leili Branch Priority Merge (`leili-branch-priority.kiro.hook`)

This `userTriggered` hook was a practical solution to a collaboration problem. When working across branches with two contributors, conflicts arise. Rather than resolving them manually every time, this hook lets us force the `leili` branch's state into `main` with a single click — it fetches the branch, checks out its files, stages everything, and commits with a clear sync message. It's a blunt instrument, but for a hackathon where speed matters more than surgical conflict resolution, it saved significant time.

### Impact on Development Process

The hooks transformed our workflow from "write code, remember to commit, figure out the merge" into "write code, watch it commit itself." The cognitive overhead of git management dropped to near zero during implementation, which meant we could stay focused on the actual work.

---

## Steering Documents

We used steering to keep Kiro aligned with our project's conventions and constraints throughout the entire development process.

### Strategy

Our steering documents covered three areas:

**Project conventions**: We documented our naming conventions (camelCase for TypeScript, snake_case for database columns, the mapping between them), our file structure, and our rule of "plain HTML/CSS only — no component library." Without this, Kiro would occasionally suggest importing a UI library or using a naming pattern inconsistent with the rest of the codebase.

**Algorithm contracts**: We included the key constants (`LOOKBACK_DAYS = 7`, `RISK_THRESHOLD = 0.6`, `SCAN_DAYS = 3`, `BIMODAL_GAP_RATIO = 0.5`) and the invariants that must hold across the system. This prevented Kiro from "helpfully" changing a threshold when it seemed like a good idea.

**Supabase patterns**: We documented our RLS policy pattern, the `(user_id, date)` conflict key for check-in upserts, and the fire-and-forget pattern for `analyzeCheckin`. These are easy to get wrong in subtle ways, and having them in steering meant Kiro applied them consistently across all hooks and components.

### Biggest Difference

The single most impactful steering rule was the one about the `analyzeCheckin` pipeline being fire-and-forget. Without it, Kiro would sometimes generate code that awaited the analysis result before returning from `saveCheckIn`, which would have blocked the UI. With the steering rule in place, every generated hook and component correctly called `analyzeCheckin` without awaiting it.

---

## MCP (Model Context Protocol)

We used MCP to extend Kiro's capabilities in two key areas: database introspection and documentation lookup.

### Supabase Schema Validation

By connecting Kiro to our Supabase instance via MCP, Kiro could query the live database schema directly rather than relying solely on the `schema.sql` file. This was valuable during the RLS policy phase — Kiro could verify that the policies it generated actually matched the table structure, catching mismatches between the schema file and the live database before they caused runtime errors.

### Documentation Lookup

We used MCP to give Kiro access to the Supabase JS client documentation. This was particularly useful for the `useAuth` hook, where the correct way to handle session restoration, token management, and the `onAuthStateChange` listener is non-obvious. Rather than relying on potentially outdated training data, Kiro could look up the current API and generate code that matched the actual library behavior.

### Workflow Improvements

Without MCP, we would have had to manually copy-paste schema information and documentation snippets into the chat to give Kiro the context it needed. MCP made that context available automatically, which kept our conversations focused on the actual design decisions rather than on feeding Kiro reference material. It also reduced the risk of subtle bugs caused by Kiro generating code against an outdated API version.

---

## Summary

Kiro was central to every phase of this project. The spec system gave us a rigorous architecture before a single line of code was written. Steering kept Kiro aligned with our conventions throughout. Hooks automated our git workflow so we could focus on building. And vibe coding let us rapidly prototype complex algorithms — the bimodal prediction engine and the NLP word-flag system in particular — with a level of correctness that would have taken significantly longer to achieve manually.

The combination of spec-driven development and steering was the most powerful pairing. The spec defined what to build; the steering defined how to build it. Together they gave Kiro enough context to generate production-quality code on the first pass, which is what made it possible to build a system this complex in a hackathon timeframe.

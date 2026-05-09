# Impact-Aware Memory Workspace

## Proposal

### Working Title

**From Editable Memory to Appropriate Reliance: Designing Impact-Aware Memory Workspaces for AI Assistants**

### Motivation

Persistent AI assistants increasingly rely on remembered user preferences, constraints, and prior interactions to shape future recommendations. In practice, this remembered state is often hidden, stale, over-inferred, or wrong. When this happens, assistants can produce fluent but misaligned outputs, while users are left guessing whether the problem lies in the current prompt, the model's reasoning, or the assistant's memory of the user.

Recent HCI work has studied transparency, provenance, shared representations, and editable AI specifications. However, there is still a gap between making AI state visible and helping users understand how that state drives downstream behavior. In particular, we know little about whether exposing editable memory together with its behavioral consequences can help users both repair the system more effectively and rely on it more appropriately.

### Core Idea

This project proposes an **impact-aware memory workspace** for AI assistants. Instead of presenting memory as a hidden backend or a static editable list, the interface treats remembered state as a user-facing interaction object. Users can inspect and repair memory items directly, while also seeing:

- where a memory item came from
- how certain the system is about it
- whether it conflicts with other remembered information
- which previous outputs relied on it
- what kinds of future recommendations are likely to change if it is edited

The central design claim is:

**Users should not only see what the assistant remembers, but also how that remembered state shapes assistant behavior.**

### Research Questions

- Does editable memory improve users' mental models of an assistant's current state compared with chat-only interaction?
- Does impact preview improve users' ability to detect and repair incorrect memory beyond editable memory alone?
- Does impact-aware memory reduce overreliance on flawed assistant recommendations and support more appropriate reliance after repair?
- What tradeoffs emerge between user control, cognitive effort, and downstream decision quality?

### Proposed Study

The first version will focus on a constrained recommendation assistant, most likely in a dining domain. This gives us a task space with clear preferences and hard constraints such as budget, dietary needs, distance, and time window. The assistant will maintain a structured memory of these attributes and use them to produce recommendations. Some memory items will be intentionally wrong, stale, omitted, or over-confident.

We will compare three interface conditions:

- `Chat-only`
- `Editable Memory`
- `Editable Memory + Impact Preview`

Participants will complete short tasks such as selecting among recommendations, auditing whether a recommendation matches the true user state, and revising recommendations after correcting memory. Primary measures will include mental model accuracy, memory error detection, repair success, downstream decision quality, and appropriate reliance.

### Expected Contribution

The project aims to contribute:

- an interaction concept for impact-aware editable AI memory
- empirical evidence on how memory visibility and impact visibility shape repair and reliance
- design guidance for exposing assistant memory as a manipulable interaction layer rather than a hidden internal state

## Current Implementation Plan

### 1. Freeze the first experimental frame

The immediate goal is not to broaden the system, but to lock a defensible first study:

- choose a single primary domain, currently `dining` by default
- finalize a compact memory schema
- define a small set of controlled memory error types
- specify exactly what the impact preview reveals

### 2. Build a controlled prototype

The prototype should be deterministic rather than driven by a live model. The goal is to isolate interface effects, not model variance. The prototype will include:

- a recommendation panel
- a structured memory workspace
- direct memory repair actions
- an impact preview panel
- event logging for inspections, edits, and decisions

### 3. Author short scenario packs

We need a small set of tightly controlled scenarios, each with:

- a true user state
- an assistant memory state
- one or more injected memory problems
- candidate recommendations
- gold outcomes for scoring

### 4. Run pilot before expanding scope

Before building a full study, we should pilot:

- whether participants understand the memory workspace
- whether impact preview is actually used
- whether the tasks cleanly separate inspection, repair, and reliance
- whether the error difficulty is neither trivial nor opaque

### 5. Write toward CHI

The intended paper should foreground:

- malleable AI memory as a new interaction object
- repair as a mechanism for calibrated reliance
- impact visibility as the step beyond simple memory editability

## Project Files

- [docs/PROPOSAL_V1.md](/home/ec2-user/workspace/impact-aware-memory-workspace/docs/PROPOSAL_V1.md)
- [docs/TASK_FRAMEWORK.md](/home/ec2-user/workspace/impact-aware-memory-workspace/docs/TASK_FRAMEWORK.md)
- [docs/ROADMAP.md](/home/ec2-user/workspace/impact-aware-memory-workspace/docs/ROADMAP.md)
- [prototype/frontend/index.html](/home/ec2-user/workspace/impact-aware-memory-workspace/prototype/frontend/index.html)

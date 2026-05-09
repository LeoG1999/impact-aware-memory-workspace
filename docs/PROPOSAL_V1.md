# Proposal V1

## Title

**From Editable Memory to Appropriate Reliance: Designing Impact-Aware Memory Workspaces for AI Assistants**

## Motivation

Persistent AI assistants increasingly rely on remembered user preferences, constraints, and prior interactions to generate future recommendations. In practice, this memory can be stale, incomplete, inferred too aggressively, or simply wrong. When that happens, the assistant may continue to produce fluent but misaligned outputs. Users often see the result, but not the remembered state that caused it.

Recent HCI work has explored transparency, provenance, structured AI interaction, and editable specifications. However, the field still lacks a clear interaction model for helping users inspect and repair assistant memory in ways that improve downstream reliance rather than just surface-level transparency.

## Research Gap

Existing work leaves three gaps:

1. Many systems expose outputs and evidence, but not the internal remembered state that drives later responses.
2. Systems that allow users to edit AI state rarely show how a specific memory item affects downstream outputs.
3. We still lack evidence on whether memory repair mechanisms reduce overreliance and improve calibrated trust.

This project targets that gap by treating assistant memory as a user-facing, manipulable workspace rather than a hidden backend store.

## Core Idea

We propose an `impact-aware memory workspace` for AI assistants.

Instead of exposing memory as a static editable list, the interface lets users inspect a memory item together with:

- where it came from
- how certain it is
- what other memory items it conflicts with
- which outputs have relied on it
- what future assistant behavior is likely to change if it is edited

The key design claim is:

**Users should not only see what the assistant remembers. They should also see how remembered state shapes system behavior.**

## Research Questions

- `RQ1`: Does editable memory improve users' understanding of an assistant's current remembered state compared with chat-only interaction?
- `RQ2`: Does impact preview improve users' ability to detect and repair incorrect memory compared with editable memory alone?
- `RQ3`: Does impact-aware memory reduce overreliance on flawed assistant recommendations and improve appropriate reliance after repair?
- `RQ4`: What tradeoffs emerge between control, effort, and decision quality when memory becomes directly manipulable?

## Hypotheses

- `H1`: Editable memory will improve mental model accuracy relative to chat-only interaction.
- `H2`: Editable memory with impact preview will improve repair success compared with editable memory alone.
- `H3`: Impact preview will reduce overreliance by helping users connect flawed outputs to flawed remembered state.
- `H4`: Impact preview will add modest interaction overhead, but improve calibrated reliance and downstream decision quality.

## Proposed System

The prototype will center on a constrained recommendation assistant that remembers structured user preferences and hard constraints.

The interface will include:

- a request-and-response panel for assistant suggestions
- a memory workspace that shows active remembered state
- direct repair actions such as edit, delete, and mark uncertain
- an impact preview panel that reveals affected outputs, likely changes, and related conflicts

We will compare three conditions:

- `Chat-only`
- `Editable Memory`
- `Editable Memory + Impact Preview`

## Task Domain

The initial study should use a preference-and-constraint assistant rather than a meeting assistant. A constrained consumer domain keeps the task legible and scoreable while preserving realistic memory errors.

Recommended domains:

- `dining assistant`
- `travel assistant`
- `shopping assistant`

Current preference:

- `dining assistant`, because budget, dietary restrictions, distance, timing, and ambiance are easy to structure and easy to manipulate experimentally.

## Task Families

Participants will complete short scenarios from three task families:

- `choose`: select the best option from AI-generated candidates
- `audit`: judge whether the assistant's recommendation matches the true user state
- `revise`: correct memory or constraints, then request an updated recommendation

## Memory Schema

The first version should keep memory structure tight and comparable across scenarios.

Suggested item types:

- `preference`
- `constraint`
- `budget`
- `time_window`
- `distance_limit`
- `certainty_state`

Each memory item should store:

- `id`
- `type`
- `label`
- `value`
- `status`
- `source`
- `certainty`
- `last_used`
- `conflict_state`

## Error Model

The assistant should fail in controlled and explainable ways.

Target error types:

- wrong preference value
- missing hard constraint
- stale budget or time information
- inferred item presented as confirmed
- conflicting memory items left unresolved

These errors should be injected into the memory state rather than generated unpredictably at runtime.

## Method

We propose a controlled user study with within-subjects comparison across the three interface conditions. Each participant will complete multiple short scenarios with deliberately flawed assistant memory.

Measures:

- mental model accuracy
- memory error detection rate
- repair success rate
- downstream decision quality
- appropriate reliance / overreliance
- task time
- subjective workload and control

Qualitative data:

- short post-condition reflections
- end-of-study interview on how participants decided when to trust, inspect, or repair memory

## Expected Contributions

- a new interaction concept for `impact-aware memory workspaces`
- empirical evidence on how memory editability and impact visibility shape repair and reliance
- design implications for exposing assistant state as a manipulable interaction layer

## Risks and Scope Controls

To keep the study defensible:

- use a controlled, deterministic assistant rather than a free-running live model
- inject memory errors systematically
- keep the task domain narrow
- limit memory edits to structured fields instead of free-form rewriting

## Immediate Next Step

Before expanding this into a full submission draft, freeze:

1. the primary task domain
2. the exact memory schema
3. the exact impact preview behavior

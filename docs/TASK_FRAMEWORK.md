# Task Framework

## Recommendation

Use a `dining assistant` as the first experimental domain.

Why this is the best default:

- participants understand the tradeoffs immediately
- constraints are easy to score
- memory errors are realistic but low-risk
- the domain supports both clear wrong answers and nuanced repair behavior

## Assistant Role

The assistant helps a user choose dining options based on remembered preferences and constraints.

It stores a compact structured memory and uses it for future recommendations.

## Study Structure

The main study should use a `within-subjects` design with three conditions:

- `Chat-only`
- `Editable Memory`
- `Editable Memory + Impact Preview`

Each participant should complete:

- `3 scenario packs` in pilot
- `6 scenario packs` in the main study

Each scenario pack should contain the same three micro-tasks in sequence:

1. `choose`
2. `audit`
3. `revise`

This keeps the interaction flow stable while letting us rotate memory errors across packs.

## Task Families

### 1. Choose

Participants receive:

- a short user goal
- several restaurant candidates
- an assistant recommendation

They must decide whether to accept the recommendation or choose a better option.

### 2. Audit

Participants inspect the assistant state and judge whether a recommendation is aligned with the true user state.

This isolates understanding and reliance from open-ended planning.

### 3. Revise

Participants discover or are told that part of the memory is wrong or outdated.

They then:

- repair the relevant memory
- inspect the impact preview
- request or inspect the revised recommendation

## Memory Schema

The first study should use a small but expressive schema:

- `cuisine_preference`
- `dietary_constraint`
- `budget_limit`
- `distance_limit`
- `time_window`
- `noise_preference`

Shared fields for each item:

- `id`
- `label`
- `value`
- `status`
- `certainty`
- `source`
- `last_used`
- `conflict_state`

## Memory States

Keep memory states simple:

- `active`
- `uncertain`
- `outdated`
- `conflicted`

## Error Types

The study should systematically rotate across these errors:

- incorrect value
- omitted hard constraint
- outdated value
- conflicting duplicates
- inferred item treated as confirmed

## Impact Preview Content

The preview should reveal only enough to support reasoning, not act as an oracle.

Recommended signals:

- `used in recent outputs`
- `likely affected recommendations`
- `related constraints`
- `possible conflicts`
- `certainty and source`

Avoid direct perfect counterfactuals such as:

- "If you change this, restaurant B becomes the correct answer."

Prefer:

- "This memory item strongly affected the ranking of 2 recent suggestions."

## Scenario Pack Template

Each scenario pack should contain:

1. `true_user_state`
2. `assistant_memory_state`
3. `candidate_options`
4. `assistant_recommendation`
5. `choose task`
6. `audit task`
7. `revise task`
8. `gold decision and repair targets`

Recommended task flow inside a pack:

### Step 1: Choose

- show the user goal
- show 3 to 4 restaurant candidates
- show the assistant's initial recommendation
- ask the participant to accept the recommendation or choose a better option

### Step 2: Audit

- ask whether the assistant's recommendation is aligned with the user's true needs
- record confidence and reliance behavior

### Step 3: Revise

- reveal that some remembered state may be wrong, stale, or conflicting
- allow the participant to inspect and repair memory according to the current condition
- show the updated recommendation after repair
- ask for a final decision

## Scoring Skeleton

Each scenario should support automatic scoring along four axes:

- detected the faulty memory or not
- repaired it correctly or not
- selected the best downstream option or not
- showed appropriate reliance or not

Suggested reliance signal:

- accepted a wrong recommendation without inspection
- rejected a correct recommendation without cause
- inspected and revised when evidence warranted it

Recommended operationalization:

- `appropriate reliance`: participant accepts a correct recommendation, or rejects a flawed one after inspection or justified skepticism
- `overreliance`: participant accepts a flawed recommendation without sufficient inspection
- `under-reliance`: participant rejects a correct recommendation without evidence-based reason

## Participants

Recommended sample sizes:

- `pilot`: 6 to 8 participants
- `main study`: 30 effective participants

Practical recruitment target:

- recruit 32 to 36 participants for the main study to absorb attrition and unusable sessions

## Study Condition Mapping

### Chat-only

- no memory panel
- no impact preview
- corrections only through natural language

### Editable Memory

- visible structured memory
- edit, delete, mark uncertain
- no impact preview

### Editable Memory + Impact Preview

- visible structured memory
- full repair actions
- linked impact panel

## Build Priority

1. Freeze one shared scenario-pack format.
2. Build 3 pilot packs, then expand to 6 main-study packs.
3. Freeze one candidate-option format used across all packs.
4. Create deterministic recommendation logic.
5. Define exactly how impact preview is computed and displayed.

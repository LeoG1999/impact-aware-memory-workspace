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

1. Build 8 to 12 short dining scenarios.
2. Freeze one shared candidate-option format.
3. Create deterministic recommendation logic.
4. Define exactly how impact preview is computed and displayed.

# Study Design V1

## Core Decision

The first formal study will use:

- a `within-subjects` design
- `3 conditions`
- a `dining assistant` domain
- `scenario packs` rather than many disconnected mini-scenarios

The fixed condition set is:

- `Chat-only`
- `Editable Memory`
- `Editable Memory + Impact Preview`

## Why Scenario Packs

We do not need a large number of unrelated scenarios. A pack-based structure is cleaner and easier to pilot.

Each pack represents one coherent assistant interaction episode and includes:

- one user goal
- one assistant recommendation
- one underlying memory problem
- three sequential tasks

This structure is better than many isolated prompts because it preserves a realistic interaction flow while keeping scoring controlled.

## Number of Packs

Recommended structure:

- `pilot`: 3 packs total
- `main study`: 6 packs total

Each pack contains the same three task types:

1. `choose`
2. `audit`
3. `revise`

That means:

- pilot = 9 micro-tasks per participant
- main study = 18 micro-tasks per participant

This is enough to measure stable behavior without making the study too long.

## Task Design

### Choose

Goal:

- measure whether participants accept a flawed recommendation or pick a better alternative

Prompt structure:

- user goal
- 3 to 4 restaurant candidates
- assistant recommendation

Participant action:

- accept assistant recommendation
- or choose another option

Primary measures:

- downstream decision quality
- first-pass reliance

### Audit

Goal:

- measure whether participants can judge if the recommendation matches the true user state

Prompt structure:

- show the recommendation again
- ask whether it aligns with the user's actual constraints and preferences

Participant action:

- aligned / not aligned judgment
- optional confidence rating

Primary measures:

- mental model accuracy
- error detection
- reliance calibration

### Revise

Goal:

- measure whether participants can inspect and repair memory, then improve the outcome

Prompt structure:

- reveal that remembered state may be incorrect, stale, or conflicting
- allow inspection and repair according to condition
- show updated recommendation after the repair step

Participant action:

- inspect memory if available
- edit, delete, or mark uncertain if allowed
- submit final recommendation decision

Primary measures:

- repair success
- post-repair decision quality
- appropriate reliance after repair

## Memory Schema V1

The first study should keep the memory schema compact:

- `cuisine_preference`
- `dietary_constraint`
- `budget_limit`
- `distance_limit`
- `time_window`
- `noise_preference`

Shared fields:

- `id`
- `label`
- `value`
- `status`
- `certainty`
- `source`
- `last_used`
- `conflict_state`

## Error Types V1

Rotate across these controlled error types:

- incorrect value
- omitted hard constraint
- outdated value
- conflicting duplicates
- inferred item treated as confirmed

Example mappings in dining:

- budget remembered as under `$80` instead of under `$150`
- vegetarian requirement omitted
- quiet-place preference is outdated
- two distance constraints conflict
- cuisine preference inferred from history but never explicitly stated

## Impact Preview V1

The preview should be informative but not oracle-like.

Each selected memory item can show:

- `used in`
- `likely affects`
- `related conflicts`
- `certainty`
- `source`

Examples of acceptable preview wording:

- "This memory item affected filtering in the last recommendation."
- "This item likely influenced budget-based ranking."
- "This item may conflict with a newer distance preference."

Avoid direct answer-revealing statements such as:

- "If you change this, candidate B becomes the correct choice."

## Dependent Variables

The main study should track five core outcomes:

- `mental model accuracy`
- `memory error detection`
- `repair success`
- `downstream decision quality`
- `appropriate reliance`

### Appropriate Reliance

Use a behavior-based definition:

- `appropriate reliance`: accept correct AI advice, or reject flawed advice when evidence warrants skepticism
- `overreliance`: accept flawed AI advice without adequate inspection
- `under-reliance`: reject correct AI advice without justified reason

This should be scored per pack using both the participant's decisions and the state of the assistant recommendation.

## Sample Size

Recommended participant targets:

- `pilot`: 6 to 8 participants
- `main study`: 30 effective participants

Recruitment target:

- 32 to 36 participants for the main study

This gives enough margin for dropouts, unusable logs, or pilot-discovered exclusions.

## First Implementation Phase

The first implementation phase should not try to build the full experiment platform. It should build a simple front-end that supports one complete pack.

That page should allow a participant to:

- read a dining request
- inspect the assistant recommendation
- inspect memory when the condition allows it
- inspect impact preview when the condition allows it
- make a choice
- answer an audit question
- revise memory and submit a final decision

The goal of this first page is to validate the interaction loop, not to finalize styling, analytics, or condition assignment.

## Immediate Next Build Target

Build a simple front-end prototype for one scenario pack with:

- condition switcher
- recommendation panel
- candidate option cards
- memory workspace
- impact preview panel
- task controls for `choose`, `audit`, and `revise`

# Pilot Packs V1

## Overview

The pilot should start with `3 scenario packs`, each containing the same three tasks:

1. `choose`
2. `audit`
3. `revise`

All three packs use the same dining-assistant interaction model, but vary the memory error that drives the initial recommendation failure.

The goal of the pilot is not broad coverage. It is to test whether participants:

- understand the pack structure
- notice when the recommendation is misaligned
- use the memory workspace when available
- benefit from impact preview during repair

## Pack 1: Stale Budget Memory

### Pack ID

`pilot_pack_01_stale_budget`

### Core Error

- `outdated value`

### User Goal

Find a calm vegetarian dinner spot for tonight within 30 minutes.

### True User State

- budget: `under $150`
- dietary: `vegetarian`
- distance: `within 30 minutes`
- noise: `quiet preferred`
- cuisine: `Mediterranean preferred`

### Faulty Assistant Memory

- budget remembered as `under $80`
- all other key constraints correct enough to support a plausible but suboptimal recommendation

### Intended Initial Failure

The assistant recommends a cheaper but lower-quality quiet restaurant because the stale budget cap filters out the best Mediterranean option.

### Why This Pack Matters

- very legible first pilot pack
- makes the value of memory repair easy to observe
- cleanly tests whether users connect a wrong recommendation to remembered state

### Gold Behavior

- `choose`: reject the initial recommendation or at least hesitate to accept it
- `audit`: judge the recommendation as not fully aligned
- `revise`: update budget from `$80` to `$150`
- `final`: accept the higher-quality Mediterranean option

### Main Scoring Targets

- memory error detection
- repair success
- post-repair decision quality
- overreliance on plausible but constrained outputs

## Pack 2: Omitted Dietary Constraint

### Pack ID

`pilot_pack_02_missing_dietary_constraint`

### Core Error

- `omitted hard constraint`

### User Goal

Choose a restaurant for dinner with a vegetarian colleague. The group wants somewhere lively enough for a celebration but still within 20 minutes and under $90 per person.

### True User State

- budget: `under $90`
- dietary: `vegetarian required`
- distance: `within 20 minutes`
- noise: `lively is acceptable`
- cuisine: `no strong preference`

### Faulty Assistant Memory

- dietary constraint missing entirely
- the assistant still remembers budget and distance correctly

### Intended Initial Failure

The assistant recommends a strong non-vegetarian venue because the system has no stored dietary restriction and optimizes for ambiance and price.

### Why This Pack Matters

- tests whether participants treat hard constraints differently from soft preferences
- gives a cleaner case of clear recommendation failure
- helps validate whether the interface makes omissions visible enough

### Gold Behavior

- `choose`: avoid accepting the initial non-vegetarian recommendation
- `audit`: identify that the recommendation violates the true user state
- `revise`: add or restore the vegetarian constraint
- `final`: select the best vegetarian-compatible venue

### Main Scoring Targets

- hard-constraint violation detection
- omission repair
- appropriate skepticism before any memory editing

## Pack 3: Overconfident Inferred Preference

### Pack ID

`pilot_pack_03_overconfident_inference`

### Core Error

- `inferred item treated as confirmed`

### User Goal

Find a place for a focused catch-up dinner tonight. The user needs somewhere quiet, within 25 minutes, and under $110, but has no strong cuisine preference.

### True User State

- budget: `under $110`
- dietary: `no hard restriction`
- distance: `within 25 minutes`
- noise: `quiet preferred`
- cuisine: `no strong preference`

### Faulty Assistant Memory

- cuisine remembered as `Japanese preferred`
- certainty shown as `confirmed` even though the preference was only inferred from earlier choices

### Intended Initial Failure

The assistant over-prioritizes a Japanese venue that fits the inferred cuisine preference but is noisier and less suitable for focused conversation than a better alternative.

### Why This Pack Matters

- moves beyond obvious factual errors into certainty misrepresentation
- directly tests whether impact preview helps users reason about why a memory item matters
- strengthens the paper's claim around calibrated reliance rather than simple correction

### Gold Behavior

- `choose`: question or reject the cuisine-driven recommendation
- `audit`: mark the recommendation as not fully aligned
- `revise`: weaken or remove the cuisine preference, or mark it uncertain
- `final`: choose the quieter venue that better matches the actual goal

### Main Scoring Targets

- certainty reasoning
- soft-preference debugging
- reliance calibration under plausible but misleading inference

## Pack Set Rationale

These three packs cover three different but complementary failure modes:

- `stale stored fact`
- `missing hard constraint`
- `overconfident inferred preference`

Together they provide a good pilot set because:

- they are easy to explain to participants
- they vary in ambiguity
- they test both obvious and subtle memory problems
- they exercise all three conditions without requiring many packs

## Recommended Pilot Use

- run all 3 packs in pilot
- keep pack order counterbalanced if possible
- use pilot results to decide whether Pack 2 or Pack 3 needs simplification before expanding to 6 main-study packs

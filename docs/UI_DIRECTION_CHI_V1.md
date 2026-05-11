# UI Direction V1

## Goal

Make the prototype feel like a professional CHI research system rather than a casual demo page.

The interface should emphasize:

- clear information hierarchy
- explicit study metadata
- restrained visual language
- readable panels for screenshots and paper figures
- visible separation between assistant output, memory state, and participant actions

## Design Direction

### 1. Research-first framing

The page should immediately communicate:

- what the system is
- what condition is active
- what task step the participant is in
- what kind of memory problem is under study

### 2. Teaser-friendly layout

The main page should read well as a screenshot in slides or a paper figure:

- left: task and assistant output
- center: memory workspace
- right: participant actions and impact preview

### 3. Restrained visual style

Avoid overly playful interface choices.

Prefer:

- muted neutrals
- one primary accent color
- disciplined typography
- explicit panel boundaries

### 4. Professional metadata

The page should expose concise prototype metadata such as:

- condition
- pack id
- error type
- task step

### 5. Support figure-making later

The layout should make it easy to capture:

- the initial failure state
- the repair interaction
- the post-repair outcome

## Concrete Guidance for This Prototype

In the current front-end, prioritize:

- concise hero text
- stronger study metadata in the header
- clean labels for task stage and recommendation state
- clear distinction between editable memory and impact preview
- reduced decorative wording in action prompts

## Why This Direction Fits CHI-style Project Pages

This direction is aligned with recent CHI-adjacent project and publication pages that foreground:

- a concise title and metadata block
- a teaser or hero artifact
- a short abstract-like explanation
- clean links to materials
- low-clutter presentation of the core system idea

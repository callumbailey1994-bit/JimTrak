# Ideas backlog

Keep this as a running list of future features/experiments. Prefer short, implementable items.

## V2 (next)
- Progression enforcement rules (e.g. if planned 5x5 not achieved, repeat weight next week; rules engine configurable per exercise type)
- Basic performance tracking:
  - Strength: PRs + estimated 1RM trends
  - Running: PBs (e.g. 5k) + pace/HR trends
  - Exercise history: “last time” and quick comparisons
- Analytics (v2 scope): weekly volume, intensity proxies, compliance/adherence
- Utility: rest timer (optional)
- AI coaching (OpenAI API) to surface suggestions based on adherence + performance metrics (explicit use-case TBD)

## V3 (later)
- In-app programme builder (create/edit programmes and sessions without Excel)
- Modular sessions/exercises + flexible rendering:
  - Support both “fixed commitments” (e.g. *club swim on Wednesday* as a scheduled block) and “structured suggested workouts” (e.g. swim session prescription: warm-up / intervals / cooldown)
  - UI should render appropriately per session type (similar to how conditioning blocks differ from per-exercise strength logging)
- Card-game programme builder UI (draw from constrained “packs”; reroll/pin/ban cards; randomness mainly for circuits/accessories, not primary lift progression)
- AI meal notes → calorie estimate (low-friction food logging: free-text meal description → approximate kcal/macros; store as a simple tracker)
- Interval detail logging toggles (optional per-interval splits/distances)
- Exercise library + autocomplete
- Templates: duplicate weeks, swap exercises, progression rules

## Infrastructure (whenever)
- Sync across devices (login + cloud storage)
- Optional Excel import (`.xlsx`) as a one-time migration path

## Integrations (research)
- Garmin sync:
  - Understand Garmin Connect data access options (official APIs vs partner programs)
  - OAuth/auth flow, rate limits, and what data is available (activities, HR, body metrics)
  - Decide whether to sync raw activities or only summaries into DeckBuilt


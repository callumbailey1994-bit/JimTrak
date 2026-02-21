# Decisions log

This exists so future work can continue without re-litigating old choices.

## Accepted

### 2026-02-21 — Phase 1: minimal logging granularity
- **Strength**: log **reps + weight per set**.
- **Scoring metric**: **one score per exercise** (e.g. RPE for strength; session-level metrics for cardio).
- **Rowing intervals**:
  - 10×500m: log **average split only** (not all 10 splits) in Phase 1.
  - 10×30s on / 30s off: log **total distance only** in Phase 1.

### 2026-02-21 — V2 product principle: deterministic, explainable programming
- **Decision**: The programme builder should be **deterministic and constraint/rule-based** (science-based, reproducible).
- **Why**: Users must be able to trust and understand the plan. “Why” explanations should be consistent with the actual logic.
- **AI stance**: LLMs can be used as an **optional assistant layer** (explanations, summaries, suggestions within constraints), but should not be the source of truth for programme structure.

### 2026-02-21 — Phase 1: “Today’s workout” uses a fixed start date
- **Decision**: Add a “Today’s workout” shortcut that maps real dates onto Week/Day using a programme start date.
- **Start date**: `2026-02-23` (Mon).


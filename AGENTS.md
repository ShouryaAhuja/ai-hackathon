# AGENTS.md

Read MEMORY.md + TASKS.md at session start. Read PRD/ARCHITECTURE/DESIGN/RULES only when relevant to the current task."

1. `MEMORY.md`  - current state, decisions, gotchas (source of truth for "where are we")
2. `RULES.md`   - engineering rules you must follow
3. `PRD.md`     - what we are building and why
4. `ARCHITECTURE.md` - how it is structured and deployed
5. `DESIGN.md`  - UI/UX standards
6. `TASKS.md`   - pick the first unchecked task and do ONLY that one

At the end of every task: tick it in `TASKS.md`, add a short entry to `MEMORY.md`, commit.
If anything here conflicts with the user's latest instruction, the user wins; then record the change in `MEMORY.md`.

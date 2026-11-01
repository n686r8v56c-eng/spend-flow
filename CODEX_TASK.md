# Spend Flow — KPI Growth Process: Personal / Social

Date: 2026-11-02
Repository: n686r8v56c-eng/Spend-Flow
Task: implement agreed KPI UI; no other app redesign.

## Objective and current code
Inspect the **latest main** code first, including `src/main.jsx`, `src/style.css`, `src/catalog.js` and `src/supabase.js`. Spend Flow is React/Vite with 5 bottom tabs (예산, 일정, 분석, 고정비·세금, 계획), a floating + expense entry, a KPI popup reached from the target icon in the upper-right of 예산, and authenticated Supabase `spend_flow_data` JSONB `payload`. Preserve the existing navigation and all other features; do not add a bottom tab.

## KPI popup structure
Within the existing KPI popup, add exactly two upper tabs: **개인 | 사회**. Both use independently foldable accordion section headers with a clear chevron. Multiple sections can be open simultaneously; click/tap on a header toggles only that section. Use accessible buttons with `aria-expanded`, mobile-friendly compact UI, and no click propagation from editing controls.

### 개인 — existing automatic KPIs only
Sections default open. Keep existing calculations and current target editing intact. Group the existing six KPI displays as:

**실행 Execution** (in order):
1. 무지출 데이 — actual / target count of no-spend days.
2. 연속 무지출 — current streak and longest streak.
3. 카테고리 예산 준수 — within-budget category count / configured categories.
4. 계획 소비율 — planned count / classified (planned + unplanned) count; exclude unknown.

**결과 Outcome** (in order):
1. 예산 남기기 — monthly balance and configured balance target.
2. 줄이기 소비 — existing previous-month reduction percentage; preserve N/A if no baseline.

Keep existing supporting **비계획 소비 금액** and **구매 포기 금액** visible under 결과 or in a compact secondary area. Purchase abandonment is **not** real savings. Do not change source data or KPI definitions or re-implement expense tracking.

### 사회 — user-managed KPIs
Show exactly four independent collapsible section headers, always in this order: **소셜, 브랜딩, 수익화, 경쟁**. Start collapsed by default. Each expanded group supports **추가, 수정, 삭제** of user-defined KPI entries. Editing controls need **name, target numeric value, unit, current numeric value**, with validation, stable IDs, cancel/save, delete confirmation. Display manual current and target values; do not invent seeded KPIs or automatically derive social metrics.

Persist entries using the **existing authenticated Supabase payload**, in a separate namespaced field (for example `growthSocialKpis` with keys social, branding, monetization, challenge). Older payloads missing the field must work with empty lists. Preserve `kpiTargets`, `kpiSettings` and all existing data; do not create a new Supabase table or schema migration unless demonstrably unavoidable. State updates must be immutable and robust to malformed old data. Show all four headers even when no KPI is saved. Keep data synchronized across devices through existing save logic.

## UI / UX
Keep Focus Flow style, purple/lavender/white/black/gray palette, iPhone-first compact cards/buttons, responsive iPad/desktop. Keep the existing five bottom tabs and floating + unchanged; only the target KPI popup is redesigned. Avoid extra explanatory boxes, duplicates, oversized gaps, horizontally overflowing cards, and dialogs wider than viewport. Ensure long KPI labels wrap or truncate appropriately, inputs fit narrow screens, and touch/keyboard interaction works.

## Existing functionality and data to preserve
Protect expense editing and receipts, category catalog and goals, planned vs unplanned classification, linked purchase plans (`planId`), budget calculator, monthly/category budgets, schedule, fixed expenses, taxes, analysis charts, account login, Supabase synchronization, import/export, current KPI calculations, and 90 Day Project Flow's existing read-only Spend data integration. No resets or destructive changes; do not expose secrets.

## Verification / acceptance
- Target icon opens KPI popup with Personal and Social tabs.
- Personal accordion has 4 KPI cards in 실행 and 2 in 결과, correct values and editability; supporting numbers remain visible.
- Both personal headings collapse independently; four social headings collapse independently; folding doesn't change data.
- Social CRUD edits name/target/unit/current, confirms deletion, persists after reload and re-login, and syncs across devices. Older accounts load with no social KPIs.
- Mobile iPhone, tablet and desktop UI have no popup/card overflow.
- Existing expense, budgets, plan purchase → expense, analytics, records, account login and read-only 90 Day integration still function.
- Run `npm run build`, existing tests and relevant regression tests. If automated tests are absent, explain manual checks explicitly. Never claim unperformed verification.

## Mandatory Codex execution and main delivery
1. Begin with the **latest main**.
2. Modify code on a **separate development branch** (not on this document branch).
3. Preserve existing functionality and Supabase data.
4. Run `npm run build` and relevant functional tests.
5. Check for regressions, errors and conflicts.
6. **If validation succeeds, merge to main and push without waiting for separate PR approval**, subject to branch protections and granted permissions.
7. Re-fetch and check latest main immediately before merging; resolve any divergence safely and re-test.
8. **Never force-push** or reset production data.
9. On conflicts, failing checks or permission limitations, **stop without merging** and report.
10. Check Cloudflare Pages **Production** deployment for the resulting main commit; report clearly if deployment status is not observable.
11. Report final main commit SHA, changed files, build/tests, deployment status, and any outstanding action.

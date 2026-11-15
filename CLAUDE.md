# CLAUDE.md — Codebase guide for AI agents

> Read this **first** when you join a new session. It points you to the
> authoritative spec, lists the rules that govern this codebase, and tells
> you where to find every file you'll likely touch. Keep your edits
> consistent with SPEC.md — that document is the single source of truth.

## TL;DR

* **What:** iOS app for FitPle (Korean sports meet-up matching). Same product as the Android Studio reference project, ported to React + Capacitor.
* **Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Capacitor iOS. No backend.
* **Persistence:** `localStorage` only. SHA-256 via Web Crypto. The full key schema is in SPEC §8.
* **Build target:** Web PWA demo (complete). The planned iOS/TestFlight build (P7–P8) was **not developed — project stopped 2026-11-15**; see HANDOFF.md §9 to resume.
* **Status / next steps:** `HANDOFF.md` (start here), history in `docs/HISTORY.md`, wiki index `docs/README.md`.
* **Don't:** add a backend, swap in a UI framework, change the bundle id, or rename design tokens without updating SPEC.md first.

## Read these before touching code

1. **`SPEC.md`** — 25 sections, ~1,600 lines. Authoritative for screens, flows, data models, colours, typography, build steps. If your change contradicts SPEC.md, update SPEC.md in the same commit.
2. **`HANDOFF.md`** — what was done last, what's next.
3. **`BUILD.md`** — every `npx cap …` / Xcode command you'll need.
4. **`docs/SOURCE_INVENTORY.md`** 🚨 **MANDATORY FIRST** — Exhaustive checklist of EVERY Android Kotlin/XML/drawable + designs/PNG. Before any audit or screen work, the Phase's checkbox must ALL be ✅. Otherwise sub-files get missed → repeated rework. Never start without going through this inventory.
5. **`docs/DESIGN_IMPLEMENTATION_GUIDE.md`** ⚠️ **MANDATORY** — Read after the inventory. Contains the pitfalls catalog (33+ items) + token mapping + shadow patterns. Skipping this guide is the #1 cause of repeated rework cycles.
6. **`docs/IMPLEMENTATION_AUDIT.md`** — Latest Android↔React deep audit findings (C1~C3 / H1~H3 / M1~M3 / L1~L2 by priority).
7. **`docs/FLOWS.md`** — 3 home-access flows (login/signup/guest) with screen-by-screen mapping.

Reference material outside this repo (read-only):

* `/Users/heebiny/AndroidStudioProjects/FitPle/app/src/main/java/com/example/fitple/` — Android Kotlin source. **Behavioural source of truth** for any flow not yet ported.
* `/Users/heebiny/AndroidStudioProjects/FitPle/app/src/main/res/values/colors.xml` — colour tokens (already extracted into `tailwind.config.ts`).
* `/Users/heebiny/AndroidStudioProjects/FitPle/designs/*.png` — design exports. Visual source of truth — see SPEC §25 for the analysis.
* `/Users/heebiny/AndroidStudioProjects/FitPle/docs/login_signup_flow.md` — auth flow diagram (already mirrored in SPEC §11).

## Project layout (what's in `src/`)

```
src/
├── App.tsx / main.tsx       shell (ErrorBoundary, Toaster, dev reset button) / root + `/?reset` hatch
├── index.css                Tailwind base + safe-area utilities + iOS-only 16px input rule
├── routes/                  AppRoutes (route table) · RequireAuth (guard + session restore) · ScrollManager
├── screens/                 auth/ (login + signup 5 steps) · main/ (13 screens) · SplashScreen
├── components/              layout/ · home/ · meeting/ · chat/ · common/ (LocationPicker) · auth/ · icons/ · dev/
├── store/                   authStore · chatStore · createdMeetingsStore · locationStore · preferenceStore
├── storage/                 userManager (async, SHA-256) · seedRunner · chatRepo · signupDraft (memory-only pw)
├── data/                    models.ts · seedData.ts (21 meetings, reviews, schedules, Android sample chat)
├── constants/               colors.ts · sports.ts (5-sport catalog + questions)
└── utils/                   date (isoDate — local, never toISOString) · meetingImage · hash · validation · cn · platform
tests/e2e/                   Playwright regression scripts + run-all.mjs (`npm run e2e`)
```

Target layout for new screens, stores, and components is documented in SPEC §5.

## House rules

### 1. Tokens, not raw values

Use the Tailwind tokens defined in `tailwind.config.ts`. Examples:

* ✅ `className="bg-orange text-textWhite"`
* ❌ `style={{ backgroundColor: '#FF5722', color: 'white' }}`

If you need the hex in JS (e.g. for a Capacitor plugin call), import from `constants/colors.ts`:

```ts
import { COLORS } from '@/constants/colors';
StatusBar.setBackgroundColor({ color: COLORS.orange });
```

### 2. Typography tokens

Use the named font-size tokens from `tailwind.config.ts > fontSize` — not arbitrary `text-[14px]` values. The 14 tokens are listed in SPEC §25.20.

* ✅ `className="text-body-strong"` → `15px / 700`.
* ❌ `className="text-[15px] font-bold"` — bypasses the design system.

### 3. Sports list is fixed

Sport names are the catalog in `constants/sports.ts`: **러닝 · 풋살 · 등산 · 사이클 · 골프** — in that order. Do not add 테니스 / 클라이밍 / 자전거; the Android original doesn't have them. The seed data, sport tile row, and `Meeting.sport` field all assume these five strings exactly.

### 4. `userManager` is async — every method

`crypto.subtle.digest` returns a Promise. Every call into `userManager` (except `isLoggedIn`, `setLoggedIn`, `logoutUser`, `savePendingSignup`, `clearPendingSignup`, `getPendingSignupEmail` which don't hash) is `async`. Awaiting is mandatory — TypeScript will complain if you forget, but the resulting bug (`[object Promise]` saved as a password hash) is silent at runtime.

### 5. Korean copy comes from the Android `strings.xml`

Inline Korean text in the UI must match the source. SPEC Appendix C has the full string table. Don't paraphrase ("환영합니다!" vs "안녕하세요!" matter).

### 6. Layout primitives

* Page horizontal padding: `20pt` (`px-5`).
* Toolbar height: `48pt` (`h-12`).
* Primary CTA height: `52pt` (`h-[52px]`).
* Card radius: `12pt` (`rounded-card` or `rounded-[12px]`).
* Bottom-sheet radius (top corners only): `20pt` (`rounded-t-sheet`).
* Safe area: no `PageFrame` component was created — each screen root applies `pt-safe`; fixed bottom bars use `pb-[calc(Npx+env(safe-area-inset-bottom))]` (plain `pb-safe` next to `pb-N`/`py-N` overrides it). Tab screens get `pb-nav-safe` from `MainLayout`.

### 7. State management

* `authStore.ts` (Zustand) — current user + isGuest. Created in Phase 1.
* `preferenceStore.ts` (Zustand) — signup-preference state machine. Created in Phase 3.
* `chatStore.ts` (Zustand) — chat message lists, keyed by meetingId. Initial value from `storage/chatRepo.loadChat`.
* `createdMeetingsStore.ts` / `locationStore.ts` (Zustand) — session-only, mirroring Android `UserCreatedMeetings` / `LocationState`.
* Selectors must return stable references — never `s.x ?? []`; use a module-level `EMPTY_*` constant (zustand v5 `getSnapshot` warning / render loop).
* Local component state otherwise. Don't promote ephemeral form state to Zustand.

### 8. Routes

React Router v6, BrowserRouter (Capacitor serves `index.html` from the bundle, hash routing not needed). The route table is fixed in SPEC §10.1. Always wrap member-only routes with `RequireAuth`.

### 9. Asset imports

* Bitmap images live under `src/assets/images/` and are imported as ES modules so Vite hashes them.
* SVG icons that don't change live under `public/icons/` and are referenced by absolute path (`/icons/foo.svg`).
* `lucide-react` is the default icon source for system glyphs (back arrow, bell, search, heart, share, etc.). Use SVG exports for brand/sport icons.

### 10. Testing

* `npm run typecheck` (`tsc --noEmit`) is the minimum bar. Run after every meaningful change.
* Before calling work done: `npm run build`, then with `npm run dev` running, `npm run e2e` (all Playwright suites, 249 checks as of 2026-11-15). Add a regression check in `tests/e2e/` for every bug you fix. See `tests/e2e/README.md`.

## When to update SPEC.md

Update the spec **in the same commit** as the code change whenever you:

* Add or remove a screen.
* Change a screen's layout, copy, or interaction model.
* Add or remove a colour, font size, or other design token.
* Change the localStorage key schema, sport list, or any model field.
* Change build / signing / release steps.

If the change is purely a refactor (no behaviour change, no API surface change) the spec doesn't need a bump — but call it out in your commit message.

## Phase status

As of 2026-11-15 (see `HANDOFF.md` / `docs/COMPLETION_STATUS.md`):

* P0–P6 (foundations → all screens) ✅ — all 21 Android fragments ported; 20 match Android + design PNGs, 1 partial (UpcomingMeeting card tap has no detail link).
* Full code/design review fixes landed in `92ce567`; regression 249/249.
* P7–P8 (iOS integration / release) — **not developed, project stopped.**
* All work lives on `feature/phase-2-login`; it has not been merged to `develop` yet (HANDOFF §0, §7-1).

**Source-of-truth precedence for porting:** layout/visual → design PNG; copy/behaviour → Android Kotlin + `strings.xml`. Record the decision in the file's header comment when they differ.

## Quick orientation snippets

When you don't know where to start, these one-liners help:

```bash
grep -n '^##' SPEC.md                              # SPEC chapters
grep -rn 'TODO' src/                               # outstanding work
grep -rn '준비 중' src/                            # placeholder toasts
cat /Users/heebiny/AndroidStudioProjects/FitPle/app/src/main/java/com/example/fitple/ui/auth/SignupPreferenceFragment.kt | head -100
```

## Don'ts (common pitfalls)

* ❌ Importing `@capacitor/core` at the top level of a module. Use `utils/platform.ts` helpers — they branch safely on web.
* ❌ Writing screen titles in English. Korean copy is the product.
* ❌ Adding network calls. No backend in v1.
* ❌ Storing the password plaintext anywhere. Always `await sha256(...)`.
* ❌ Rewriting `seedRunner` to re-seed on every launch. The `seeded` flag exists so user-edited chat messages aren't wiped on relaunch.
* ❌ Disabling `strict` in `tsconfig.json`. It catches most async/promise mistakes.

---

Last updated: 2026-11-15.

# CLAUDE.md — Codebase guide for AI agents

> Read this **first** when you join a new session. It points you to the
> authoritative spec, lists the rules that govern this codebase, and tells
> you where to find every file you'll likely touch. Keep your edits
> consistent with SPEC.md — that document is the single source of truth.

## TL;DR

* **What:** iOS app for FitPle (Korean sports meet-up matching). Same product as the Android Studio reference project, ported to React + Capacitor.
* **Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Capacitor iOS. No backend.
* **Persistence:** `localStorage` only. SHA-256 via Web Crypto. The full key schema is in SPEC §8.
* **Build target:** TestFlight / App Store (iOS 15+). Web PWA build is a free side-effect.
* **Don't:** add a backend, swap in a UI framework, change the bundle id, or rename design tokens without updating SPEC.md first.

## Read these before touching code

1. **`SPEC.md`** — 25 sections, ~1,600 lines. Authoritative for screens, flows, data models, colours, typography, build steps. If your change contradicts SPEC.md, update SPEC.md in the same commit.
2. **`HANDOFF.md`** — what was done last, what's next.
3. **`BUILD.md`** — every `npx cap …` / Xcode command you'll need.
4. **`docs/DESIGN_IMPLEMENTATION_GUIDE.md`** ⚠️ **MANDATORY** — Read before implementing/modifying ANY screen from `designs/*.png` or Figma. Contains the pitfalls catalog (19+ items so far) and token mapping. Skipping this guide is the #1 cause of repeated rework cycles.
5. **`docs/FLOWS.md`** — 3 home-access flows (login/signup/guest) with screen-by-screen mapping.

Reference material outside this repo (read-only):

* `/Users/heebiny/AndroidStudioProjects/FitPle/app/src/main/java/com/example/fitple/` — Android Kotlin source. **Behavioural source of truth** for any flow not yet ported.
* `/Users/heebiny/AndroidStudioProjects/FitPle/app/src/main/res/values/colors.xml` — colour tokens (already extracted into `tailwind.config.ts`).
* `/Users/heebiny/AndroidStudioProjects/FitPle/designs/*.png` — design exports. Visual source of truth — see SPEC §25 for the analysis.
* `/Users/heebiny/AndroidStudioProjects/FitPle/docs/login_signup_flow.md` — auth flow diagram (already mirrored in SPEC §11).

## Project layout (what's in `src/`)

```
src/
├── App.tsx                  app shell (currently placeholder)
├── main.tsx                 React root
├── index.css                Tailwind base + safe-area helpers + iOS 16px enforce
├── constants/
│   ├── colors.ts            COLORS object (mirrors tailwind.config.ts)
│   └── sports.ts            5-sport catalog + 14 detail questions (matches SPEC §15)
├── data/
│   ├── models.ts            UserProfile, Meeting, ChatMessage, Review, ScheduleItem
│   └── seedData.ts          demo accounts + 15 meetings + reviews + schedules + chats
├── storage/
│   ├── userManager.ts       async UserManager (Android UserManager.kt 1:1 port)
│   └── seedRunner.ts        first-run seed injection ("seeded" flag)
├── utils/
│   ├── hash.ts              Web Crypto SHA-256 wrapper
│   ├── validation.ts        email / password / nickname rules (matches Android)
│   ├── date.ts              dayjs helpers — DateStrip, hero date, Korean weekday
│   ├── cn.ts                className combiner
│   └── platform.ts          isNative / isIOS / isStandalonePWA detection
└── vite-env.d.ts
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
* Safe area: every full-screen view wraps in a `PageFrame` (to be created in Phase 2) that applies `pt-safe` and `pb-safe` utilities defined in `index.css`.

### 7. State management

* `authStore.ts` (Zustand) — current user + isGuest. Created in Phase 1.
* `preferenceStore.ts` (Zustand) — signup-preference state machine. Created in Phase 3.
* `chatStore.ts` (Zustand) — chat message lists, keyed by meetingId. Created in Phase 5.
* Local component state otherwise. Don't promote ephemeral form state to Zustand.

### 8. Routes

React Router v6, BrowserRouter (Capacitor serves `index.html` from the bundle, hash routing not needed). The route table is fixed in SPEC §10.1. Always wrap member-only routes with `RequireAuth`.

### 9. Asset imports

* Bitmap images live under `src/assets/images/` and are imported as ES modules so Vite hashes them.
* SVG icons that don't change live under `public/icons/` and are referenced by absolute path (`/icons/foo.svg`).
* `lucide-react` is the default icon source for system glyphs (back arrow, bell, search, heart, share, etc.). Use SVG exports for brand/sport icons.

### 10. Testing

* `npx tsc --noEmit` is the minimum bar. Run after every meaningful change.
* If you add unit tests, use Vitest (zero config needed). Add `npm run test` to `package.json` when you do.

## When to update SPEC.md

Update the spec **in the same commit** as the code change whenever you:

* Add or remove a screen.
* Change a screen's layout, copy, or interaction model.
* Add or remove a colour, font size, or other design token.
* Change the localStorage key schema, sport list, or any model field.
* Change build / signing / release steps.

If the change is purely a refactor (no behaviour change, no API surface change) the spec doesn't need a bump — but call it out in your commit message.

## Phase status

Per HANDOFF.md, the project is between Phase 0 (foundations) and Phase 1 (data + routing). The Phase 0 polish that just landed:

* `tailwind.config.ts` now has the final 24 colours + 14 typography tokens.
* `constants/sports.ts` has the correct 5-sport catalog with full question banks.
* `constants/colors.ts`, `utils/cn.ts`, `utils/date.ts`, `utils/platform.ts` added.
* `data/seedData.ts` rebuilt against the correct sports + real image filenames.
* `BUILD.md`, `CLAUDE.md`, `.nvmrc` added.

Next up is **Phase 1: routing, slide transitions, auth store, repos.** See SPEC §20.

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

Last updated: 2026-05-25.

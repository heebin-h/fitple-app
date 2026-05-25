# FitPle iOS — Full Technical Specification

> **Single source of truth** for building the iPhone version of FitPle.
> **Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Capacitor (iOS).
> **Backend:** None. All persistence lives in the device's local storage.
> **Reference implementation:** Android Studio project at `/Users/heebiny/AndroidStudioProjects/FitPle/` and design exports in `/Users/heebiny/AndroidStudioProjects/FitPle/designs/`.
> **Working tree:** `/Users/heebiny/fitple-app/` (already scaffolded with Vite + React + Tailwind + PWA + Capacitor iOS).
> **Audience:** Any engineer or AI agent that needs to implement screens, data flows, or release tasks without having to read the Android source first.

---

## Table of Contents

1. Product Summary
2. Goals, Non‑Goals, and Out of Scope
3. Tech Stack
4. Build Targets and Capacitor Topology
5. Project Layout
6. Design System
7. Data Model
8. Local Storage Schema and Seed Policy
9. State Management
10. Routing and Navigation
11. Authentication Flows
12. Screen Specifications
13. Component Inventory
14. Asset Inventory and Import Strategy
15. Sport Catalog and Preference Question Bank
16. iOS-Specific Behaviour
17. Permissions and Privacy
18. Build, Distribution, and Release
19. Test Plan and Acceptance Criteria
20. Implementation Milestones
21. Risks and Open Questions
22. Appendix A — Android → iOS Pattern Map
23. Appendix B — Glossary
24. Appendix C — Sample Strings (Korean copy used by the app)

---

## 1. Product Summary

FitPle is a sports meet-up matching app. Users sign up with email, pick the sports they enjoy, and browse local recurring meet-ups ("정기모임"), trial meet-ups ("체험"), and recommended groups. The headline interactions are:

* Discover meet-ups by sport, location, and schedule.
* Open a meet-up detail page with tabs for **Home / Board / Chat / Photos / Members** and an "Apply" CTA.
* Read reviews from past attendees and browse a 7-day date strip showing upcoming recurring meet-ups.
* Optionally browse the entire catalog as a **guest** (no account) with login prompts on member-only actions.

The Android app is feature-complete as a single-Activity + Fragment app with a hard-coded seed dataset, file-based user storage, and SHA-256 password hashing — there is no backend. The iOS app reproduces the same experience using a React PWA bundled into a native iOS shell with Capacitor.

## 2. Goals, Non‑Goals, and Out of Scope

### 2.1 Goals
* Pixel-faithful reproduction of every Android screen, with iPhone safe-area and gesture support.
* Identical product behaviour: same flows, same copy, same validation rules, same seed data, same hashing.
* Native-feeling navigation: slide transitions, bottom tab bar that respects the home indicator, modal bottom sheets, swipe-back gesture.
* Installable through the standard App Store pipeline (Xcode → App Store Connect → TestFlight → production).
* Same codebase that drives the web PWA — only the host shell (Capacitor iOS) and a few platform adapters differ.

### 2.2 Non-Goals
* Server, REST API, real-time backend, or push backend.
* Multi-device data sync. Each install owns its own data.
* Account portability between iOS, Android, and web — they are three independent installs with the same seed.
* Real social login (Kakao, Apple, Google buttons remain wired to "Coming soon" toasts).

### 2.3 Explicitly Out of Scope (deferred to v2)
* Real-time chat over WebSocket. Chat is local-only seed + user-typed messages persisted to `localStorage`.
* Push notifications and background tasks.
* Map view, GPS-based search, geocoding. Locations are plain text strings.
* In-app purchases, payments, monetisation.
* Image upload, profile picture editing, photo gallery uploads.
* Dark mode, dynamic type beyond default, multi-language (Korean only).
* Accessibility audit (VoiceOver compatibility planned but not certified for v1).
* Password reset, account deletion, social account linking.

## 3. Tech Stack

```
Application
├── React 18 + TypeScript          UI runtime
├── Vite 8                         Build tool + dev server
├── Tailwind CSS v3                Styling (utility classes)
├── React Router v6                Client-side routing
├── Zustand 5                      Global state (auth, ephemeral UI)
├── Vaul 1                         Mobile bottom sheet primitive
├── lucide-react                   Icon set
├── react-hot-toast                Toast notifications
├── dayjs                          Date formatting / date strip math
└── vite-plugin-pwa                Service worker + manifest (web only)

Cryptography
└── Web Crypto API (crypto.subtle.digest)   SHA-256 (browser-native; works in WKWebView)

iOS Host
├── @capacitor/core 8              JS bridge
├── @capacitor/ios 8               Native iOS project generator
├── @capacitor/cli 8               Build orchestration
└── Xcode 15+                      Native compilation & signing

Optional Capacitor plugins (added when the related feature lands)
├── @capacitor/splash-screen       Native splash control
├── @capacitor/status-bar          Status bar style management
├── @capacitor/keyboard            Keyboard show/hide events + safe-area assist
├── @capacitor/haptics             Light haptic on primary CTA (optional polish)
├── @capacitor/share               System share sheet (Phase 5+ "공유" button)
└── @capacitor/preferences         (alternative to localStorage if WKWebView quota becomes a concern)
```

Already pinned in `package.json`:

```
@capacitor/core      ^8.3.4
@capacitor/ios       ^8.3.4
@capacitor/cli       ^8.3.4   (dev)
react                ^18.3.1
react-dom            ^18.3.1
react-router-dom     ^6.30.3
zustand              ^5.0.13
vaul                 ^1.1.2
lucide-react         ^1.16.0
react-hot-toast      ^2.6.0
dayjs                ^1.11.20
tailwindcss          ^3.4.19  (dev)
vite                 ^8.0.14  (dev)
vite-plugin-pwa      ^1.3.0   (dev)
```

## 4. Build Targets and Capacitor Topology

* **Bundle identifier:** `team.fitple.sideproject` (already configured in `capacitor.config.ts`).
* **App name:** `FitPle`.
* **Web directory:** `dist/` — Vite's production output is what Capacitor copies into the iOS bundle.
* **iOS deployment target:** iOS 15.0 minimum (covers safe-area + WKWebView + Sign in with Apple if we ever wire it). Build with the latest stable Xcode.
* **Orientations supported:** Portrait only. Match the Android `defaultConfig` and the PWA manifest (`orientation: 'portrait'`).
* **Webview:** WKWebView via Capacitor. `crypto.subtle` is available in WKWebView, so the existing `utils/hash.ts` works as-is.

Capacitor configuration lives at `capacitor.config.ts`:

```ts
const config: CapacitorConfig = {
  appId: 'team.fitple.sideproject',
  appName: 'FitPle',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};
```

For iOS we will additionally enable:

```ts
// proposed additions
server: {
  androidScheme: 'https',
  iosScheme: 'fitple', // optional custom scheme; default is 'capacitor'
},
ios: {
  contentInset: 'always', // give Capacitor control over the safe-area padding
},
plugins: {
  SplashScreen: {
    launchAutoHide: false,         // we hide it manually after seedRunner finishes
    backgroundColor: '#FFFFFF',
    showSpinner: false,
  },
  StatusBar: {
    style: 'DEFAULT',              // dark text on white background
    backgroundColor: '#FFFFFF',    // iOS ignores backgroundColor but Android uses it
  },
  Keyboard: {
    resize: 'native',
    resizeOnFullScreen: true,
  },
},
```

### 4.1 First-time iOS setup commands

These run once per machine:

```bash
# 1. Build the web bundle
npm install
npm run build

# 2. Add the iOS native project (generates ios/App/...)
npx cap add ios

# 3. Copy the latest web assets and sync plugins
npx cap sync ios

# 4. Open the Xcode workspace
npx cap open ios
```

After this, the iterative loop becomes:

```bash
npm run build && npx cap sync ios   # whenever JS/TS changes
# then either ⌘R inside Xcode, or:
npx cap run ios --target=<device-id>
```

## 5. Project Layout

The repo currently looks like:

```
fitple-app/
├── capacitor.config.ts
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── dist/                          # build output (Capacitor reads from here)
├── public/                        # PWA + iOS launch assets
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── constants/
    │   └── sports.ts              # SPORT catalog + question bank
    ├── data/
    │   ├── models.ts              # UserProfile, Meeting, …
    │   └── seedData.ts            # Demo accounts + dummy meetings/reviews/schedules/chats
    ├── storage/
    │   ├── userManager.ts         # 1:1 port of Android UserManager.kt
    │   └── seedRunner.ts          # First-run seed injection
    └── utils/
        ├── hash.ts                # Web Crypto SHA-256 wrapper
        └── validation.ts          # Email / password / nickname rules
```

The target layout for the full iOS build adds the screen, component, store, route, and asset directories that Phase 1 onward will create:

```
src/
├── App.tsx
├── main.tsx
├── index.css
├── routes/
│   ├── AppRoutes.tsx              # BrowserRouter + route tree
│   ├── RequireAuth.tsx            # Guard for member-only routes
│   └── transitions.tsx            # CSS slide-in/out wrappers (matches Android slide_in_*)
├── screens/
│   ├── SplashScreen.tsx
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   ├── EmailLoginScreen.tsx
│   │   ├── SignupEmailScreen.tsx
│   │   ├── SignupPasswordScreen.tsx
│   │   ├── SignupNicknameScreen.tsx
│   │   ├── SignupPreferenceScreen.tsx
│   │   └── SignupCompleteScreen.tsx
│   └── main/
│       ├── HomeScreen.tsx
│       ├── GuestHomeBranch.tsx    # Used inside HomeScreen when isGuest
│       ├── ExerciseScreen.tsx
│       ├── PostDetailScreen.tsx
│       ├── PostChatScreen.tsx
│       ├── RecommendedGroupScreen.tsx
│       └── UpcomingMeetingScreen.tsx
├── components/
│   ├── layout/
│   │   ├── BottomNav.tsx
│   │   ├── PageFrame.tsx          # Safe-area aware wrapper (replaces MobileFrame on device)
│   │   └── Toolbar.tsx            # Reusable top bar (back / title / right slot)
│   ├── common/
│   │   ├── InputBox.tsx
│   │   ├── EmailSuggestion.tsx
│   │   ├── PasswordField.tsx
│   │   ├── PrimaryButton.tsx
│   │   ├── SportIcon.tsx
│   │   ├── Chip.tsx
│   │   ├── FilterChip.tsx
│   │   ├── Badge.tsx
│   │   └── TermsBottomSheet.tsx   # Vaul-based bottom sheet
│   ├── home/
│   │   ├── HeroCard.tsx
│   │   ├── SportRow.tsx
│   │   ├── TrialMeetingCard.tsx
│   │   ├── ReviewCard.tsx
│   │   ├── DateStrip.tsx
│   │   ├── ScheduleCard.tsx
│   │   ├── ActiveMeetingCard.tsx
│   │   ├── CtaSection.tsx
│   │   └── HomeFab.tsx
│   └── meeting/
│       ├── MeetingCard.tsx
│       ├── GroupListItem.tsx
│       ├── DetailHeader.tsx
│       ├── DetailTabs.tsx
│       ├── NoticeListItem.tsx
│       └── ChatBubble.tsx
├── store/
│   ├── authStore.ts               # currentUser, isGuest
│   ├── preferenceStore.ts         # SELECTION → DETAIL state machine
│   └── chatStore.ts               # Active meetingId → messages
├── storage/
│   ├── userManager.ts
│   ├── seedRunner.ts
│   ├── meetingsRepo.ts            # CRUD against localStorage 'meetings'
│   ├── reviewsRepo.ts
│   ├── schedulesRepo.ts
│   └── chatsRepo.ts
├── data/
│   ├── models.ts
│   └── seedData.ts
├── utils/
│   ├── hash.ts
│   ├── validation.ts
│   ├── date.ts                    # dayjs helpers: M/D, day-of-week, 7-day strip
│   ├── cn.ts                      # className combiner
│   └── platform.ts                # Capacitor detection helpers
├── constants/
│   ├── colors.ts
│   └── sports.ts
└── assets/
    └── images/                    # img_meeting_*, img_trial_*, img_profile_*, ic_*
```

Out at the project root the iOS shell appears under `ios/` after `npx cap add ios`:

```
ios/
└── App/
    ├── App/
    │   ├── Info.plist
    │   ├── AppDelegate.swift
    │   ├── Assets.xcassets/       # AppIcon + LaunchImage
    │   └── public/                # mirror of dist/
    ├── App.xcodeproj
    └── App.xcworkspace
```

## 6. Design System

### 6.1 Brand colours

Direct port of `app/src/main/res/values/colors.xml`. Drop these into `tailwind.config.ts` under `theme.extend.colors`:

| Token                      | Hex        | Used for                                                |
|----------------------------|-----------|----------------------------------------------------------|
| `orange`                   | `#FF5722` | Brand primary, CTA, active tab indicator                 |
| `orangeTint`               | `#FFF0ED` | Sport icon backgrounds when selected                     |
| `textPrimary`              | `#111111` | Body text                                                |
| `textSecondary`            | `#555555` | Sub-text, captions                                       |
| `textHint`                 | `#AAAAAA` | Placeholder, system chat messages                        |
| `textDisabled`             | `#CCCCCC` | Inactive button labels                                   |
| `borderDefault`            | `#DDDDDD` | Input default                                            |
| `borderActive`             | `#333333` | Input focused                                            |
| `borderValid`              | `#2196F3` | Input passed validation                                  |
| `borderError`              | `#FF4444` | Input failed validation                                  |
| `surface`                  | `#FFFFFF` | Card / sheet background                                  |
| `background`               | `#F2F2F2` | Page background                                          |
| `btnKakao`                 | `#FEE500` | Kakao login button                                       |
| `btnDisabled`              | `#CCCCCC` | Primary button disabled state                            |
| `blue`                     | `#2196F3` | Email verification, check icons                          |
| `blueTint`                 | `#E3F2FD` | Card tint (signup complete preview)                      |
| `green`                    | `#4CAF50` | Success                                                  |
| `greenTint`                | `#E8F5E9` | Card tint                                                |
| `cardWarm`                 | `#FFF3E0` | Card tint                                                |
| `cardPink`                 | `#FCE4EC` | Card tint                                                |
| `cardPurple`               | `#EDE7F6` | Card tint                                                |
| `error`                    | `#FF4444` | Error text                                               |
| `badgeDark`                | `#CC222222`| Dark translucent badge over imagery                     |
| `gradientStart`            | `#00000000`| Review-card gradient top                                |
| `gradientEnd`              | `#E6000000`| Review-card gradient bottom                             |
| `sportLightAccent`         | `#F5AA96` | Light highlight border (preference DETAIL phase)         |
| `sportLightTint`           | `#FFF5F2` | Light highlight background                               |
| `noticeBg`                 | `#FEF7F7` | Notice badge background                                  |
| `noticeRed`                | `#EB5048` | Notice badge text / icon                                 |
| `googleBlue / Green / Yellow / Red` | `#4285F4 / #34A853 / #FBBC05 / #EA4335` | Google logo glyph slices |

> The current `tailwind.config.ts` has placeholder values. Replacing them is **task 0** of any implementation pass.

### 6.2 Typography

* Default font stack: **Pretendard**, then `system-ui`, then `-apple-system`, then `sans-serif`. Already configured in `tailwind.config.ts` and `index.css`. Pretendard is bundled via `https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css` (or self-host under `public/fonts/`).
* Base size 14px / line-height 1.4 for body. 16px for inputs to avoid iOS Safari auto-zoom — already enforced in `src/index.css`.
* Title weights match the Android `Typeface.BOLD` calls in the source. Use `font-bold` for headlines, `font-semibold` for card titles, default weight everywhere else.

### 6.3 Spacing, radii, shadows

* 4 px base. Standard horizontal page padding is **20 px** (matches the 20dp gutter seen across Android XML).
* Card radius **16 px**. Chip radius **999 px** (pill). Image radius **12 px**.
* Shadows are minimal in the Android app — use Tailwind `shadow-sm` for floating elements (FAB, bottom nav) and none elsewhere.

### 6.4 Iconography

* Replace Android vector drawables with `lucide-react` equivalents wherever a sensible match exists (`Search`, `Bell`, `MapPin`, `Heart`, `Share2`, `Send`, `ChevronDown`, `Plus`, `Check`).
* Custom illustrations (sport mascots, banner art, trial-ticket icon, crown badges, bolt logo) are imported as PNG/SVG from `assets/images/` and rendered as `<img>` or inline `<svg>`.

### 6.5 Motion

* Page transitions: `slide-in-right` on push, `slide-out-left` on hide, `slide-in-left` on back, `slide-out-right` on dismiss. Implement with a wrapper that uses CSS `transform: translate3d` + `transition: transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1)` triggered by React Router location changes.
* iOS swipe-back gesture: handled natively by WKWebView only if no JS intercepts. We allow browser back, and pages must be safe to unmount via `useEffect` cleanups.
* Bottom sheet animation: handled by Vaul (drag-to-dismiss, spring snap).
* Toasts: `react-hot-toast` default slide.

## 7. Data Model

All models live in `src/data/models.ts` and mirror the Kotlin `data class` definitions one-to-one. The iOS spec keeps the field names identical so the same `seedData.ts` works on web and iOS without divergence.

```ts
export interface UserProfile {
  email: string;                                        // normalized: trim + lowercase
  nickname: string;
  passwordHash: string;                                 // SHA-256 hex
  selectedSports: string[];                             // e.g. ['러닝', '골프']
  sportDetails: Record<string, Record<string, string>>; // sport → question → answer
}

export interface Meeting {
  id: string;
  title: string;
  groupName: string;
  sport: string;                                        // one of SPORT_NAMES
  image: string;                                        // asset filename or import key
  location: string;                                     // freeform Korean text (e.g. '미사 1동')
  memberCount: number;
  maxMembers: number;
  level?: string;                                       // '보통' | '중급' | '상급' | …
  date?: string;                                        // 'YYYY-MM-DD'
  time?: string;                                        // 'HH:mm'
  description?: string;
  isUrgent?: boolean;                                   // shows "한자리 남았어요!!" badge
  lastActiveMinutes?: number;                           // "{n}분전 활동"
  meetingTime?: string;                                 // human-readable cadence, e.g. '매주 토 오전 8:00'
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  senderName: string;       // '' when isSystem
  message: string;
  timestamp: number;        // Unix epoch ms (the seed also accepts '오후 3:20' style strings; normalise on read)
  isMe: boolean;
  isSystem: boolean;
}

export interface Review {
  id: string;
  nickname: string;
  activity: string;        // '싱글벙글 러닝크루 후기'
  text: string;
  image: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  date: string;            // 'YYYY-MM-DD' (Android stores 'M/D'; normalise both ways in date.ts)
  time: string;            // '오전 8:00' style display text
  sport: string;
  image: string;
  day: string;             // '월'..'일' (day-of-week label used to match the DateStrip)
  level: string;           // '보통' default
  location: string;
  memberCount: number;
  isUrgent: boolean;
}

export interface NoticeItem {
  id: string;
  title: string;
  preview: string;
  date: string;            // 'YYYY.MM.DD' display
  hasThumbnail: boolean;
  meetingId: string;       // foreign key into Meeting.id
}
```

A meeting maps roughly 1:1 to a "post" in the Android sense (`PostDetailFragment` arguments include `meetingId`, `title`, `groupName`, etc.).

## 8. Local Storage Schema and Seed Policy

### 8.1 Keys

| Key                              | Type            | Notes                                                                 |
|----------------------------------|-----------------|------------------------------------------------------------------------|
| `seeded`                         | `'true'`        | Set by `seedRunner` after a successful first-run injection.            |
| `current_user`                   | `string`        | Normalised email of the currently logged-in user. Absent = signed-out. |
| `pending_signup`                 | `string`        | Email of a user that finished nickname/terms but not preferences.      |
| `user:{sha256(email)}`           | JSON string     | Serialised `UserProfile`.                                              |
| `meetings`                       | JSON array      | Seeded meeting catalogue (Home + Exercise + RecommendedGroup pull from this). |
| `reviews`                        | JSON array      | Review carousel.                                                       |
| `schedules`                      | JSON array      | Upcoming meeting items.                                                |
| `notices:{meetingId}`            | JSON array      | Notice/board entries for the post-detail "게시판" tab.                  |
| `chats:{meetingId}`              | JSON array      | Chat transcript for a single meeting.                                  |
| `joined:{email}`                 | JSON array      | Meeting IDs the current member has joined (drives `setupActiveMeetings`).|

### 8.2 Hashing

Hash email and password with Web Crypto SHA-256 (`src/utils/hash.ts`). The wrapper is already implemented. All `userManager` methods are async because `crypto.subtle.digest` returns a Promise.

### 8.3 First-run seed (`seedRunner.ts`)

On every app boot, `seedIfFirstRun()` runs before mounting routes. If `seeded === 'true'` it short-circuits. Otherwise:

1. Register `SEED_DEMO_ACCOUNTS` via `userManager.saveUser` (this hashes their passwords correctly).
2. For the primary demo user (`demo@fitple.app`), preload selected sports so the Resume Signup dialog never triggers.
3. Persist `meetings`, `reviews`, `schedules`, `notices:{meetingId}` and each `chats:{meetingId}` blob from `SEED_CHATS`.
4. Write `joined:{demo@fitple.app}` if you want the demo account to land on the "Active Meetings" hero state.
5. Set `seeded='true'` last so a crash mid-seed re-runs cleanly.

### 8.4 Reset helper

Expose `resetAndReseed()` (already drafted) via the DevTools console for QA. Bind it to a long-press on the splash logo only in `import.meta.env.DEV` builds — not in production binaries.

### 8.5 Quota considerations

`localStorage` inside WKWebView is bounded per-origin to roughly 5 MB. Total seed weight is ≈ 200–500 KB. If the dataset grows (more chats or notices), switch to `@capacitor/preferences` (encrypted Keychain on iOS) or to IndexedDB. **Not required for v1.**

## 9. State Management

Zustand stores; one store per concern.

```ts
// authStore.ts
interface AuthState {
  currentUser: UserProfile | null;
  isGuest: boolean;
  setUser: (u: UserProfile | null) => void;
  enterGuest: () => void;
  exitGuest: () => void;
}
```

```ts
// preferenceStore.ts (signup step 5)
type Phase = 'SELECTION' | 'DETAIL';
interface PreferenceState {
  phase: Phase;
  selectedSports: string[];                          // preserves selection order
  detailQueue: string[];                             // sports[] copy used to drive DETAIL pages
  detailStep: number;                                // index into detailQueue
  detailSelections: Record<string, Record<string, number>>; // sport → question → option index
  selectSport: (sport: string) => void;
  beginDetail: () => void;
  setAnswer: (sport: string, q: string, optionIdx: number) => void;
  next: () => void;
  back: () => void;
  reset: () => void;
}
```

```ts
// chatStore.ts (PostDetail chat tab + standalone PostChatScreen)
interface ChatState {
  byMeetingId: Record<string, ChatMessage[]>;
  load: (meetingId: string) => Promise<void>;
  send: (meetingId: string, text: string, sender: string) => Promise<void>;
}
```

Local component state remains the default. Only promote to Zustand when:
* The value must outlive a screen unmount (auth user, signup-preference in-flight selections).
* Two screens read or write the same value (chat list refresh, joined meetings).

## 10. Routing and Navigation

### 10.1 Route tree

```
/                               SplashScreen
/login                          LoginScreen
/email-login                    EmailLoginScreen
/signup
  ├── /email                    SignupEmailScreen
  ├── /password                 SignupPasswordScreen   (state: email)
  ├── /nickname                 SignupNicknameScreen   (state: email, password)
  ├── /preference               SignupPreferenceScreen (state: email)
  └── /complete                 SignupCompleteScreen   (state: email)
/home                           HomeScreen             (renders Guest or Member branch)
/exercise                       ExerciseScreen
/explore                        RecommendedGroupScreen (no sport filter)
/explore/:sport                 RecommendedGroupScreen
/upcoming                       UpcomingMeetingScreen
/meeting/:meetingId             PostDetailScreen
/meeting/:meetingId/chat        PostChatScreen         (standalone chat, used by floating "Chat" entry points)
```

* React Router v6 + `BrowserRouter`. Inside the Capacitor WKWebView this still works because Capacitor serves `index.html` from the bundle and the SPA handles every path client-side.
* `RequireAuth` wraps any route that demands a real account (chat send, meeting create, MY tab). On rejection it pushes to `/login` and surfaces a `react-hot-toast` notification.
* Header/tab visibility:
  * `BottomNav` is rendered by `HomeScreen`, `ExerciseScreen`, `RecommendedGroupScreen` (top-level "Explore"), `UpcomingMeetingScreen` (when accessed from a tab).
  * The auth screens, signup flow, and `PostDetailScreen` hide the bottom nav (parity with Android `bottomNavigation.visibility = View.GONE`).

### 10.2 Slide transitions

Wrap `<Routes>` with a `<TransitionGroup>` (custom CSS) keyed on `location.pathname`:

```tsx
<div className={cn(
  'absolute inset-0 transition-transform duration-240 will-change-transform',
  forward ? 'translate-x-0' : '-translate-x-full',
)}>
  {children}
</div>
```

A small `useNavigationDirection` hook compares previous and current routes against a static priority list to decide which direction to slide. This recreates `slide_in_right/slide_out_left` exactly.

### 10.3 Hardware back / swipe-back

* iOS WKWebView treats edge-swipe as browser back. Allow it: do not call `preventDefault` on touch events.
* Inside a Capacitor app there is no hardware back button. The Android "press back twice to exit" pattern (`HomeFragment.onBackPressedDispatcher`) does not apply on iOS — drop it for the iOS build.
* Inside the signup flow, browser back still walks the stack screen-by-screen, which is the desired UX.

## 11. Authentication Flows

Authoritative flowchart is `/Users/heebiny/AndroidStudioProjects/FitPle/docs/login_signup_flow.md`. The iOS port preserves every branch and resume case.

### 11.1 First boot decision

```
App.tsx onMount
  ├── await seedIfFirstRun()
  ├── await userManager.getCurrentUser()
  │     ├── present → setUser → navigate('/home')   (1.5 s splash)
  │     └── absent  → navigate('/login')            (4.6 s splash)
```

Splash delays match Android (`FitpleMainActivity.kt`). For iOS we hide the native Capacitor splash with `SplashScreen.hide()` as soon as the JS-side splash takes over, so the user never sees a flicker.

### 11.2 Email login

1. `EmailLoginScreen` validates email with `^[^\s@]+@[^\s@]+\.[^\s@]+$` and password with `^(?=.*[A-Za-z])(?=.*\d).{8,20}$`.
2. While typing, auto-suggest `{id}@naver.com` / `{id}@gmail.com` (Android: `EmailSuggestion` chips above the keyboard).
3. On submit: `await userManager.loginUser(email, password)`.
4. On failure: red helper text "이메일 또는 비밀번호가 올바르지 않아요." under the password field.
5. On success: `userManager.setLoggedIn(email)` → `userManager.clearPendingSignup()` → `navigate('/home', { replace: true })`.

### 11.3 Sign-up (6 steps)

| Step | Screen                       | Side-effects                                                                                         |
|------|------------------------------|------------------------------------------------------------------------------------------------------|
| 1    | `SignupEmailScreen`          | Local validation + `userManager.isEmailTaken(email)` real-time check (debounced 200 ms).             |
| 2    | `SignupPasswordScreen`       | Regex check + confirm-match. No persistence.                                                         |
| 3    | `SignupNicknameScreen`       | Trim + length 2–10. Open `TermsBottomSheet`.                                                         |
| 4    | `TermsBottomSheet` (modal)   | 5 required checkboxes. On "동의하고 가입하기" → `userManager.saveUser` + `userManager.savePendingSignup`. |
| 5    | `SignupPreferenceScreen`     | SELECTION → DETAIL state machine (see §15). Skip available. On finish → `savePreferences` + `setLoggedIn` + `clearPendingSignup`. |
| 6    | `SignupCompleteScreen`       | Success animation + horizontally scrolling preview of 5 recommended meetings. CTA → `/home`.         |

### 11.4 Resume after force-quit

When the splash decides "not logged in" it routes to `/login`. The `LoginScreen` `useEffect` reads `userManager.getPendingSignupEmail()`. If non-null it presents a confirm dialog:

* **Continue** → `navigate('/signup/preference', { state: { email } })`.
* **Later** → dismiss; the flag is retained for the next visit.

The flag is also cleared if the user logs in successfully on the same device.

### 11.5 Guest mode

`LoginScreen` → "회원가입 없이 둘러보기" → `authStore.enterGuest()` → `navigate('/home')`. The home screen reads `isGuest` from the store and renders the guest branch (`GuestHomeBranch.tsx`):

* Hero copy is fixed: "모임을 둘러보는 중이에요!" with CTA "로그인하고 참여하기 →".
* "Active Meetings" section is omitted.
* Notification bell, FAB, "맞춤 모임 찾기" all show "로그인이 필요한 기능이에요" via `react-hot-toast`.
* Tabs **MY** and **Chat** are disabled; tapping them shows the same toast.

### 11.6 Logout

Member-only `MyScreen` (placeholder in v1) exposes a logout action. Implementation: `userManager.logoutUser()` → `authStore.setUser(null)` → `navigate('/login', { replace: true })`.

## 12. Screen Specifications

> The numbering matches the Android Fragment list so cross-referencing is trivial. Every screen lives in `src/screens/...` per §5. Each spec lists: **Purpose**, **Layout sketch** (top-to-bottom), **Data sources**, **Interactions**, **Edge cases**.

### 12.1 SplashScreen
* **Purpose:** Show the FitPle wordmark + bolt logo while `seedIfFirstRun()` and `getCurrentUser()` resolve.
* **Layout:** Center-aligned FitPle logo, orange bolt mark below. White background.
* **Data:** None.
* **Interactions:** None. Auto-navigates after `await Promise.all([seedIfFirstRun(), minDelay(isLoggedIn ? 1500 : 4600)])`.
* **Edge cases:** If seed throws, fall back to `/login` and log the error to the console.

### 12.2 LoginScreen
* **Purpose:** Entry point for non-authenticated users.
* **Layout:**
  * 1× hero illustration top (`sign_splash_login_emaillogin.png`).
  * Title with brand-coloured "핏플" span: "가장 편한 방법으로\n핏플을 시작해보세요!".
  * Trial coupon badge "회원가입하고 **1회 체험권** 받기!".
  * 4 social buttons: 카카오 (`btnKakao`), Apple (`btnApple`), Google (`btnGoogle`), 이메일로 시작하기 (`btnEmail`).
  * "회원가입" underlined text → `/signup/email`.
  * "회원가입 없이 둘러보기" underlined → guest mode.
* **Data:** `userManager.getPendingSignupEmail()` for resume dialog (see §11.4).
* **Interactions:**
  * Kakao / Apple / Google → toast "준비 중인 기능이에요".
  * Email → `/email-login`.
* **Edge cases:**
  * Pending dialog should suppress itself if the user is already on `/signup/*` (defensive when restored from history).

### 12.3 EmailLoginScreen
* **Purpose:** Existing user sign-in.
* **Layout:**
  * `Toolbar` with back button, no title (matches `layout_toolbar_email_login.xml`).
  * Two inputs (`InputBox`): Email, Password (visibility toggle).
  * "로그인" primary button.
  * Hint row: "비밀번호를 잊으셨나요?" → toast "준비 중".
  * "아직 계정이 없으신가요? 회원가입" underlined → `/signup/email`.
* **Data:** `userManager.loginUser`.
* **Interactions:** Submit on keyboard return when both fields valid.
* **Edge cases:** Repeated wrong attempts do not lock the account in v1.

### 12.4 SignupEmailScreen
* **Purpose:** Step 1.
* **Layout:** Title "이메일을 입력해주세요". `InputBox` with five states (empty, typing, invalid format, already taken, valid). When taken, helper text "이미 가입된 이메일이에요. **로그인하기**" with an underlined link that navigates to `/email-login` and pre-fills the email.
* **Data:** `userManager.isEmailTaken` debounced.
* **Interactions:** "다음" button enables only on `valid`.
* **Edge cases:** Trimming + lowercasing applied before storage; display value remains as typed.

### 12.5 SignupPasswordScreen
* **Purpose:** Step 2.
* **Layout:** Two `InputBox` (password + confirm). Live requirement chips: "영문 + 숫자", "8자 이상 20자 이하". Each turns green as it passes.
* **Data:** None.
* **Interactions:** "다음" enables when both rules pass and the values match.
* **Edge cases:** Show / hide eye toggles on both inputs.

### 12.6 SignupNicknameScreen
* **Purpose:** Step 3.
* **Layout:** Title "사용하실 닉네임을 입력해주세요". One `InputBox` (length 2–10). Helper text shows live character count "{n}/10".
* **Data:** None; pass through to terms sheet.
* **Interactions:** "다음" opens `TermsBottomSheet`. On agree it calls `userManager.saveUser(email, password, nickname)` then `userManager.savePendingSignup(email)` and navigates to `/signup/preference`.
* **Edge cases:** Disallow nicknames consisting entirely of whitespace after trim.

### 12.7 TermsBottomSheet
* **Purpose:** Modal step 4. Implemented as a Vaul `Drawer.Content` rendered from `SignupNicknameScreen`.
* **Layout:** Title "약관에 동의해주세요", 5 individual rows each prefixed with a brand-orange "**필수**" badge:
  1. 만 14세 이상입니다.
  2. 서비스 이용약관 동의
  3. 커뮤니티 이용약관 동의
  4. 개인정보 수집 및 이용 동의
  5. 위치 정보 수집 동의
  6. "모두 동의" master row.
  7. CTA: "동의하고 가입하기" (disabled until all 5 are checked).
* **Edge cases:** Master toggle propagates state both ways. Each row also exposes a chevron that should open the long-form terms text — in v1 chevron taps show a toast "곧 추가될 예정이에요".

### 12.8 SignupPreferenceScreen
* **Purpose:** Step 5. Two-phase state machine.
* **Layout (SELECTION phase):**
  * Header "관심있는 운동을 선택해주세요".
  * 5 large square sport tiles arranged in a 2-column grid + one centered: 러닝 / 풋살 / 등산 / 사이클 / 골프.
  * Each tile shows an icon, the sport label, and a checkmark badge once selected. Selected tiles get the dark highlight (`orangeTint` background + orange border).
  * "다음" enables when ≥ 1 sport is selected.
  * "건너뛰기" link in the top-right of the toolbar — calls `savePreferences(email, [], {})` then completes signup.
* **Layout (DETAIL phase):**
  * Header swaps to "{sportName} 정보를 알려주세요".
  * Horizontal progress strip (lighter tile for sports not currently focused).
  * 2–4 question cards depending on the sport (see §15).
  * "다음" cycles `detailStep` through `detailQueue`. After the last sport's last question, finishes signup.
* **Data:** Reads `SPORTS` from `constants/sports.ts`. Persists via `userManager.savePreferences`.
* **Interactions:** Back button must walk DETAIL → previous question → previous sport → SELECTION cleanly; do not lose answers. `useReducer` is preferred over chained `useState` setters.
* **Edge cases:** If launched with `state.email` missing (deep-link), redirect to `/signup/email`.

### 12.9 SignupCompleteScreen
* **Purpose:** Step 6, congratulatory landing.
* **Layout:** Centered check-circle icon, "가입이 완료 되었어요!" title, subtitle "이제 핏플과 함께 즐거운 운동을 시작해보세요". Horizontal carousel of 5 recommended meeting cards. CTA "핏플 시작하기".
* **Interactions:** CTA → `/home` with replace + reset stack.
* **Edge cases:** Pressing back is intercepted — both back and the X icon in the toolbar should also `/home` because the account is already active.

### 12.10 HomeScreen (member)
* **Purpose:** Authenticated landing.
* **Layout (top-to-bottom):**
  1. Top bar: location chip ("미사 1동 ▾"), search bar ("찾고싶은 모임이 있나요?"), bell icon.
  2. Hero card: greeting "안녕하세요 {nickname}님!", contextual subtitle + CTA — see three states below.
  3. Sport icon row (5 sports). Tap routes to `/explore/{sport}`.
  4. Section "활동 중인 모임" with filter chips (`가까운순`, `편하게`, `평일오후`, `주말`) and 3+ `MeetingCard` rows. "더보기 ›" routes to `/exercise`.
  5. Section "체험 가능 모임" — horizontal carousel of `TrialMeetingCard`. Apply button on each card routes to `/meeting/{id}`.
  6. Section "후기" — horizontal carousel of `ReviewCard` (image + gradient overlay + quote).
  7. Section "다가오는 정기모임" — `DateStrip` (7 days, today centred) + vertical list of `ScheduleCard`. "더보기 ›" routes to `/upcoming`.
  8. CTA banner: "나에게 딱맞는 모임이 없어 아쉬우신가요? / 직접 모임장이 되어 모임을 운영해보세요!" with "모임 만들기 →".
  9. Floating `+` FAB bottom-right (above bottom nav) → toast "모임 만들기 기능 준비 중이에요".
* **Hero card states** (logic identical to Android `HomeFragment.setupHero`):
  | State                                         | Title                                                      | CTA                  |
  |-----------------------------------------------|------------------------------------------------------------|----------------------|
  | No upcoming schedule today or tomorrow        | `안녕하세요 {nickname}님!\n아직 가입한 모임이 없어요`              | `가입하러 가기 →`     |
  | Schedule found for tomorrow                   | `안녕하세요 {nickname}님!\n다음 {sport}은 내일 {time}이에요 🏃`     | `일정 바로가기 →`     |
  | Schedule found for today                      | `안녕하세요 {nickname}님!\n오늘 {time} · {title}이 있어요`        | `일정 바로가기 →`     |
* **Data:** `meetingsRepo.getActive(currentUser)`, `meetingsRepo.getTrials()`, `reviewsRepo.list()`, `schedulesRepo.next7()`.
* **Interactions:** Search input is read-only in v1 (toast). Bell shows toast. Location chip shows toast.

### 12.11 HomeScreen (guest branch)
* Same skeleton minus the Active Meetings section, with the fixed hero text, and with login prompts replacing several actions (see §11.5).

### 12.12 ExerciseScreen
* **Purpose:** Vertical list of every meeting (Android `ExerciseFragment`).
* **Layout:** Toolbar with back + bell, location filter pill ("미사 1동 ▾"), then vertical `MeetingCard` list.
* **Data:** `meetingsRepo.list()` (no filter in v1; backing seed has 7+ rows).
* **Interactions:** Card tap → `/meeting/{id}`.

### 12.13 RecommendedGroupScreen
* **Purpose:** Sport-filtered discover view (Android `RecommendedGroupFragment`).
* **Layout:** Toolbar with back + title (`"{sport} 추천 모임"` or "추천 모임"). Condition chips (`가까운 순`, `편하게`, `평일 오후`, `주말`). Vertical `GroupListItem`.
* **Data:** `meetingsRepo.list().filter(sportMatch + chipPredicates)`.
* **Interactions:** Condition chip is a toggle (re-tap deselects). Card tap → `/meeting/{id}`.

### 12.14 UpcomingMeetingScreen
* **Purpose:** Calendar-style upcoming meetings (Android `UpcomingMeetingFragment`).
* **Layout:** Toolbar with back + search + bell. Header "YYYY년 M월". `DateStrip` (7 days, today centred). 2-column grid of upcoming meeting cards.
* **Data:** `schedulesRepo.range(±3 days)`.
* **Interactions:** Tapping a date filters the grid. Card tap → `/meeting/{id}`.

### 12.15 PostDetailScreen
* **Purpose:** Meeting detail with tabbed body (Android `PostDetailFragment`).
* **Layout:**
  * Hero image (meeting cover; falls back to `img_meeting_group_photo1` if missing).
  * Toolbar overlay with back, "찜하기" heart, share icon.
  * Title row: meeting name + sport badge.
  * Tab strip: **홈 / 게시판 / 채팅 / 사진첩 / 멤버**.
  * **홈 tab body:**
    * Group description.
    * Notice banner ("운영진 공지" + collapse toggle).
    * `기본정보` card with rows for `정기모임시간`, `모집 인원` ({n}/{max}명), `장소`.
    * Embedded map placeholder (WebView showing Kakao maps in Android; v1 uses a static map image with the location label overlay).
    * Sticky "1회 참가하기" button at the bottom.
  * **게시판 tab body:** Vertical list of `NoticeListItem` (title, preview, date, optional thumbnail).
  * **채팅 tab body:** Notice banner + scrollable message list + input row (text + send). Mirrors `PostChatScreen` markup.
  * **사진첩 / 멤버 tabs:** Placeholder "{tab} 기능을 준비 중이에요" centered.
* **Data:** Reads `meetingsRepo.get(meetingId)`, `notices:{meetingId}`, `chats:{meetingId}`.
* **Interactions:**
  * "1회 참가하기" → toast "참가 신청이 완료되었어요!" + button becomes disabled with label "참가 완료". State persists in `joined:{email}`.
  * Heart icon toasts "찜하기 기능 준비 중이에요" (kept for parity; even though wording differs we keep it).
  * Share icon → `@capacitor/share` to open the iOS share sheet with text "FitPle 모임 — {title}" (v1.1; v1 may toast).
* **Edge cases:**
  * Bottom navigation must hide while on this screen.
  * Notice banner collapse persists for the lifetime of the page (not stored).

### 12.16 PostChatScreen
* **Purpose:** Standalone chat screen used by future direct-chat entry points.
* **Layout:** Toolbar (back + title = meeting title), notice strip, scrollable message list, input row.
* **Data:** Same `chats:{meetingId}` blob as the in-detail chat tab.
* **Interactions:** Send appends a message with `isMe: true`, `senderName: '나'`, `timestamp: Date.now()`. Auto-scrolls to bottom.
* **Edge cases:** Keyboard avoidance — `@capacitor/keyboard` raises the input bar above the keyboard via `keyboardWillShow` events.

### 12.17 MyScreen (placeholder)
* **Purpose:** Logout entry point + profile preview.
* **Layout:** Avatar + nickname + email + "로그아웃" row + "이용약관" / "개인정보처리방침" / "버전 1.0.0".
* **Data:** `authStore.currentUser`.
* **Interactions:** Logout → `userManager.logoutUser()` → `authStore.setUser(null)` → `/login`.
* **Edge cases:** Tab is hidden when `isGuest` (login required toast instead).

## 13. Component Inventory

| Component                | File                                      | Notes |
|--------------------------|-------------------------------------------|-------|
| `PageFrame`              | `components/layout/PageFrame.tsx`         | Safe-area wrapper (`pt-safe`, `pb-safe`), background colour, optional max width when running in browser preview. |
| `Toolbar`                | `components/layout/Toolbar.tsx`           | Left slot (back/X), title, right slot (icons). Variants: transparent (over image) and solid white. |
| `BottomNav`              | `components/layout/BottomNav.tsx`         | 5 tabs (홈 / 체험 / 탐색 / 채팅 / MY). Active tint = orange. `safe-area-inset-bottom` padding. |
| `InputBox`               | `components/common/InputBox.tsx`          | 5-state field (default, typing, invalid, taken, valid). Clear button. Optional trailing icon. |
| `EmailSuggestion`        | `components/common/EmailSuggestion.tsx`   | Renders chips above the input. |
| `PasswordField`          | `components/common/PasswordField.tsx`     | Wraps `InputBox` with eye toggle and validation chips. |
| `PrimaryButton`          | `components/common/PrimaryButton.tsx`     | 56 px tall, orange background, white text. `disabled` swaps to `btnDisabled`. |
| `OutlineButton`          | `components/common/OutlineButton.tsx`     | Same shape, white background, 1 px border. |
| `SportIcon`              | `components/common/SportIcon.tsx`         | Three visuals: unselected / selected-dark / selected-light. |
| `Chip`                   | `components/common/Chip.tsx`              | Selectable pill. |
| `FilterChip`             | `components/common/FilterChip.tsx`        | Stateful filter chip (orange when active). |
| `Badge`                  | `components/common/Badge.tsx`             | Pill badge (sport name, "필수", "한자리 남았어요!!", "Level·중급"). |
| `TermsBottomSheet`       | `components/common/TermsBottomSheet.tsx`  | Vaul `Drawer.Root` with 5 + 1 rows. |
| `HeroCard`               | `components/home/HeroCard.tsx`            | Member and guest variants. |
| `SportRow`               | `components/home/SportRow.tsx`            | Horizontal scroll of 5 sport tiles. |
| `TrialMeetingCard`       | `components/home/TrialMeetingCard.tsx`    | Image + sport pill + activity stamp + member count + Apply button. |
| `ReviewCard`             | `components/home/ReviewCard.tsx`          | Photo + gradient overlay + nickname + activity + quote. |
| `DateStrip`              | `components/home/DateStrip.tsx`           | 7-day strip centred on today. |
| `ScheduleCard`           | `components/home/ScheduleCard.tsx`        | Level badge + sport badge + title + info row + thumbnail. |
| `ActiveMeetingCard`      | `components/home/ActiveMeetingCard.tsx`   | Compact card used in the "활동 중인 모임" rail. |
| `CtaSection`             | `components/home/CtaSection.tsx`          | "직접 모임장이 되어보세요" banner. |
| `HomeFab`                | `components/home/HomeFab.tsx`             | Floating `+` button. |
| `MeetingCard`            | `components/meeting/MeetingCard.tsx`      | Full-width row used in Exercise + Active rail. |
| `GroupListItem`          | `components/meeting/GroupListItem.tsx`    | Compact list row used in RecommendedGroup. |
| `DetailHeader`           | `components/meeting/DetailHeader.tsx`     | Hero image with overlay toolbar. |
| `DetailTabs`             | `components/meeting/DetailTabs.tsx`       | Tab strip + sliding indicator. |
| `NoticeListItem`         | `components/meeting/NoticeListItem.tsx`   | Notice row with optional thumbnail. |
| `ChatBubble`             | `components/meeting/ChatBubble.tsx`       | Variants: `me`, `other`, `system`. Other variant includes avatar + sender name + timestamp. |

## 14. Asset Inventory and Import Strategy

All raster assets currently live under `/Users/heebiny/AndroidStudioProjects/FitPle/designs/`. The following 1:1 mapping table guides the port — copy each file into `src/assets/images/`, import it from the component, and reference via Vite's hashed asset URL.

| Android resource (`drawable`) | iOS asset filename               | Used by                          |
|-------------------------------|----------------------------------|----------------------------------|
| `img_meeting_running_group1`  | `img_meeting_running_group1.png` | Recent + Active home, ScheduleCard |
| `img_meeting_running_night`   | `img_meeting_running_night.png`  | Active home, schedule, review     |
| `img_meeting_running_beach`   | `img_meeting_running_beach.png`  | Exercise list                     |
| `img_meeting_running_track`   | `img_meeting_running_track.png`  | Recommended group                 |
| `img_meeting_futsal_field1`   | `img_meeting_futsal_field1.png`  | Recent + Active + Recommended     |
| `img_meeting_hiking_group1-4` | `img_meeting_hiking_group{n}.png`| Recent + Recommended + Exercise   |
| `img_meeting_hiking_winter`   | `img_meeting_hiking_winter.png`  | Exercise list                     |
| `img_meeting_outdoor_winter`  | `img_meeting_outdoor_winter.png` | Reviews                           |
| `img_meeting_cycling_group1`  | `img_meeting_cycling_group1.png` | Recent + Active + Schedule        |
| `img_meeting_cycling_group2`  | `img_meeting_cycling_group2.png` | Recommended                       |
| `img_meeting_golf_field1`     | `img_meeting_golf_field1.png`    | Recent + Active + Schedule        |
| `img_meeting_group_photo1`    | `img_meeting_group_photo1.png`   | PostDetail fallback header        |
| `img_trial_cycling_group`     | `img_trial_cycling_group.png`    | Home trial carousel               |
| `img_trial_hiking_group1`     | `img_trial_hiking_group1.png`    | Home trial carousel               |
| `img_trial_hiking_group2`     | `img_trial_hiking_group2.png`    | Home trial carousel               |
| `img_profile_sample1`         | `img_profile_sample1.png`        | Chat avatar (`김상미`)            |
| `img_profile_default`         | `img_profile_default.png`        | Chat avatar fallback              |
| `ic_logo_bolt`                | `ic_logo_bolt.svg`               | Splash, login hero                |
| `ic_banner_schedule_illust`   | `ic_banner_schedule_illust.svg`  | Hero card illustration            |
| `ic_trial_ticket`             | `ic_trial_ticket.svg`            | Login trial coupon badge          |
| `ic_crown_blue` / `ic_crown_gold` | same SVGs                    | Member tier icons                 |
| `ic_chat_bubble`, `ic_chat_filled`, `ic_bell_filled`, `ic_search_filled`, `ic_location_pin_filled` | same SVGs | Tab icons / toolbar icons |
| `ic_profile_user`             | `ic_profile_user.svg`            | MY tab                            |

Import pattern (works on both web and Capacitor):

```tsx
import runningGroup1 from '../assets/images/img_meeting_running_group1.png';
<img src={runningGroup1} alt="" />
```

For SVG icons that don't need to participate in Vite's hashing, drop them in `public/icons/` and reference by absolute path. Capacitor copies `public/` into the iOS bundle automatically.

### 14.1 App icon and launch image (iOS)

1. Produce a 1024 × 1024 PNG with a flat background (no transparency) — the AppStore icon.
2. Use Xcode's "AppIcon" asset catalog or the `cordova-res` helper to generate every required size.
3. Replace `ios/App/App/Assets.xcassets/AppIcon.appiconset/` entirely.
4. Replace `ios/App/App/Assets.xcassets/Splash.imageset/` with a 2732 × 2732 splash image. Centre the bolt logo on a white background.
5. Update `capacitor.config.ts` SplashScreen plugin background colour to match (`#FFFFFF`).

## 15. Sport Catalog and Preference Question Bank

The Android source pins sport order to: 러닝, 풋살, 등산, 사이클, 골프. The iOS spec retains the same ordering so seed compatibility is preserved.

```ts
export const SPORTS: SportDef[] = [
  {
    name: '러닝',
    icon: 'sport_running',
    questions: [
      {
        question: '평균 페이스를 알려주세요(1km 기준)',
        options: ['4:59 이하', '5:00~5:59', '6:00~6:59', '7:00~7:59', '상관없어요(잘 몰라요)'],
      },
      {
        question: '주로 뛰는 거리를 알려주세요!',
        options: ['1~3km', '3~5km', '5~10km', '상관없어요(잘 몰라요)'],
      },
    ],
  },
  {
    name: '풋살',
    icon: 'sport_futsal',
    questions: [
      { question: '풋살 레벨은 어느정도 이신가요?', options: ['입문(처음이에요)', '초보(룰은 아는데 실전은 적어요)', '중급(경험 있음, 기본기 가능)', '상급(대회 출전 등 강한 경기 선호)', '상관없어요(잘 몰라요)'] },
      { question: '선호하는 포지션을 알려주세요!',   options: ['공격수(피벗)', '윙어(아마)', '수비수(픽소)', '골키퍼(골레이로)'] },
      { question: '선호하는 인원을 알려주세요!',     options: ['5:5', '6:6', '상관없어요(잘 몰라요)'] },
      { question: '선호하는 팀 구성을 알려주세요!',   options: ['남자 팀', '여자 팀', '혼성 팀', '상관없어요(잘 몰라요)'] },
    ],
  },
  {
    name: '등산',
    icon: 'sport_hiking',
    questions: [
      { question: '등산 레벨은 어느정도 이신가요?', options: ['입문(처음이에요)', '초보(쉬운 코스 위주)', '중급(장거리 가능)', '고급(험한 코스도 OK)', '상관없어요(잘 몰라요)'] },
      { question: '선호하는 시간대를 알려주세요!', options: ['이른 아침', '오전', '오후', '상관없어요(잘 몰라요)'] },
    ],
  },
  {
    name: '사이클',
    icon: 'sport_cycling',
    questions: [
      { question: '사이클 레벨은 어느정도이신가요?', options: ['이제 막 타기 시작(초보)', '어느정도 탈 줄 앎(중급)', '장거리도 문제없음(고급)', '상관없어요(잘 몰라요)'] },
      { question: '선호하는 방식을 알려주세요!', options: ['혼자', '팀 라이딩', '상관없어요'] },
      { question: '어떤 분기를 선호하나요?',     options: ['단거리', '장거리', '상관없어요'] },
    ],
  },
  {
    name: '골프',
    icon: 'sport_golf',
    questions: [
      { question: '골프 레벨은 어느정도이신가요?', options: ['입문(처음이에요)', '초보(잘 모르지만 재밌어요)', '중급(경험 있음, 기본기 가능)', '상급(대회 출전 등 강한 경기 선호)', '상관없어요(잘 몰라요)'] },
      { question: '평균 스코어를 알려주세요!',     options: ['90대 이하', '100대', '110대 이상', '상관없어요(잘 몰라요)'] },
      { question: '선호하는 방식을 알려주세요!',   options: ['스크린', '필드', '상관없어요(둘 다 좋아요)'] },
    ],
  },
];
```

> The current `src/constants/sports.ts` has placeholders ("테니스", "클라이밍"). Replace these with the table above before Phase 3 starts — this is a high-risk silent divergence that the Android docs already flagged.

## 16. iOS-Specific Behaviour

### 16.1 Safe area

* `index.css` defines `.pt-safe` and `.pb-safe`. Use them on `PageFrame` and `BottomNav` respectively.
* `viewport-fit=cover` is already on the `<meta name="viewport">` so `env(safe-area-inset-*)` resolves correctly.
* Avoid `100vh`; use `min-h-screen` + `dvh` fallback to escape Safari's dynamic toolbar bug.

### 16.2 Status bar

* Default to `style: 'DEFAULT'` (dark glyphs on light background) since the app is light themed.
* When navigating onto `PostDetailScreen`, the hero image extends to the top — call `StatusBar.setStyle({ style: 'LIGHT' })` on mount and reset on unmount.

### 16.3 Keyboard

* Configure `@capacitor/keyboard` with `resize: 'native'` so the WebView reflows.
* In chat screens, listen for `keyboardWillShow` / `keyboardWillHide` to scroll the message list to the bottom when the keyboard appears.

### 16.4 Splash screen handoff

* Native LaunchImage shows first → JS bootstraps → `App.tsx` mounts `<SplashScreen>` → calls `SplashScreen.hide({ fadeOutDuration: 200 })` once `seedIfFirstRun()` resolves.

### 16.5 Haptics (optional)

* Light impact on `PrimaryButton.onPress` and on chat send. Wrap with `Haptics.impact({ style: ImpactStyle.Light })`. Only call when running natively (`Capacitor.isNativePlatform()`).

### 16.6 Webview gestures

* `WKWebView`'s `allowsBackForwardNavigationGestures` defaults to `true` in Capacitor. Keep it on — it gives free swipe-back across React Router routes.
* Disable double-tap zoom by leaving `maximum-scale=1.0` (already in `index.html`).

### 16.7 Dark mode

* Out of scope. The app forces light styles. `Info.plist` should set `UIUserInterfaceStyle = Light` to make sure system widgets (alerts, share sheets) match.

### 16.8 Deep links

* Out of scope for v1. If needed later, register a custom URL scheme `fitple://` and add `LSApplicationQueriesSchemes` accordingly.

## 17. Permissions and Privacy

The MVP needs **no runtime permissions**. Network requests are limited to fetching the JS bundle (loaded from the app bundle, not the network). The following are required by App Store review whenever the related API is touched, even if guarded by a flag:

| Key                                       | Required? | Reason                                                |
|-------------------------------------------|-----------|-------------------------------------------------------|
| `NSLocationWhenInUseUsageDescription`     | Future    | Location-based meeting recommendations.                |
| `NSPhotoLibraryUsageDescription`          | Future    | Photo uploads for meeting albums.                      |
| `NSCameraUsageDescription`                | Future    | Profile pictures.                                      |
| `NSContactsUsageDescription`              | No        | —                                                     |
| `NSAppTransportSecurity` allow-localhost  | Dev only  | For `npm run dev` debugging via Safari Web Inspector. |

For v1 ship a tiny `Info.plist` with only the standard keys, plus `ITSAppUsesNonExemptEncryption = NO` so App Store Connect doesn't request the encryption export form (SHA-256 via the system library is exempt, but declaring this avoids the review hold).

**App Store privacy nutrition label:** record "Data Not Collected" because the app stores everything locally and never transmits to a server.

## 18. Build, Distribution, and Release

### 18.1 Local development loop

```bash
npm run dev                       # Vite dev server (browser preview)
npx cap copy ios                  # quick refresh of dist → ios/App/App/public
npx cap run ios                   # build native + launch simulator
```

Live-reload from Vite into the simulator:

```bash
# vite.config.ts (dev only)
server: { host: true, port: 5173 },

# capacitor.config.ts (dev only — comment back out before release)
server: {
  url: 'http://<your-mac-ip>:5173',
  cleartext: true,
},
```

### 18.2 Production build

```bash
npm run build
npx cap sync ios
# Open Xcode workspace
npx cap open ios
# In Xcode: Product → Archive → Distribute App → App Store Connect
```

### 18.3 Signing

* Apple Developer account required (`team.fitple.sideproject` bundle id reserved up front).
* Generate distribution certificate + provisioning profile via "Automatically manage signing" in Xcode → Signing & Capabilities.
* Capabilities to enable in Xcode (none required for v1, but if Apple Sign-in is ever implemented add "Sign In with Apple").

### 18.4 TestFlight & App Store submission checklist

1. App icon (1024 px) added to asset catalog.
2. Launch image / splash configured.
3. `Info.plist` build version + marketing version (`1.0.0`).
4. App Store metadata in App Store Connect:
   * App name: FitPle
   * Subtitle: 운동 모임 매칭
   * Category: Health & Fitness → Sports
   * Keywords: 운동, 모임, 러닝, 골프, 사이클, 등산, 풋살
   * Privacy URL + Support URL (a static Vercel page is fine for v1).
   * Screenshots (6.5", 5.5"): grab from the simulator using `cmd+S`. Five required.
5. Upload IPA via Xcode Organizer → wait for processing → enable TestFlight.
6. Add internal testers via Apple IDs.
7. Submit for App Store Review with demo account credentials (`demo@fitple.app` / `demo1234`).

### 18.5 Versioning

* `package.json` `version` drives the React layer.
* `MARKETING_VERSION` (CFBundleShortVersionString) drives the App Store version.
* `CURRENT_PROJECT_VERSION` (CFBundleVersion) increments per build upload.

## 19. Test Plan and Acceptance Criteria

### 19.1 Manual acceptance

Use the demo scenario from `REACT_WEB_PLAN.md` (translated to iOS):

1. Cold launch on a fresh simulator → splash → LoginScreen.
2. "회원가입 없이 둘러보기" → HomeScreen (guest) with seed content visible.
3. Tap each sport icon → RecommendedGroupScreen filters correctly.
4. Tap a meeting card → PostDetailScreen shows hero, tabs, and Apply button.
5. Switch to Chat tab → seed conversation visible, system message styled differently.
6. Type a message → appears as `me` bubble, persists after killing and relaunching the app.
7. Bottom nav: Chat and MY → "로그인이 필요한 기능이에요" toast.
8. Back to LoginScreen → tap "이메일로 시작하기" → enter `demo@fitple.app` / `demo1234` → HomeScreen (member) with personalised hero.
9. Open "다가오는 정기모임 더보기" → UpcomingMeetingScreen shows 7-day strip.
10. Logout from MY tab → LoginScreen.
11. Sign up with a brand-new email, advance to the nickname step, force-quit the app from the app switcher.
12. Relaunch → LoginScreen offers the resume dialog → tap "이어서 하기" → SignupPreferenceScreen loads with the pending email pre-filled.
13. Complete preferences → SignupCompleteScreen → "핏플 시작하기" → HomeScreen (member).

### 19.2 Automated checks (minimum)

* Type-check: `npx tsc --noEmit` must succeed.
* Unit tests (Vitest, optional): hashing, validators (`isValidEmailFormat`, `isValidPassword`, `isValidNickname`), preference reducer transitions, date strip math.
* Smoke test: launch Vite preview, follow E2E scenario via Playwright (web only — gives 80 % coverage of business logic before the iOS shell run).

### 19.3 Performance budget

* TTI on iPhone 12 simulator < 1.5 s after splash.
* JS bundle < 600 KB gzipped (current scaffold lands around 200 KB before screens are added).
* Largest image asset < 250 KB; compress via `squoosh` before committing.

## 20. Implementation Milestones

| Phase | Scope                                                                 | Risk | Days |
|-------|------------------------------------------------------------------------|------|------|
| **P0** Foundations | Paint final colours into `tailwind.config.ts`, replace placeholder fonts, lock viewport, wire `react-hot-toast` + `Vaul`, confirm Vite build under Capacitor sync. | 🟢 | 0.5–1 |
| **P1** Data + routing  | Implement `routes/AppRoutes.tsx`, `RequireAuth`, slide transition wrapper, full `seedData.ts`, all storage repos.                                                  | 🟡 | 1–1.5 |
| **P2** Common UI       | InputBox + 5 states, EmailSuggestion, PasswordField, PrimaryButton, SportIcon, Chip, FilterChip, Badge, TermsBottomSheet, BottomNav, Toolbar, PageFrame.           | 🟢 | 1–1.5 |
| **P3** Auth screens    | Splash, Login (incl. resume dialog), EmailLogin, Signup 1–6, Terms sheet.                                                                                          | 🟡 | 2–2.5 |
| **P4** Home screen     | Hero (3 states), SportRow, Active rail, Trial carousel, Reviews, DateStrip + ScheduleCard, CTA banner, FAB, Guest branch.                                          | 🟢 | 2–2.5 |
| **P5** Meeting screens | Exercise, RecommendedGroup, UpcomingMeeting, PostDetail (with all 5 tabs), PostChat.                                                                              | 🟢 | 2–2.5 |
| **P6** Social toasts   | Kakao / Apple / Google buttons → toasts. Disabled tabs → toasts.                                                                                                  | 🟢 | 0.2 |
| **P7** iOS integration | `npx cap add ios`, app icon, launch image, status bar, splash hide, keyboard handling, haptics, share plugin wiring.                                              | 🔴 | 1–1.5 |
| **P8** Release         | Sign, archive, screenshots, App Store Connect metadata, TestFlight invite.                                                                                        | 🔴 | 1 |

> P0–P6 mirror the existing `REACT_WEB_PLAN.md`. P7–P8 are the iOS-specific add-on.

## 21. Risks and Open Questions

| Risk                                                                                  | Mitigation                                                                                                                  |
|---------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| `crypto.subtle.digest` returning before `localStorage.setItem` writes are flushed.    | All `userManager` methods are async and awaited at every call site; TypeScript types prevent silent `Promise` storage.       |
| Status-bar overlap on devices without a notch (iPhone SE).                            | Use `pt-safe` everywhere, plus a fallback minimum of `12px` top padding.                                                     |
| Keyboard hiding the chat input.                                                       | `@capacitor/keyboard` `resize: 'native'` plus manual scroll-to-bottom on `keyboardWillShow`.                                 |
| Vite dev server cannot reach the simulator on the first run.                          | Document the `capacitor.config.ts` `server.url` override and revert before release.                                          |
| `localStorage` cleared by iOS when storage pressure is high.                          | Acceptable for v1. Migrate to `@capacitor/preferences` in v1.1 if reports come in.                                           |
| App Store review rejection due to "thin app" (no backend).                            | Position the seed dataset as a functional demo; the app's behaviour (signup, browse, chat) is fully interactive.             |
| Pretendard webfont weight on a cellular network (PWA mode).                           | Self-host under `public/fonts/` and preload via `<link rel="preload" as="font">` in `index.html`.                            |

### Open questions

1. **Live reload during App Store review?** If a reviewer launches in airplane mode, the demo must run offline. Confirmed: localStorage + bundled assets satisfy this.
2. **Social login parity** — Apple requires "Sign in with Apple" if any other social provider is offered. We don't ship real social, so we don't trigger this rule, but if Kakao goes real we must add Apple too.
3. **Map embed** — Android uses a WebView pointed at Kakao Maps. iOS v1 will substitute a static map screenshot. Decide before P5 whether to upgrade to MapKit or keep static.
4. **In-app browser for terms** — currently a toast. App Store reviewers tolerate that for a v1 demo as long as the privacy URL is reachable from App Store Connect metadata.

## 22. Appendix A — Android → iOS Pattern Map

| Android (Kotlin/XML)                                | iOS (React + Capacitor)                                |
|-----------------------------------------------------|--------------------------------------------------------|
| `FitpleMainActivity` + Fragment stack               | `<BrowserRouter>` + `<Routes>` + slide transition      |
| `BottomNavigationView`                              | `<BottomNav>` with `safe-area-inset-bottom`            |
| `BottomSheetDialogFragment`                         | Vaul `<Drawer.Root>`                                   |
| `AlertDialog.Builder`                               | Custom modal or `window.confirm` (avoid native dialog) |
| `Toast.makeText(...).show()`                        | `toast('...')` (react-hot-toast)                       |
| `ViewBinding` + `<include>`                         | JSX composition + props                                |
| `TextWatcher.afterTextChanged`                      | `onChange={e => setState(e.target.value)}`             |
| `Spannable` / `setSpan`                             | Inline `<span class="text-orange font-bold">`          |
| `Context.filesDir/fitple/...`                       | `localStorage` (key prefix conventions in §8)          |
| `MessageDigest.getInstance("SHA-256")`              | `crypto.subtle.digest('SHA-256', ...)`                 |
| `Calendar` API                                      | `dayjs()` helpers in `utils/date.ts`                   |
| `lifecycleScope.launch { delay(); ... }`            | `useEffect` with `setTimeout` / await                  |
| `CoordinatorLayout` + FAB                           | `<HomeFab class="fixed bottom-20 right-4">`            |
| `HorizontalScrollView`                              | `<div class="overflow-x-auto flex gap-3">`             |
| `RecyclerView` + adapter                            | `array.map(...)` or `react-window` if dataset > 200    |
| Slide animations (`R.anim.slide_in_right`, etc.)    | `transitions.tsx` CSS transform wrapper                |
| `onBackPressedDispatcher`                           | WKWebView edge-swipe + React Router `navigate(-1)`     |
| `ConstraintLayout`                                  | Flexbox + `absolute` positioning                       |
| `View.VISIBLE` / `View.GONE`                        | Conditional render or Tailwind `hidden`                |
| `R.drawable.img_*`                                  | Vite `import x from '../assets/...'`                   |

## 23. Appendix B — Glossary

* **회원 / 비회원 (Member / Guest):** Authenticated vs. anonymous user. Drives the home screen branch.
* **체험 (Trial):** A meet-up that accepts one-off attendees, distinct from recurring memberships.
* **정기모임 (Recurring meeting):** Weekly cadence meet-up — what `ScheduleItem` represents.
* **추천 모임 (Recommended group):** Sport-filtered list shown by `RecommendedGroupFragment`.
* **공지 (Notice):** A board post inside a meeting, shown in the 게시판 tab.
* **활동 시간 (Last active):** Minutes since the last chat activity in the group, rendered as "n분전 활동".
* **한자리 남았어요 (One spot left):** Badge shown when `maxMembers - memberCount ≤ 2`.

## 24. Appendix C — Sample Strings (Korean copy)

Pulled verbatim from `app/src/main/res/values/strings.xml` and the Fragment source. These are the source-of-truth strings — do not paraphrase.

```
앱 이름            FitPle
하단 탭            홈 / 체험 / 탐색 / 채팅 / MY
검색창 placeholder 찾고싶은 모임이 있나요?
홈 - hero 기본    안녕하세요 {nickname}님!\n아직 가입한 모임이 없어요   /  가입하러 가기 →
홈 - hero 내일    안녕하세요 {nickname}님!\n다음 {sport}은 내일 {time}이에요 🏃  /  일정 바로가기 →
홈 - hero 오늘    안녕하세요 {nickname}님!\n오늘 {time} · {title}이 있어요    /  일정 바로가기 →
게스트 hero       모임을 둘러보는 중이에요!                          /  로그인하고 참여하기 →
종목 이름          러닝 / 풋살 / 등산 / 사이클 / 골프
섹션 타이틀       추천 모임 / 활동 중인 모임 / 체험 가능 모임 / 후기 / 다가오는 정기모임
필터 칩            가까운 순 / 편하게 / 평일 오후 / 주말
멤버 표기          멤버 {n}명   ·   {n}/{max}명
체험 카드 CTA     신청하기
모임 상세 탭       홈 / 게시판 / 채팅 / 사진첩 / 멤버
모임 상세 CTA     1회 참가하기 → (성공 토스트) 참가 신청이 완료되었어요!   → 버튼 상태 "참가 완료"
공유 버튼 토스트  찜하기 기능 준비 중이에요
탭 placeholder    {label} 기능을 준비 중이에요
약관 5개          만 14세 이상입니다. / 서비스 이용약관 동의 / 커뮤니티 이용약관 동의 / 개인정보 수집 및 이용 동의 / 위치 정보 수집 동의
약관 모두 동의 CTA 동의하고 가입하기
회원가입 완료 카피 가입이 완료 되었어요!  /  이제 핏플과 함께 즐거운 운동을 시작해보세요  /  핏플 시작하기
재개 다이얼로그   회원가입을 이어서 하시겠습니까?  /  이전에 시작한 회원가입이 있어요.\n선호 운동 설정만 하면 완료돼요!  /  이어서 하기  /  나중에
로그인 실패        이메일 또는 비밀번호가 올바르지 않아요.
이메일 중복        이미 가입된 이메일이에요.  로그인하기
미구현 토스트     준비 중인 기능이에요  /  검색 기능 준비 중이에요  /  알림 기능 준비 중이에요  /  위치 변경 기능 준비 중이에요  /  모임 만들기 기능 준비 중이에요  /  맞춤 모임 추천 기능 준비 중이에요
종료 안내         뒤로 버튼을 한번 더 누르면 종료됩니다   (Android only — drop on iOS)
```

---

## 25. Visual Specifications (from design images)

> **Source:** captured directly from `/Users/heebiny/AndroidStudioProjects/FitPle/designs/*.png`. Treat this section as **authoritative when it conflicts with the prose above** — it reflects what the designer actually drew.
> All pixel values are measured against an **iPhone 14/15 viewport (390 × 844 pt)**. The reference design uses ~430 pt wide artboards; figures here are converted to a 390 pt canvas. Adjust ±2 pt for SE / Pro Max as needed.
> Spacing tokens (T-shirt scale): `xs=4 / sm=8 / md=12 / lg=16 / xl=20 / 2xl=24 / 3xl=32`.

### 25.1 Global UI conventions

* **Page horizontal padding:** `20 pt` on both sides (matches the Android 20 dp gutter).
* **Status bar:** transparent; content extends to `env(safe-area-inset-top)`. Plain headers add `12 pt` extra below safe-area.
* **Default toolbar height:** `48 pt`. Left slot icon `24 × 24`, centered title `16 pt / 600 weight / textPrimary`, right slot text-button `14 pt / 500 / textSecondary` (turns `orange` when active).
* **Primary CTA button:** `52 pt` tall, `100% - 40 pt` wide, corner-radius `8 pt`, label `15 pt / 600 / white`. Active fill `orange #FF5722`. Disabled fill `btnDisabled #CCCCCC` with white label.
* **Secondary buttons (e.g. terms "취소"):** same height, white background, `1 pt` border in `borderDefault #DDDDDD`, label `textPrimary`.
* **Underlined text-links:** `14 pt / 500`, color `textSecondary`, `text-decoration: underline`.
* **Section header:** title `16 pt / 700 / textPrimary` + right "더보기 >" `13 pt / 500 / textSecondary`. Bottom margin `12 pt`.
* **Cards:** `surface #FFFFFF`, radius `12 pt`, shadow `0 1pt 2pt rgba(0,0,0,0.04)` (very subtle).
* **Page background:** main scroll uses `background #F2F2F2`; cards sit on top.

### 25.2 InputBox component (definitive states)

Width = container width. Height `48 pt`. Radius `8 pt`. Padding inset `14 pt` horizontal, `12 pt` vertical. Font `15 pt / 400`.

| State              | Border                | Background | Right-side icon stack                  | Helper text below              |
|--------------------|----------------------|-----------|----------------------------------------|--------------------------------|
| **empty**          | `1pt borderDefault`  | `surface` | none                                   | none                           |
| **focused/typing** | `1pt borderActive #333333` | `surface` | `X` clear button (16 × 16 gray)        | none                           |
| **error**          | `1pt borderError #FF4444` | `surface` | `X` + orange-red `⚠` triangle (16 × 16)| `13 pt / borderError`, e.g. "이메일 주소가 올바르지 않습니다." |
| **valid**          | `1pt borderActive`   | `surface` | `X` + filled blue `✓` (16 × 16, `blue #2196F3`) | none                           |
| **with autocomplete dropdown** | focused border | dropdown overlays below at full input width, divider line on top, 2 rows × 44 pt high, label `14 pt / textPrimary`, hover/press tint `background` | — | — |

**Label** above the input: `13 pt / 500 / textPrimary`, margin-bottom `6 pt`.
**Autocomplete rule:** trigger when the value contains `@` and the substring after `@` is empty or a prefix of `naver.com` / `gmail.com`. Suggest the same two domains in this order.

### 25.3 Splash screen

* Background `#FFFFFF`.
* Logo: centered vertically and horizontally.
* Orange bolt SVG `100 × 130 pt`, gradient from `#FF7A4D` (top) to `#E64A19` (bottom).
* Wordmark "Fit Ple" `28 pt / 700`, color `textPrimary` (`F` and `i` letterforms appear dark; `Ple` uses the same dark colour in the export — no per-letter colour in production).
* Logo + wordmark stacked with `12 pt` gap, group centered.
* No buttons, no text below.

### 25.4 LoginScreen

Layout (top→bottom):

| Element                                   | Spec |
|-------------------------------------------|------|
| Logo card                                 | `80 × 80 pt`, radius `16 pt`, white card with `1 pt borderDefault`. Inside: "F" and "P" letterforms in orange gradient, `36 pt / 700`. Centered. Top inset from safe-area: `48 pt`. |
| Title                                     | `22 pt / 700 / textPrimary`, two lines, line-height `1.35`. "핏플" span colored `orange`. Centered. Margin-top `24 pt`. |
| Trial coupon badge                        | Speech-bubble shape (rounded pill + downward triangle tail). Width auto, padding `8 pt × 14 pt`, `1 pt borderDefault`, white background, label `13 pt / 500`, "1회 체험권" span weighted `700`. Margin-top `20 pt`. |
| Spacer                                    | `32 pt` |
| Kakao button                              | `52 pt` tall, full-width minus `40 pt` margins. Background `btnKakao #FEE500`. Icon (speech bubble) `18 × 18` + label "카카오로 계속하기" `15 pt / 500 / textPrimary`. Radius `10 pt`. |
| Apple button                              | Same dims. Background `#000000`. Apple glyph `16 × 18` + label "Apple로 계속하기" `15 pt / 500 / #FFFFFF`. |
| Google button                             | Same dims. Background `#FFFFFF`, `1 pt borderDefault`. Google "G" multicolor `18 × 18` + label "Google로 시작하기" `15 pt / 500 / textPrimary`. |
| Email button                              | Same dims. Background `btnDisabled #CCCCCC` (visually muted by design; the gray ≠ disabled — it is the brand-quiet style for the email entry). Envelope icon `18 × 18` + label "이메일로 시작하기" `15 pt / 500 / #FFFFFF`. |
| Gap between buttons                       | `12 pt` vertical |
| "회원가입" underlined link                | `14 pt / 500 / textSecondary`, underlined. Centered. Margin-top `20 pt`. |
| "회원가입 없이 둘러보기" underlined link | `14 pt / 500 / textSecondary`, underlined. Centered. Margin-top `36 pt`. Pinned `36 pt` above bottom safe-area. |

### 25.5 EmailLoginScreen

| Region | Spec |
|--------|------|
| Toolbar | `48 pt`. Left back-chevron `24 × 24`. Center title "이메일로 로그인" `16 pt / 600`. No right slot. |
| Form area | Padding `20 pt` horizontal, top margin from toolbar `24 pt`. |
| Email label | "이메일 아이디" — see InputBox label spec. |
| Email input | InputBox (states from §25.2). Placeholder "fitple@fitple.com". |
| Gap | `16 pt` |
| Password label | "비밀번호" |
| Password input | InputBox, placeholder "문자, 숫자 포함 8자 ~20자". When `비밀번호 표시` is off, mask with `•`. |
| "비밀번호 표시" row | Margin-top `10 pt`. Checkbox `18 × 18`, radius `4 pt`. Unchecked: `1 pt borderDefault`, white fill. Checked: solid `orange` with white check glyph. Label "비밀번호 표시" `13 pt / 500 / textSecondary` with `8 pt` left gap. |
| CTA "로그인" | Primary CTA, margin-top `28 pt`. Disabled until both fields are `valid`. |
| "회원가입" link | Underlined, centered, margin-top `20 pt`. |

### 25.6 SignupEmailScreen / PasswordScreen / NicknameScreen — shared shell

* Toolbar: back `<` left, "회원가입" centered, no right slot during typing; once `valid` the bottom CTA appears.
* Body padding `20 pt` horizontal, top `24 pt`.
* **Page title** is bold + 2-line capable: `20 pt / 700 / textPrimary`, line-height `1.4`. Margin-bottom `24 pt`.
* Single (or paired) InputBox.
* Bottom CTA: anchored `24 pt` above the keyboard or `24 pt` above the home-indicator when keyboard hidden. Animates in colour from `btnDisabled` → `orange` when validation passes.

Screen-specific copy:

| Screen                  | Title                                              | Label(s)           | Helper / Error                                                                 |
|-------------------------|----------------------------------------------------|--------------------|---------------------------------------------------------------------------------|
| SignupEmail             | "사용하실 이메일 주소를 입력해주세요."             | 이메일 아이디      | error "이메일 주소가 올바르지 않습니다." · taken "이미 가입된 이메일이에요. 로그인하기" (link in orange-bold-underline) |
| SignupPassword          | "사용하실 비밀번호를 입력해주세요."                | 비밀번호 · 비밀번호 한번 더 입력해주세요. | default helper (gray) "문자, 숫자 포함 8자 ~20자 입력해주세요." · mismatch "비밀번호가 일치하지 않습니다." |
| SignupNickname          | "사용하실 닉네임을 입력해주세요."                  | 닉네임              | taken "이미 사용중인 닉네임이에요."                                              |

Password screen also includes "비밀번호 표시" row identical to EmailLogin §25.5.

### 25.7 TermsBottomSheet

* Sheet attached to bottom, radius `20 pt` top corners, white background.
* Sheet handle: a small `36 × 4 pt` rounded gray bar centered, top margin `8 pt`. (Vaul renders this by default.)
* Title: `18 pt / 700 / textPrimary`, 2-line, "회원가입을 위해서는\n아래의 약관들에 동의가 필요해요". Margin `24 pt` top, `20 pt` horizontal.
* "모두 동의하기" row:
  * Height `52 pt`, full sheet width, no internal padding beyond `20 pt` horizontal.
  * Left: checkbox `22 × 22`. Unchecked = orange `1 pt` outlined square with hollow center; checked = solid `orange` with white check.
  * Label "모두 동의하기" `15 pt / 600`.
  * Bottom `1 pt` divider in `borderDefault`.
* Individual rows (×5): `48 pt` tall.
  * Same checkbox visual but `20 × 20`.
  * Inline label: orange `"필수"` `13 pt / 700` + `" - "` (gray) + item text `14 pt / 500 / textPrimary`.
  * Right chevron `> ` `16 × 16` `textHint`.
  * No inter-row divider.
* Items in order:
  1. 만 14세 이상입니다.
  2. 서비스 이용약관 동의
  3. 커뮤니티 이용약관 동의
  4. 개인정보 수집 및 이용 동의
  5. 위치 정보 수집 동의
* Bottom button row (sticky, `16 pt` padding all-around above safe-area):
  * "취소" — secondary button, occupies `30%` of row width.
  * `12 pt` gap.
  * "동의하고 가입하기" — primary CTA, fills the rest. Disabled gray until master + 5 items all true.

### 25.8 SignupPreferenceScreen — SELECTION phase

* Toolbar: `<` left, "회원가입" center, **"건너뛰기"** right (`14 pt / 500 / textSecondary`).
* Title (`22 pt / 700`, 2 lines, line-height `1.35`): "거의 다했어요! 맞춤 운동을 제공 할 수 있도록\n몇가지만 알려주세요!"
* Subtitle (`14 pt / 500 / textSecondary`, margin-top `12 pt`): "어떤 운동 선호하나요?(중복선택 가능해요)"
* **Sport tile row** — single horizontal row of 5 tiles, equal width, spacing `12 pt`. Margin-top `20 pt`.
  * Tile size `60 × 78 pt` (icon area `60 × 60`, label below).
  * Unselected: icon area `background #F2F2F2`, radius `12 pt`, icon dark line-art `36 × 36` centered; label `13 pt / 500 / textSecondary`.
  * **Selected (dark highlight):** icon area `orangeTint #FFF0ED`, `1 pt orange` border, icon stays original color; label `13 pt / 600 / orange`.
* CTA "다음" anchored bottom — orange when `selectedSports.length ≥ 1`.

### 25.9 SignupPreferenceScreen — DETAIL phase

> **Key correction (from `sign_signup_preference_golf_extended.png`):** DETAIL is **one screen per sport, not one screen per question**. All of a sport's questions stack vertically inside the same screen, and tapping "다음" advances to the next sport (or to SignupComplete if last).

* Toolbar same as SELECTION but the right "건너뛰기" remains.
* User profile chip floats above the sport row: nickname inside a `28 pt` tall pill, white background, `1 pt borderDefault`, label `13 pt / 600 / textPrimary`. Positioned near the currently-focused tile.
* Title (`20 pt / 700`, 2 lines): "선택 한 운동의 필터를 설정하면\n모임을 추천해 드려요"
* **Sport tile row** — same 5 tiles, but the visual states diverge:
  * **Currently focused sport (DETAIL target):** dark highlight (`orange` border + `orangeTint` fill) + dark icon.
  * **Other selected sports (not currently focused):** light highlight — `1 pt sportLightAccent #F5AA96` border + `sportLightTint #FFF5F2` fill + icon tinted gray `#CCCCCC` + label `sportLightAccent`.
  * **Unselected:** plain gray as in SELECTION.
* **Question blocks — all questions for the current sport stack on a single screen:**
  * Question text `14 pt / 600 / textPrimary`, margin-top `24 pt` from previous block (first block `28 pt` from the sport row).
  * Options row directly under the question — **horizontal scroll, single-line, no wrap**. `8 pt` left padding (so the first chip aligns with body padding), trailing chips bleed past the right edge to hint that more options exist.
  * Pill height `36 pt`, padding `0 16 pt`, radius `999`, `1 pt` border, `8 pt` gap.
    * Unselected: border `borderDefault`, fill `surface`, label `14 pt / 500 / textSecondary`.
    * Selected: border `orange`, fill `orangeTint`, label `14 pt / 600 / orange`.
  * Selections are **optional** per question — "다음" is always active in DETAIL (the user can skip any question by leaving it unselected; the answer just isn't recorded).
* CTA "다음" stays bottom; advances to the next sport (or to SignupComplete if last).
* Reference question counts per sport (matches §15):
  * 러닝: 2 questions · 풋살: 4 questions · 등산: 2 questions · 사이클: 3 questions · 골프: 3 questions.

### 25.10 SignupCompleteScreen

* Toolbar: empty (no back). The system swipe-back is allowed but lands on Login (so we replace history).
* Center column starting `120 pt` from top:
  * Orange filled check-circle `64 × 64 pt` (`orange` fill, white check).
  * `20 pt` gap.
  * "가입이 완료 되었어요!" `22 pt / 700 / textPrimary`, centered.
  * `8 pt` gap.
  * "어떤 모임이 있을까?" `15 pt / 500 / textSecondary`, centered.
* Recommended-meeting carousel:
  * Top margin `40 pt`.
  * Horizontal scroll, `16 pt` left padding, `12 pt` gap.
  * Each card `120 × 140 pt`: square image top `120 × 100` with radius `10 pt`, title below `12 pt / 600 / textPrimary` 2-line ellipsis.
* CTA "핏플 시작하기" — primary, anchored bottom with `24 pt` margins.

### 25.11 HomeScreen (member, full layout)

Order top→bottom on the same single scrollable surface.

| #  | Region                                       | Spec |
|----|----------------------------------------------|------|
| 1  | **Header row** (sticky)                      | Height `52 pt`. Left: location chip "미사 1동 ▾" `13 pt / 600 / textPrimary` with chevron-down `12 × 12`. Center: search bar fills remaining width, height `36 pt`, radius `999`, background `surface`, `1 pt borderDefault`, leading magnifier icon `16 × 16`, placeholder "찾고싶은 모임이 있나요?" `13 pt / 400 / textHint`. Right: bell icon `24 × 24`. |
| 2  | **Hero card**                                | Margin `12 pt` top, `20 pt` horizontal. Card height `108 pt`, radius `14 pt`, background gradient from `#FFE2D7` (top-left) to `#FFD0C0` (bottom-right). Inside: date `12 pt / 500 / textSecondary` top-left, then bold 2-line title `15 pt / 700 / textPrimary` line-height `1.4`. Right side: schedule mascot illustration `90 × 90 pt`. CTA text "가입하러 가기 →" `13 pt / 700 / orange` aligned bottom-left. |
| 3  | **Sport row**                                | Margin-top `20 pt`. Row of 5 tiles same as preference SELECTION sizing (`60 × 78`). Spacing `12 pt`. Horizontal padding `20 pt`. Hits route to `/explore/{sport}`. |
| 4  | **추천 모임 section**                         | Header (see §25.1). Margin-top `28 pt`. |
| 4a | Filter chips                                 | Horizontal scroll, `8 pt` gap. Chip height `32 pt`, radius `999`, padding `0 14 pt`. Unselected: border `borderDefault`, label `13 pt / 500 / textSecondary`. Selected: solid `orangeTint`, `1 pt orange`, label `13 pt / 600 / orange`. First chip "가까운 순 ▾" adds chevron. |
| 4b | Recommended cards (list)                     | 4 visible. Card `100% × 84 pt`, radius `12 pt`, white background. Left: image `64 × 64`, radius `10 pt`, `16 pt` from card-left. Right: title `15 pt / 700 / textPrimary` (single line, ellipsis), desc `13 pt / 400 / textSecondary` (single line), meta row `12 pt / 400 / textHint` "멤버 {n}명 · {n}분전 활동". Top-right: heart icon `20 × 20`, `textHint` outline. Sport badge pill bottom-right of image area: height `20 pt`, radius `999`, padding `0 8 pt`, label `11 pt / 600`, color scheme matches the sport (default `orangeTint` + `orange` text). |
| 5  | **활동 중인 모임 section**                    | Same card pattern as 4b. Header "활동 중인 모임" + 더보기. |
| 6  | **체험 가능 모임 section**                    | Horizontal carousel. Card `160 × 240 pt`, radius `14 pt`, white background with light shadow. Image top `160 × 140`, radius corners `14 pt` top-only. Two overlay badges on the image: "3분전 활동" pill (badgeDark + white text, top-left) + sport pill (orange tint, top-right). Title `14 pt / 700`, padding `10 pt 12 pt 0`. One-line subtitle gray. Footer row: pin icon + location `12 pt / 500 / textHint`, then row "👥 멤버 10/30" `12 pt / 500 / textSecondary`. Bottom CTA inside the card: orange `36 pt` tall pill "신청하기", `12 pt` from card-bottom. |
| 7  | **CTA banner**                                | Card `100% × 96 pt`, radius `14 pt`, background `#FFF0ED`. Title `14 pt / 700`, subtitle `13 pt / 500 / textSecondary` underneath. Right side: orange outline button "모임 만들기 →" `36 pt` tall, padding `0 14 pt`, radius `999`, label `13 pt / 700 / orange`. |
| 8  | **후기 section**                              | Carousel. Card `220 × 140 pt`, radius `14 pt`, image fills card with linear gradient overlay top-transparent→bottom `rgba(0,0,0,0.85)`. Text stack bottom-left, `14 pt` padding: nickname `12 pt / 500 / white80`, activity `12 pt / 500 / white80` (e.g. "싱글벙글 러닝모임 후기"), quote `13 pt / 600 / white` with leading `"`. |
| 9  | **다가오는 정기모임 section**                 | Header "다가오는 정기모임" + 더보기. Below header: "{YYYY}년 {M}월" `13 pt / 500 / textSecondary`. |
| 9a | Date strip                                   | 7 day cells centered on today. Each cell `40 × 56 pt`. Number `15 pt / 600 / textPrimary` on white circle `32 × 32` (no fill when not today). Today: circle solid `orange`, number white, day-of-week label `12 pt / 700 / orange` below. Other days: dow `12 pt / 500 / textHint`. Horizontal scroll if more than 7 visible. |
| 9b | Schedule cards                               | List, gap `10 pt`. Card `100% × 100 pt`, radius `12 pt`, white background. Left text column padding `14 pt`. Top: small badge row "Level·{보통/중급/상급}" `11 pt / 700 / orange` on `orangeTint` pill + sport badge "{러닝/…}" same style. Title `15 pt / 700`, single-line. "한자리 남았어요!!" red bold below title when `isUrgent`. Info row: `{location} · 매주({day}) {time} · {n}명 참석중` `12 pt / 500 / textSecondary`. Right: thumbnail `80 × 80 pt`, radius `10 pt`. |
| 10 | **Bottom-nav** (fixed)                       | Height `56 pt + safe-area-inset-bottom`. White background, top `1 pt` divider in `borderDefault`. 5 equal-width slots. Icon `24 × 24` + label `11 pt / 500`. Selected: icon + label both `orange`; unselected: `textHint`. The active tab indicator is colour-only (no underline). |
| 11 | **FAB**                                      | `56 × 56` round, orange, white `+ ` glyph, `bottom: 76 pt + safe-area`, `right: 20 pt`. Shadow `0 4pt 12pt rgba(255,87,34,0.30)`. |

#### Hero state copy (textually identical to §12.10):
* No upcoming → "안녕하세요 {nickname}님!\n아직 가입한 모임이 없어요" / CTA "가입하러 가기 →".
* Tomorrow → "안녕하세요 {nickname}님!\n다음 {sport}은 내일 {time}이에요 🏃" / CTA "일정 바로가기 →".
* Today → "안녕하세요 {nickname}님!\n오늘 {time} · {title}이 있어요" / CTA "일정 바로가기 →".

### 25.12 HomeScreen — guest branch

Identical scaffold minus the "활동 중인 모임" section (#5). Hero copy is fixed "모임을 둘러보는 중이에요!" / CTA "로그인하고 참여하기 →", and the hero background uses a slightly cooler tint (`#E7F0FF` → `#D3E1FF`) per the design exports.

### 25.13 ExerciseScreen

Same skin as Home but with a focused-list layout:
* Toolbar `48 pt`: back + "체험" title + bell.
* Below toolbar: location filter pill `미사 1동 ▾` aligned left, padding `20 pt` horizontal, margin-top `12 pt`.
* Single vertical list of meeting cards (same dimensions as Home §25.11 4b). No section headers. Heart icon on each row.
* Bottom-nav visible.

### 25.14 RecommendedGroupScreen

* Toolbar `<` + "추천 모임" + `🔍` + `🔔`. The title swaps to "{sport} 추천 모임" when arrived via a sport icon.
* Below toolbar: row containing the location pill, a `필터` chip with funnel icon, and the condition chips.
* Condition chips (per §25.11 4a) — toggle on tap.
* List rows: `100% × 92 pt`, image `72 × 72` left, title `15 pt / 700`, desc `13 pt / 400 / textSecondary`, meta `12 pt / 400 / textHint`. Heart icon top-right.
* Bottom-nav visible.

### 25.15 UpcomingMeetingScreen

* Toolbar `<` + "다가오는 정기모임" + `🔍` + `🔔`.
* Below toolbar: "YYYY년 M월" header `15 pt / 600 / textPrimary`, padding `20 pt` horizontal, margin-top `12 pt`.
* Date strip identical to §25.11 9a.
* **Grid**: 2 columns, gap `10 pt`, horizontal padding `20 pt`. Each card:
  * Width `(viewport - 50) / 2` pt. Image `100% × 110 pt`, radius `12 pt` top.
  * Below image: title `13 pt / 700` 2-line, info `11 pt / 500 / textSecondary` 2-line: "{day} {time}\n{location} · {memberCount}명".
  * "한자리 남았어요" red `11 pt / 700` shown when `isUrgent`.
* No bottom-nav (the screen is reached via "더보기" — for parity with Android `bottomNavigation.visibility = GONE`).

### 25.16 PostDetailScreen

Layered structure top→bottom:

1. **Hero image** — full-width × `260 pt`, no rounded corners. Sport overlay badge top-right: dark pill (`badgeDark`) containing distance/duration text like "4.1 km, 5.5초 평균" in white `12 pt / 600`. Toolbar floats over the image (transparent background): back, heart (찜), share icons in white. Status bar style set to `LIGHT` while this screen is mounted.
2. **Title row** — padding `20 pt`. Title `19 pt / 700 / textPrimary` line-height `1.3`. Subtitle `13 pt / 400 / textSecondary` second line.
3. **Tab strip** — sticky after scroll. Height `44 pt`, divider below `1 pt borderDefault`. 5 equal tabs: 홈 / 게시판 / 채팅 / 사진첩 / 멤버. Label `14 pt / 500 / textSecondary`. Active label `14 pt / 700 / textPrimary` with `2 pt orange` underline indicator beneath the active label (animates left/right on switch).
4. **Tab body** — varies per tab (below).
5. **Sticky bottom CTA bar** — only on 홈 tab. Two buttons in a row, padding `12 pt 20 pt` + safe-area-inset-bottom:
   * "공유하기" — secondary outline button, takes `32%` width. On tap triggers the iOS share sheet (Capacitor `Share` plugin) with payload `{ title, text: meeting.description, url: deep-link-or-placeholder }`. Confirmed by `home_main_postdetail_share_chat.png` sitemap.
   * "1회 체험하기" — primary CTA, takes the rest. Toast on tap: "참가 신청이 완료되었어요!" and the button becomes "참가 완료" with `btnDisabled` fill and `textPrimary` label.

#### 25.16.a 홈 tab body

* "다가오는 정기 모임" header `14 pt / 700 / textPrimary`, margin-top `20 pt`.
* Kakao Map placeholder card `100% × 160 pt`, radius `12 pt`, gray ish background with a centered pin illustration. Bottom-right: "내 위치보기 ›" pill in white with `1 pt borderDefault`. Below the map: a centered tag "공유하기" icon row.
* "기본정보" header `14 pt / 700`, margin-top `24 pt`.
* Info rows (each `40 pt` tall, leading icon `16 × 16 textHint`, label `14 pt / 500 / textSecondary`, value right-aligned `14 pt / 500 / textPrimary`):
  * 시간 : 매주 화 19:30
  * 인원 : 20/200명
  * 위치 : {location}
* Description block (`14 pt / 500 / textPrimary`, line-height `1.6`). Padded `20 pt` horizontal, margin-top `20 pt`.

#### 25.16.b 게시판 tab body

> **Update (from `home_postdetail_noticelist_tab2.png`):** notice cards have **two variants** — short (text-only) and rich (with map thumbnail + inline location link). Both share the same shell.

* List of notice cards, gap `12 pt`, padding `20 pt` horizontal.
* Each card: white `surface`, radius `12 pt`, padding `16 pt`.
  * Top: red "공지" badge — pill height `22 pt`, padding `0 8 pt`, background `noticeBg #FEF7F7`, leading megaphone icon `12 × 12 noticeRed`, label "공지" `11 pt / 700 / noticeRed`.
  * Title `15 pt / 700 / textPrimary`, margin-top `8 pt`.
  * **Variant A — text only:** Preview line `13 pt / 400 / textSecondary`, max 2 lines.
  * **Variant B — with location + map thumbnail:**
    * Preview row prefixed with pin icon `12 × 12 textHint` + bold location segment + inline body text. The location segment ("보라매 공원") renders as a `13 pt / 600 / blue #2196F3` underlined link (toast in v1).
    * Right-aligned map thumbnail `64 × 64 pt`, radius `8 pt`, gap `12 pt` from the text column. The thumbnail vertically centers against the title + preview block.
  * Footer row `12 pt / 500 / textHint`: "{n}일전 · 조회 {n}" left + comments badge "💬 {n}" right.
* When a card has the map thumbnail, the comments badge stays in the same row as `{n}일전 · 조회 {n}` directly under the text column (it does not sit beside the thumbnail).

#### 25.16.c 채팅 tab body

* Top notice banner card: full-width minus `20 pt` margins, padding `12 pt`, `noticeBg` background, radius `10 pt`.
  * Title "📢 [싱글벙글 러닝 크루 채팅방입니다.] 러닝을 즐기는 사람들과의 만남이 됩니다 X" `13 pt / 600`.
  * Bullet list below in `12 pt / 500 / textSecondary`, each starting with a red `✕` or green `✓` 12px icon.
* Message list scrolls, padding `16 pt 20 pt`. Bubble layouts:
  * **other** — avatar `32 × 32 pt` (left), sender name `12 pt / 500 / textSecondary` above bubble, bubble background `#F2F2F2`, padding `10 pt 14 pt`, radius `14 pt` (with top-left corner `4 pt` to indicate tail), max width `72%`. Timestamp `11 pt / 500 / textHint` right of bubble, aligned to bubble bottom.
  * **me** — bubble `orange`, white text, radius `14 pt` (top-right `4 pt`), aligned right. Timestamp left of bubble.
  * **system** — full-width inline strip, background `orangeTint`, padding `8 pt 12 pt`, label `12 pt / 500 / orange` centered.
* Composer at bottom (sticky, `safe-area-inset-bottom` padding):
  * Input height `44 pt`, radius `22 pt`, background `#F2F2F2`, placeholder "메시지를 입력하세요" `14 pt / 400 / textHint`, leading `+ ` icon, trailing send button `36 × 36` orange circle with white paper-plane icon (visible only when text is non-empty).

#### 25.16.d 사진첩 / 멤버 tab body

* Centered placeholder: light gray icon `48 × 48`, then label "{tab} 기능을 준비 중이에요" `14 pt / 500 / textHint`. Vertical center of the available space.

### 25.17 PostChatScreen (standalone)

Identical to the in-detail 채팅 tab but with a real toolbar at top instead of the meeting hero:
* Toolbar `48 pt`: back + meeting name `16 pt / 600` + right `🔍` icon (in-room search, v1 toast).
* Notice banner same as §25.16.c.
* Message list + composer same as §25.16.c.

### 25.18 MyScreen (placeholder for v1)

* Toolbar `48 pt`: empty left, "MY" centered, right gear icon `24 × 24` (toast).
* Profile card top: avatar `64 × 64` circle, nickname `17 pt / 700` right of avatar, email `13 pt / 500 / textHint` below nickname. Card padding `20 pt`.
* List rows (`56 pt` each, divider in `borderDefault`):
  * 알림 설정 →
  * 이용약관 →
  * 개인정보처리방침 →
  * 버전 1.0.0 (no chevron)
  * 로그아웃 (red `noticeRed` label)
* Bottom-nav visible.

### 25.19 Component visual cheat-sheet

| Component        | Variants                           | Key dims                                                                    |
|------------------|------------------------------------|------------------------------------------------------------------------------|
| `PrimaryButton`  | active / disabled                  | `52 pt` tall, radius `8 pt`, font `15 / 600`                                  |
| `SecondaryButton`| default / pressed                  | `52 pt` tall, radius `8 pt`, `1 pt borderDefault`, font `15 / 500`            |
| `Chip`           | unselected / selected              | `32 pt` tall, radius `999`, padding `0 14 pt`                                 |
| `Pill`           | sport / level / activity-time      | `20–24 pt` tall, radius `999`, padding `0 8 pt`                               |
| `Badge` (notice) | `공지` / `필수` / `한자리 남았어요`| `22 pt`, padding `0 8 pt`, font `11 / 700`                                    |
| `Heart icon`     | unfilled / filled                  | `20 × 20`, stroke `1.5 pt`                                                    |
| `Avatar`         | default / sample                   | `32`, `48`, `64` circle                                                       |
| `Date cell`      | normal / today                     | `40 × 56`, inner circle `32`                                                  |
| `Meeting card (list)`  | default                       | `100% × 84 pt`, radius `12 pt`, image `64 × 64`                               |
| `Trial card`     | default                            | `160 × 240 pt`, image-top `160 × 140`, radius `14 pt`                          |
| `Review card`    | default                            | `220 × 140 pt`, dark gradient overlay                                         |
| `Schedule card`  | normal / urgent                    | `100% × 100 pt`, thumbnail `80 × 80`                                          |
| `InputBox`       | empty / focused / error / valid / autocomplete | `48 pt`, radius `8 pt`                                              |

### 25.20 Typography scale (final)

| Token             | Size / Weight | Used for                                       |
|-------------------|--------------|------------------------------------------------|
| `display`         | `22 / 700`   | Auth page titles, complete-screen headline      |
| `h1`              | `19 / 700`   | PostDetail title                                |
| `h2`              | `17 / 700`   | MyScreen nickname                               |
| `h3`              | `16 / 600`   | Toolbar title, section header                   |
| `body`            | `15 / 500`   | Default body                                    |
| `body-strong`     | `15 / 700`   | Card titles                                     |
| `label`           | `14 / 500`   | Inline labels, tab labels                       |
| `label-strong`    | `14 / 700`   | Active tab, in-card section title               |
| `caption`         | `13 / 500`   | Helper text, meta                               |
| `caption-strong`  | `13 / 700`   | Active chip, CTA links ("가입하러 가기 →")      |
| `micro`           | `12 / 500`   | Meta info, timestamp                            |
| `micro-strong`    | `12 / 700`   | "한자리 남았어요!!", date strip day label        |
| `mini`            | `11 / 500`   | Bottom-nav label                                |
| `mini-strong`     | `11 / 700`   | Badge text                                      |

Encode this in `tailwind.config.ts` under `theme.extend.fontSize`:

```ts
fontSize: {
  display:        ['22px', { lineHeight: '1.35', fontWeight: '700' }],
  h1:             ['19px', { lineHeight: '1.30', fontWeight: '700' }],
  h2:             ['17px', { lineHeight: '1.40', fontWeight: '700' }],
  h3:             ['16px', { lineHeight: '1.40', fontWeight: '600' }],
  body:           ['15px', { lineHeight: '1.50', fontWeight: '500' }],
  'body-strong':  ['15px', { lineHeight: '1.50', fontWeight: '700' }],
  label:          ['14px', { lineHeight: '1.40', fontWeight: '500' }],
  'label-strong': ['14px', { lineHeight: '1.40', fontWeight: '700' }],
  caption:        ['13px', { lineHeight: '1.45', fontWeight: '500' }],
  'caption-strong':['13px',{ lineHeight: '1.45', fontWeight: '700' }],
  micro:          ['12px', { lineHeight: '1.40', fontWeight: '500' }],
  'micro-strong': ['12px', { lineHeight: '1.40', fontWeight: '700' }],
  mini:           ['11px', { lineHeight: '1.30', fontWeight: '500' }],
  'mini-strong':  ['11px', { lineHeight: '1.30', fontWeight: '700' }],
},
```

### 25.21 Cross-reference index

For implementers — every screen in §12 has a corresponding visual block here:

| §12 screen              | §25 visual ref          | Source image(s)                                                                 |
|-------------------------|-------------------------|----------------------------------------------------------------------------------|
| SplashScreen            | §25.3                   | `sign_splash_login_emaillogin.png`                                              |
| LoginScreen             | §25.4                   | `sign_splash_login_emaillogin.png`                                              |
| EmailLoginScreen        | §25.5 + §25.2 InputBox  | `sign_splash_login_emaillogin.png`, `sign_emaillogin_input_states.png`           |
| SignupEmailScreen       | §25.6 + §25.2           | `sign_signup_email_states.png`                                                  |
| SignupPasswordScreen    | §25.6 + §25.2           | `sign_signup_password_states.png`, `sign_signup_password_active.png`             |
| SignupNicknameScreen    | §25.6 + §25.2           | `sign_signup_nickname_states.png`                                                |
| TermsBottomSheet        | §25.7                   | `sign_signup_terms_bottomsheet.png`                                              |
| SignupPreference (SEL)  | §25.8                   | `sign_signup_preference_running.png`                                             |
| SignupPreference (DET)  | §25.9                   | `sign_signup_preference_running.png` (right pane), `sign_signup_preference_futssal_cycle_mountain_golf.png`, `sign_signup_preference_golf_extended.png`, `sign_signup_preference_with_skip.png` |
| SignupCompleteScreen    | §25.10                  | `sign_signup_preference_cycle_complete_card.png`                                 |
| HomeScreen (member)     | §25.11                  | `home_full_scroll_chatroom.png`, `home_review_billboard_cards.png`, `home_trial_card_detail_apply.png`, `home_bottom_banner_schedule.png` |
| HomeScreen (guest)      | §25.12                  | `home_section2_overview_sitemap.png`                                             |
| ExerciseScreen          | §25.13                  | `home_main_postdetail_share_chat.png` (leftmost frame), `home_recommended_group_list.png` |
| RecommendedGroupScreen  | §25.14                  | `home_recommended_group_list.png`                                                |
| UpcomingMeetingScreen   | §25.15                  | `home_bottom_banner_schedule.png` (bottom frame)                                 |
| PostDetailScreen        | §25.16                  | `home_postdetail_participant_home.png`, `home_postdetail_noticelist_tab.png`, `home_postdetail_noticelist_chattab.png`, `home_postdetail_noticelist_tab2.png`, `home_postdetail_chat_groups_upcoming.png` |
| PostChatScreen          | §25.17                  | `home_postdetail_noticelist_chattab.png`                                          |
| MyScreen                | §25.18                  | (not exported — extrapolated from spec)                                          |

---

> **Document status:** v1.2 — visual layer captured from 24 design PNG exports (full coverage of all interactive screens). Pair this with §1–§24 for the full build instructions. Pixel deltas in code should be reconciled against the cross-reference table in §25.21 first.
>
> **Image coverage:** 24 / 58 PNGs in `designs/` were inspected. The remaining 34 are content assets (`img_meeting_*`, `img_trial_*`, `img_profile_*`, `ic_*`) listed in §14 — these are imported as-is without further inspection. Two ratio guides (`Img ratio-web*.png`) and one work-in-progress screenshot are out of scope.

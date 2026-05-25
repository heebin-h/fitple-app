# FitPle iOS — Build & Release Cheatsheet

A condensed companion to SPEC.md §18. Every command is meant to be copy-pasted.

---

## 0. One-time machine setup

```bash
# Apple toolchain
xcode-select --install                 # Command Line Tools
sudo gem install cocoapods             # OR: brew install cocoapods

# Node toolchain (use the version pinned in .nvmrc)
nvm install                            # reads .nvmrc → installs the right Node
nvm use
node -v                                # confirm
```

Apple Developer account isn't required for local simulator runs. It IS required for installing on a physical iPhone (Free Apple ID = your phone only, 7-day expiry; Apple Developer Program = $99/yr for TestFlight + App Store).

---

## 1. Daily dev loop (browser only — no Xcode)

```bash
npm install
npm run dev                            # http://localhost:5173 — Chrome / Safari
npm run dev -- --host                  # expose on LAN, scan QR from phone Safari
```

For LAN access from a phone:

```bash
ipconfig getifaddr en0                 # find your Mac's IP, e.g. 192.168.0.42
# then on the phone: http://192.168.0.42:5173/
```

Type-check + production build sanity:

```bash
npx tsc --noEmit                       # no emitted files, just diagnostics
npm run build                          # → dist/
npm run preview                        # serves dist/ on localhost:4173
```

---

## 2. First-time iOS shell creation

Only do this once per machine — the generated `ios/` folder gets committed.

```bash
npm install                            # ensure @capacitor/cli is present
npm run build                          # produce dist/
npx cap add ios                        # generates ios/App/...
npx cap sync ios                       # copies dist + installs plugins via Pods
npx cap open ios                       # opens the Xcode workspace
```

After opening Xcode:

1. **App target → Signing & Capabilities** → tick *Automatically manage signing* → pick your Team.
2. **General** → confirm Bundle Identifier = `team.fitple.sideproject`, Deployment Info iOS = `15.0` (or higher), Device Orientation = Portrait only.
3. **Build Settings** → search "Swift Language Version" → set 5.0+.
4. **Capabilities** (only when you actually wire them): Push Notifications, Sign in with Apple, Background Modes.

---

## 3. Iterative iOS loop

After the initial `cap add`:

```bash
# any time you change web code
npm run build && npx cap sync ios

# run on a connected device / simulator without leaving terminal
npx cap run ios --target=<device-or-simulator-id>
# OR
npx cap open ios     # then ⌘R in Xcode
```

Live-reload (Vite dev server inside the iOS shell):

```ts
// vite.config.ts — dev only
server: { host: true, port: 5173 },

// capacitor.config.ts — dev only, REVERT before release
server: {
  url: 'http://192.168.0.42:5173',     // your Mac's IP
  cleartext: true,
},
```

Then `npx cap sync ios && npx cap run ios` — the WebView pulls JS straight from Vite, you save → app reloads.

⚠️ **Always revert the `server.url` block before archiving.** Released apps cannot point at your laptop.

---

## 4. Asset wiring

```bash
# App icon (1024×1024 PNG, no transparency)
open ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json
# Replace each entry. Use https://www.appicon.co or `cordova-res` to fan out the sizes.

# Launch image (2732×2732 PNG, transparent or white background)
open ios/App/App/Assets.xcassets/Splash.imageset/Contents.json
```

Splash background colour is controlled by `capacitor.config.ts > plugins.SplashScreen.backgroundColor`. Match it to your launch image background to avoid the white-flash on app open.

---

## 5. Info.plist quick edits

Open `ios/App/App/Info.plist`. Common additions:

```xml
<!-- Tells App Store Connect "no custom crypto used" — SHA-256 via the system library is exempt -->
<key>ITSAppUsesNonExemptEncryption</key>
<false/>

<!-- Force light UI (we don't ship a dark theme in v1) -->
<key>UIUserInterfaceStyle</key>
<string>Light</string>

<!-- Permissions added ONLY when the matching feature ships -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>모임 추천을 위해 현재 위치를 사용합니다.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>모임 사진 업로드를 위해 사진에 접근합니다.</string>
<key>NSCameraUsageDescription</key>
<string>프로필 사진 촬영을 위해 카메라를 사용합니다.</string>
```

---

## 6. TestFlight / App Store submission

```bash
# 1. Bump versions in Xcode → General
#    Marketing Version (CFBundleShortVersionString): 1.0.0, 1.0.1, ...
#    Bundle Version (CFBundleVersion):               1, 2, 3, ... (must increment every upload)

# 2. Clean + archive
#    Xcode → Product → Clean Build Folder
#    Xcode → Product → Archive          (target must be "Any iOS Device (arm64)")

# 3. Distribute
#    Organizer window → pick the archive → Distribute App → App Store Connect →
#    Upload → wait ~5–15 min for processing → email confirms

# 4. App Store Connect (https://appstoreconnect.apple.com)
#    My Apps → FitPle → TestFlight → "+ Internal Testing" → invite by Apple ID
#    OR → App Store tab → fill metadata → add screenshots → submit for review
```

App Store metadata to prepare ahead of time:

* App name: **FitPle**
* Subtitle (30 chars): **운동 모임 매칭**
* Primary category: **Health & Fitness** → Sports
* Keywords (100 chars): `운동,모임,러닝,골프,사이클,등산,풋살,헬스,데모`
* Privacy URL: a static page on Vercel is fine for v1 (the existing PWA URL works).
* Support URL: same.
* Demo account: `demo@fitple.app / demo1234` (paste into the review notes box).
* Screenshots: 6.5″ (1290×2796) and 5.5″ (1242×2208). Capture via simulator → `⌘ S`. Five required per size.
* Privacy nutrition label: choose **Data Not Collected** for every category (the app is local-only).

---

## 7. Troubleshooting

| Symptom                                                           | Fix |
|-------------------------------------------------------------------|-----|
| `pod install` fails with `Unable to find a specification`         | `cd ios/App && pod repo update && pod install`                                                |
| White screen after launching on device                            | Check Safari Web Inspector (Mac → Safari → Develop → \<your phone\> → \<app webview\>). Likely a JS error from `seedRunner`. |
| "App ID prefix" mismatch when archiving                           | Xcode → Signing & Capabilities → Team is set, then **Try Again** in the signing banner.       |
| Status bar overlaps content                                       | Confirm `viewport-fit=cover` in `index.html`, and that `PageFrame` applies `pt-safe`.         |
| New build doesn't show on phone after running                     | Quit the app fully (swipe up from app switcher), then relaunch — iOS caches the WKWebView.    |
| `npx cap sync ios` says "Plugin not found"                        | `rm -rf node_modules && npm install`, then sync again. Often happens after upgrading Capacitor major versions. |
| iOS-simulator keyboard not appearing                              | In the simulator menu: **I/O → Keyboard → Toggle Software Keyboard** (or ⌘K).                  |

---

## 8. Files & where they live on disk

```
fitple-app/
├── ios/                          # generated by `npx cap add ios` — commit this
│   └── App/
│       ├── App/
│       │   ├── Info.plist
│       │   ├── AppDelegate.swift
│       │   ├── Assets.xcassets/
│       │   └── public/           # mirror of dist/ — overwritten by `cap sync`
│       ├── App.xcodeproj
│       └── App.xcworkspace       # open this with Xcode (NOT the .xcodeproj)
├── dist/                         # `npm run build` output — gitignored
├── capacitor.config.ts           # appId, plugins, dev server overrides
└── package.json
```

> If you ever delete `ios/` to start fresh, you only lose the native scaffolding — your icon assets and `Info.plist` edits go with it. Stash them first or commit them before deleting.

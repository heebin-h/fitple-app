# FitPle React Web — 세션 인계 노트

> 최종 갱신: 2026-05-25 (Phase 0 폴리쉬 완료 + 디자인 토큰 + 유틸리티 + AI 가이드 추가)
> 새 세션이 `CLAUDE.md` → 이 파일 → `SPEC.md` 순으로 보면 즉시 이어받을 수 있음.

---

## 0. 새 세션 시작 시 첫 3분

```bash
cd /Users/heebiny/fitple-app
cat CLAUDE.md           # AI용 단일 출처 가이드 (10개 하우스 룰 + 파일 매핑)
cat HANDOFF.md          # 이 파일 — 어디까지 했고 다음 뭐 할지
git status              # 현재 변경사항
git log --oneline -5
# SPEC.md 는 필요 섹션만 grep해서 참조
```

> **`CLAUDE.md`가 fitple-app 디렉토리의 cwd에서 자동 로드됨** — 새 세션을 fitple-app 안에서 시작하면 별도 Read 없이 컨텍스트 진입.

## 1. 단일 출처 문서

| 문서 | 역할 |
|------|------|
| **`CLAUDE.md`** | AI 에이전트용 가이드 — TL;DR, 하우스 룰 10개, 파일 매핑, 다음 작업 포인터 |
| **`SPEC.md`** | 풀스펙 (1624줄, 25 섹션) — **무엇을** 만들지 / 색상 / 타이포 / 화면 / 데이터 |
| **`BUILD.md`** | 빌드/배포 치트시트 (SPEC §18 동반) — every `npx cap` 명령 |
| **`HANDOFF.md`** (이 파일) | 진행 상황 + 다음 작업 + 환경 + 미해결 |
| `/Users/heebiny/AndroidStudioProjects/FitPle/REACT_WEB_PLAN.md` | 외부 계획서, Phase 정의 |
| `/Users/heebiny/AndroidStudioProjects/FitPle/RN_MIGRATION_PLAN.archive.md` | 폐기된 RN 노선, 참고용 |

⚠️ 충돌 시 **SPEC.md > CLAUDE.md > HANDOFF.md** 우선.

## 2. 작업 디렉토리 / 외부 참조

| 항목 | 경로 |
|------|------|
| 코드 (작업) | `/Users/heebiny/fitple-app/` |
| GitHub | `https://github.com/heebin-h/fitple-app` (main) |
| Android 원본 (수정 X) | `/Users/heebiny/AndroidStudioProjects/FitPle/app/src/main/java/com/example/fitple/` |
| Android colors.xml | `.../app/src/main/res/values/colors.xml` (이미 tailwind.config.ts로 추출 완료) |
| 디자인 시안 PNG | `/Users/heebiny/AndroidStudioProjects/FitPle/designs/` |
| Android 인증 플로우 다이어그램 | `/Users/heebiny/AndroidStudioProjects/FitPle/docs/login_signup_flow.md` (SPEC §11에 미러됨) |

## 3. 완료된 작업

### Phase 0 — 프로젝트 초기화 ✅ (커밋 `3416a47`)
- Vite 8 + React 18 + TypeScript 5 + Tailwind CSS 3 + vite-plugin-pwa
- 폴더 구조: `src/{screens/{auth,main},components/{layout,common,home,meeting},store,storage,data,utils,constants,routes,assets/images}`, `public/icons/`
- 설정: `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `index.html`, `vite-env.d.ts`
- 엔트리: `src/main.tsx`, `src/App.tsx` (임시), `src/index.css`
- `npm run build` 통과

### Capacitor iOS 래퍼 ✅ (커밋 `8782025`)
- `@capacitor/core`, `@capacitor/ios`, `@capacitor/cli` 설치
- `capacitor.config.ts` (`appId=team.fitple.sideproject`, `appName=FitPle`, `webDir=dist`)
- ❌ `ios/` 네이티브 폴더 미생성 (Xcode 완료 후 `npx cap add ios`)

### Phase 0 폴리쉬 ✅ (사용자 직접 보강 — 다음 커밋 대상)
**디자인 토큰 완성** (`tailwind.config.ts` + `src/constants/colors.ts`):
- 24개 색상 토큰 (brand `#FF5722`, text/border/surface/button/semantic/card tint/badge/google glyph)
- 14개 타이포 토큰 (`display`/`h1-3`/`body`/`label`/`caption`/`micro`/`mini` × `-strong`)
- `borderRadius` (`card=12`, `sheet=20`), iOS 애니메이션 토큰

**유틸 추가**:
- `src/utils/cn.ts` — className 결합 (clsx 미사용, 0 deps)
- `src/utils/date.ts` — dayjs 기반 Korean 요일/월/날짜 헬퍼
- `src/utils/platform.ts` — Capacitor 안전 감지 (`isNative`, `isIOS`, `isStandalonePWA`)
- `src/constants/colors.ts` — Tailwind 토큰의 JS 상수 미러 (Capacitor 플러그인 인자용)

**문서**:
- `CLAUDE.md` — AI 에이전트 가이드 (TL;DR + 10개 하우스 룰 + 파일 매핑 + 다음 작업 포인터)
- `BUILD.md` — 빌드/배포 치트시트
- `.nvmrc` — Node 20 핀

**기존 인프라 정확화**:
- `src/constants/sports.ts` — 5종목 SPEC 확정값 (러닝/풋살/등산/사이클/골프, 종목별 2~4 질문, 정확한 옵션 문구)
- `src/data/models.ts` — Meeting 인터페이스에 `lastActiveMinutes`, `meetingTime`, `tags` 추가
- `src/data/seedData.ts` — 모임 15개 (3 per sport × 5 sports), Android HomeFragment/ExerciseFragment 기반 실제 location/image 매칭
- `README.md` — 사용자 다듬음

### Phase 1 인프라 (절반) ✅ (커밋 `8782025`)
- `src/utils/hash.ts` — Web Crypto SHA-256 async
- `src/utils/validation.ts` — email/password/nickname
- `src/storage/userManager.ts` — Android `UserManager.kt` 1:1 포트
- `src/storage/seedRunner.ts` — 첫 실행 시드

## 4. 다음 작업 — Phase 1 후반 (SPEC §20 / CLAUDE.md "Next up")

13개 파일 한 번에 작성 후 빌드 검증:

| # | 파일 | 핵심 |
|---|------|---------|
| 1 | `src/store/authStore.ts` | Zustand: `currentUser`, `isGuest`, `setUser`, `enterGuest`, `clearUser` |
| 2 | `src/components/layout/MobileFrame.tsx` | max-w-mobile 가운데 정렬 + 좌우 회색 |
| 3 | `src/components/layout/BottomNav.tsx` | 5탭 (Home/Exercise/Explore/Chat/My). Chat/My는 `toast('준비 중')` |
| 4 | `src/components/layout/MainLayout.tsx` | `<Outlet />` + BottomNav |
| 5 | `src/routes/RequireAuth.tsx` | 비로그인 시 `/login` redirect |
| 6 | `src/routes/AppRoutes.tsx` | BrowserRouter + MobileFrame + MainLayout nested |
| 7 | `src/screens/SplashScreen.tsx` | 1.5s 후 `pendingSignup`/`isLoggedIn` 기반 분기 |
| 8 | `src/screens/auth/LoginScreen.tsx` | placeholder: 데모 빠른 로그인 + 게스트 + 소셜 Toast |
| 9 | `src/screens/main/HomeScreen.tsx` | placeholder |
| 10 | `src/screens/main/ExerciseScreen.tsx` | placeholder |
| 11 | `src/screens/main/RecommendedGroupScreen.tsx` | placeholder |
| 12 | `src/App.tsx` 수정 | `seedIfFirstRun()` + `<AppRoutes/>` + `<Toaster/>` |
| 13 | 검증 | `npx tsc --noEmit && npm run build` |

상세 구현: SPEC §9 (State), §10 (Routing — 라우트 테이블 §10.1), §11 (Auth Flows), §12 (Screen Specs).
주의: CLAUDE.md 하우스 룰 #1 (토큰만 사용), #2 (타이포 토큰), #4 (모두 await), #6 (레이아웃 primitives: `px-5`/`h-12`/`h-[52px]`/`rounded-card`).

## 5. 결정된 사항 (변경 금지)

| 항목 | 값 |
|------|---|
| Bundle ID / appId | `team.fitple.sideproject` |
| 앱 이름 | FitPle |
| 모바일 폭 | `max-w-mobile = 430px` |
| 로컬 DB | localStorage |
| 해싱 | Web Crypto SHA-256 (모두 `async`) |
| 종목 5개 (불변) | **러닝 · 풋살 · 등산 · 사이클 · 골프** |
| 데모 계정 | `demo@fitple.app` / `demo1234` (선호운동까지 자동 시드) |
| 브랜드 컬러 | `#FF5722` (orange), `#FFF0ED` (orangeTint) |
| iOS 배포 | Capacitor + Free Apple ID + Xcode → 본인 폰 7일 (무료) |
| 친구 폰 배포 | PWA URL 공유 (Safari "홈 화면에 추가") |
| 호스팅 | Phase 7에서 결정 (Vercel / GH Pages / Cloudflare Pages) |
| 푸시/소셜 로그인 | 데모 범위 외 (Toast 처리) |
| Apple Developer Program | 미가입 ($99/년 — 친구 폰 IPA 배포 시에만) |

## 6. 환경

| 항목 | 값 |
|------|---|
| Node | v25.8.1 (단, `.nvmrc` = Node 20 — 새 세션에서 `nvm use` 권장) |
| npm | 11.11.0 |
| git | 2.50.1 |
| Homebrew | `/opt/homebrew/bin/brew` |
| VS Code 확장 | ESLint, Prettier, Tailwind CSS IntelliSense (사용자 GUI 설치) |
| Xcode | ⚠️ 사용자 측 설치 진행 중 — **다음 세션에서 진행 상황 확인 필요** |
| CocoaPods | ❌ 미설치 — Xcode 완료 후 `brew install cocoapods` (BUILD.md §0 참조) |

## 7. 사용자 측 미해결 / 다음 세션 첫 확인

1. **Xcode 설치 완료 + 첫 실행 라이센스 동의 여부**
2. **`brew install cocoapods`** 완료 여부
3. **`nvm install && nvm use`** (`.nvmrc`의 Node 20으로 전환)
4. **폰에서 `npm run dev --host` 테스트** — 아직 안 해봄
5. PWA 아이콘 PNG (192/512px) — placeholder (Phase 7 직전에 생성)

## 8. 다음 세션 첫 액션 시퀀스

1. **확인 질의**: Xcode/CocoaPods/Node 버전/폰 테스트 진행 상황
2. **Phase 1 후반 진행**: §4의 13개 파일을 한 번에 작성 → 빌드 검증
3. **commit**: `feat(phase-1): auth store + router + layout + screen scaffolds`
4. **사용자가 `npm run dev`로 화면 확인** → 데모 로그인 / 게스트 / BottomNav 동작 확인
5. **Phase 2 진입** (공통 컴포넌트 — `InputBox` 5-state, `EmailSuggestion`, `PrimaryButton`, `SportIcon`, `Chip`, `TermsBottomSheet`, `MeetingCard`)
6. **Xcode 완료 시 Capacitor iOS 빌드** (BUILD.md §2 참조):
   ```bash
   npm run build
   npx cap add ios          # 최초 1회
   npx cap sync
   npx cap open ios
   # Xcode → Signing & Capabilities → Team을 본인 Apple ID로 → 폰 USB → ▶ Run
   ```

## 9. 트러블슈팅

- **TS strict**: 빌드 전 `npx tsc --noEmit` 권장 (CLAUDE.md 룰 #10).
- **`crypto.subtle.digest` Promise**: await 누락 시 비번 해시가 `[object Promise]` (CLAUDE.md 룰 #4).
- **localStorage 도메인 격리**: dev (localhost:5173) vs prod URL 키 분리됨. 정상.
- **vite-plugin-pwa manifest icons**: 현재 빈 배열 — Phase 7 직전 PNG 추가 시 경고 해소.
- **Vite 8 + plugin-react latest**: peer dep React 18 명시 안 됐어도 정상 동작.

## 10. (옵션) 글로벌 프로필 갱신

`/Users/heebiny/.claude/profile/current-projects.md`에 FitPle 항목 추가 — 다음 세션 자동 인지:

```markdown
## 7. fitple-app — React + Capacitor iOS 데모 (Phase 1 후반 진행 중)

- **현재**: Phase 0 폴리쉬 + Phase 1 인프라 완료, 후반 13개 (routing + auth store + layout + 화면 placeholder) 대기 (2026-05-25)
- **노선**: React 웹 + PWA + Capacitor iOS 래퍼 (백엔드 없음, localStorage)
- **위치**: `/Users/heebiny/fitple-app/` (참조: `CLAUDE.md`, `HANDOFF.md`, `SPEC.md`, `BUILD.md`)
- **외부 계획서**: `/Users/heebiny/AndroidStudioProjects/FitPle/REACT_WEB_PLAN.md`
- **미해결**: Xcode 설치 / CocoaPods / 폰 PWA 테스트 / PWA 아이콘
- **grep**: `fitple|fitple-app|capacitor|react.*pwa`
```

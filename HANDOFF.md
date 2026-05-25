# FitPle React Web — 세션 인계 노트

> 최종 갱신: 2026-05-25
> 새 세션이 이 파일과 `SPEC.md`만 읽고 즉시 작업을 이어갈 수 있도록 정리.

---

## 0. 새 세션 시작 시 첫 3분

```bash
cd /Users/heebiny/fitple-app
cat HANDOFF.md          # 이 파일 (1분)
git status              # 현재 변경사항
git log --oneline -5    # 최근 커밋
# 필요 시 SPEC.md를 섹션별로 참조
```

## 1. 단일 출처 문서

| 문서 | 역할 |
|------|------|
| **`SPEC.md`** | 풀스펙 (1624줄, 25개 섹션) — **무엇을** 만들지 / Android→iOS 패턴 / 화면 상세 / 색상 / 데이터 모델 |
| **`HANDOFF.md`** (이 파일) | 어디까지 했고 / 다음 뭐 할지 / 환경 / 결정사항 |
| `/Users/heebiny/AndroidStudioProjects/FitPle/REACT_WEB_PLAN.md` | 외부 계획서 (Phase 정의), Android 원본 옆에 있음 |
| `/Users/heebiny/AndroidStudioProjects/FitPle/RN_MIGRATION_PLAN.archive.md` | 폐기된 RN 노선, 참고용 |

⚠️ SPEC.md와 본 노트가 충돌하면 **SPEC.md를 단일 출처로 우선**.

## 2. 작업 디렉토리 / 외부 참조

| 항목 | 경로 |
|------|------|
| 코드 (작업) | `/Users/heebiny/fitple-app/` |
| GitHub | `https://github.com/heebin-h/fitple-app` (main) |
| Android 원본 (수정 X) | `/Users/heebiny/AndroidStudioProjects/FitPle/app/src/main/java/com/example/fitple/` |
| Android colors.xml | `.../app/src/main/res/values/colors.xml` (색상 추출 필요) |
| 디자인 시안 PNG | `/Users/heebiny/AndroidStudioProjects/FitPle/designs/` |

## 3. 완료된 작업

### Phase 0 — 프로젝트 초기화 ✅ (커밋 `3416a47`)
- Vite 8 + React 18 + TypeScript 5 + Tailwind CSS 3 + vite-plugin-pwa
- 폴더 구조: `src/{screens/{auth,main},components/{layout,common,home,meeting},store,storage,data,utils,constants,routes,assets/images}`, `public/icons/`
- 설정: `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts` (PWA manifest, theme #FF6B35), `tailwind.config.ts` (color placeholder, max-w-mobile=430px, Pretendard), `postcss.config.js`, `index.html`, `src/vite-env.d.ts`
- 엔트리: `src/main.tsx`, `src/App.tsx` (임시 화면), `src/index.css` (Tailwind + SafeArea + iOS 16px)
- `.gitignore` Python → Node/Vite로 교체
- `npm run build` 통과 (1.13s, gzip 46KB)

### Capacitor iOS 래퍼 ✅ (uncommitted)
- 설치: `@capacitor/core`, `@capacitor/ios`, `@capacitor/cli` (-D)
- `capacitor.config.ts` 생성 (`appId=team.fitple.sideproject`, `appName=FitPle`, `webDir=dist`)
- ❌ `ios/` 네이티브 폴더 미생성 (Xcode 완료 후 `npx cap add ios`)

### Phase 1 인프라 ✅ (uncommitted, TS 타입체크 통과)
- `src/utils/hash.ts` — Web Crypto SHA-256 async 헬퍼
- `src/data/models.ts` — UserProfile, Meeting, ChatMessage, Review, ScheduleItem
- `src/constants/sports.ts` — 5종목 + 세부 질문 (러닝/골프/테니스/클라이밍/자전거). **실제 질문/선지는 Android `SignupPreferenceFragment.kt` 매칭 후 정확화 필요**.
- `src/utils/validation.ts` — `isValidEmailFormat`, `isValidPassword` (영문+숫자 8~20), `isValidNickname`
- `src/storage/userManager.ts` — **Android `UserManager.kt` 1:1 포트, 모든 메서드 async**
- `src/data/seedData.ts` — 데모 계정 3 + 모임 12 + 후기 6 + 스케줄 7 + 채팅 시드 (3 모임만)
- `src/storage/seedRunner.ts` — `seedIfFirstRun()` + `resetAndReseed()` (디버그용)

### 외부 자료 ✅
- 사용자 작성 `SPEC.md` (1624 줄) — 풀스펙
- `REACT_WEB_PLAN.md` (외부) — Phase 0~7 일정 + 의사결정 히스토리

## 4. 다음 작업 — Phase 1 후반

13개 파일 한 번에 작성 후 빌드 검증:

| # | 파일 | 핵심 내용 |
|---|------|---------|
| 1 | `src/store/authStore.ts` | Zustand: `currentUser`, `isGuest`, `setUser`, `enterGuest`, `clearUser` |
| 2 | `src/components/layout/MobileFrame.tsx` | 데스크톱 가운데 정렬, max-w-mobile, 좌우 회색 배경 |
| 3 | `src/components/layout/BottomNav.tsx` | 5탭 (Home/Exercise/Explore/Chat/My). Chat/My는 `toast('준비 중')` |
| 4 | `src/components/layout/MainLayout.tsx` | `<Outlet />` + BottomNav 래퍼 |
| 5 | `src/routes/RequireAuth.tsx` | 비로그인 시 `/login` redirect |
| 6 | `src/routes/AppRoutes.tsx` | BrowserRouter, MobileFrame 마운트, MainLayout nested |
| 7 | `src/screens/SplashScreen.tsx` | 1.5s 후 분기: `pendingSignup` 있으면 /login (Phase 3에서 점프), `isLoggedIn` 이면 /home, 아니면 /login |
| 8 | `src/screens/auth/LoginScreen.tsx` | placeholder: 데모 빠른 로그인 + 게스트 진입 + 소셜 Toast |
| 9 | `src/screens/main/HomeScreen.tsx` | placeholder: nickname / 게스트 안내 |
| 10 | `src/screens/main/ExerciseScreen.tsx` | placeholder |
| 11 | `src/screens/main/RecommendedGroupScreen.tsx` | placeholder |
| 12 | `src/App.tsx` 수정 | `seedIfFirstRun()` useEffect + `<AppRoutes/>` + `<Toaster/>` |
| 13 | 검증 | `npx tsc --noEmit && npm run build` |

상세 구현 지침: `SPEC.md` §9 (State Management), §10 (Routing), §11 (Authentication Flows), §12 (Screen Specifications).

## 5. 결정된 사항 (변경 금지)

| 항목 | 값 |
|------|---|
| Bundle ID / appId | `team.fitple.sideproject` |
| 앱 이름 | FitPle |
| 모바일 폭 | `max-w-mobile = 430px` (Tailwind) |
| 로컬 DB | localStorage (의존성 0) |
| 해싱 | Web Crypto SHA-256 (모두 `async`) |
| MMKV 암호화 | 없음 |
| 데모 계정 | `demo@fitple.app` / `demo1234` (시드 시 선호운동까지 자동 주입) |
| iOS 배포 | Capacitor + Free Apple ID + Xcode → 본인 폰 7일 만료 (무료) |
| 친구 폰 배포 | **PWA URL 공유** (iOS는 Safari `홈 화면에 추가`) |
| 호스팅 | Phase 7에서 결정 (Vercel / GitHub Pages / Cloudflare Pages 중) |
| 푸시/소셜 로그인 | 데모 범위 외 (Toast 처리) |
| Apple Developer Program | **미가입** ($99/년) — 친구 폰 IPA 배포 시에만 필요 |
| 라이브 리로드 / 로컬 폰 테스트 | `npm run dev -- --host` + 같은 Wi-Fi 폰 Safari |

## 6. 환경

| 항목 | 값 |
|------|---|
| Node | v25.8.1 |
| npm | 11.11.0 |
| git | 2.50.1 |
| Homebrew | `/opt/homebrew/bin/brew` |
| VS Code 확장 | ESLint, Prettier, Tailwind CSS IntelliSense (사용자가 GUI로 설치 완료) |
| Xcode | ⚠️ 사용자 측 설치 진행 중 (~15GB) — **다음 세션에서 진행 상황 확인 필요** |
| CocoaPods | ❌ 미설치 — Xcode 완료 후 `brew install cocoapods` |

## 7. 사용자 측 미해결 / 다음 세션 확인 필요

- **Xcode 설치 완료 여부 + 첫 실행 라이센스 동의 여부**
- VS Code 확장 3개 정상 작동 (Tailwind 자동완성 등) — 미검증
- 폰에서 `npm run dev --host` 테스트 — 아직 안 해봤음
- 색상 placeholder (`#FF6B35` 등) → Android `colors.xml` 실제값 추출 필요 (Phase 3 진입 전)
- 종목 세부 질문 → Android `SignupPreferenceFragment.kt` 정확 내용 매칭 (Phase 3-7 직전)
- PWA 아이콘 PNG (192/512px) → 아직 placeholder (Phase 0 후반)

## 8. 다음 세션 첫 액션 시퀀스

1. **확인**: 사용자한테 Xcode 설치 완료됐는지 / 폰에서 dev 서버 테스트 했는지
2. **Phase 1 후반 진행**: 위 §4의 13개 파일 한 번에 작성 + 빌드 검증
3. **commit**: `feat(phase-1): localStorage userManager + seed + router + ui scaffold`
4. **사용자가 `npm run dev`로 화면 확인** → 데모 로그인 → 홈 진입 / 게스트 진입 / BottomNav 5탭 동작 확인
5. **Phase 2 진입** (공통 컴포넌트 — InputBox 5-state, EmailSuggestion, PrimaryButton, SportIcon, Chip, TermsBottomSheet, MeetingCard)
6. **Xcode 완료 시 Capacitor iOS 플랫폼 추가**:
   ```bash
   brew install cocoapods            # 사용자
   npm run build
   npx cap add ios                   # ios/ 네이티브 폴더 생성
   npx cap sync
   npx cap open ios                  # Xcode 열림
   # Xcode → Signing & Capabilities → Team을 본인 Apple ID로 설정
   # 폰 USB 연결 → 빌드 대상 선택 → ▶ Run
   # 폰 설정 → 일반 → VPN 및 기기 관리 → Apple ID 신뢰
   ```

## 9. 트러블슈팅 메모

- **TS strict 모드**: 새 .tsx의 unused import/var 즉시 에러. 빌드 전 `npx tsc --noEmit` 권장.
- **`crypto.subtle.digest`는 Promise**: `await` 누락 시 비밀번호 해시가 `[object Promise]`로 저장되어 로그인이 영원히 실패. `userManager`의 모든 메서드 async 보장.
- **localStorage 도메인 격리**: dev (localhost:5173)와 prod (배포 URL)의 키가 다르게 보임. 정상 동작.
- **vite-plugin-pwa manifest icons**: 현재 빈 배열 (`icons: []`). PNG 추가 시 빌드 경고 없어짐.
- **Vite 8 + plugin-react 6**: peer dependency가 React 18로 명시되지 않았어도 정상 동작 (React 19 호환).
- **vite-env.d.ts 누락 주의**: CSS import 시 `TS2882` 에러. Phase 0에서 추가 완료.

## 10. (옵션) 글로벌 프로필 갱신 권장

`/Users/heebiny/.claude/profile/current-projects.md` (마지막 갱신 2026-05-17)에 FitPle 항목 추가 권장. 다음 세션에서 자동 인지됨.

추가할 섹션 예시:
```markdown
## 7. fitple-app — React + Capacitor iOS 데모 (Phase 1 진행 중)

- **현재**: Phase 1 인프라 완료 (localStorage userManager + 시드 + Capacitor 셋업), 후반 13개 파일 작성 대기 (2026-05-25)
- **노선**: React 웹 + PWA + Capacitor iOS 래퍼 (백엔드 없음, localStorage)
- **위치**: `/Users/heebiny/fitple-app/` (참조: `HANDOFF.md`, `SPEC.md`)
- **외부 계획서**: `/Users/heebiny/AndroidStudioProjects/FitPle/REACT_WEB_PLAN.md`
- **미해결**: Xcode 설치 진행 중, 폰 PWA 테스트 미수행, 색상/종목 placeholder
- **grep**: `fitple|fitple-app|capacitor|react.*pwa`
```

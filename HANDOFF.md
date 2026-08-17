# FitPle React Web — 세션 인계 노트

> 최종 갱신: 2026-08-17 (Phase 0~6 완료)
> 새 세션이 `CLAUDE.md` → 이 파일 → `SPEC.md` 순으로 보면 즉시 이어받을 수 있음.

---

## 0. 새 세션 시작 시 첫 3분

```bash
cd /Users/heebiny/fitple-app
cat CLAUDE.md           # AI용 단일 출처 가이드 (10개 하우스 룰 + 파일 매핑)
cat HANDOFF.md          # 이 파일 — 어디까지 했고 다음 뭐 할지
git status              # 현재 변경사항
git log --oneline -5
```

## 1. 단일 출처 문서

| 문서 | 역할 |
|------|------|
| **`CLAUDE.md`** | AI 에이전트용 가이드 — TL;DR, 하우스 룰 10개, 파일 매핑 |
| **`SPEC.md`** | 풀스펙 (1624줄, 25 섹션) — 무엇을 만들지 / 색상 / 타이포 / 화면 / 데이터 |
| **`BUILD.md`** | 빌드/배포 치트시트 |
| **`HANDOFF.md`** (이 파일) | 진행 상황 + 다음 작업 + 환경 + 미해결 |

⚠️ 충돌 시 **SPEC.md > CLAUDE.md > HANDOFF.md** 우선.

## 2. 작업 디렉토리 / 외부 참조

| 항목 | 경로 |
|------|------|
| 코드 (작업) | `/Users/heebiny/fitple-app/` |
| GitHub | `https://github.com/heebin-h/fitple-app` (main) |
| Android 원본 (수정 X) | `/Users/heebiny/AndroidStudioProjects/FitPle/app/src/main/java/com/example/fitple/` |
| Android colors.xml | `.../app/src/main/res/values/colors.xml` (tailwind.config.ts로 추출 완료) |
| 디자인 시안 PNG | `/Users/heebiny/AndroidStudioProjects/FitPle/designs/` |

## 3. 완료된 작업

### Phase 0 — 프로젝트 초기화 ✅
- Vite 8 + React 18 + TypeScript 5 + Tailwind CSS 3 + vite-plugin-pwa
- 디자인 토큰: 24색 + 14 타이포 (`tailwind.config.ts`, `constants/colors.ts`)
- 유틸: `cn.ts`, `date.ts`, `platform.ts`, `hash.ts`, `validation.ts`

### Phase 1 — 데이터 + 라우팅 ✅
- `authStore.ts` (Zustand), `RequireAuth`, `AppRoutes`, `MainLayout`, `BottomNav`
- `userManager.ts` (Android UserManager.kt 1:1 포트), `seedRunner.ts`
- `SplashScreen` 부트 분기

### Phase 2 — 공통 UI ✅
- `LoginScreen` (Figma 기준), `EmailLoginScreen`
- `EmailSuggestions`, `SignupToolbar`, `TermsBottomSheet`

### Phase 3 — 인증 화면 ✅ (커밋 20개, Android XML 1:1 정렬 완료)
- `SignupEmailScreen` → `SignupPasswordScreen` → `SignupNicknameScreen` → `SignupPreferenceScreen` → `SignupCompleteScreen`
- `SplashScreen` 디자인 PNG 완전 재구현

### Phase 4 — HomeScreen 풀 구현 ✅
- `meetingImage.ts`: 시드 img_* 키 → 실제 에셋 매핑
- `MeetingCard` 컴포넌트 (Home/Exercise/Recommended 공용)
- `HomeScreen`: top bar, hero 3-state (오늘/내일/없음), 종목 아이콘 행, 활동중인모임+칩필터, 체험가능모임 carousel, 후기 carousel, DateStrip+ScheduleCard, CTA 배너, FAB
- 게스트 분기: "활동 중인 모임" 섹션 숨김 (SPEC §12.11)

### Phase 5 — 모임/일정/마이 화면 ✅
- `chatStore.ts` (Zustand, meetingId 키)
- `ExerciseScreen`: MeetingCard 전체 목록 + 위치 필터
- `RecommendedGroupScreen`: 종목 필터 + 조건 칩 (편하게/평일오후/주말)
- `PostDetailScreen`: 히어로 이미지 + 5탭 (홈/게시판/채팅/사진첩/멤버) + 참가하기 persist
- `PostChatScreen`: `/meeting/:id/chat` 독립형 채팅 (SPEC §12.16)
- `UpcomingMeetingScreen`: DateStrip + 2열 그리드
- `MyScreen`: 아바타 이니셜, 닉네임/이메일, 로그아웃

### Phase 6 — 소셜 Toast / BottomNav ✅
- 소셜 로그인 버튼 (카카오/Apple/Google) → `toast('준비 중인 기능이에요')`
- BottomNav MY 탭 → `/my` 네비게이션 (게스트면 로그인 토스트)
- BottomNav 채팅 탭 → `toast('채팅 기능을 준비 중이에요')`

## 4. 현재 라우트 테이블 (완전)

| 경로 | 컴포넌트 | BottomNav |
|------|----------|-----------|
| `/` | SplashScreen | ✗ |
| `/login` | LoginScreen | ✗ |
| `/email-login` | EmailLoginScreen | ✗ |
| `/signup/email` | SignupEmailScreen | ✗ |
| `/signup/password` | SignupPasswordScreen | ✗ |
| `/signup/nickname` | SignupNicknameScreen | ✗ |
| `/signup/preference` | SignupPreferenceScreen | ✗ |
| `/signup/complete` | SignupCompleteScreen | ✗ |
| `/home` | HomeScreen | ✅ |
| `/exercise` | ExerciseScreen | ✅ |
| `/explore` | RecommendedGroupScreen | ✅ |
| `/explore/:sport` | RecommendedGroupScreen | ✅ |
| `/upcoming` | UpcomingMeetingScreen | ✅ |
| `/my` | MyScreen | ✅ |
| `/meeting/:id` | PostDetailScreen | ✗ |
| `/meeting/:id/chat` | PostChatScreen | ✗ |

## 5. 의도된 "준비 중" 항목 (v1 데모 범위 외)

아래 기능은 SPEC에서 데모 범위 외로 명시 → toast 처리, 미구현이 정상:
- 카카오/Apple/Google 소셜 로그인
- 위치 변경, 검색, 알림
- 모임 만들기 FAB
- 채팅 탭 (BottomNav)
- 이용약관/개인정보처리방침 (MyScreen)
- 찜하기, 공유 (PostDetailScreen)
- 게시판 탭 상세, 사진첩/멤버 탭
- UpcomingMeetingScreen 카드 탭 → toast (ScheduleItem에 meetingId 필드 없음)

## 6. 알려진 한계 / 다음 세션 주의사항

| 항목 | 내용 |
|------|------|
| ScheduleItem.meetingId 미존재 | `UpcomingMeetingScreen` 카드 탭이 /meeting/:id로 이동 불가. 해결하려면 `models.ts`에 `meetingId?: string` 추가 + 시드 업데이트 필요 |
| 시드 날짜 고정 | `SEED_SCHEDULES`의 날짜는 첫 실행 시점 기준. 오래된 기기라면 HomeScreen hero "오늘/내일" 매칭 안 됨 → DevResetButton으로 재시드 |
| 게시판 더미 데이터 | `PostDetailScreen` 게시판 탭은 하드코딩 3건 (NOTICES) |
| 채팅 미영속 | 새로고침 시 chatStore 초기화 → localStorage에서 재로드 (시드 대화만 복원) |

## 7. 다음 작업 — Phase 7 iOS 통합 (SPEC §20)

```bash
# 전제: Xcode 설치 완료 + CocoaPods 설치
brew install cocoapods

npm run build
npx cap add ios          # 최초 1회
npx cap sync
npx cap open ios
# Xcode → Signing & Capabilities → Team = 본인 Apple ID
# 앱 아이콘: src/assets/images/icon-*.png (192/512px) 준비 후 Xcode Assets 추가
# 상태바: @capacitor/status-bar 설치 → SplashScreen에서 StatusBar.setBackgroundColor
# 스플래시: capacitor.config.ts SplashScreen 플러그인 설정
```

Phase 7 상세: SPEC §16 (iOS 동작), §17 (권한/프라이버시), §18 (빌드/배포).

## 8. 결정된 사항 (변경 금지)

| 항목 | 값 |
|------|---|
| Bundle ID / appId | `team.fitple.sideproject` |
| 앱 이름 | FitPle |
| 모바일 폭 | `max-w-mobile = 430px` |
| 로컬 DB | localStorage |
| 해싱 | Web Crypto SHA-256 (모두 `async`) |
| 종목 5개 (불변) | **러닝 · 풋살 · 등산 · 사이클 · 골프** |
| 데모 계정 | `demo@fitple.app` / `demo1234` |
| 브랜드 컬러 | `#ff5432` (orange), `#FFF0ED` (orangeTint) |
| iOS 배포 | Capacitor + Free Apple ID + Xcode → 본인 폰 7일 (무료) |

## 9. 환경

| 항목 | 값 |
|------|---|
| Node | v25.8.1 (`.nvmrc` = Node 20) |
| npm | 11.11.0 |
| Xcode | 사용자 측 설치 필요 |
| CocoaPods | 미설치 — `brew install cocoapods` |

## 10. 트러블슈팅

- **TS strict**: 빌드 전 `npx tsc --noEmit` 권장.
- **`crypto.subtle.digest` Promise**: await 누락 시 비번 해시가 `[object Promise]`.
- **localStorage 도메인 격리**: dev (localhost:5173) vs prod URL 키 분리됨. 정상.
- **시드 날짜 불일치**: DevResetButton(우하단 ↻)으로 재시드.

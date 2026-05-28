# FLOWS — 로그인 화면 **버튼 3개** 기준 홈 진입 흐름

> 로그인 화면(`/login`)에는 홈으로 이어지는 진입 버튼이 정확히 3개다.
> Android 원본(`/Users/heebiny/AndroidStudioProjects/FitPle/`) vs React 포트(`/Users/heebiny/fitple-app/`) 매핑.
> 작성 시점: 2026-05-28 · 본 문서는 `feature/phase-2-login` 머지 직전 기준.

```
┌──────────── 로그인 화면 (/login) ────────────┐
│                                              │
│   [카카오] [Apple] [Google]   ← 데모 범위 외 (Toast 준비 중)
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │ ① 이메일로 시작하기                  │    │  ← 버튼 1
│  └─────────────────────────────────────┘    │
│                                              │
│         ② 회원가입  ← 버튼 2                │
│                                              │
│      ③ 회원가입 없이 둘러보기  ← 버튼 3      │
│                                              │
└──────────────────────────────────────────────┘
        │              │              │
        ▼              ▼              ▼
   /email-login   /signup/email  enterGuest()
        │              │              │
        ▼              ▼              ▼
      /home    (6단계 끝나면)        /home
                    /home          (게스트 분기)
```

---

## 공통 — 스플래시 분기 (앱 시작 시)

| 검사 (`current_user`) | Android 시간 | React 시간 | 목표 |
|---------------------|-----------|----------|------|
| 있음 | 1,500ms | 800ms | `/home` (resume — 로그인 화면 안 거침) |
| 없음 | 4,600ms | 800ms | `/login` (3개 버튼 대기) |

- Android `FitpleMainActivity.kt` / React `src/screens/SplashScreen.tsx`.
- React는 시작 시 `seedIfFirstRun()` (idempotent, `seeded` 플래그).
- 시드 실패 → `/login` 폴백.

---

## ① 이메일로 시작하기 (기존 회원 로그인)

**한 줄**: `/login` → `/email-login` 입력 → 통과 시 `/home`.

| # | 화면 | Android Fragment | React 라우트 / 파일 | 동작 | 저장 키 |
|----|------|-----------------|-------------------|------|--------|
| 1 | 이메일+비번 입력 | `EmailLoginFragment` | `/email-login` · `EmailLoginScreen.tsx` | 형식 검증(이메일 regex / 비번 `^(?=.*[A-Za-z])(?=.*\d).{8,20}$`) | — |
| 2 | 자동완성 | `layoutEmailSuggestions` | `EmailSuggestions.tsx` | `@` 후 형식 미완성에서만 naver/gmail 추천 | — |
| 3 | 로그인 제출 | `UserManager.loginUser()` | `await userManager.loginUser()` | 비번 SHA-256 비교. 실패 → Toast + 비번 칸 에러 보더 | — |
| 4 | 성공 | `setLoggedIn()` + `clearPendingSignup()` → `navigateToHome()` | `setLoggedIn()` + `clearPendingSignup()` + `setUser()` → `navigate('/home', { replace: true })` | 세션 시작 | `current_user` set, `pending_signup` 제거 |

### React 진행 상태
- ✅ 완성 (feature/phase-2-login)
- 갭 없음

---

## ② 회원가입 (신규 가입 — 6단계)

**한 줄**: `/login` → `/signup/email` → `/password` → `/nickname` → 약관 모달 → `/preference` → `/complete` → `/home`.

| # | 화면 (한글명) | Android Fragment | React 라우트 / 파일 | Figma 프레임 | 동작 | 이 단계의 저장 | React 상태 |
|----|-------------|-----------------|-------------------|------------|------|-------------|----------|
| 1 | **이메일** | `SignupEmailFragment` | `/signup/email` · `SignupEmailScreen.tsx` | `2479:7554` (+상태 변종 `7606`·`7660`·`7714`) — 라벨이 "1.1로그인_이메일로그인"으로 잘못 붙어있음 | 5-state: empty / typing / invalid / taken / valid. 이미 가입 시 "로그인하기" CTA(→ `/email-login` prefill). `isEmailTaken` 200ms 디바운스 | — | ✅ feature/phase-2-login |
| 2 | **비밀번호** | `SignupPasswordFragment` | `/signup/password` · `SignupPasswordScreen.tsx` | `2479:7540` (대표) + 상태 변종 `7768`·`7827`·`7886`·`7945`·`8004` — 라벨 동일하게 잘못 붙음 | 비번 + 확인 일치. 라이브 chips: "영문+숫자" / "8자~20자" | — | ❌ 라우트 미등록 |
| 3 | **닉네임** | `SignupNicknameFragment` | `/signup/nickname` · `SignupNicknameScreen.tsx` | `2479:8866` (대표) + 변종 `8970`·`9074` | 길이 2~10, "{n}/10" 카운트. "다음" → 약관 모달 오픈 | — | ❌ 라우트 미등록 |
| 4 | **약관 동의 (모달)** | `TermsBottomSheetFragment` | `components/common/TermsBottomSheet.tsx` (Vaul Drawer) | ⚠️ **이 섹션에 디자인 없음** ('약관/14세/위치 정보' 텍스트 0건). 다른 페이지에 있거나 미디자인 → SPEC §12.7 + Android XML 기준 | 필수 5개 + "모두 동의" 토글. 동의하기 → 콜백 | **`saveUser(email, pw, nickname)`** + **`savePendingSignup(email)`** | ❌ 컴포넌트 미구현 |
| 5 | **선호운동** | `SignupPreferenceFragment` | `/signup/preference` · `SignupPreferenceScreen.tsx` + `preferenceStore.ts` | DETAIL 공통 진입 `2479:8560` · 종목별 `11752`(러닝) `11798`(러닝-2) `11829`(풋살) `11871`(등산) `11898`(사이클) `11935`(골프) — SELECTION 단독 프레임은 캐시에 안 보임 | SELECTION (5타일 2열+1) → DETAIL (스포츠별 2~4 질문). "건너뛰기"는 빈 sports로 직행 | (단계 진행 중) | ❌ 라우트 미등록 |
| 5→6 | 완료/건너뛰기 | — | — | — | — | **`savePreferences()`** + **`setLoggedIn()`** + **`clearPendingSignup()`** | ❌ |
| 6 | **가입 완료** | `SignupCompleteFragment` | `/signup/complete` · `SignupCompleteScreen.tsx` | `2479:8615` — "가입이 완료 되었어요!" 텍스트 확인. 라벨이 "1.4회원가입_참가자"로 잘못 붙음 | 체크 아이콘 + "가입이 완료 되었어요!" + 추천 모임 5개 carousel + "핏플 시작하기" | — | ❌ 라우트 미등록 |
| 6→홈 | CTA | `navigateToHome()` (백스택 clear) | `navigate('/home', { replace: true })` | — | 회원 홈 | — | ❌ |

> **Figma fileKey**: `ZnGS84L5S9cc7rgD87egfS` — 위 노드 ID는 모두 이 파일 내 위치. 라벨이 디자이너 실수로 "1.1로그인_이메일로그인"·"1.4회원가입_참가자"에 묶여있어 처음엔 안 보였고, 텍스트 내용("사용하실 비밀번호를…", "사용하실 닉네임을…", "가입이 완료 되었어요!") 기반으로 부모 폰 프레임을 역추적해 식별함.
>
> 각 프레임을 직접 열려면 Figma에서 `figma.com/design/ZnGS84L5S9cc7rgD87egfS/?node-id=2479-7540` 식으로 URL 끝 ID만 바꾼다 (콜론 `:`은 URL에선 하이픈 `-`로 표기).

### 저장 시퀀스 (Android·React 동일)
```
Step 4 (약관 동의 후):
  saveUser(email, password, nickname)   // 비번 SHA-256 해시, user:{hash} 저장
  savePendingSignup(email)              // pending_signup 작성 (중단 대비)

Step 5 (선호운동 완료/건너뛰기):
  savePreferences(email, sports, details)   // selectedSports + sportDetails merge
  setLoggedIn(email)                        // current_user 작성
  clearPendingSignup()                      // pending_signup 제거
```

### 중간이탈 재개 (이 버튼의 곁가지 — SPEC §11.4)
- `pending_signup` 키 = Step 4 통과 후 + Step 5 완료 전 = "약관까지는 했고 선호운동만 남음" 상태.
- 이 상태에서 앱을 끄고 다시 켜면 `current_user` 가 없어 `/login`으로 가는데, Android `LoginFragment`는 `getPendingSignupEmail()`을 체크해 **AlertDialog "이어서 하시겠어요?"** 표시 → `/signup/preference` 로 점프.
- React `LoginScreen`엔 이 다이얼로그 **미구현** — 다음 작업 후보.

### React 회원가입 현재 갭
| 막힌 지점 | 다음 작업 |
|----------|---------|
| `/signup/password` 라우트 미등록 | `SignupPasswordScreen.tsx` + AppRoutes 추가 |
| `/signup/nickname` 라우트 미등록 | `SignupNicknameScreen.tsx` + AppRoutes 추가 |
| TermsBottomSheet 미구현 | Vaul `Drawer.Root` 모달 + 필수 5개 + master 토글 |
| `/signup/preference` 라우트 미등록 | `SignupPreferenceScreen.tsx` + `preferenceStore.ts` (SELECTION→DETAIL) |
| `/signup/complete` 라우트 미등록 | `SignupCompleteScreen.tsx` + carousel |
| 재개 다이얼로그 | LoginScreen `useEffect` + Dialog/Sheet + "이어서 하기" → `/signup/preference` |

---

## ③ 회원가입 없이 둘러보기 (게스트)

**한 줄**: `/login` → `enterGuest()` (메모리만) → `/home` (게스트 분기).

| 단계 | Android | React | 동작 | 저장 |
|------|---------|-------|------|------|
| 진입 | "회원가입 없이 둘러보기" 탭 → `GuestHomeFragment` replace | `authStore.enterGuest()` → `navigate('/home')` | `currentUser=null, isGuest=true` (런타임만) | — (영속 X, 앱 끄면 사라짐) |
| 홈 표시 | `GuestHomeFragment` hero "모임을 둘러보는 중이에요!" | `HomeScreen` isGuest=true 분기 → 같은 hero | "로그인하고 참여하기 →" CTA | — |
| "활동 중인 모임" 섹션 | 숨김 | 숨김 | — | — |
| 종목 타일 탭 | `/explore/{sport}` 진입 가능 | `RequireAuth` 통과 (currentUser ‖ isGuest) | 게스트도 탐색 가능 | — |
| 채팅·MY 탭 | Toast "로그인이 필요한 기능이에요" | `BottomNav.lockedTap()` 동일 Toast | 회원 전용 동작 차단 | — |
| FAB / 찜 / 공유 등 | Toast 동일 | 호출부에서 `isGuest` 추가 검사 | 게스트 거부 | — |

### React 진행 상태
- ✅ `authStore.enterGuest()` (`store/authStore.ts`)
- ✅ HomeScreen hero 분기 (`screens/main/HomeScreen.tsx`)
- ✅ BottomNav 채팅·MY 잠금 Toast (`components/layout/BottomNav.tsx`)
- ✅ RequireAuth가 게스트 통과 (`routes/RequireAuth.tsx`)
- ⚠️ 홈 내부 섹션(활동 모임·체험 모임·후기·정기모임)이 placeholder — Phase 4 디자인 입힐 때 게스트 분기 완성

---

## 라우트 등록 현황 (3버튼 흐름이 닿는 라우트만)

| 라우트 | 버튼 | 등록 | 비고 |
|--------|------|-----|------|
| `/` | (스플래시) | ✅ | |
| `/login` | (3버튼 모음) | ✅ | |
| `/email-login` | ① | ✅ | feature/phase-2-login |
| `/signup/email` | ② | ✅ | feature/phase-2-login |
| `/signup/password` | ② | ❌ | 다음 작업 |
| `/signup/nickname` | ② | ❌ | 다음 작업 |
| `/signup/preference` | ② | ❌ | 다음 작업 |
| `/signup/complete` | ② | ❌ | 다음 작업 |
| `/home` | ①·②·③ 종착 | ✅ | RequireAuth (currentUser ‖ isGuest) |

---

## 핵심 localStorage 키 — 3버튼 흐름에서의 변화

| 키 | 형식 | 흐름에서의 변화 |
|----|------|--------------|
| `seeded` | `'true'` | 첫 실행 1회만 set (시드 idempotent 플래그) |
| `current_user` | 정규화 이메일 | ① 성공 시 set / ② Step 5 완료 시 set / ③ 변화 없음 |
| `pending_signup` | 정규화 이메일 | ② Step 4 set, Step 5 clear / ①·③ 변화 없음 |
| `user:{sha256(email)}` | JSON `UserProfile` | ② Step 4 saveUser, Step 5 savePreferences로 갱신 |
| 시드 컬렉션 (`meetings`/`reviews`/`schedules`/`chats:*`) | JSON | 첫 실행 1회 시드, 이후 변화 없음 |

정규화: 이메일 = `trim().toLowerCase()` · 비번 = SHA-256 hex (async) · 닉네임 = `trim()`.

---

## 흐름별 진행 상태 요약

| 버튼 | 진입 → 종착 | React 현재 |
|------|-----------|----------|
| ① 이메일로 시작하기 | `/login → /email-login → /home` | ✅ **완성** (feature/phase-2-login) |
| ② 회원가입 | `/login → /signup/email → password → nickname → 약관모달 → preference → complete → /home` | ⚠️ **Step 1만 완성**. Step 2~6 + 재개 다이얼로그 = 미구현 |
| ③ 회원가입 없이 둘러보기 | `/login → /home (isGuest=true)` | ✅ **분기 동작**. 홈 내부 섹션 디자인은 Phase 4+에서 |

---

## 다음 작업 (3버튼 기준 우선순위 · Figma 노드 포함)

| 우선 | 버튼 | 브랜치 | 만들 것 | Figma fetch 대상 |
|-----|------|--------|--------|--------------|
| 1 | ② Step 2·3 | `feature/phase-2-signup-pw-nick` | `SignupPasswordScreen` + `SignupNicknameScreen` + 라우트 2개. SignupEmail "다음" Toast → 실제 navigate로 교체 | 비번 `2479:7540` / 닉네임 `2479:8866` 의 `get_design_context` |
| 2 | ② Step 4·5·6 | `feature/phase-3-signup-terms-preference` | `TermsBottomSheet`(Vaul) + `preferenceStore` + `SignupPreferenceScreen` + `SignupCompleteScreen` + 라우트 2개 → 가입 end-to-end | 선호운동 `2479:8560` `11752` + 완료 `2479:8615` 의 `get_design_context`. **약관은 시안 없음** → Android `fragment_terms_bottom_sheet.xml` + SPEC §12.7 기준 구성 |
| 3 | ② 재개 | `feature/phase-3-resume-dialog` | LoginScreen에 `getPendingSignupEmail()` 체크 + Dialog → `/signup/preference` | — (Android `LoginFragment.onViewCreated()`의 AlertDialog 기준) |
| 4 | ③ 게스트 홈 | `feature/phase-4-home-guest-sections` | HomeScreen 활동/체험/후기/정기모임 섹션 디자인 + isGuest 분기 채우기 | 홈 화면은 다른 Figma 섹션 — 추후 추가 노드 ID 확보 필요 |

> **현재 Figma MCP rate limit 걸려있음** (Starter plan). 노드 ID는 캐시된 메타데이터에서 식별 완료. 호출 한도가 풀리면 위 "Figma fetch 대상" 노드들을 차례로 `get_design_context` / `get_screenshot` 해서 토큰·간격을 추출해 구현.

---

**이 문서는 코드 변경 시 같은 PR에서 갱신한다.** (CONTRIBUTING.md §0 원칙: 규칙·흐름은 md로 git에 남긴다.)

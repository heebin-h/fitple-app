# IMPLEMENTATION_AUDIT — 인증 흐름 Android↔React 정밀 감사

> **방법**: Android `app/src/main/java/com/example/fitple/` 전체 .kt + `res/layout/*.xml` + `res/values/*.xml` 풀 read → 현재 `fitple-app/src/` React 포트와 줄 단위 대조.
> **범위**: SplashScreen → Login → EmailLogin / Signup(Email/Password/Nickname/Terms/Preference/Complete) → 게스트 분기. BottomNav 포함.
> **제외 (이미 적용됨)**: `docs/DESIGN_IMPLEMENTATION_GUIDE.md` 의 33개 함정 카탈로그.
> 작성: 2026-05-31.

---

## 🚨 CRITICAL — 누락된 핵심 동작

### C1. LoginScreen 가입 중단 재개 다이얼로그 (SPEC §11.4)

**Android `LoginFragment.kt:91-111`**:
```kotlin
val pendingEmail = UserManager.getPendingSignupEmail(requireContext())
if (pendingEmail != null) {
    AlertDialog.Builder(requireContext())
        .setTitle("회원가입을 이어서 하시겠습니까?")
        .setMessage("이전에 시작한 회원가입이 있어요.\n선호 운동 설정만 하면 완료돼요!")
        .setPositiveButton("이어서 하기") { _, _ ->
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragmentContainer, SignupPreferenceFragment().apply {
                    arguments = Bundle().apply { putString("email", pendingEmail) }
                })
                .addToBackStack(null)
                .commit()
        }
        .setNegativeButton("나중에", null)
        .show()
}
```

**현재 React**: `LoginScreen.tsx` — useEffect 없음, 다이얼로그 미구현.

**시점**: 약관 동의(Step 4) 후 + 선호운동(Step 5) 완료 전 → `pending_signup`만 있고 `current_user` 없음. 이때 앱 끄고 다시 켜면 스플래시 → /login 으로 가는데, **/login 진입 시 pending 감지하여 사용자에게 재개 옵션 제공**해야 함.

**수정 위치**: `src/screens/auth/LoginScreen.tsx`.
**우선도**: 🚨 CRITICAL — 가입 진행 중 데이터 손실 방지.

---

### C2. SignupPreferenceScreen DETAIL — 상단 종목 행 클릭 점프

**Android `SignupPreferenceFragment.kt:148-174`**:
```kotlin
sportButtons.forEachIndexed { index, layout ->
    layout.setOnClickListener {
        when (phase) {
            Phase.SELECTION -> { /* 토글 */ }
            Phase.DETAIL -> {
                // 미선택 종목 → 무시
                if (!selectedSports.contains(index)) return@setOnClickListener
                // 현재 활성 종목 클릭 → 무시
                if (detailQueue[detailStep] == index) return@setOnClickListener
                // 선택됐지만 비활성인 종목 → 해당 세부 질문 단계로 점프
                val targetStep = detailQueue.indexOf(index)
                if (targetStep >= 0) {
                    detailStep = targetStep
                    renderDetailPhase()
                }
            }
        }
    }
}
```

**현재 React** `SignupPreferenceScreen.tsx:181`: `disabled` — 클릭 자체가 안 됨.

**기능**: DETAIL에서 종목 행의 light 상태(선택했지만 현재 아닌) 종목 클릭 → 해당 종목의 질문 화면으로 즉시 점프. UX 핵심 — 답변 수정/검토에 필요.

**수정**: SportTile `disabled` 제거 + DETAIL phase에서 isSelected인 비-current 종목 클릭 시 store의 `detailStep` 변경 액션 호출. preferenceStore에 `jumpToSport(name)` 추가.

**우선도**: 🚨 CRITICAL — 사용자 명시적 기능.

---

### C3. SignupPreferenceScreen DETAIL — 뒤로 버튼 동작

**Android `SignupPreferenceFragment.kt:129-141`**:
- DETAIL `detailStep > 0` → `detailStep--` (이전 종목으로)
- DETAIL `detailStep == 0` → SELECTION 단계로 복귀 (답변 보존)
- SELECTION → popBackStack (이전 화면)

**현재 React**: `SignupToolbar`의 뒤로 버튼 = `navigate(-1)` (브라우저 history) → DETAIL에서 뒤로 누르면 `/signup/nickname` 으로 점프.

**수정**: `SignupToolbar`에 `onBack` prop 추가. SignupPreference DETAIL에서 store의 `back()` 액션 사용 (이미 구현돼있음).

**우선도**: 🚨 CRITICAL — 가입 흐름 UX 깨짐.

---

## ⚠️ HIGH — UX 명확화

### H1. BottomNav Toast 문구 정확화

**Android `FitpleMainActivity.kt:147-153`**:
```kotlin
R.id.nav_chat -> {
    Toast.makeText(this, "채팅 기능을 준비 중이에요", Toast.LENGTH_SHORT).show()
    false
}
R.id.nav_my -> {
    Toast.makeText(this, "마이페이지 기능을 준비 중이에요", Toast.LENGTH_SHORT).show()
    false
}
```

**현재 React** `BottomNav.tsx`: `'준비 중이에요'` 또는 `'로그인이 필요한 기능이에요'` (게스트).

**Android는 게스트/회원 분기 없음** — 둘 다 동일한 "준비 중" Toast (기능 자체가 미구현이라 게스트 여부 무관).

**수정**: 채팅 → "채팅 기능을 준비 중이에요", MY → "마이페이지 기능을 준비 중이에요". 게스트 분기 제거.

**우선도**: ⚠️ HIGH — 텍스트 정확성.

---

### H2. SignupPreferenceScreen "건너뛰기" — 동작 일치

**Android `SignupPreferenceFragment.kt:402-427` (`navigateToComplete()`)**:
- `email`이 비어있지 않을 때만 `savePreferences/setLoggedIn/clearPendingSignup` 호출
- 어떤 경우든 SignupCompleteFragment로 이동

**현재 React** `SignupPreferenceScreen.tsx:70-80`:
- email 비어있으면 일찍 return (저장 X)
- email 있으면 무조건 savePreferences (sports=[] 도 OK) + setLoggedIn + clearPendingSignup + /complete

**차이**: React 동작이 Android보다 더 명확함 (sports=[]도 명시 저장). Android 코드는 약간 모호 — 빈 sports라도 `savePreferences(email, [], {})` 호출되도록 Android 코드 분석상 OK.

**판단**: React 현재 동작 유지 (더 명확함). 차이 없음으로 표기.

---

### H3. preferenceStore — `jumpToSport()` 액션 추가

C2를 위한 store 액션:
```typescript
jumpToSport: (sportName: string) => {
  const { detailQueue } = get();
  const targetStep = detailQueue.indexOf(sportName);
  if (targetStep >= 0) set({ detailStep: targetStep });
},
```

---

## 🟡 MEDIUM — 미세 정렬

### M1. SplashScreen 지연 시간

**Android**: 로그인 1.5초 / 비로그인 4.6초.
**React 현재**: 800ms 통일 (사용자가 이전에 짧게 요청).
**판단**: 사용자 명시 우선 유지. 변경 없음.

### M2. 화면 전환 애니메이션 (slide_in_right 등)

**Android**: 모든 fragment 전환에 `R.anim.slide_in_right / slide_out_left` 적용.
**React 현재**: 기본 (애니메이션 없음).
**판단**: Phase 2+ 보강 (SPEC §10.2). 현재 스킵.

### M3. 화면 전환 시 키보드 dismiss

Android는 InputMethodManager로 dismiss. React/iOS PWA는 native 처리.
**판단**: 차이 없음 (브라우저 자동 처리).

---

## 🟢 LOW — 텍스트 정밀

### L1. 한글 텍스트 1:1 검증 (모든 화면)

대조 완료. 모두 일치:
- "사용하실 이메일 주소를 입력해주세요." (마침표 포함) ✓
- "사용하실 비밀번호를 입력해주세요." ✓
- "사용하실 닉네임을 입력해주세요." ✓
- "거의 다했어요! 맞춤 운동을 제공 할 수 있도록\n몇가지만 알려주세요!" ✓
  (※ Android `.kt` 코드는 "다왔어요"로 오타 — 디자인 PNG는 "다했어요" — React는 "다했어요"로 디자인 정답을 따름)
- "선택 한 운동의 필터를 설정하면\n모임을 추천해 드려요" ✓
- "어떤 운동 선호하나요?(중복선택 가능해요)" ✓
- "회원가입을 위해서는\n아래의 약관동의가 필요해요" ✓
- "이메일 또는 비밀번호가 맞지 않아요" (마침표 없음) ✓
- "문자, 숫자 포함 8-20자로 입력해주세요." (마침표 포함) ✓

### L2. SignupComplete 뒤로 버튼 동작

**Android `SignupCompleteFragment.kt:32-45`**: 뒤로 누르면 스택 전체 비우고 LoginFragment.
**React 현재**: 뒤로 누르면 브라우저 history 이전 = `/signup/preference` 로 감 (이상함).
**판단**: 가입 완료 후엔 뒤로 갈 일 없음. 큰 문제 X. 향후 history.replaceState() 처리 고려.

---

## 적용 우선순위 요약

| # | 항목 | 파일 | 우선도 |
|---|------|------|--------|
| C1 | LoginScreen 가입 중단 재개 다이얼로그 | LoginScreen.tsx | 🚨 |
| C2 | SignupPreference DETAIL 종목 클릭 점프 | SignupPreferenceScreen.tsx + preferenceStore.ts | 🚨 |
| C3 | SignupPreference DETAIL 뒤로 버튼 (store back) | SignupPreferenceScreen.tsx + SignupToolbar.tsx | 🚨 |
| H1 | BottomNav Toast 문구 정확화 | BottomNav.tsx | ⚠️ |
| H3 | preferenceStore jumpToSport 액션 | preferenceStore.ts | ⚠️ |

**나머지 (M, L 항목)**: 사용자 명시 또는 Phase 2+ 작업으로 분류.

---

## 분석 출처 — 풀 Read한 Android 파일

- `MainActivity.kt` (39행) · `FitpleMainActivity.kt` (193행) — 라우팅·스플래시·BottomNav
- `LoginFragment.kt` (211행) · `EmailLoginFragment.kt` · `SignupEmailFragment.kt` · `SignupPasswordFragment.kt` · `SignupNicknameFragment.kt` · `SignupPreferenceFragment.kt` (493행) · `SignupCompleteFragment.kt` · `TermsBottomSheetFragment.kt`
- `UserManager.kt` — 세션·저장 API
- `fragment_*.xml` 7개 + `layout_toolbar_*.xml` 3개 + `layout_input_*.xml` 2개 + `layout_bottom_sheet_terms.xml`
- `values/dimens.xml` · `values/colors.xml`

이 문서의 모든 진단은 위 파일들의 실제 코드/XML 인용에 근거함. 추측 없음.

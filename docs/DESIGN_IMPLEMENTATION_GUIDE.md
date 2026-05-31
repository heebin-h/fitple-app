# DESIGN_IMPLEMENTATION_GUIDE — 디자인 구현 절대 규칙

> ⚠️ **이 문서는 디자인을 코드로 옮기는 모든 작업 전에 반드시 먼저 읽고 따른다.**
> Phase 3 회원가입 화면들에서 같은 종류의 실수를 7~8번 반복한 후 박은 규칙들.
> 한 번이라도 이 절차를 건너뛰면 사후 수정 사이클이 시작된다. 절대 건너뛰지 않는다.

---

## 0. 규칙의 우선순위 (충돌 시)

```
Figma (있으면) >  designs/*.png  >  Android res/layout/*.xml  >  Android *Fragment.kt 동작  >  SPEC.md
```

- **PNG와 XML이 다르면 PNG 우선.** 이게 가장 빈번한 함정.
- 디자인이 명시되지 않은 영역만 XML + SPEC 따른다.
- 동작(behavior) — 검증 규칙·디바운스·상태 머신 — 은 `*Fragment.kt` 우선.

---

## 1. 작업 시작 전 필수 체크리스트 — 화면당 1회 수행

화면 1개를 구현/수정하기 전 **반드시 아래 5가지를 Read 도구로 직접** 읽는다. 메모리/추측 금지.

- [ ] **1. 디자인 PNG** — `/Users/heebiny/AndroidStudioProjects/FitPle/designs/sign_*.png`
  - 화면 자체 + state 변종 (empty/typing/error/valid 각각)
  - 외곽: 보더? 그림자? 둘 다?
  - 텍스트: 굵기, 색, 위치
- [ ] **2. Android 레이아웃 XML** — `app/src/main/res/layout/fragment_*.xml` + 포함된 `layout_*.xml`
- [ ] **3. drawable** — `app/src/main/res/drawable/bg_*.xml` 사용되는 모든 배경
- [ ] **4. dimens.xml** — `app/src/main/res/values/dimens.xml`에서 `corner_*`, `stroke_*`, 패딩 값
- [ ] **5. Fragment** — `app/src/main/java/com/example/fitple/ui/auth/*Fragment.kt` 동작·검증·라우팅

읽은 다음 코드에 손대기 전에 **이 화면의 PNG vs XML 차이 발견점**을 메모(주석으로 남김).

---

## 2. SVG/이미지 에셋 다룰 때 반드시 확인

SVG는 한 번에 깨지면 시간 낭비 크다.

- [ ] **viewBox** 확인 — `viewBox="0 0 W H"` 의 W, H가 네이티브 사이즈
- [ ] **preserveAspectRatio** 확인:
  - `none` → 컨테이너 크기에 강제로 변형됨 → **명시 px 사이즈 권장** (`-left-[Xpx] -top-[Ypx] w-[Wpx] h-[Hpx]`)
  - 기본 (`xMidYMid meet`) → 비율 보존하며 fit → `inset-0 size-full` OK
- [ ] **filter / shadow** 내장 여부 — `filter="url(#filter0_d_...)"` 있으면 SVG 자체에 drop-shadow 박혀 있음 → **별도 border/shadow 추가 금지**
- [ ] **fill** — `var(--fill-0, color)` 의 fallback 색이 배경 대비 보이는지 (예: 검정 아이콘을 검정 배경에 깔지 마)
- [ ] **음수 inset 트릭** — wrapper div의 % inset은 `preserveAspectRatio="none"`일 때 위험 → 명시 px 우선

---

## 3. 자주 놓친 함정 카탈로그 (절대 반복 X)

| # | 함정 | 잘못 | 정답 |
|---|------|------|------|
| 1 | 라벨 굵기 | XML의 `textStyle="bold"`를 그대로 옮김 | PNG 시각 = medium normal → `text-label` |
| 2 | 외곽 라인 vs 섀도우 | XML의 `<stroke>` 그대로 → border 추가 | PNG는 shadow만일 수 있음 → `shadow-*`만 + border 제거 |
| 3 | 모서리 반경 | `rounded-card`(12px) 자동 사용 | dimens의 `corner_sm`(8dp)=`rounded-lg` 등 정확 매핑 |
| 4 | 가로 패딩 | `px-5`(20px) 디폴트 | XML `paddingHorizontal="24dp"` → `px-6` |
| 5 | placeholder 텍스트 | "비밀번호를 입력해주세요" 추측 | XML `android:hint="문자, 숫자 포함 8자 ~20자"` 그대로 |
| 6 | 입력 박스 높이 | h-12 (48px) | XML 보통 `52dp` → `h-[52px]` |
| 7 | 헤더 타이틀 | 임의 텍스트 | XML `txtToolbarTitle` 텍스트 그대로 ("이메일로 로그인" 등) |
| 8 | h1 제목 누락 | "로그인" 임의 추가 | PNG 없으면 추가 X |
| 9 | "회원가입" 링크 밑줄 | XML에 underline 없음 → 없이 구현 | PNG에 밑줄 있음 → `underline` 추가 |
| 10 | 자동완성 박스 배경 | "짙은 회색" 같은 모호한 지시에 휘둘림 | PNG/Android 둘 다 확인 → 둘 다 일치하는 답 선택 |
| 11 | 자동완성 박스 외곽 | XML `<stroke>` 그대로 → border | PNG는 라인 없는 shadow 카드 |
| 12 | SVG `preserveAspectRatio="none"` 처리 | wrapper에 % inset → 변형 강제 | 명시 px 사이즈 + 절대 위치 (`-left-[Xpx]`) |
| 13 | 배지/말풍선 텍스트 위치 | `left-1/2 -translate-x-1/2` 가운데 정렬 | Figma `ml-[12px] mt-[8px]` 그대로 |
| 14 | 체크박스 크기 | `h-5 w-5 border-2`(20px) 디폴트 | PNG는 14px → `h-[14px] w-[14px] border` |
| 15 | 종목 타일 비율 | `h-14 w-full` 고정 | `aspect-square w-full` (1:1) |
| 16 | 폰 vh 비율 | `min-h-screen` (= 100vh, iOS 주소창 포함) | `min-h-dvh` (dynamic viewport height) |
| 17 | DETAIL 종목 순서 | 사용자 선택 순서 (LinkedHashSet) | **사용자 요구**: SPORTS 카탈로그 순서 |
| 18 | DETAIL 종목 행 상태 | 3-state(current/light/muted) | **사용자 요구**: 2-state(current/muted) — 현재만 색, 나머지 전부 회색 |
| 19 | 텍스트 끝 마침표 | "...입력해주세요" 자르기 | XML 정확히 "...입력해주세요." (마침표 포함) |
| 20 | Tailwind `shadow-md`로 dropdown 그림자 | y-offset 큼 → 위/옆 거의 안 보임 | 커스텀 `shadow-[0_2px_10px_rgba(0,0,0,0.10)]` (small y + large blur = 사방) |
| 21 | 입력 도움말 항상 노출 | "문자, 숫자 포함…" 회색으로 늘 보임 | 빈 상태엔 숨김. 입력 있고 형식 안 맞을 때만 빨강(`{pwError && <p>`) |
| 22 | 입력칸 아이콘 (X/체크/경고) lucide 기본 | `X`/`Check`/`AlertCircle` (단순 선) | `XCircle`/`CheckCircle`/`AlertTriangle` — Android ic_clear/ic_check_circle/ic_warning 모양 |
| 23 | 약관 체크박스 원형 | rounded-full 24×24 | **사각 4dp 모서리**(`rounded`) — Android `ic_checkbox_*` corner_xs |
| 24 | 약관 모달 타이틀 | "약관에 동의해주세요" 임의 | XML 그대로: "회원가입을 위해서는\n아래의 약관동의가 필요해요" |
| 25 | 약관 행에 화살표 누락 | 체크박스 + 라벨만 | 우측 ChevronRight 18px gray (`ic_arrow_right`) 필수 |
| 26 | 약관 버튼 1개 + 바닥 붙임 | "동의하고 가입하기" 하나만, bottom 0 | **취소 + 동의** 2버튼 가로 분할 + `mt-6 mb-8` (바닥 X) |
| 27 | SignupComplete 단순화 | 체크+타이틀+버튼만 | "어떤 모임이 있을까?" + **5개 추천 모임 가로 carousel** (그라데이션 카드) 필수 |
| 28 | 가입 화면 h1 크기 | `text-display`(22px) | Android XML 20sp → **`text-[20px] font-bold`** 또는 새 토큰 |
| 29 | Terms 모달 타이틀 크기 | `text-h2`(17px) | Android XML 18sp → **`text-[18px] font-bold`** |
| 30 | 약관 체크박스 — Android XML 사각 | XML 따라서 `rounded` 4dp | **PNG 우선 = 원형** (`rounded-full`) |
| 31 | SignupComplete 체크 합성 | `bg-orange rounded-full` + `<Check>` | **ic_check_circle 인라인 SVG**(CheckCircleIcon size={96}) 그대로 |
| 32 | 입력 아이콘 lucide outline | XCircle/CheckCircle/AlertTriangle | **Android ic_* 인라인 SVG** (ClearIcon/CheckCircleIcon/WarningIcon — filled 카브아웃) |
| 33 | DETAIL 종목 행 상태 — PNG 3상태(current/light/muted) | PNG 따라 light 추가 | **사용자 명시 = 2상태(current/muted)만** — PNG와 다르더라도 사용자 지시 우선 |

---

## 4. 토큰 매핑 — 디자인 값 → 우리 토큰

`tailwind.config.ts` 토큰만 사용 (룰 #1). 디자인 값에서 토큰으로 매핑:

| 디자인 (Android dimens/원본) | Tailwind 토큰 |
|---|---|
| corner_xs=4dp | `rounded` (4px) |
| **corner_sm=8dp** ← 입력 박스·드롭다운 | **`rounded-lg`** |
| corner_md=12dp ← 카드·버튼 | `rounded-card` |
| corner_lg=16dp | `rounded-2xl` |
| corner_full=50dp ← 칩(pill) | `rounded-full` |
| stroke_thin=1dp | `border` |
| stroke_md=2dp | `border-2` |
| 22sp display | `text-display` (22/700) |
| 20sp h1 (Android 가입 타이틀) | `text-display` (22/700) — 2sp 차이 허용 |
| 18sp h2 (toolbar title) | `text-h2` (17/700) — 1sp 차이 허용 |
| 16sp h3 / 버튼 글자 | `text-h3` (16/600) |
| 14sp label normal | **`text-label`** (14/500) — `label-strong`은 강조용만 |
| 13sp body | `text-caption` (13/500) |
| 12sp caption | `text-micro` (12/500) |
| paddingHorizontal=24dp | `px-6` |
| paddingHorizontal=20dp | `px-5` |
| input height=52dp | `h-[52px]` |
| button height=54dp (로그인) / 52dp (다음) | `h-[54px]` / `h-[52px]` |
| toolbar height=56dp | `h-14` |
| colorSurface | `bg-surface` (#FFFFFF) |
| colorBackground | `bg-background` (#F2F2F2) |
| colorBorderDefault | `border-borderDefault` (#DDDDDD) |
| colorTextPrimary | `text-textPrimary` (#111111) |
| colorTextSecondary | `text-textSecondary` (#555555) |
| colorTextHint | `text-textHint` (#AAAAAA) |
| colorOrange | `text-orange` / `bg-orange` (#ff5432) |
| colorOrangeTint | `bg-orangeTint` (#FFF0ED) |
| neutralLow (Figma) | `border-neutralLow` (#BDBDBD) |

새 값 필요하면 SPEC + tailwind.config.ts에 토큰 추가 후 사용.

---

## 5. 그림자 패턴

`shadow-md` 같은 Tailwind 디폴트는 주로 아래 방향 → 옆/위 거의 안 보임. 디자인이 사방으로 보이는 그림자를 요구하면 **명시 커스텀 shadow**.

| 용도 | 클래스 |
|---|---|
| 입력 박스 위에 뜨는 드롭다운 | `shadow-[0_2px_10px_0_rgba(0,0,0,0.10)]` — y-offset 작고 blur 큼 = 사방 보임 |
| 카드 정적 그림자 | `shadow-[0_2px_8px_rgba(0,0,0,0.08)]` |
| 강한 elevation (모달 등) | `shadow-[0_4px_16px_-2px_rgba(0,0,0,0.15)]` |

`shadow-md`는 button hover처럼 시각 강조용. **드롭다운/말풍선엔 부적합** — blur가 커야 옆면도 보임.

---

## 6. 구현 절차 (작업 1건당)

1. 위 §1 체크리스트 완료
2. 차이점 메모 (PNG vs XML)
3. 코드 작성 — 토큰만, 추측 없이, §3 함정 카탈로그 비교하며
4. **`npx tsc --noEmit && npm run build`** — 둘 다 통과 후에만 커밋
5. 커밋 메시지에 출처 명시 (예: "Android `fragment_email_login.xml` + design PNG panel 2 기준")
6. 사용자 폰 검수 → 추가 차이 발견되면 §3에 새 항목 추가

---

## 7. 같은 함정 반복 시 자기 점검 질문

새 화면을 만지기 전에 스스로 물어본다:

1. 디자인 PNG를 **이 세션에서 방금** Read 도구로 봤는가? (메모리 X)
2. Android XML의 `textStyle / stroke / hint` 같은 속성을 **PNG가 동의하는지** 비교했는가?
3. 사용 중인 SVG의 `preserveAspectRatio`를 확인했는가?
4. 폰트 굵기·색상·패딩 값을 **명시적으로** 토큰에 매핑했는가, 아니면 추측인가?
5. corner radius를 dimens.xml의 어떤 값에 매핑하는지 확정했는가?
6. 사용자가 한 번이라도 같은 종류의 지적을 했었으면, §3 함정 카탈로그에 추가했는가?

YES 5개 미만이면 **작성 중단하고 §1로 돌아간다.**

---

**이 문서는 디자인을 코드로 옮기는 모든 작업의 단일 출처.** 새 함정 발견 시 즉시 §3에 추가하고 같은 PR에서 커밋한다.

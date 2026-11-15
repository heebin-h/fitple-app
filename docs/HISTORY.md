# HISTORY — 개발 이력

> FitPle Android(Kotlin) 앱을 React + TypeScript 웹(PWA)으로 옮긴 과정.
> 기간 2026-05-18 ~ 2026-11-15, 커밋 51개 (`feature/phase-2-login` 기준).
> 현재 상태와 다음 할 일은 [[HANDOFF]], 화면별 완성도는 [[COMPLETION_STATUS]].

---

## 한눈에

| 기간 | 단계 | 결과 |
|---|---|---|
| 05-18 ~ 05-25 | P0 기초 · P1 인프라 | Vite+React+TS+Tailwind+PWA, 디자인 토큰, Capacitor 스캐폴딩, SPEC/CLAUDE 문서 |
| 05-27 ~ 05-28 | P1 · P2 로그인 | 라우터·authStore·레이아웃, Figma 기준 로그인, 이메일 로그인, `/?reset` 해치 |
| 05-29 ~ 06-19 | P3 회원가입 | 가입 5단계 end-to-end, Android XML·dimens·PNG 1:1 정렬 (커밋 ~20개) |
| 08-17 | P4~P6 + 보안·QA | 홈·모임·일정·마이 화면, 보안 High 8건·Medium 10건 수정, Playwright QA 27건 |
| 11-10 ~ 11-13 | 누락 화면 포팅 | 체험·후기·알림·채팅 목록·검색+찜·모임 만들기·홈 재구성·상세 탭·동네 선택 |
| 11-14 ~ 11-15 | 검증·리뷰·수정 | 완성도 문서, 코드·디자인 전수 리뷰 → 결함 일괄 수정, 회귀 249/249 |
| 11-15 | 종료 | **iOS(P7 통합·P8 출시)는 프로젝트 중단으로 미개발** |

---

## 단계별 상세

### P0~P1 — 기초 (05-18 ~ 05-27)
- `3416a47` Vite + React 18 + TS + Tailwind + vite-plugin-pwa 부트스트랩.
- `8782025` · `c912ce3` Android `colors.xml` → Tailwind 색 토큰 24개, 타이포 토큰 14개. `constants/sports.ts` 5종목(러닝·풋살·등산·사이클·골프)·질문 14개. SPEC.md / CLAUDE.md / BUILD.md 작성.
- `6eb468a` Zustand `authStore`, React Router v6, `RequireAuth`, `MainLayout`, 화면 스캐폴드.
- `bfb921d` CONTRIBUTING.md — Git Flow(main/develop/feature), 커밋 규칙.

### P2 — 로그인 (05-28)
- `6ec1d51` Figma 프레임 기준 LoginScreen (소셜 4버튼, 체험권 배지).
- `b384d61` 데모 로그인이 스플래시를 건너뛰던 문제 → 데모 로그인 비영속화 + `/?reset` 리셋 해치.
- `9e83e86` 개발 모드 전용 우하단 "↻ 리셋" 버튼.
- `5ab53a8` EmailLoginScreen + 이메일 도메인 자동완성.

### P3 — 회원가입 (05-29 ~ 06-19)
- `c7093c0` 이메일 → 비밀번호 → 닉네임(+약관 시트) → 선호 운동(2단계 상태 머신) → 완료 end-to-end.
- `53de299` ~ `358e0de` Android XML·`dimens.xml`·디자인 PNG와 픽셀 단위 정렬을 반복. 이 과정의 함정을 `docs/DESIGN_IMPLEMENTATION_GUIDE.md`(33+항목)로 정리(`18b69e2`).
- `d9f34c4` `docs/SOURCE_INVENTORY.md` — Android/디자인 파일 전수 체크리스트(누락 방지).
- `5b8f8e3` Android 소스 전수 분석으로 누락 동작 4건 반영(가입 재개 다이얼로그 등).
- `9c75975` 선호 운동: 해제한 종목의 답변 잔존(zombie) 제거, 건너뛰기 시 답변 보존.

### P4~P6 + 보안·QA (08-17)
- `b34a26b` HomeScreen (MeetingCard, 전 섹션). `9667f0b` 모임 상세·정기모임·마이·라우팅. `011027f` PostChat·게스트 홈 분기.
- `58aa446` BottomNav가 스크롤 시 사라지는 버그(absolute → fixed).
- `69e4851` 보안·안정성 High 8건 — 전역 ErrorBoundary, 게스트 채팅 전송 차단, 로그인 이중 제출 방지, 가입 비밀번호를 history state 대신 sessionStorage로(→ 11-15에 메모리 전달로 다시 바꿈), 시드 QuotaExceeded 처리, 재개 다이얼로그 a11y.
- `c5f47ec` Medium 10건 — safe-area 패딩, 하드코딩 px → 토큰, 가입 완료 순서(clearPendingSignup → setLoggedIn) 등.
- `380b15e` Playwright QA 스크립트 `qa.mjs`(27) · `qa_detail.mjs`.

### 누락 화면 포팅 (11-10 ~ 11-13)
Android Fragment 대비 미구현 7개를 찾아 포팅.
- `fb22b44` TrialList · ReviewList, 체험 카드 이미지의 배지 이중 노출 → 배지 없는 이미지로 교체.
- `c29e198` Notification · ChatList (벨·채팅 탭 "준비 중" 토스트 대체).
- `df403a8` Search + 찜(`favoriteMeetingIds`, `userManager.isFavorite/toggleFavorite`).
- `4a310b7` CreateMeeting + 세션 전용 `createdMeetingsStore` (Android `UserCreatedMeetings`).
- `59d3cfa` 회원·게스트 홈을 디자인 PNG·XML 기준으로 재구성.
- `d50c573` 상세 사진첩·멤버 탭, zustand v5 `getSnapshot` 경고(셀렉터가 매번 새 `[]` 반환) 근본 수정.
- `ed2cd0a` 동네 선택 다이얼로그 + 세션 전용 `locationStore` (Android `LocationState`).

### 검증·리뷰·수정 (11-14 ~ 11-15)
- `91a89b3` 홈 재구성 후 낡은 QA 셀렉터 갱신.
- `2d39fc2` `docs/COMPLETION_STATUS.md` (화면별 완성도).
- `92ce567` 코드·디자인 전수 리뷰 결과 일괄 수정 — 아래 표.

| 분류 | 문제 → 수정 |
|---|---|
| 기능 | `/home` 등에서 새로고침 시 로그아웃 → `RequireAuth` 세션 복원 |
| 기능 | 스크롤 위치가 다음 화면으로 이어짐 → `ScrollManager` (새 화면 맨 위, 뒤로 복원) |
| 기능 | 한글 IME 조합 중 Enter 전송 → `isComposing` 가드 |
| 기능 | 약관 동의 후 이메일 화면 경유·뒤로 시 이메일 → 비밀번호 메모리 전달(`signupDraft`), sessionStorage 평문 제거 |
| 기능 | `toISOString()`(UTC) 날짜로 KST 새벽 하루 어긋남 → 로컬 `isoDate` |
| 기능 | 채팅방 대부분 빈 방 → Android 샘플 대화 기본값(`chatRepo`) + 역할 표시 |
| 디자인 | 모임 상세·추천 모임·하단 4탭 플로팅 내비를 PNG·Android 기준으로 재작성 |
| 문구 | 로그인 실패, 비밀번호 확인, 게스트 MY, 체험 탭 제목, 상세 "공지" 탭 → Android 원문 |
| 기타 | 이미지 키 누락(`hiking_group3`), 대체 사진 6종 원본화, Pretendard 실제 로드, 토큰 `tiny`·`crownGold` |

---

## 반복된 교훈 (다음 사람이 같은 실수를 하지 않도록)

1. **Android 소스 + 디자인 PNG를 둘 다 본다.** 레이아웃·스타일은 PNG 우선, 문구·동작은 Android 소스(Kotlin·strings.xml) 우선. 한쪽만 보고 만든 화면은 거의 다 재작업했다 (P3 커밋 20개, 11-15 상세·추천 재작성).
2. **"테스트 통과 = 완성"이 아니다.** 11-14까지 회귀 186건이 전부 통과했지만, 리뷰에서 기능 결함 7건(새로고침 로그아웃, 스크롤, IME 등)이 나왔다. 기존 테스트가 그 경로를 안 밟았기 때문. 결함마다 재현 테스트를 추가했다(`tests/e2e/fixes.mjs`).
3. **날짜는 로컬 기준.** `toISOString()`은 UTC다. 날짜 키는 `utils/date.ts`의 `isoDate()`만 쓴다.
4. **zustand v5 셀렉터는 안정 참조를 반환해야 한다.** `s.x ?? []` 금지 → 모듈 상수 `EMPTY_*`.
5. **`seeded` 플래그 때문에 시드 변경은 기존 설치에 반영되지 않는다.** 시드를 바꾸면 `/?reset`으로 확인.
6. **임시 스크립트를 /tmp에 두지 않는다.** 11-15에 검증 스크립트 5개가 OS 정리로 사라져 대화 기록에서 복원했다 → 지금은 `tests/e2e/`에 있다.

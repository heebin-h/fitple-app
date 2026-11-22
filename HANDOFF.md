# HANDOFF — FitPle React Web 인계 문서

> 최종 갱신: **2026-11-15** · 기준 브랜치 `feature/phase-2-login` (HEAD `92ce567` 이후 문서 커밋)
> 처음 받는 사람은 이 문서 → [[docs/README|위키 홈]] → `CLAUDE.md` → `SPEC.md` 순서로 보면 된다.
> 우선순위: 사양 충돌 시 **SPEC.md > CLAUDE.md > HANDOFF.md**.

---

## 0. 현재 상태 한 줄

**웹(PWA) 데모는 완성, iOS 앱은 프로젝트 중단으로 미개발.**
Android 원본의 21개 화면이 모두 React에 있고 20개는 동작·디자인이 일치한다(1개 부분 일치 — §7-2). 회귀 테스트 249건 전부 통과.

⚠️ **가장 먼저 할 일:** 모든 작업이 아직 `feature/phase-2-login`에만 있다.

| 비교 | 상태 |
|---|---|
| vs `origin/feature/phase-2-login` | 로컬이 **10커밋 앞섬** (push 안 됨) |
| vs `origin/develop` | 로컬이 **45커밋 앞섬**, develop에 한 번도 머지 안 됨 |
| vs `origin/main` | 46커밋 앞섬 |

→ push 후 `develop` 대상 PR을 열어 머지해야 한다 (CONTRIBUTING.md §3 흐름). `.obsidian/`(Obsidian 설정)은 추적하지 않는다.

---

## 1. 5분 시작

```bash
cd /Users/heebiny/fitple-app
npm install
npm run dev                 # http://localhost:5173
# 로그인: demo@fitple.app / demo1234   (또는 "회원가입 없이 둘러보기" = 게스트)
```

| 하고 싶은 것 | 방법 |
|---|---|
| 처음 상태로 초기화 (시드 재주입) | 주소에 `/?reset`, 개발 모드 우하단 "↻ 리셋" 버튼, 콘솔 `fitpleReset()` |
| 타입 검사 | `npm run typecheck` |
| 빌드 | `npm run build` |
| 전체 회귀 테스트 | dev 서버를 켠 상태에서 `npm run e2e` → 249건, 실패 시 exit 1 |
| 폰에서 보기 | `npm run dev -- --host` 후 같은 Wi-Fi 폰 Safari로 접속 |

---

## 2. 문서 지도

| 문서 | 용도 |
|---|---|
| [[docs/README\|docs/README.md]] | **위키 홈** — 모든 문서 색인 |
| `HANDOFF.md` (이 문서) | 현재 상태 · 구조 · 다음 할 일 · 함정 |
| [[docs/HISTORY\|docs/HISTORY.md]] | 단계별 개발 이력과 교훈 |
| [[docs/COMPLETION_STATUS\|docs/COMPLETION_STATUS.md]] | 화면별 Android 대비 완성도 |
| `SPEC.md` | 풀 사양 (화면·데이터·토큰·라우트) — **단일 진실 출처** |
| `CLAUDE.md` | AI 에이전트용 작업 규칙 (사람에게도 유효) |
| `CONTRIBUTING.md` | 브랜치 전략 · 커밋/PR 규칙 |
| `docs/DESIGN_IMPLEMENTATION_GUIDE.md` | 디자인 구현 함정 33+항목 — 화면 작업 전 필독 |
| `docs/SOURCE_INVENTORY.md` | Android/디자인 원본 파일 전수 체크리스트 |
| `tests/e2e/README.md` | 테스트 구성과 실행법 |
| `BUILD.md` | 빌드·Capacitor 명령 (iOS 부분은 미사용) |

외부 원본 (읽기 전용, 수정 금지):

| 원본 | 경로 | 무엇의 기준인가 |
|---|---|---|
| Android 소스 | `/Users/heebiny/AndroidStudioProjects/FitPle/app/src/main/java/com/example/fitple/` | **동작·문구** |
| Android 리소스 | `.../app/src/main/res/` (layout, values/strings.xml, colors.xml, drawable) | 문구·크기·아이콘 |
| 디자인 PNG | `/Users/heebiny/AndroidStudioProjects/FitPle/designs/` | **레이아웃·스타일** |

---

## 3. 구조

### 3.1 스택
React 18 · TypeScript (strict) · Vite 8 · Tailwind 3 · React Router 6 (BrowserRouter) · Zustand 5 · react-hot-toast · vaul(바텀시트) · lucide-react · dayjs · vite-plugin-pwa · Playwright(테스트). **백엔드 없음 — 모든 데이터는 localStorage.**

### 3.2 폴더
```
src/
├── routes/        AppRoutes(라우트 표) · RequireAuth(가드+세션 복원) · ScrollManager(전환 스크롤)
├── screens/       auth/(로그인·가입 7) · main/(13) · SplashScreen
├── components/    layout/(BottomNav·MainLayout·MobileFrame) · home/(HomeSections) · meeting/(카드·하트)
│                  chat/(ChatMessageList) · common/(LocationPicker) · auth/(약관 시트 등) · dev/(리셋 버튼)
├── store/         authStore · chatStore · createdMeetingsStore · locationStore · preferenceStore
├── storage/       userManager(Android UserManager 포트) · seedRunner · chatRepo · signupDraft
├── data/          models.ts · seedData.ts
├── constants/     colors · sports(5종목·질문)
└── utils/         date(isoDate 등) · meetingImage(이미지 키→에셋) · hash · validation · cn
tests/e2e/         회귀 스크립트 8종 + run-all.mjs        (qa.mjs·qa_detail.mjs는 루트)
```

### 3.3 라우트 (SPEC §10.1)

| 경로 | 화면 | Android 원본 | 하단 탭 | 접근 |
|---|---|---|---|---|
| `/` | Splash | FitpleMainActivity 시작 로고(imgFitpleLogo) | ✗ | 공개 |
| `/login` · `/email-login` | 로그인 | LoginFragment · EmailLoginFragment | ✗ | 공개 |
| `/signup/email·password·nickname·preference·complete` | 가입 5단계 | Signup*Fragment, TermsBottomSheet | ✗ | 공개 |
| `/home` | 홈 (회원/게스트 분기) | HomeFragment · GuestHomeFragment | ✅ | 회원+게스트 |
| `/exercise` | 체험 탭 "활동 중인 모임" | ExerciseFragment | ✅ | 회원+게스트 |
| `/explore`, `/explore/:sport` | 추천 모임 | RecommendedGroupFragment | ✅ | 회원+게스트 |
| `/upcoming` | 다가오는 정기모임 | UpcomingMeetingFragment | ✅ | 회원+게스트 |
| `/chat` | 채팅 목록 | ChatListFragment | ✅ | 회원 |
| `/my` | MY | MyFragment | ✅ | 회원 |
| `/meeting/:id` | 모임 상세 (홈·공지·채팅·사진첩·멤버) | PostDetailFragment | ✗ | 회원+게스트 |
| `/trials` · `/reviews` · `/notifications` · `/search` | 체험·후기·알림·검색 | 각 Fragment | ✗ | 회원+게스트 |
| `/create-meeting` | 모임 만들기 | CreateMeetingFragment | ✗ | 회원 |
| `/meeting/:id/chat` | 독립 채팅 | (Android 없음) | ✗ | UI 진입점 없음 |

하단 탭 = Android `bottom_nav_menu` 4개: **홈 · 체험(/exercise) · 채팅 · MY**. `/explore`는 홈의 종목 아이콘·"추천 모임 더보기"로 진입.

### 3.4 상태와 저장소

| 이름 | 위치 | 수명 | 내용 |
|---|---|---|---|
| `authStore` | 메모리 | 세션 | currentUser · isGuest. 새로고침 시 `RequireAuth`가 `current_user`로 복원(게스트는 복원 안 함) |
| `chatStore` | 메모리 | 세션 | 모임별 메시지. 초기값 = `chats:{id}` 또는 Android 샘플 대화 |
| `createdMeetingsStore` | 메모리 | 세션 | 만든 모임 (Android도 세션 한정) |
| `locationStore` | 메모리 | 세션 | 선택 동네 (기본 "미사 1동") |
| `preferenceStore` | 메모리 | 가입 중 | 선호 운동 상태 머신 |
| `signupDraft` | 모듈 변수 | 가입 중 | 가입 비밀번호 임시 보관 — 저장소에 평문을 두지 않기 위해 |
| localStorage | 영구 | — | `user:{sha256}` · `current_user` · `pending_signup` · `meetings` · `reviews` · `schedules` · `chats:{id}` · `joined:{email}` · `seeded` (SPEC §8.1) |

**시드:** 첫 실행 때 `seedRunner`가 한 번만 주입하고 `seeded=true`를 남긴다. 그래서 `seedData.ts`를 바꿔도 기존 브라우저에는 반영되지 않는다 → `/?reset`.

---

## 4. 작업 규칙 (핵심만 — 전체는 CLAUDE.md)

1. **기준 우선순위:** 레이아웃·스타일은 **디자인 PNG**, 문구·동작은 **Android Kotlin/strings.xml**. 둘이 다르면 그 판단을 코드 주석에 남긴다(기존 파일 상단 주석 참고).
2. **토큰만 쓴다.** 색(`tailwind.config.ts` colors), 글자 크기(`text-h2`, `text-label`, `text-tiny` …). `text-[13px]`·hex 직접 입력 금지.
3. **SPEC.md는 같은 커밋에서 갱신**한다 (화면·문구·모델·토큰·라우트 변경 시).
4. **한국어 문구는 Android 원문 그대로.** 바꿔 쓰지 않는다. Android에 없는 문구를 새로 만들면 SPEC에 "React-only"로 표시한다.
5. **날짜 키는 `isoDate()`**(로컬). `toISOString()` 금지 — UTC라 KST 새벽에 하루 어긋난다.
6. **zustand 셀렉터는 안정 참조**를 반환해야 한다. `s.x ?? []` 대신 모듈 상수 `EMPTY_*`를 쓴다.
7. **userManager는 전부 async** (SHA-256). await 누락 시 `[object Promise]`가 저장된다.
8. **완료 게이트:** `npm run typecheck` → `npm run build` → `npm run e2e`(dev 서버 필요). 새 동작에는 `tests/e2e/`에 검증을 추가한다.

---

## 5. 검증

| 스위트 | 파일 | 건수 | 다루는 것 |
|---|---|---|---|
| trial_review | `tests/e2e/trial_review.mjs` | 9 | 체험·후기 목록, 게스트 접근 |
| noti_chat | `tests/e2e/noti_chat.mjs` | 15 | 알림, 채팅 목록, 상세 채팅 탭 진입 |
| search_fav | `tests/e2e/search_fav.mjs` | 16 | 검색, 찜 영속 |
| create | `tests/e2e/create.mjs` | 21 | 모임 만들기 검증·생성·노출 |
| home | `tests/e2e/home.mjs` | 30 | 회원/게스트 홈 섹션·Hero 문구·더보기·로그인 유도 |
| detail_tabs | `tests/e2e/detail_tabs.mjs` | 11 | 사진첩·멤버 탭 |
| location | `tests/e2e/location.mjs` | 16 | 동네 선택 공유 |
| fixes | `tests/e2e/fixes.mjs` | 63 | 11-15 리뷰 결함 재현 방지 (세션 복원, 스크롤, IME, 가입 이력, KST 새벽, 추천·상세·내비, 문구, 폰트) |
| qa / qa_detail | `qa.mjs` · `qa_detail.mjs` | 26 · 42 | 전체 흐름 스모크, 가입 D1~D6 |
| **합계** | `npm run e2e` | **249** | 마지막 실행 2026-11-15: 249/249, 콘솔 error/warning 0 |

**미검증:** Safari/WebKit, 실제 iPhone/Android 기기, 실제 한글 IME 키보드(조합 이벤트 시뮬레이션만 함).

---

## 6. 결정된 사항 (바꾸지 말 것)

| 항목 | 값 |
|---|---|
| 종목 5개 (순서 고정) | 러닝 · 풋살 · 등산 · 사이클 · 골프 |
| 저장소 / 해싱 | localStorage / Web Crypto SHA-256 |
| 데모 계정 | `demo@fitple.app` / `demo1234` |
| 모바일 폭 | `max-w-mobile` 430px |
| 브랜드 컬러 | orange `#ff5432`, orangeTint `#FFF0ED` |
| 하단 탭 | 홈 · 체험 · 채팅 · MY (Android 4탭) |
| 상세 탭 | 홈 · 공지 · 채팅 · 사진첩 · 멤버 (Android tabTitles) |
| Bundle ID (iOS 재개 시) | `team.fitple.sideproject` |
| 글꼴 | Pretendard Variable dynamic subset v1.3.9 (jsdelivr, 버전 고정) |

---

## 7. 다음 할 일 (우선순위 순)

| # | 할 일 | 왜 / 어디 | 크기 |
|---|---|---|---|
| 1 | **push + `develop` PR + 머지** | §0 — 45커밋이 통합 안 됨 | 작음 |
| 2 | 정기모임 카드 → 모임 상세 이동 | 유일한 Android 불일치. `ScheduleItem`에 `meetingId?` 추가 + `SEED_SCHEDULES` 연결 + `UpcomingMeetingScreen` 카드 onClick (지금은 "준비 중" 토스트). SPEC §12.14 갱신 | 작음 |
| 3 | 시드 버전 관리 | `seeded` 불리언이라 시드 변경이 기존 설치에 안 들어감 → `seedVersion` 숫자로 바꾸고 증가 시 컬렉션만 재주입(사용자 계정·찜 보존) | 중간 |
| 4 | 채팅 영속화 | 보낸 메시지가 새로고침 시 사라짐 → `chatStore.addMessage`에서 `chats:{id}` 저장 | 작음 |
| 5 | WebKit 테스트 | Playwright `webkit` 프로젝트로 `npm run e2e` 확장 → iOS Safari 차이 조기 발견 | 중간 |
| 6 | 고해상도 모임 사진 | 원본이 70~100px라 상세 헤더에서 흐림. 디자인팀 원본 확보 시 `src/assets/images/meetings/` 교체 (키 매핑은 `utils/meetingImage.ts`) | 원본 의존 |
| 7 | 남은 "준비 중" | MY 이용약관·개인정보처리방침 페이지, 소셜 로그인 3종 — v1 범위 외로 정해둔 항목 | 범위 결정 필요 |
| 8 | 정리 | ① `/meeting/:id/chat`(PostChatScreen) 유지/삭제 결정 — UI 진입점 없음 ② React Router v7 future flag 경고 대응 ③ 게스트용 시드(`m-guest-*`)가 체험 탭·검색에도 노출되는 것 의도 확인 | 작음 |
| — | (재개 시) iOS P7·P8 | §9 참고 | 큼 |

---

## 8. 알려진 한계와 함정

| 증상 | 원인 / 대처 |
|---|---|
| 시드를 바꿨는데 화면이 그대로 | `seeded` 플래그 → `/?reset` |
| Hero "오늘/내일" 일정이 안 맞음 | 시드 일정 날짜는 첫 실행일 기준으로 고정 → `/?reset` |
| 새로고침 후 게스트가 로그인 화면으로 | 의도된 동작 (게스트 세션은 비영속, Android 동일) |
| 보낸 채팅이 새로고침 후 사라짐 | 미영속 (§7-4) |
| 모임 사진이 흐림 | 원본 해상도 한계 (§7-6) |
| 동네를 바꿔도 목록이 안 바뀜 | 의도된 동작 — Android도 표시만 바꿈 |
| Playwright `waitForLoadState('networkidle')`가 안 끝남 | 화면을 떠날 때 Chrome이 보류한 Pretendard 글자 조각 요청이 열린 채 남음. 사용자에게 보이는 영향은 없는 것으로 판단(추정). 테스트에서는 networkidle 대신 요소 대기를 쓴다 |
| dev 서버 첫 접속 직후 테스트가 "Execution context was destroyed" | Vite 의존성 최적화로 1회 전체 새로고침 → 다시 실행 |
| `Port 5173 is already in use` | 이전 서버 잔존 → `lsof -ti tcp:5173 \| xargs kill` |
| 임시 스크립트가 사라짐 | macOS가 /tmp를 정리함 → 테스트는 `tests/e2e/`에 둔다 |
| 외부 네트워크 의존 | 상세 지도(Google Maps embed), 글꼴(jsdelivr). 오프라인이면 지도 빈칸·시스템 글꼴 |

---

## 9. iOS (미개발 — 재개할 경우)

프로젝트 중단으로 진행하지 않았다. `@capacitor/ios` 8.3.4와 `capacitor.config.ts`만 있고 `ios/` 폴더는 없다.
재개 순서: Xcode·CocoaPods 설치 → `npm run build` → `npx cap add ios` → `npx cap sync` → `npx cap open ios` → Signing 설정 → 아이콘·스플래시·상태바(`@capacitor/status-bar`)·키보드(`@capacitor/keyboard`). 상세는 SPEC §16~§18, §20(P7·P8), `BUILD.md`.

---

## 10. 환경

| 항목 | 값 |
|---|---|
| Node | 로컬 v26.4.0 확인 (`.nvmrc` = 20) |
| npm | 11.17.0 |
| Playwright | devDependency 1.62 — 처음이면 `npx playwright install chromium` |
| 원격 | `git@github.com:heebin-h/fitple-app.git` |

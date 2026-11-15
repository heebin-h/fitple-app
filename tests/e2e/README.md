# E2E 회귀 테스트

Playwright(Chromium, 모바일 뷰포트)로 실제 앱을 조작해 화면·동작·문구를 확인하는 스크립트 모음.
테스트 프레임워크 없이 순수 Node 스크립트이며, 각 파일이 `OK …` / `FAIL …` 줄을 출력하고 실패가 있으면 exit 1.

## 실행

```bash
npm run dev            # 터미널 1 — http://localhost:5173
npm run e2e            # 터미널 2 — 전부 실행 + 집계 (249건)

node tests/e2e/fixes.mjs                      # 하나만
BASE=http://localhost:4173 npm run e2e        # 다른 주소 (예: npm run preview)
SS=/tmp/shots node tests/e2e/home.mjs         # 스크린샷 경로 지정 (기본 test-results/e2e, gitignore)
```

처음 설치한 환경이면 `npx playwright install chromium`.

## 구성

| 파일 | 건수 | 내용 |
|---|---|---|
| `trial_review.mjs` | 9 | 체험·후기 목록, 신청하기 → 상세, 게스트 접근 |
| `noti_chat.mjs` | 15 | 알림 화면(벨 진입 경로), 채팅 목록 → 상세 채팅 탭 |
| `search_fav.mjs` | 16 | 검색(자동 포커스·빈 검색어·결과 이동), 찜 토글·영속·카드로 전파 안 됨, 게스트 |
| `create.mjs` | 21 | 모임 만들기 유효성·기본값·생성 후 노출, 게스트 차단 |
| `home.mjs` | 30 | 회원/게스트 홈 섹션·Hero 문구·날짜·월 라벨, 더보기 이동, 게스트 로그인 유도 |
| `detail_tabs.mjs` | 11 | 상세 사진첩 9장·멤버 5명, 하단 버튼 표시 조건 |
| `location.mjs` | 16 | 동네 선택 다이얼로그, 화면 간 공유, 세션 한정 |
| `fixes.mjs` | 63 | 2026-11-15 리뷰 결함 재발 방지 — 세션 복원, 스크롤, IME, 가입 이력·평문 비밀번호, KST 새벽 날짜(시계 고정), 채팅 샘플, 추천 모임 칩, 상세 버튼·지도, 하단 4탭, 문구, 폰트 |
| `../../qa.mjs` | 26 | 전체 흐름 스모크 (로그인 → 홈 → 상세 → 체험 → MY → 로그아웃 → 게스트) |
| `../../qa_detail.mjs` | 42 | 상세 탭, 추천 칩, 정기모임, 회원가입 D1~D6, 재개 다이얼로그, 스크롤 시 탭바 |

## 작성 규칙

- **한 파일 = 독립 실행.** 시작할 때 `localStorage.clear()` 후 새로고침으로 초기 상태를 만든다.
- **화면 이동은 UI 조작으로.** `page.goto`로 보호 경로에 들어가면 게스트 세션이 사라진다(게스트는 비영속). 회원은 새로고침해도 유지된다. SPA 내부 이동이 필요하면 `history.pushState` + `popstate` 이벤트를 쓴다(`fixes.mjs`의 `spaGo`).
- **`waitForLoadState('networkidle')` 쓰지 않기.** 웹폰트 조각 요청이 보류된 채 남아 끝나지 않을 수 있다. 요소를 기다리거나 짧은 `waitForTimeout`을 쓴다.
- **셀렉터는 역할·이름 기반, `exact: true`.** 모임 제목·설명에 같은 단어(예: "주말", "편하게")가 들어 있어 부분 일치가 자주 깨진다. 칩처럼 `aria-pressed`를 가진 요소는 하트 버튼도 같은 속성을 가지므로 클래스로 한 번 더 좁힌다.
- **콘솔 error/warning 0건**을 마지막에 확인한다 (React Router Future Flag 경고만 예외).
- 결함을 고치면 재현 테스트를 `fixes.mjs` 또는 새 파일에 추가하고 `run-all.mjs`의 목록에 등록한다.

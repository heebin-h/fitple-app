# FitPle 위키

> 운동 모임 매칭 앱 **FitPle**의 Android(Kotlin) 원본을 React 웹(PWA)으로 옮긴 프로젝트의 문서 색인.
> 이 레포 폴더는 Obsidian 볼트로 열 수 있다 (`[[링크]]`가 문서 간 이동).
> 상태: **웹 데모 완성 · iOS 미개발(프로젝트 중단)** — 2026-11-15 기준.

## 처음 왔다면 (순서대로)

1. [[HANDOFF]] — 현재 상태, 구조, 다음 할 일, 함정. **인계의 출발점**
2. [[HISTORY]] — 어떻게 여기까지 왔는지, 반복된 교훈
3. [[COMPLETION_STATUS]] — 화면별 Android 대비 완성도
4. `../CLAUDE.md` — 작업 규칙 (토큰·문구·SPEC 동기화·검증 게이트)
5. `../SPEC.md` — 풀 사양. 코드와 다르면 SPEC이 기준이며 같은 커밋에서 맞춘다

## 주제별

| 알고 싶은 것 | 문서 |
|---|---|
| 화면·데이터·라우트·토큰 정의 | `../SPEC.md` (§10 라우트, §12 화면, §8 저장소, §6 토큰) |
| 디자인 구현할 때 빠지는 함정 | [[DESIGN_IMPLEMENTATION_GUIDE]] |
| Android/디자인 원본 파일 목록 | [[SOURCE_INVENTORY]] |
| 과거 인증 흐름 감사 결과 | [[IMPLEMENTATION_AUDIT]] (2026-05-31 작성. 이후 커밋 `5b8f8e3`·`4368085` 등에서 반영 작업이 있었으나 항목별 반영 여부는 미확인) |
| 브랜치·커밋·PR 규칙 | `../CONTRIBUTING.md` |
| 테스트 실행·작성법 | `../tests/e2e/README.md` |
| 빌드·Capacitor | `../BUILD.md` (iOS 부분은 미사용) |

## 자주 묻는 것

**Q. 데모 계정은?** `demo@fitple.app` / `demo1234`. 로그인 화면의 "회원가입 없이 둘러보기"는 게스트 모드.

**Q. 데이터를 처음 상태로 되돌리려면?** 주소 뒤에 `/?reset`, 또는 개발 모드 우하단 "↻ 리셋".

**Q. 시드(`src/data/seedData.ts`)를 고쳤는데 화면이 안 바뀐다.** 첫 실행에만 주입되고 `seeded` 플래그가 남기 때문. `/?reset`.

**Q. Android와 디자인 PNG가 다르면 무엇을 따르나?** 레이아웃·스타일은 PNG, 문구·동작은 Android 소스. 판단은 해당 파일 상단 주석에 기록돼 있다.

**Q. 백엔드는?** 없다. 모든 데이터는 브라우저 localStorage. 비밀번호는 SHA-256 해시로만 저장.

**Q. 다 됐는지 어떻게 확인하나?** `npm run typecheck && npm run build`, dev 서버를 켠 상태에서 `npm run e2e` (249건).

**Q. iOS 앱은?** 계획만 있고 개발하지 않았다. 재개 방법은 [[HANDOFF]] §9.

## 용어

| 용어 | 뜻 |
|---|---|
| 회원 / 게스트 | 로그인 사용자 / "둘러보기"로 들어온 비로그인 사용자 (일부 기능은 로그인 유도) |
| 체험 탭 | 하단 두 번째 탭. 화면 제목은 "활동 중인 모임"(`/exercise`, Android ExerciseFragment) |
| 추천 모임 | `/explore` — 종목·조건 칩으로 거르는 목록 |
| 정기모임 | 홈 하단·`/upcoming`의 일정(`ScheduleItem`) |
| 공지 탭 | 모임 상세의 두 번째 탭 (일부 디자인 PNG에서는 "게시판") |
| 시드 | 첫 실행 때 localStorage에 넣는 데모 데이터 |
| Android 원본 | `/Users/heebiny/AndroidStudioProjects/FitPle` — 동작·문구의 기준 (읽기 전용) |

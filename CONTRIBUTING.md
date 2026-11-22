# CONTRIBUTING — 협업 · 브랜치 · 작업 규칙

> 이 저장소의 **모든 작업 규칙**을 모은 단일 문서입니다.
> 브랜치를 어떻게 나누고, 어떻게 합치고, 커밋·PR을 어떻게 쓰는지를 정의합니다.
> 코드/화면 스펙은 [`SPEC.md`], AI 에이전트 가이드는 [`CLAUDE.md`], 빌드 절차는
> [`BUILD.md`], 진행 인계는 [`HANDOFF.md`]가 담당합니다 — 이 문서는 **"어떻게 일하는가"**만 다룹니다.

---

## 0. 최우선 원칙 (모든 결정의 기준)

순서가 곧 우선순위입니다. 충돌하면 위 항목이 이깁니다.

1. **가독성 좋은 문서** — 규칙·결정은 항상 md로 남기고 git에 올린다. 말로만 하는 규칙은 없다.
2. **단순하고 유지보수하기 쉬운 코드** — 영리한 코드보다 다음 사람이 5초 안에 이해하는 코드. 추상화는 중복이 실제로 아플 때만 도입한다.
3. **안정성** — 에러 핸들링·엣지 케이스를 먼저 생각한다(빈 데이터, 파싱 실패, 비동기 경합).
4. **재현 가능성** — 설정은 파일/토큰으로. 하드코딩 금지(색상·문구·키는 정해진 출처에서).

> 새 규칙이 생기면 **코드보다 이 문서를 먼저** 고친다.

---

## 1. 브랜치 구조 (Git Flow)

```
main    ────●──────────────●──────▶   릴리즈만. 항상 배포 가능 상태. 태그를 단다.
             \            /
develop  ●────●────●────●────●──────▶   통합 브랜치. 기본 작업 대상. 항상 빌드 통과.
                \      /
       feature/<name>                  기능 단위 작업. develop에서 따서 develop로 PR.
```

| 브랜치 | 역할 | 받는 곳 | 보내는 곳 |
|--------|------|---------|-----------|
| `main` | 배포/릴리즈 스냅샷. 항상 안정. | `develop`(릴리즈 시) | 태그 |
| `develop` | 기능 통합. 일상 작업의 기준점. | `feature/*` (PR) | `main`(릴리즈) |
| `feature/*` | 하나의 기능/작업 단위 | — | `develop` (PR) |

- `develop`은 현재 `main` 기준으로 생성됨(기존 Phase 0~1 작업 포함). **이후 `main`은 릴리즈 머지로만 전진**한다.
- `main`·`develop`에는 **직접 커밋하지 않는다**(릴리즈/핫픽스 예외 제외). 항상 `feature/*`에서 작업한다.

---

## 2. 브랜치 네이밍

```
<type>/<짧은-설명-kebab>
```

| 접두사 | 용도 | 예시 |
|--------|------|------|
| `feature/` | 새 기능·화면·스토어 | `feature/phase-2-components` |
| `fix/` | 버그 수정 | `fix/splash-race` |
| `docs/` | 문서만 변경 | `docs/branching-rules` |
| `chore/` | 설정·빌드·잡일 | `chore/tsconfig-paths` |
| `refactor/` | 동작 변화 없는 정리 | `refactor/meeting-card` |
| `release/` | 릴리즈 준비 | `release/v1.0.0` |
| `hotfix/` | 배포본 긴급 수정(main 기준) | `hotfix/login-crash` |

규칙: 영문 소문자 + 하이픈. Phase 작업은 `feature/phase-N-...`로 통일.

---

## 3. 작업 흐름 (한 사이클)

```bash
# 1. 최신 develop에서 작업 브랜치 생성
git switch develop && git pull
git switch -c feature/phase-2-components

# 2. 작업 + 커밋 (작은 단위로 자주, §4 메시지 규칙)
#    화면/모델/토큰을 바꿨으면 SPEC.md도 같은 커밋에서 갱신 (CLAUDE.md 룰)

# 3. 검증 게이트 — 통과 못 하면 PR 금지 (§6)
npx tsc --noEmit && npm run build

# 4. 푸시 후 PR 생성 → develop 대상, Squash merge (§5)
git push -u origin feature/phase-2-components
```

---

## 4. 커밋 메시지 (Conventional Commits)

```
<type>(<scope>): <요약 — 한국어, 명령형, 마침표 없음>

<본문 — 무엇을/왜. 어떻게는 코드가 말한다>
```

- **type**: `feat` `fix` `docs` `chore` `refactor` `test` `build`
- **scope**(선택): 작업 영역. 본 프로젝트는 Phase 단위 권장 → `feat(phase-2): ...`
- 예: `feat(phase-1): auth store + router + layout + screen scaffolds`

> 한 커밋 = 한 가지 일. 리뷰·되돌리기·기록이 쉬워진다.

---

## 5. PR + Squash Merge

- 합치기는 **항상 GitHub PR**로. 대상은 원칙적으로 `develop`(릴리즈만 `main`).
- 머지 방식은 **Squash and merge** — feature의 잔커밋을 1개로 압축해 `develop` 히스토리를 기능 단위로 깔끔하게 유지.
- PR 본문에 **무엇을/왜 + 검증 결과(`tsc`, `build`)**를 적는다.
- 머지 후 **feature 브랜치는 삭제**(로컬·원격 모두).

```bash
# gh CLI가 있으면 (없으면: brew install gh, 또는 GitHub 웹에서 생성)
gh pr create --base develop --head feature/phase-2-components \
  --title "feat(phase-2): 공통 컴포넌트" --body "..."
gh pr merge --squash --delete-branch
```

> ⚠️ 현재 환경에 `gh` 미설치. `brew install gh && gh auth login` 후 위 명령 사용,
> 또는 GitHub 웹 UI에서 PR 생성 → "Squash and merge" 선택.

---

## 6. 검증 게이트 (PR 전 필수)

PR을 열기 전에 **로컬에서 반드시 통과**:

```bash
npx tsc --noEmit   # 타입 오류 0 (CLAUDE.md 룰 #10)
npm run build      # 프로덕션 빌드 성공
```

둘 중 하나라도 실패하면 PR을 만들지 않는다.

---

## 7. 릴리즈 (develop → main)

```bash
# 1. develop를 main으로 PR (또는 release/* 브랜치 경유)
# 2. main에서 Squash/Merge 후 태그
git switch main && git pull
git tag -a v1.0.0 -m "v1.0.0 — TestFlight 1차"
git push origin v1.0.0
```

- 버전은 [SemVer](https://semver.org): `vMAJOR.MINOR.PATCH`.
- 릴리즈 노트는 PR 본문 + 태그 메시지로 남긴다.

---

## 8. 문서 지도 (어떤 규칙이 어디에)

| 문서 | 답하는 질문 |
|------|-------------|
| **`CONTRIBUTING.md`** (이 문서) | 어떻게 일하나 — 브랜치·커밋·PR·릴리즈 |
| `SPEC.md` | 무엇을 만드나 — 화면·데이터·디자인 토큰 (단일 출처) |
| `CLAUDE.md` | AI 에이전트용 코드 하우스 룰 + 파일 매핑 |
| `BUILD.md` | 빌드·배포 명령 (`npx cap …`, Xcode) |
| `HANDOFF.md` | 지금까지 한 일 / 다음 할 일 |

> 규칙이 바뀌면 이 문서를 갱신하는 PR을 먼저 올린다. 그게 규칙이다.

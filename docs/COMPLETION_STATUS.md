# COMPLETION_STATUS — 구현 완성도 (Android 원본 대비)

> **기준 커밋**: `91a89b3` (branch `feature/phase-2-login`)
> **방법**: Android `app/src/main/java/com/example/fitple/` Fragment/Activity 목록·클릭 핸들러·Toast 문구 + `res/menu` ↔ `src/screens/` 대조, 전체 E2E 재실행.
> **작성**: 2026-11-15.

---

## 0. 결론

- **화면**: Android 21개 Fragment 전부 React에 대응. **18개 완전 일치, 3개 부분 일치**(추천 모임 · 다가오는 정기모임 · 모임 상세).
- **단계**: 웹 기능 단계 P0~P6 완료.
- **iOS (P7 iOS 통합 · P8 출시)**: 계획했으나 **프로젝트 중단으로 개발하지 않음**. 완성도 산정 범위에서 제외.
- **전체**: 개발 범위(P0~P6) 기준 단계는 모두 완료. 남은 것은 §2의 Android 정합 △ 항목뿐.

---

## 1. 단계별 (SPEC §20)

| 단계 | 상태 | 근거 |
|---|---|---|
| P0 기초 | ✅ | 토큰, 빌드 성공 |
| P1 데이터·라우팅 | ✅ | 라우트 표(SPEC §10.1), `RequireAuth`, 시드 |
| P2 공통 UI | ✅ | 입력칸, 약관 시트, BottomNav 등 |
| P3 인증 | ✅ | `qa_detail.mjs` D1~D6, E 통과 |
| P4 홈 | ✅ | verify_home 30건 |
| P5 모임 화면 | △ | §2의 부분 일치 3개 |
| P6 소셜 토스트 | ✅ | 의도된 "준비 중" (HANDOFF §5) |
| P7 iOS 통합 | ⛔ 미개발 | 프로젝트 중단. `ios/` 미생성 (`@capacitor/ios` 8.3.4·`capacitor.config.ts`만 존재) |
| P8 출시 | ⛔ 미개발 | 프로젝트 중단. 서명·아카이브·TestFlight 없음 |

---

## 2. 화면별

### 2.1 인증 (8) — 모두 ✅

로그인 · 이메일 로그인 · 회원가입 5단계(이메일/비밀번호/닉네임/선호 운동/완료) · 약관 바텀시트.
가입 중단 재개 다이얼로그 포함. 소셜 로그인 3종은 토스트(데모 범위 외).

### 2.2 메인 (13)

| 화면 | 상태 | 비고 |
|---|---|---|
| 회원 홈 / 게스트 홈 | ✅ | XML 섹션 순서, 게스트 로그인 유도 6종 동일 |
| 운동 | ✅ | |
| 체험 목록 · 후기 목록 | ✅ | |
| 알림 · 채팅 목록 | ✅ | |
| 검색 (+찜) | ✅ | 찜은 계정별 localStorage 저장 |
| 모임 만들기 | ✅ | 세션 메모리만 (Android `UserCreatedMeetings`와 동일) |
| 마이 | ✅ | Android는 닉네임·이메일·로그아웃만. React는 약관 항목 추가(토스트) |
| **추천 모임** | △ | 툴바 알림(종) 아이콘 없음. 목록 행이 `item_group_list`가 아닌 홈 카드(`MeetingCard`) |
| **다가오는 정기모임** | △ | 카드 탭: Android는 모임 상세 이동(`UpcomingMeetingFragment.kt:79,90`), React는 토스트 (`ScheduleItem`에 meetingId 없음) |
| **모임 상세** | △ | §2.3 |

### 2.3 모임 상세 탭

| 탭 | 상태 | 비고 |
|---|---|---|
| 홈(정보) | △ | 아래 Android 기능 누락 |
| 게시판 | △ | 목록만, 상세는 토스트. 탭명 Android "공지" vs React "게시판" |
| 채팅 | ✅ | 공지 배너 접기, 전송 |
| 사진첩 · 멤버 | ✅ | 사진 9장 3열 그리드 / 멤버 5명 + 역할 칩 |

홈(정보) 탭 누락 기능 — 근거 `PostDetailFragment.kt:134-192, 480`:

| Android | React 현재 |
|---|---|
| 하단 "문의하기"(mailto support@fitple.app) / "가입하기"("가입 신청이 완료되었어요!" → "가입 완료") | "1회 참가하기" 1개 |
| 중간 "공유하기"(시스템 공유) / "1회 체험하기"("1회 체험 신청이 완료되었어요!") | 없음. 상단 공유는 "준비 중" 토스트 |
| 장소 지도 (Google Maps WebView 임베드) | 플레이스홀더 |

### 2.4 공통

| 항목 | 상태 | 비고 |
|---|---|---|
| 하단 탭 | △ | Android `res/menu`·디자인은 4탭(홈·운동·채팅·MY), React는 5탭(탐색 추가) |
| 동네 선택 다이얼로그 | ✅ | 8개 동네, 세션 공유 (Android `LocationState`) |

---

## 3. React 전용 "준비 중" 토스트 (Android에는 해당 문구 없음)

| 위치 | 내용 |
|---|---|
| `src/screens/main/PostDetailScreen.tsx:156` | 찜하기 (Android 상세엔 하트 자체가 없음) |
| `src/screens/main/PostDetailScreen.tsx:160` | 공유 |
| `src/screens/main/PostDetailScreen.tsx:253` | 게시글 상세 |
| `src/screens/main/MyScreen.tsx:27-28` | 이용약관 · 개인정보처리방침 |
| `src/screens/main/UpcomingMeetingScreen.tsx:100` | 모임 상세 |
| `src/screens/auth/LoginScreen.tsx:102` | 소셜 로그인 |

---

## 4. 데이터 · 플랫폼

| 항목 | 상태 |
|---|---|
| 계정(SHA-256) · 로그인 · 찜 | ✅ localStorage 영구 저장 |
| 만든 모임 · 선택 동네 | 세션 전용 (Android 동일) |
| 채팅 | △ 새로고침 시 시드 대화만 복원 |
| 데모 로그인 | △ 새로고침 시 로그인 해제 |
| 이미지 | △ `running_track` · `running_night` · `running_group1` → `running_beach` 1장으로 대체 |
| iOS 상태바 · 키보드 · 아이콘 · 스플래시 | ⛔ 미개발 (프로젝트 중단) |
| iOS 입력칸 확대 (입력 글자 14px) | 미확인 — iOS 미개발로 확인하지 않음 |

---

## 5. 검증 (커밋 `91a89b3`, 2026-11-15)

| 항목 | 결과 |
|---|---|
| `npx tsc --noEmit` | 에러 0 |
| `npm run build` | 성공 (JS 361KB / gzip 114KB) |
| Playwright 검증 7종 (체험·후기 / 알림·채팅 / 검색·찜 / 모임 만들기 / 홈 / 상세 탭 / 동네 선택) | 118/118 |
| `qa.mjs` | 26/26 |
| `qa_detail.mjs` | 42/42 |
| 콘솔 error/warning | 0건 (React Router Future Flag 제외) |
| TODO/FIXME · `.skip`/`.only` · `console.log` | 0건 |

**미검증**: Chromium 모바일 뷰포트에서만 실행. Safari/WebKit · iOS 기기 미검증.

---

## 6. 남은 작업

- iOS(P7·P8)는 프로젝트 중단으로 진행하지 않음.
- **Android 정합 (선택)** — §2의 △ 항목: 모임 상세 버튼 4개 + 지도, 정기모임 카드 → 상세 이동, 추천 모임 알림 아이콘·행 컴포넌트, 하단 탭 4개, "공지" 탭명, 러닝 이미지 원본.

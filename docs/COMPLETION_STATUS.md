# COMPLETION_STATUS — 구현 완성도 (Android 원본 대비)

> **기준**: 2026-11-15 리뷰 수정 반영 후 (branch `feature/phase-2-login`)
> **방법**: Android `app/src/main/java/com/example/fitple/` Fragment/Activity 목록·클릭 핸들러·Toast 문구 + `res/menu` ↔ `src/screens/` 대조, 전체 E2E 재실행.
> **작성**: 2026-11-15.

---

## 0. 결론

- **화면**: Android 21개 Fragment 전부 React에 대응. **20개 일치, 1개 부분 일치**(다가오는 정기모임 — 카드 탭 시 상세 이동 불가).
- **단계**: 웹 기능 단계 P0~P6 완료.
- **iOS (P7 iOS 통합 · P8 출시)**: 계획했으나 **프로젝트 중단으로 개발하지 않음**. 완성도 산정 범위에서 제외.
- **전체**: 개발 범위(P0~P6) 기준 단계는 모두 완료. 2026-11-15 코드·디자인 리뷰 지적 사항(기능 7 · 디자인 5 · 문구 등) 수정 완료 — §7.

---

## 1. 단계별 (SPEC §20)

| 단계 | 상태 | 근거 |
|---|---|---|
| P0 기초 | ✅ | 토큰, 빌드 성공 |
| P1 데이터·라우팅 | ✅ | 라우트 표(SPEC §10.1), `RequireAuth`, 시드 |
| P2 공통 UI | ✅ | 입력칸, 약관 시트, BottomNav 등 |
| P3 인증 | ✅ | `qa_detail.mjs` D1~D6, E 통과 |
| P4 홈 | ✅ | verify_home 30건 |
| P5 모임 화면 | ✅ (1개 △) | 다가오는 정기모임 카드 탭만 미연결 |
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
| 체험 탭 ("활동 중인 모임") | ✅ | Android ExerciseFragment 제목 |
| 체험 목록 · 후기 목록 | ✅ | |
| 알림 · 채팅 목록 | ✅ | |
| 검색 (+찜) | ✅ | 찜은 계정별 localStorage 저장 |
| 모임 만들기 | ✅ | 세션 메모리만 (Android `UserCreatedMeetings`와 동일) |
| 마이 | ✅ | Android는 닉네임·이메일·로그아웃만. React는 약관 항목 추가(토스트) |
| 추천 모임 | ✅ | 알림 아이콘·필터 라벨·칩 5개 단일 선택(Android matchesCondition)·item_group_list 행 |
| **다가오는 정기모임** | △ | 카드 탭: Android는 모임 상세 이동(`UpcomingMeetingFragment.kt:79,90`), React는 토스트 (`ScheduleItem`에 meetingId 없음) |
| 모임 상세 | ✅ | §2.3 — 디자인 PNG·Android 기준 재구성 |

### 2.3 모임 상세 탭

| 탭 | 상태 | 비고 |
|---|---|---|
| 홈 | ✅ | 툴바(검색·알림), 헤더 정보 카드, 다가오는 정기 모임(지도 embed), 공유하기·1회 체험하기, 기본정보, 필독·안내사항, 하단 문의하기·가입하기 |
| 공지 | ✅ | Android `setupNoticeList` 4건 (탭명 Android "공지") |
| 채팅 | ✅ | 접기 배너, Android 샘플 대화 8건 + 역할(왕관), "작성"/"전송", 한글 조합 중 Enter 무시 |
| 사진첩 · 멤버 | ✅ | 사진 9장 3열 그리드 / 멤버 5명 + 역할 칩 |

### 2.4 공통

| 항목 | 상태 | 비고 |
|---|---|---|
| 하단 탭 | ✅ | Android 4탭 홈·체험·채팅·MY, 플로팅 카드(디자인), 원본 아이콘, 활성 표시 |
| 동네 선택 다이얼로그 | ✅ | 8개 동네, 세션 공유 (Android `LocationState`) |

---

## 3. React 전용 "준비 중" 토스트 (Android에는 해당 문구 없음)

| 위치 | 내용 |
|---|---|
| `src/screens/main/MyScreen.tsx:27-28` | 이용약관 · 개인정보처리방침 |
| `src/screens/main/UpcomingMeetingScreen.tsx` | 정기모임 카드 탭 (ScheduleItem에 meetingId 없음) |
| `src/screens/auth/LoginScreen.tsx:102` | 소셜 로그인 |

모임 상세의 찜·공유·게시글 "준비 중" 토스트는 2026-11-15 재구성으로 제거(Android 동작으로 대체).

## 4. 데이터 · 플랫폼

| 항목 | 상태 |
|---|---|
| 계정(SHA-256) · 로그인 · 찜 | ✅ localStorage 영구 저장 |
| 만든 모임 · 선택 동네 | 세션 전용 (Android 동일) |
| 채팅 | △ 새로고침 시 보낸 메시지 사라짐 (저장본/Android 샘플만 복원) |
| 로그인 세션 | ✅ 어느 화면에서 새로고침해도 유지 (게스트는 해제 — Android 동일) |
| 이미지 | △ 키별 Android 원본 사용(대체 없음). 원본 해상도 70~100px라 상세 헤더에서 흐림 — 고해상도 소스 없음 |
| iOS 상태바 · 키보드 · 아이콘 · 스플래시 | ⛔ 미개발 (프로젝트 중단) |
| iOS 입력칸 확대 (입력 글자 14px) | 미확인 — iOS 미개발로 확인하지 않음 |

---

## 5. 검증 (2026-11-15, 리뷰 수정 반영 후)

| 항목 | 결과 |
|---|---|
| `npx tsc --noEmit` | 에러 0 |
| `npm run build` | 성공 (JS 384KB / gzip 125KB) |
| Playwright 검증 7종 (체험·후기 / 알림·채팅 / 검색·찜 / 모임 만들기 / 홈 / 상세 탭 / 동네 선택) | 118/118 |
| Playwright 리뷰 수정 검증 (`verify_fixes`: 세션 복원·스크롤·IME·가입 이력·KST 새벽 날짜·채팅·추천 모임·상세·하단 탭·문구·폰트) | 63/63 |
| `qa.mjs` | 26/26 |
| `qa_detail.mjs` | 42/42 |
| 콘솔 error/warning | 0건 (React Router Future Flag 제외) |
| TODO/FIXME · `.skip`/`.only` · `console.log` | 0건 |

**미검증**: Chromium 모바일 뷰포트에서만 실행. Safari/WebKit · iOS 기기 · 실제 한글 IME 키보드 미검증 (IME는 `isComposing` 이벤트로 시뮬레이션).

---

## 6. 남은 작업

- iOS(P7·P8)는 프로젝트 중단으로 진행하지 않음.
- **Android 정합 (선택)** — 다가오는 정기모임 카드 → 모임 상세 이동 (`ScheduleItem`에 meetingId 추가 필요).
- 모임 사진 고해상도 원본 확보 시 교체 (현재 Android drawable 70~100px).

---

## 7. 2026-11-15 리뷰 수정 내역

| 구분 | 내용 |
|---|---|
| 기능 | 새로고침 로그아웃(세션 복원) · 화면 전환 스크롤(새 화면 맨 위/뒤로 복원) · 한글 조합 중 Enter 전송 · 약관 동의 후 이메일 화면 경유(비밀번호 메모리 전달) · UTC 날짜 · 빈 채팅방 · iOS 입력 확대 CSS |
| 디자인 | 모임 상세 재구성 · 추천 모임 · 하단 4탭 플로팅 · MY 탭 활성 표시 · 채팅 말풍선 |
| 문구 | 로그인 실패 · 비밀번호 확인 라벨/hint/오류 · 게스트 MY 토스트 · 체험 탭 제목 · 공지 탭명 |
| 기타 | 하트 Enter 전파 · PostChat 게스트 전송/폭 · 시드 질문 키 · `hiking_group3` 키 누락 · 약관 시트 a11y 경고 · Pretendard 로드 · `text-tiny`·`crownGold` 토큰 |


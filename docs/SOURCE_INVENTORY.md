# SOURCE_INVENTORY — Android 원본 + 디자인 자산 전체 목록 (강제 체크리스트)

> ⚠️ **모든 화면 감사/구현 시 이 문서의 해당 섹션을 처음부터 끝까지 Read한 뒤에만 시작.**
> 한 파일이라도 건너뛰고 진단하면 누락 → 사후 수정 사이클 → 사용자 분노. 절대 금지.
>
> 사용법: 작업 시작 전 해당 Phase의 모든 파일을 Read 도구로 직접 읽고, 본문에 체크 ✅ 표시.
> 새 Phase 시작 시 체크 박스 모두 리셋 (다른 화면이라 다시 봐야 함).

---

## 0. 외부 문서 (모든 Phase 공통, 최초 1회)

- [ ] `/Users/heebiny/AndroidStudioProjects/FitPle/docs/login_signup_flow.md` — 인증 흐름 다이어그램 (SPEC §11 미러)
- [ ] `/Users/heebiny/AndroidStudioProjects/FitPle/REACT_WEB_PLAN.md` — Phase 정의 (외부 계획서)
- [ ] `/Users/heebiny/AndroidStudioProjects/FitPle/designs/UI_QA_REPORT.md` — 디자인 QA 리포트
- [ ] `/Users/heebiny/fitple-app/CLAUDE.md` — AI 에이전트 하우스 룰 10개
- [ ] `/Users/heebiny/fitple-app/CONTRIBUTING.md` — 브랜치/협업 규칙
- [ ] `/Users/heebiny/fitple-app/SPEC.md` (필요 섹션만 grep) — 풀스펙
- [ ] `/Users/heebiny/fitple-app/docs/DESIGN_IMPLEMENTATION_GUIDE.md` — **함정 카탈로그 33+개**
- [ ] `/Users/heebiny/fitple-app/docs/IMPLEMENTATION_AUDIT.md` — 직전 감사 결과
- [ ] `/Users/heebiny/fitple-app/docs/FLOWS.md` — 홈 진입 3흐름 매핑

## 1. 공용 리소스 (모든 Phase 공통, 최초 1회)

### Android values (반드시 풀 Read)
- [ ] `app/src/main/res/values/colors.xml` — 모든 색 토큰
- [ ] `app/src/main/res/values/dimens.xml` — 모든 간격/크기 (corner_*/stroke_*/spacing_*/text_*/icon_*/page_margin/card_preview_* 등)
- [ ] `app/src/main/res/values/strings.xml` — 모든 한글 텍스트의 단일 출처
- [ ] `app/src/main/res/values/themes.xml` — 폰트 family / 글로벌 스타일

### Android 진입점 (라우팅·스플래시)
- [ ] `app/src/main/java/com/example/fitple/MainActivity.kt` (39행)
- [ ] `app/src/main/java/com/example/fitple/FitpleMainActivity.kt` (193행)
- [ ] `app/src/main/res/layout/activity_fitple_main.xml`
- [ ] `app/src/main/res/layout/activity_main.xml`

### Android 데이터 모델/저장소
- [ ] `app/src/main/java/com/example/fitple/data/UserManager.kt` (222행)
- [ ] `app/src/main/java/com/example/fitple/data/model/UserProfile.kt`
- [ ] `app/src/main/java/com/example/fitple/data/model/Meeting.kt`
- [ ] `app/src/main/java/com/example/fitple/data/model/ScheduleItem.kt`
- [ ] `app/src/main/java/com/example/fitple/data/model/ChatMessage.kt`
- [ ] `app/src/main/java/com/example/fitple/data/model/Review.kt`

### React 토큰/구조 (대조 기준)
- [ ] `/Users/heebiny/fitple-app/tailwind.config.ts` — 모든 토큰
- [ ] `/Users/heebiny/fitple-app/src/index.css` — 글로벌 유틸리티
- [ ] `/Users/heebiny/fitple-app/src/constants/sports.ts` — 5종목 카탈로그
- [ ] `/Users/heebiny/fitple-app/src/storage/userManager.ts` — 세션 API
- [ ] `/Users/heebiny/fitple-app/src/storage/seedRunner.ts` — 시드

---

## 2. Phase 2~3 — 인증 화면 (Login + Signup + Splash)

### Android Kotlin (전부 풀 Read — sed/head 금지)
- [ ] `ui/auth/LoginFragment.kt` (187행)
- [ ] `ui/auth/EmailLoginFragment.kt` (256행)
- [ ] `ui/auth/SignupEmailFragment.kt` (216행)
- [ ] `ui/auth/SignupPasswordFragment.kt` (233행)
- [ ] `ui/auth/SignupNicknameFragment.kt` (160행)
- [ ] `ui/auth/SignupPreferenceFragment.kt` (493행 ⚠️ 가장 큼)
- [ ] `ui/auth/SignupCompleteFragment.kt` (46행)
- [ ] `ui/auth/TermsBottomSheetFragment.kt` (135행)

### Android layout XML
- [ ] `res/layout/fragment_login.xml`
- [ ] `res/layout/fragment_email_login.xml`
- [ ] `res/layout/fragment_signup_email.xml`
- [ ] `res/layout/fragment_signup_password.xml`
- [ ] `res/layout/fragment_signup_nickname.xml`
- [ ] `res/layout/fragment_signup_preference.xml`
- [ ] `res/layout/fragment_signup_complete.xml`
- [ ] `res/layout/layout_bottom_sheet_terms.xml`
- [ ] `res/layout/layout_toolbar_signup.xml`
- [ ] `res/layout/layout_toolbar_signup_password.xml`
- [ ] `res/layout/layout_toolbar_preference.xml`
- [ ] `res/layout/layout_toolbar_email_login.xml`
- [ ] `res/layout/layout_input_email.xml`
- [ ] `res/layout/layout_input_password.xml`

### Android drawable (인증 영역 — 각 background/icon 그대로 의미가 있음)
- [ ] `bg_input_box.xml` / `bg_input_box_default.xml` / `bg_input_box_active.xml` / `bg_input_box_valid.xml` / `bg_input_box_error.xml` / `bg_input_underline.xml`
- [ ] `bg_btn_kakao.xml` / `bg_btn_apple.xml` / `bg_btn_google.xml` / `bg_btn_email.xml`
- [ ] `bg_btn_primary.xml` / `bg_btn_outline.xml`
- [ ] `bg_bottom_sheet.xml`
- [ ] `bg_chip_selected.xml` / `bg_chip_unselected.xml`
- [ ] `bg_sport_selected.xml` / `bg_sport_selected_light.xml` / `bg_sport_unselected.xml` / `bg_sport_icon.xml`
- [ ] `bg_review_card.xml` / `bg_review_gradient.xml`
- [ ] `ic_back.xml` / `ic_clear.xml` / `ic_check_circle.xml` / `ic_check_white.xml` / `ic_warning.xml` / `ic_arrow_right.xml`
- [ ] `ic_checkbox_checked.xml` / `ic_checkbox_unchecked.xml` / `checkbox_button_selector.xml`
- [ ] `ic_kakao.xml` / `ic_apple.xml` / `ic_google.xml` / `ic_email.xml`

### designs/ PNG (auth 영역 — 모두 Read 도구로 직접 봐)
- [ ] `sign_splash_login_emaillogin.png` ⚠️ **스플래시 + 로그인 + 이메일 로그인 3-in-1**
- [ ] `sign_emaillogin_input_states.png` — EmailLogin 4상태
- [ ] `sign_signup_email_states.png` — SignupEmail 4상태
- [ ] `sign_signup_password_states.png` — SignupPassword 4상태
- [ ] `sign_signup_password_active.png` — SignupPassword 활성 상태
- [ ] `sign_signup_nickname_states.png` — SignupNickname 4상태
- [ ] `sign_signup_terms_bottomsheet.png` — Terms 모달
- [ ] `sign_signup_preference_running.png` — Preference (러닝) SELECTION+DETAIL
- [ ] `sign_signup_preference_futssal_cycle_mountain_golf.png` — Preference 4종목 DETAIL
- [ ] `sign_signup_preference_golf_extended.png` — Preference 골프 확장
- [ ] `sign_signup_preference_with_skip.png` — Preference "건너뛰기" 상태
- [ ] `sign_signup_preference_cycle_complete_card.png` — 가입완료 + 카드

### React 대상 코드 (현 상태 대조)
- [ ] `src/screens/SplashScreen.tsx`
- [ ] `src/screens/auth/LoginScreen.tsx`
- [ ] `src/screens/auth/EmailLoginScreen.tsx`
- [ ] `src/screens/auth/SignupEmailScreen.tsx`
- [ ] `src/screens/auth/SignupPasswordScreen.tsx`
- [ ] `src/screens/auth/SignupNicknameScreen.tsx`
- [ ] `src/screens/auth/SignupPreferenceScreen.tsx`
- [ ] `src/screens/auth/SignupCompleteScreen.tsx`
- [ ] `src/components/auth/TermsBottomSheet.tsx`
- [ ] `src/components/auth/EmailSuggestions.tsx`
- [ ] `src/components/auth/SignupToolbar.tsx`
- [ ] `src/components/icons/index.tsx` — Android ic_* 인라인 SVG
- [ ] `src/store/preferenceStore.ts` — SELECTION/DETAIL 상태 머신
- [ ] `src/store/authStore.ts`
- [ ] `src/routes/AppRoutes.tsx`
- [ ] `src/routes/RequireAuth.tsx`
- [ ] `src/components/layout/MobileFrame.tsx`
- [ ] `src/components/layout/MainLayout.tsx`
- [ ] `src/components/layout/BottomNav.tsx`

---

## 3. Phase 4 — 홈 영역 (HomeScreen + 부속)

### Android Kotlin (큰 파일 주의)
- [ ] `ui/home/HomeFragment.kt` (577행 ⚠️ 가장 큼)
- [ ] `ui/home/GuestHomeFragment.kt` (380행)
- [ ] `ui/home/ExerciseFragment.kt` (148행)
- [ ] `ui/home/RecommendedGroupFragment.kt` (187행)
- [ ] `ui/home/UpcomingMeetingFragment.kt` (223행)
- [ ] `ui/home/PostDetailFragment.kt` (333행)
- [ ] `ui/home/PostChatFragment.kt` (128행)

### Android layout XML
- [ ] `fragment_home.xml`
- [ ] `fragment_guest_home.xml`
- [ ] `fragment_exercise.xml`
- [ ] `fragment_recommended_group.xml`
- [ ] `fragment_upcoming_meeting.xml`
- [ ] `fragment_post_detail.xml`
- [ ] `fragment_post_chat.xml`

### Android item layout (RecyclerView 어댑터 행 — 카드 디자인의 단일 출처)
- [ ] `item_meeting_card.xml` — 모임 카드
- [ ] `item_trial_card.xml` — 체험 카드
- [ ] `item_review_card.xml` — 후기 카드
- [ ] `item_group_list.xml` — 모임 리스트 행
- [ ] `item_schedule.xml` — 일정 행
- [ ] `item_upcoming_card.xml` — 다가오는 모임 카드
- [ ] `item_date_strip.xml` — 날짜 스트립
- [ ] `item_chat_message.xml` / `item_chat_message_me.xml` — 채팅 버블
- [ ] `item_notice_card.xml` — 공지 카드

### Android drawable (홈/카드 영역)
- [ ] `bg_avatar_circle.xml`
- [ ] `bg_badge_activity.xml` / `_pill.xml` / `_time.xml`
- [ ] `bg_badge_dark.xml` / `bg_badge_level.xml` / `bg_badge_notice.xml`
- [ ] `bg_badge_sport.xml` / `_pill.xml` / `_light.xml`
- [ ] `bg_badge_white.xml`
- [ ] `bg_bottom_nav.xml`
- [ ] `bg_btn_apply.xml`
- [ ] `bg_card_default.xml`
- [ ] `bg_date_selected.xml`
- [ ] `bg_filter_chip_selected.xml` / `_unselected.xml`
- [ ] `bg_hero_btn.xml` / `bg_hero_card.xml`
- [ ] `bg_img_rounded.xml`
- [ ] `bg_notice_banner.xml`
- [ ] `bg_search_bar.xml`
- [ ] `bg_trial_card.xml`
- [ ] `bg_week_day_selected.xml`
- [ ] `ic_add.xml` / `ic_bell.xml` / `ic_chevron_down.xml` / `ic_edit.xml`
- [ ] `ic_heart.xml` / `ic_location_pin.xml` / `ic_people.xml` / `ic_search.xml`
- [ ] `ic_send.xml` / `ic_share.xml`
- [ ] `ic_nav_home.xml` / `ic_nav_exercise.xml` / `ic_nav_explore.xml` / `ic_nav_chat.xml` / `ic_nav_my.xml`

### designs/ PNG (홈/디테일/카드)
- [ ] `home_main_postdetail_share_chat.png` — 홈 메인 + 디테일 공유 채팅
- [ ] `home_postdetail_chat_groups_upcoming.png` — 디테일 채팅 그룹 다가오는
- [ ] `home_postdetail_noticelist_tab.png` / `_tab2.png` — 공지 리스트 탭
- [ ] `home_postdetail_noticelist_chattab.png` — 공지 + 채팅 탭
- [ ] `home_postdetail_participant_home.png` — 참가자 홈
- [ ] `home_bottom_banner_schedule.png` — 하단 배너 일정
- [ ] `home_full_scroll_chatroom.png` — 풀스크롤 채팅방
- [ ] `home_recommended_group_list.png` — 추천 모임 리스트
- [ ] `home_review_billboard_cards.png` — 후기 빌보드 카드
- [ ] `home_trial_card_detail_apply.png` — 체험 카드 디테일 신청
- [ ] `home_section2_overview_sitemap.png` — 섹션 오버뷰 사이트맵

### designs/ 아이콘 PNG
- [ ] `ic_banner_schedule_illust.png`
- [ ] `ic_bell_filled.png`
- [ ] `ic_chat_bubble.png` / `ic_chat_filled.png`
- [ ] `ic_crown_blue.png` / `ic_crown_gold.png`
- [ ] `ic_location_pin_filled.png`
- [ ] `ic_logo_bolt.png` ⚠️ **로고/스플래시용**
- [ ] `ic_profile_user.png`
- [ ] `ic_search_filled.png`
- [ ] `ic_trial_ticket.png`

### designs/ 모임 사진
- [ ] `img_meeting_cycling_group1.png` ~ `cycling_group2.png`
- [ ] `img_meeting_futsal_field1.png`
- [ ] `img_meeting_golf_field1.png`
- [ ] `img_meeting_group_photo1.png`
- [ ] `img_meeting_hiking_group1.png` ~ `hiking_group4.png` + `hiking_winter.png`
- [ ] `img_meeting_outdoor_winter.png`
- [ ] `img_meeting_running_beach.png` / `running_group1.png` / `running_night.png` / `running_track.png`
- [ ] `img_trial_cycling_group.png` / `img_trial_hiking_group1.png` / `img_trial_hiking_group2.png`
- [ ] `img_profile_default.png` / `img_profile_sample1.png`

### React 대상 코드 (현 상태 대조)
- [ ] `src/screens/main/HomeScreen.tsx`
- [ ] `src/screens/main/ExerciseScreen.tsx`
- [ ] `src/screens/main/RecommendedGroupScreen.tsx`
- (UpcomingMeetingScreen / PostDetailScreen / PostChatScreen — 아직 미구현)
- [ ] `src/data/models.ts` — Meeting/Review/ScheduleItem 타입
- [ ] `src/data/seedData.ts` — 시드 데이터 (모임 15개 등)

---

## 4. 사용 절차

1. **작업 진입 시**: 위 §0~§1 (공통)을 처음 한 번 모두 Read.
2. **Phase 선택**: §2(인증) 또는 §3(홈) 중 진입하는 Phase의 모든 항목을 Read.
3. **체크 표시**: 본 문서를 Edit 도구로 열어 해당 박스를 `[x]` 로 변경. 다음 작업자/세션이 진행상황 확인 가능.
4. **누락 시 작업 중단**: 한 파일이라도 안 읽었으면 코드 변경 금지. 우선 Read.
5. **새 Phase 시작**: 체크 박스 모두 `[ ]` 로 리셋.

## 5. 누락 시 부작용 (실제 발생한 사례)

- ❌ `sign_splash_login_emaillogin.png` 미확인 → 스플래시 화면 잘못 그림 (작은 텍스트 + 작은 bolt) → 사후 수정
- ❌ `SignupPreferenceFragment.kt` 풀 read 안 함 → 종목 행 클릭 점프 누락 → 사후 수정
- ❌ `LoginFragment.kt` 풀 read 안 함 → 가입 중단 재개 다이얼로그 누락 → 사후 수정
- ❌ `FitpleMainActivity.kt` 미확인 → BottomNav Toast 문구 부정확 → 사후 수정
- ❌ `fragment_signup_complete.xml` 미확인 → "어떤 모임이 있을까?" 섹션 + carousel 누락 → 사후 수정
- ❌ `dimens.xml` 의 `card_preview_height=160dp` 미확인 → 카드 비율 망함 → 사후 수정
- ❌ `dimens.xml` 의 `corner_sm=8dp` 미확인 → 입력 박스 모서리 12px (잘못) → 사후 수정

위 모두 **인벤토리에 있는 파일을 안 읽어서** 발생. 본 문서를 따르면 발생 안 함.

---

**이 인벤토리는 `DESIGN_IMPLEMENTATION_GUIDE.md` 의 §1 체크리스트보다 상위에 있음.**
해당 화면 작업 시 본 인벤토리의 모든 박스가 ✅ 인 상태가 아니면 작업 시작 금지.

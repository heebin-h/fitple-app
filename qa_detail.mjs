import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const SS = '/private/tmp/claude-501/-Users-heebiny-fitple-app/630af659-6a9e-4145-a390-22cd1518d0e0/scratchpad/detail';
const VIEWPORT = { width: 430, height: 932 };

const issues = [];
const ok   = (m) => console.log('✅ ' + m);
const flag = (m) => { console.log('⚠️  ' + m); issues.push(m); };
const info = (m) => console.log('   ℹ️  ' + m);

const browser = await chromium.launch({ headless: true });
const ctx  = await browser.newContext({ viewport: VIEWPORT });
const page = await ctx.newPage();
page.setDefaultTimeout(15000);

// mkdir
import { mkdirSync } from 'fs';
mkdirSync(SS, { recursive: true });

const shot = (name) => page.screenshot({ path: `${SS}/${name}` });

// ── 부트스트랩: 로그인 ──────────────────────────────────────────────────────
console.log('\n=== 부트 & 로그인 ===');
await page.goto(BASE);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForURL('**/login', { timeout: 15000 });
await page.waitForLoadState('networkidle');

await page.getByText('이메일로 시작하기').click();
await page.waitForURL('**/email-login');
await page.locator('input').first().fill('demo@fitple.app');
await page.locator('input').nth(1).fill('demo1234');
await page.getByRole('button', { name: '로그인' }).click();
await page.waitForURL('**/home', { timeout: 10000 });
await page.waitForLoadState('networkidle');
ok('로그인 → /home');

// ── A. PostDetailScreen — 탭 컨텐츠 ────────────────────────────────────────
console.log('\n=== A. 모임 상세 — 탭 컨텐츠 ===');

// 첫 번째 모임 카드 진입
await page.locator('button.flex.w-full.items-start').first().click();
await page.waitForURL('**/meeting/**');
await page.waitForLoadState('networkidle');
await shot('A01_detail_home_tab.png');

// ─ A1. 홈 탭 컨텐츠 ─
const homeTabContent = await page.locator('body').textContent();
homeTabContent?.includes('기본정보') ? ok('A1: 홈 탭 — "기본정보" 카드 렌더링') : flag('A1: 홈 탭 기본정보 없음');
homeTabContent?.includes('운영진 공지') ? ok('A1: 홈 탭 — "운영진 공지" 섹션') : flag('A1: 운영진 공지 없음');
homeTabContent?.includes('정기모임시간') ? ok('A1: 홈 탭 — 정기모임시간 필드') : flag('A1: 정기모임시간 없음');
homeTabContent?.includes('장소') ? ok('A1: 홈 탭 — 장소 필드') : flag('A1: 장소 필드 없음');

// ─ A2. 게시판 탭 ─
console.log('\n  [게시판 탭]');
await page.getByText('게시판', { exact: true }).first().click();
await page.waitForTimeout(500);
await shot('A02_detail_board_tab.png');
const boardContent = await page.locator('body').textContent();
// 게시판은 seedData에 없을 수 있음 — 렌더링 자체가 안 깨지는지 확인
const boardCrashed = await page.locator('text=문제가 발생했어요').isVisible().catch(() => false);
boardCrashed ? flag('A2: 게시판 탭 — ErrorBoundary 발생') : ok('A2: 게시판 탭 — 에러 없이 렌더링');
info(`게시판 탭 텍스트 스니펫: "${boardContent?.slice(0, 80).replace(/\s+/g, ' ').trim()}"`);

// ─ A3. 채팅 탭 — 메시지 목록 + 전송 ─
console.log('\n  [채팅 탭]');
await page.getByText('채팅', { exact: true }).first().click();
await page.waitForTimeout(500);
await shot('A03_detail_chat_tab_before.png');

// 메시지 목록
const chatContent = await page.locator('body').textContent();
const chatCrashed = await page.locator('text=문제가 발생했어요').isVisible().catch(() => false);
chatCrashed ? flag('A3: 채팅 탭 — ErrorBoundary 발생') : ok('A3: 채팅 탭 — 에러 없이 렌더링');

// 기존 메시지 있는지 (seedData)
const msgLocator = page.locator('[class*="chat"], [class*="message"], [class*="bubble"]');
const msgCount = await msgLocator.count();
msgCount > 0
  ? ok(`A3: 채팅 메시지 ${msgCount}개 DOM 존재`)
  : info('A3: 채팅 메시지 DOM 요소 미탐지 (class명 다를 수 있음)');

// 입력창 확인
const chatInput = page.locator('input[placeholder*="메시지"], textarea[placeholder*="메시지"]');
const chatInputVisible = await chatInput.isVisible().catch(() => false);
chatInputVisible ? ok('A3: 채팅 입력창 표시') : flag('A3: 채팅 입력창 없음');

// 메시지 전송
if (chatInputVisible) {
  await chatInput.fill('테스트 메시지 — QA 자동화');
  await shot('A04_detail_chat_typed.png');

  const sendBtn = page.locator('button[aria-label*="전송"], button[type="submit"]').last();
  const sendVisible = await sendBtn.isVisible().catch(() => false);
  if (sendVisible) {
    await sendBtn.click();
    await page.waitForTimeout(600);
    await shot('A05_detail_chat_after_send.png');
    const afterContent = await page.locator('body').textContent();
    afterContent?.includes('테스트 메시지 — QA 자동화')
      ? ok('A3: 메시지 전송 → 목록 반영 확인')
      : flag('A3: 전송 후 메시지 목록 미반영');
  } else {
    // Enter key 전송 시도
    await chatInput.press('Enter');
    await page.waitForTimeout(600);
    await shot('A05_detail_chat_after_send.png');
    const afterContent = await page.locator('body').textContent();
    afterContent?.includes('테스트 메시지 — QA 자동화')
      ? ok('A3: Enter 전송 → 목록 반영')
      : flag('A3: Enter 전송 후 메시지 미반영');
  }
}

// 채팅 fixed 바 레이아웃 — 입력창이 뷰포트 내에 있는지
if (chatInputVisible) {
  const inputBox = await chatInput.boundingBox();
  if (inputBox) {
    inputBox.y + inputBox.height <= VIEWPORT.height + 5
      ? ok(`A3: 채팅 입력바 뷰포트 내 (y=${Math.round(inputBox.y)})`)
      : flag(`A3: 채팅 입력바 뷰포트 벗어남 (y+h=${Math.round(inputBox.y + inputBox.height)} > ${VIEWPORT.height})`);
  }
}

// ─ A4. 사진첩 탭 ─
console.log('\n  [사진첩 탭]');
await page.getByText('사진첩', { exact: true }).first().click();
await page.waitForTimeout(500);
await shot('A06_detail_photo_tab.png');
const photoCrashed = await page.locator('text=문제가 발생했어요').isVisible().catch(() => false);
photoCrashed ? flag('A4: 사진첩 탭 — ErrorBoundary 발생') : ok('A4: 사진첩 탭 — 에러 없이 렌더링');
const photoContent = await page.locator('body').textContent();
info(`사진첩 탭 텍스트: "${photoContent?.slice(0, 80).replace(/\s+/g, ' ').trim()}"`);
// 이미지 존재 여부
const photoImgs = await page.locator('img').count();
info(`사진첩 탭 img 요소: ${photoImgs}개`);

// ─ A5. 멤버 탭 ─
console.log('\n  [멤버 탭]');
await page.getByText('멤버', { exact: true }).first().click();
await page.waitForTimeout(500);
await shot('A07_detail_member_tab.png');
const memberCrashed = await page.locator('text=문제가 발생했어요').isVisible().catch(() => false);
memberCrashed ? flag('A5: 멤버 탭 — ErrorBoundary 발생') : ok('A5: 멤버 탭 — 에러 없이 렌더링');
const memberContent = await page.locator('body').textContent();
info(`멤버 탭 텍스트: "${memberContent?.slice(0, 100).replace(/\s+/g, ' ').trim()}"`);

// ─ A6. 탭 전환 후 홈 탭 복귀 — 참가 버튼/고정 바 정상 여부 ─
console.log('\n  [탭 전환 후 홈 복귀]');
await page.getByText('홈', { exact: true }).first().click();
await page.waitForTimeout(400);
await shot('A08_detail_home_tab_return.png');
const joinOrComplete = await page.getByText('1회 참가하기').isVisible().catch(() => false)
  || await page.getByText('참가 완료').isVisible().catch(() => false);
joinOrComplete ? ok('A6: 홈 탭 복귀 — 참가 버튼 정상') : flag('A6: 홈 탭 복귀 후 참가 버튼 없음');

// 참가 버튼 fixed 위치 확인
const joinBtn = page.locator('button', { hasText: /1회 참가하기|참가 완료/ }).first();
if (await joinBtn.isVisible().catch(() => false)) {
  const joinBox = await joinBtn.boundingBox();
  if (joinBox) {
    joinBox.y + joinBox.height <= VIEWPORT.height + 5
      ? ok(`A6: 참가 버튼 뷰포트 내 고정 (bottom=${Math.round(VIEWPORT.height - joinBox.y - joinBox.height)}px 여유)`)
      : flag(`A6: 참가 버튼 뷰포트 벗어남`);
  }
}

// ── B. ExploreScreen (추천 모임) 필터 칩 ────────────────────────────────────
console.log('\n=== B. ExploreScreen 필터 칩 ===');
await page.goBack();
await page.waitForTimeout(400);

// 홈으로 가서 러닝 아이콘 클릭
const homeUrl = page.url();
if (!homeUrl.includes('/home')) {
  await page.goBack().catch(() => {});
  await page.waitForTimeout(400);
}
await page.locator('nav').getByText('홈').click().catch(async () => {
  await page.goto(`${BASE}/home`);
});
await page.waitForURL('**/home');
await page.waitForTimeout(400);

await page.locator('button').filter({ has: page.locator('img[alt="러닝"]') }).click();
await page.waitForURL('**/explore/**');
await page.waitForLoadState('networkidle');
await shot('B01_explore_running.png');

const chips = ['편하게', '평일 오후', '주말'];
for (const chip of chips) {
  const chipEl = page.getByText(chip, { exact: true });
  const visible = await chipEl.isVisible().catch(() => false);
  visible ? ok(`B: 필터 칩 "${chip}" 노출`) : flag(`B: 필터 칩 "${chip}" 없음`);
}

// 칩 클릭 → 필터 동작 (선택 상태 변화)
const firstChip = page.getByText('편하게', { exact: true });
if (await firstChip.isVisible().catch(() => false)) {
  await firstChip.click();
  await page.waitForTimeout(300);
  await shot('B02_explore_chip_selected.png');
  // 선택 후 오렌지 색상 계열 class가 붙는지 (bg-orange 또는 text-orange)
  const chipClass = await firstChip.getAttribute('class').catch(() => '');
  chipClass?.includes('orange') || chipClass?.includes('selected')
    ? ok('B: 칩 선택 → 스타일 변경 확인')
    : info('B: 칩 class에 orange/selected 없음 — 부모 요소에 있을 수 있음');
}

// ── C. UpcomingMeeting 화면 상세 ────────────────────────────────────────────
console.log('\n=== C. UpcomingMeeting 화면 ===');
await page.locator('nav').getByText('홈').click();
await page.waitForURL('**/home');
await page.waitForTimeout(400);

const upcomingMore = page.locator('a[href="/upcoming"], button').filter({ hasText: '더보기' }).last();
if (await upcomingMore.isVisible().catch(() => false)) {
  await upcomingMore.click();
  await page.waitForURL('**/upcoming', { timeout: 8000 });
  await page.waitForLoadState('networkidle');
  await shot('C01_upcoming_full.png');
  await page.screenshot({ path: `${SS}/C01_upcoming_fullpage.png`, fullPage: true });

  const upcomingContent = await page.locator('body').textContent();
  upcomingContent?.includes('다가오는 정기모임') ? ok('C: 타이틀 "다가오는 정기모임"') : flag('C: 타이틀 없음');
  const scheduleItems = await page.locator('button.flex.w-full.items-start, [class*="card"], [class*="item"]').count();
  info(`C: 렌더링된 아이템 요소 수: ${scheduleItems}개`);
  const upcomingCrash = await page.locator('text=문제가 발생했어요').isVisible().catch(() => false);
  upcomingCrash ? flag('C: UpcomingMeeting ErrorBoundary') : ok('C: 에러 없이 렌더링');
} else {
  flag('C: "다가오는 정기모임 더보기" 링크 없음');
}

// ── D. 회원가입 플로우 ───────────────────────────────────────────────────────
console.log('\n=== D. 회원가입 플로우 ===');
// 로그아웃 후 새 계정으로 가입
await page.locator('nav').getByText('MY').click().catch(() => {});
await page.waitForURL('**/my').catch(() => {});
await page.getByText('로그아웃').click().catch(async () => {
  await page.goto(`${BASE}/login`);
});
await page.waitForURL('**/login').catch(() => {});
await page.waitForLoadState('networkidle');

// D1. 이메일 입력
await page.getByText('회원가입', { exact: true }).first().click();
await page.waitForURL('**/signup/email').catch(() => page.waitForTimeout(1000));
await shot('D01_signup_email.png');
const d1Crash = await page.locator('text=문제가 발생했어요').isVisible().catch(() => false);
d1Crash ? flag('D1: 회원가입 이메일 화면 ErrorBoundary') : ok('D1: 이메일 화면 렌더링');

const emailInput = page.locator('input[type="email"], input[placeholder*="이메일"]').first();
const emailVisible = await emailInput.isVisible().catch(() => false);
emailVisible ? ok('D1: 이메일 입력창 표시') : flag('D1: 이메일 입력창 없음');

if (emailVisible) {
  // 유효하지 않은 이메일 → 다음 버튼 비활성
  await emailInput.fill('notvalid');
  await page.waitForTimeout(200);
  const nextBtn = page.getByRole('button', { name: '다음' });
  const disabled = await nextBtn.isDisabled().catch(() => false);
  disabled ? ok('D1: 유효하지 않은 이메일 → 다음 버튼 비활성') : flag('D1: 잘못된 이메일에도 다음 버튼 활성');

  // 유효한 이메일 → 활성
  await emailInput.clear();
  await emailInput.fill('qa_test_' + Date.now() + '@test.com');
  await page.waitForTimeout(300);
  const enabled = await nextBtn.isEnabled().catch(() => false);
  enabled ? ok('D1: 유효 이메일 → 다음 버튼 활성') : flag('D1: 유효 이메일에도 다음 버튼 비활성');
  await shot('D01b_signup_email_valid.png');
  await nextBtn.click();
  await page.waitForURL('**/signup/password').catch(() => page.waitForTimeout(1000));
}

// D2. 비밀번호 입력
await shot('D02_signup_password.png');
const d2Crash = await page.locator('text=문제가 발생했어요').isVisible().catch(() => false);
d2Crash ? flag('D2: 비밀번호 화면 ErrorBoundary') : ok('D2: 비밀번호 화면 렌더링');

const pwInput = page.locator('input[type="password"]').first();
const pwVisible = await pwInput.isVisible().catch(() => false);
if (pwVisible) {
  // 짧은 비밀번호 → 에러
  await pwInput.fill('abc');
  await page.waitForTimeout(300);
  const pwError = await page.locator('text=문자, 숫자 포함 8-20자').isVisible().catch(() => false);
  pwError ? ok('D2: 짧은 비밀번호 → 에러 텍스트') : flag('D2: 비밀번호 에러 텍스트 미표시');

  // 유효한 비밀번호
  await pwInput.clear();
  await pwInput.fill('Test1234');
  await page.waitForTimeout(300);
  await shot('D02b_signup_pw_valid.png');

  // 비밀번호 확인
  const pwConfirm = page.locator('input[type="password"]').nth(1);
  if (await pwConfirm.isVisible().catch(() => false)) {
    await pwConfirm.fill('Test1234');
    await page.waitForTimeout(300);
    const nextBtn2 = page.getByRole('button', { name: '다음' });
    const en = await nextBtn2.isEnabled().catch(() => false);
    en ? ok('D2: 비밀번호 일치 → 다음 활성') : flag('D2: 비밀번호 일치인데 다음 비활성');
    await shot('D02c_signup_pw_confirm.png');
    await nextBtn2.click();
    await page.waitForURL('**/signup/nickname').catch(() => page.waitForTimeout(1000));
  }
}

// D3. 닉네임 입력
await shot('D03_signup_nickname.png');
const d3Crash = await page.locator('text=문제가 발생했어요').isVisible().catch(() => false);
d3Crash ? flag('D3: 닉네임 화면 ErrorBoundary') : ok('D3: 닉네임 화면 렌더링');

const nickInput = page.locator('input[type="text"]').first();
if (await nickInput.isVisible().catch(() => false)) {
  // 1글자 → 다음 비활성
  await nickInput.fill('가');
  await page.waitForTimeout(200);
  const nextBtn3 = page.getByRole('button', { name: '다음' });
  const dis = await nextBtn3.isDisabled().catch(() => false);
  dis ? ok('D3: 1글자 닉네임 → 다음 비활성') : flag('D3: 1글자 닉네임에도 다음 활성');

  await nickInput.clear();
  await nickInput.fill('QA테스터');
  await page.waitForTimeout(300);
  await shot('D03b_signup_nick_valid.png');
  const en3 = await nextBtn3.isEnabled().catch(() => false);
  en3 ? ok('D3: 유효 닉네임 → 다음 활성') : flag('D3: 유효 닉네임인데 다음 비활성');
  await nextBtn3.click();
  await page.waitForTimeout(600);
}

// D4. 약관 바텀시트
await shot('D04_signup_terms_sheet.png');
// 약관 시트: 실제 텍스트는 "약관동의", 전체동의는 "모두 동의합니다."
const termsVisible = await page.getByText('약관동의').isVisible().catch(() => false);
termsVisible ? ok('D4: 약관 바텀시트 오픈') : flag('D4: 약관 바텀시트 미오픈');

if (termsVisible) {
  await shot('D04_terms_open.png');
  const allAgreeBtn = page.getByText('모두 동의합니다', { exact: false });
  if (await allAgreeBtn.isVisible().catch(() => false)) {
    await allAgreeBtn.click();
    await page.waitForTimeout(400);
    await shot('D04b_signup_terms_all_agreed.png');
    const confirmBtn = page.getByRole('button', { name: '동의하고 가입하기' });
    const confirmEnabled = await confirmBtn.isEnabled().catch(() => false);
    confirmEnabled ? ok('D4: 전체동의 후 "동의하고 가입하기" 버튼 활성') : flag('D4: 전체동의 후 버튼 비활성');
    await confirmBtn.click();
    await page.waitForURL('**/signup/preference', { timeout: 8000 });
    ok('D4: 약관 동의 → /signup/preference 이동');
  } else {
    flag('D4: "모두 동의합니다" 버튼 없음');
  }
}

// D5. 선호운동 화면
await shot('D05_signup_preference.png');
const prefContent = await page.locator('body').textContent();
const prefCrash = await page.locator('text=문제가 발생했어요').isVisible().catch(() => false);
prefCrash ? flag('D5: 선호운동 화면 ErrorBoundary') : ok('D5: 선호운동 화면 렌더링');
prefContent?.includes('거의 다했어요') ? ok('D5: 타이틀 "거의 다했어요" 확인') : flag('D5: 선호운동 타이틀 없음');

// 건너뛰기로 완료
const skipBtn = page.getByText('건너뛰기', { exact: true });
if (await skipBtn.isVisible().catch(() => false)) {
  await skipBtn.click();
  await page.waitForURL('**/signup/complete', { timeout: 8000 }).catch(() => page.waitForTimeout(1500));
  await shot('D06_signup_complete.png');
  const completeCrash = await page.locator('text=문제가 발생했어요').isVisible().catch(() => false);
  completeCrash ? flag('D6: 가입완료 화면 ErrorBoundary') : ok('D6: 가입완료 화면 렌더링');
  const completeContent = await page.locator('body').textContent();
  completeContent?.includes('가입') || completeContent?.includes('완료') || completeContent?.includes('시작')
    ? ok('D6: 가입완료 텍스트 확인')
    : flag('D6: 가입완료 텍스트 없음');
}

// ── E. 로그인 재개 다이얼로그 ────────────────────────────────────────────────
console.log('\n=== E. 재개 다이얼로그 (pending signup) ===');
// pending_signup이 남아있는 상태에서 로그인 화면 재방문 시 다이얼로그 표시
await page.evaluate(() => { localStorage.setItem('pending_signup', 'qa_pending@test.com'); });
await page.goto(`${BASE}/login`);
await page.waitForURL('**/login');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500);
await shot('E01_login_with_pending.png');
const dialogVisible = await page.getByRole('dialog').isVisible().catch(() => false);
const resumeText = await page.getByText('이어서 하기').isVisible().catch(() => false);
dialogVisible || resumeText
  ? ok('E: pending signup → 재개 다이얼로그 표시')
  : flag('E: pending signup 있는데 다이얼로그 미표시');

// ── F. 홈 스크롤 시 BottomNav + 각 고정 요소 위치 ────────────────────────────
console.log('\n=== F. 홈 스크롤 BottomNav 고정 확인 ===');
// E에서 열린 재개 다이얼로그가 있을 수 있으므로 pending 제거 후 reload
await page.evaluate(() => localStorage.removeItem('pending_signup'));
await page.reload();
await page.waitForURL('**/login');
await page.waitForLoadState('networkidle');
await page.getByText('이메일로 시작하기').click();
await page.waitForURL('**/email-login');
await page.locator('input').first().fill('demo@fitple.app');
await page.locator('input').nth(1).fill('demo1234');
await page.getByRole('button', { name: '로그인' }).click();
await page.waitForURL('**/home', { timeout: 10000 });
await page.waitForLoadState('networkidle');

for (const scrollY of [300, 600, 1200, 2000]) {
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.waitForTimeout(300);
  const nav = page.locator('nav').first();
  const navBox = await nav.boundingBox();
  if (navBox) {
    const navBottom = Math.round(navBox.y + navBox.height);
    navBottom <= VIEWPORT.height + 2
      ? ok(`F: scroll=${scrollY}px → BottomNav 고정 (navBottom=${navBottom}px)`)
      : flag(`F: scroll=${scrollY}px → BottomNav 벗어남 (navBottom=${navBottom}px)`);
  }
}
await page.evaluate(() => window.scrollTo(0, 0));
await shot('F01_home_after_scroll_reset.png');

// ── 결과 ──────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════');
if (issues.length === 0) {
  console.log('🎉 상세 QA 전체 통과');
} else {
  console.log(`이슈 ${issues.length}건:`);
  issues.forEach((i, n) => console.log(`  ${n + 1}. ${i}`));
}
console.log(`스크린샷: ${SS}`);
await browser.close();

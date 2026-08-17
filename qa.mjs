import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const SS = '/private/tmp/claude-501/-Users-heebiny-fitple-app/630af659-6a9e-4145-a390-22cd1518d0e0/scratchpad';
const VIEWPORT = { width: 430, height: 932 };

const issues = [];
const ok   = (m) => console.log('✅ ' + m);
const flag = (m) => { console.log('⚠️  ' + m); issues.push(m); };

const browser = await chromium.launch({ headless: true });
const ctx  = await browser.newContext({ viewport: VIEWPORT });
const page = await ctx.newPage();
page.setDefaultTimeout(15000);

// ── 1. 스플래시 → /login (seedIfFirstRun 실행) ─────────────────────────────
await page.goto(BASE);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForURL('**/login', { timeout: 15000 });
await page.waitForLoadState('networkidle');
await page.screenshot({ path: `${SS}/01_login.png` });

await page.getByText('이메일로 시작하기').isVisible().catch(() => false)
  ? ok('로그인 — "이메일로 시작하기" 확인')
  : flag('로그인: 이메일 버튼 없음');
await page.getByText('회원가입 없이 둘러보기').isVisible().catch(() => false)
  ? ok('"회원가입 없이 둘러보기" 확인')
  : flag('"회원가입 없이 둘러보기" 없음');

// ── 2. 이메일 로그인 ────────────────────────────────────────────────────────
await page.getByText('이메일로 시작하기').click();
await page.waitForURL('**/email-login');
await page.waitForLoadState('networkidle');
await page.locator('input').first().fill('demo@fitple.app');
await page.locator('input').nth(1).fill('demo1234');
await page.screenshot({ path: `${SS}/02_email_login.png` });
await page.getByRole('button', { name: '로그인' }).click();
await page.waitForURL('**/home', { timeout: 10000 });
ok('이메일 로그인 → /home');

// ── 3. 홈 화면 ─────────────────────────────────────────────────────────────
await page.waitForLoadState('networkidle');
await page.screenshot({ path: `${SS}/03_home.png` });
await page.screenshot({ path: `${SS}/03_home_full.png`, fullPage: true });

await page.getByText('안녕하세요').first().isVisible().catch(() => false)
  ? ok('홈 Hero 인사 텍스트') : flag('홈 Hero 없음');
await page.getByText('활동 중인 모임').isVisible().catch(() => false)
  ? ok('"활동 중인 모임" 섹션') : flag('"활동 중인 모임" 없음');
await page.getByText('체험 가능 모임').isVisible().catch(() => false)
  ? ok('"체험 가능 모임" 섹션') : flag('"체험 가능 모임" 없음');
await page.getByText('후기').isVisible().catch(() => false)
  ? ok('"후기" 섹션') : flag('"후기" 없음');
await page.getByText('다가오는 정기모임').isVisible().catch(() => false)
  ? ok('"다가오는 정기모임" 섹션') : flag('"다가오는 정기모임" 없음');

// ── 4. BottomNav 스크롤 고정 버그 체크 ─────────────────────────────────────
const nav = page.locator('nav').first();
await nav.isVisible().catch(() => false) ? ok('BottomNav 존재') : flag('BottomNav 없음');

await page.evaluate(() => window.scrollTo(0, 1000));
await page.waitForTimeout(400);
await page.screenshot({ path: `${SS}/04_home_scrolled.png` });
const navBox = await nav.boundingBox();
if (navBox) {
  const navBottom = Math.round(navBox.y + navBox.height);
  navBottom <= VIEWPORT.height + 2
    ? ok(`BottomNav 고정 (bottom=${navBottom}px)`)
    : flag(`BottomNav 스크롤 시 사라짐 — bottom=${navBottom}px vs viewport=${VIEWPORT.height}px`);
}
await page.evaluate(() => window.scrollTo(0, 0));

// ── 5. 종목 아이콘 → 추천 모임 (SPA 이동) ──────────────────────────────────
await page.locator('button').filter({ has: page.locator('img[alt="러닝"]') }).click();
await page.waitForURL('**/explore/**');
await page.screenshot({ path: `${SS}/05_explore.png` });
await page.getByText('편하게').isVisible().catch(() => false)
  ? ok('추천 모임 조건 칩') : flag('조건 칩 없음');

// ── 6. PostDetailScreen (카드 클릭) ────────────────────────────────────────
const firstCard = page.locator('button.flex.w-full.items-start').first();
await firstCard.click();
await page.waitForURL('**/meeting/**');
await page.waitForLoadState('networkidle');
await page.screenshot({ path: `${SS}/06_post_detail.png` });

for (const tab of ['홈', '게시판', '채팅', '사진첩', '멤버']) {
  await page.getByText(tab, { exact: true }).first().isVisible().catch(() => false)
    ? ok(`탭 "${tab}"`) : flag(`탭 "${tab}" 없음`);
}

const joinVisible = await page.getByText('1회 참가하기').isVisible().catch(() => false);
joinVisible ? ok('"1회 참가하기" 확인') : flag('"1회 참가하기" 없음');
if (joinVisible) {
  await page.getByText('1회 참가하기').click();
  await page.waitForTimeout(500);
  await page.getByText('참가 완료').isVisible().catch(() => false)
    ? ok('"참가 완료" 상태 전환') : flag('"참가 완료" 미전환');
}

await page.getByText('채팅', { exact: true }).first().click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${SS}/07_chat.png` });
await page.locator('input[placeholder*="메시지"]').isVisible().catch(() => false)
  ? ok('채팅 입력창') : flag('채팅 입력창 없음');

// ── 7. 운동 화면 (뒤로가기 → BottomNav "운동") ─────────────────────────────
await page.goBack();
await page.waitForTimeout(500);
// PostDetailScreen에서 뒤로 = explore/:sport
await page.goBack();
await page.waitForTimeout(500);
// 홈으로 복귀 or 다른 화면 — BottomNav "운동" 클릭
await page.locator('nav').getByText('운동').click();
await page.waitForURL('**/exercise');
await page.waitForLoadState('networkidle');
await page.screenshot({ path: `${SS}/08_exercise.png` });
const cardCount = await page.locator('button.flex.w-full.items-start').count();
cardCount >= 10 ? ok(`운동 화면 카드 ${cardCount}개`) : flag(`운동 카드 부족: ${cardCount}개`);

// ── 8. 다가오는 정기모임 (/upcoming) ───────────────────────────────────────
// 홈 탭으로 이동 후 "더보기" 클릭
await page.locator('nav').getByText('홈').click();
await page.waitForURL('**/home');
await page.waitForTimeout(400);
// "다가오는 정기모임" 섹션의 더보기 링크 클릭
await page.locator('a[href="/upcoming"], button').filter({ hasText: '더보기' }).last().click();
await page.waitForURL('**/upcoming', { timeout: 8000 });
await page.waitForLoadState('networkidle');
await page.screenshot({ path: `${SS}/09_upcoming.png` });
const upcomingTitle = await page.getByText('다가오는 정기모임').isVisible().catch(() => false);
upcomingTitle ? ok('UpcomingMeeting 화면') : flag('UpcomingMeeting 타이틀 없음');

// ── 9. MY 화면 (BottomNav "MY") ─────────────────────────────────────────────
await page.locator('nav').getByText('MY').click();
await page.waitForURL('**/my');
await page.waitForLoadState('networkidle');
await page.screenshot({ path: `${SS}/10_my.png` });
// authStore currentUser.nickname 확인
const myContent = await page.locator('body').textContent();
myContent?.includes('demo@fitple.app')
  ? ok('MyScreen 이메일 표시')
  : flag('MyScreen 이메일/닉네임 없음');

// ── 10. 로그아웃 → 게스트 모드 ─────────────────────────────────────────────
await page.getByText('로그아웃').click();
await page.waitForURL('**/login');
await page.screenshot({ path: `${SS}/11_login_after_logout.png` });
ok('로그아웃 → /login 리다이렉트');

await page.getByText('회원가입 없이 둘러보기').click();
await page.waitForURL('**/home');
await page.waitForTimeout(500);
await page.screenshot({ path: `${SS}/12_guest_home.png`, fullPage: true });

const guestActive = await page.getByText('활동 중인 모임').isVisible().catch(() => false);
!guestActive
  ? ok('게스트: "활동 중인 모임" 숨김')
  : flag('게스트: "활동 중인 모임" 표시됨 (버그)');
await page.getByText('모임을 둘러보는 중이에요').isVisible().catch(() => false)
  ? ok('게스트 Hero 텍스트') : flag('게스트 Hero 없음');

// 게스트 MY → 리다이렉트
await page.locator('nav').getByText('MY').click();
await page.waitForTimeout(800);
const afterMyUrl = page.url();
afterMyUrl.includes('/my') ? flag('게스트 /my 접근 허용 (버그)') : ok(`게스트 MY 탭 → 차단 (${afterMyUrl.split('/').pop()})`);

// ── 결과 ──────────────────────────────────────────────────────────────────
console.log('\n─────────────────────────────────────────');
if (issues.length === 0) {
  console.log('🎉 전체 통과');
} else {
  console.log(`이슈 ${issues.length}건:`);
  issues.forEach((i, n) => console.log(`  ${n + 1}. ${i}`));
}
await browser.close();

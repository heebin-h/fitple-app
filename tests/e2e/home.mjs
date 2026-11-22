import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:5173';
const fails = [];
const ok = (m) => console.log('OK   ' + m);
const bad = (m) => { console.log('FAIL ' + m); fails.push(m); };
const check = (cond, m) => (cond ? ok(m) : bad(m));

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({ viewport: { width: 430, height: 932 } })).newPage();
page.setDefaultTimeout(10000);
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('getSnapshot')) errors.push(m.text()); });
const toasts = async () => (await page.locator('[role="status"]').allInnerTexts()).join('|');
const headings = async () => (await page.locator('h2').allInnerTexts());
const more = (title) => page.getByRole('heading', { name: title, exact: true }).locator('..').getByRole('button', { name: '더보기' });
const section = (title) => page.getByRole('heading', { name: title, exact: true }).locator('xpath=../..');

async function guestHome() {
  await page.goto(BASE + '/login');
  await page.getByText('회원가입 없이 둘러보기').click();
  await page.waitForURL('**/home');
}
async function expectLogin(action, text, label) {
  await action();
  await page.waitForURL('**/login');
  check((await toasts()).includes(text), `guest ${label} → "${text}" + /login`);
  await guestHome();
}

// ── 게스트
await page.goto(BASE);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForURL('**/login');
await guestHome();
check(JSON.stringify(await headings()) === JSON.stringify(['추천 모임', '체험 가능 모임', '후기', '다가오는 정기모임']), `guest 섹션 순서 ${JSON.stringify(await headings())}`);
check(await page.getByText('로그인하고 다양한 모임에 참여해요!').isVisible(), 'guest hero 문구');
check(await page.getByText(/^\d+월 \d+일\([일월화수목금토]\)$/).isVisible(), 'hero 날짜 "M월 D일(요일)"');
check(await page.getByText(/^\d{4}년 \d+월$/).count() === 0, 'guest: 월 라벨 없음 (XML 제거됨)');
const guestRec = await section('추천 모임').locator('[role="button"] p.truncate.text-body').allInnerTexts();
check(JSON.stringify(guestRec) === JSON.stringify(['싱글벙글 러닝 크루 모집', '동작구 러닝 모임', '한시간 달리는 러닝 크루', '같이 달리자! 동작구 모집!']), 'guest 추천 = guestRecommended g1~g4');
check((await section('추천 모임').locator('[role="button"]').first().innerText()).includes('동작구') &&
      (await section('추천 모임').locator('[role="button"]').first().innerText()).includes('멤버 40명'), 'guest 추천 메타 "위치 | 멤버 n명", 배지 없음');
await expectLogin(() => section('추천 모임').locator('[role="button"]').first().click(), '로그인 후 모임 상세 보기 기능을 사용할 수 있어요', '추천 카드');
await expectLogin(() => section('추천 모임').getByRole('button', { name: '찜하기', exact: true }).first().click(), '로그인 후 찜하기 기능을 사용할 수 있어요', '추천 하트');
await expectLogin(() => page.locator('button', { hasText: '신청하기' }).first().click(), '로그인 후 체험 신청 기능을 사용할 수 있어요', '체험 신청하기');
await expectLogin(() => section('체험 가능 모임').locator('[role="button"]').first().click({ position: { x: 20, y: 20 } }), '로그인 후 모임 상세 보기 기능을 사용할 수 있어요', '체험 카드');
await expectLogin(() => page.getByRole('button', { name: '모임 찾아주기 →' }).click(), '로그인 후 맞춤 모임 추천 기능을 사용할 수 있어요', 'CTA 배너');
await expectLogin(() => page.getByRole('button', { name: '모임 만들기', exact: true }).click(), '로그인 후 모임 만들기 기능을 사용할 수 있어요', 'FAB');
await expectLogin(() => page.getByRole('button', { name: '알림' }).click(), '로그인 후 알림 기능을 사용할 수 있어요', 'bell');
await page.getByRole('button', { name: '로그인하기 →' }).click();
await page.waitForURL('**/login');
ok('guest hero CTA → /login');
await guestHome();
for (const [t, path] of [['추천 모임', '/explore'], ['체험 가능 모임', '/trials'], ['후기', '/reviews'], ['다가오는 정기모임', '/upcoming']]) {
  await more(t).click();
  await page.waitForURL(`**${path}`);
  ok(`guest ${t} 더보기 → ${path}`);
  await page.goBack();
  await page.waitForURL('**/home');
}

// ── 회원
await page.goto(BASE + '/login');
await page.getByText('이메일로 시작하기').click();
await page.waitForURL('**/email-login');
await page.locator('input').first().fill('demo@fitple.app');
await page.locator('input').nth(1).fill('demo1234');
await page.getByRole('button', { name: '로그인' }).click();
await page.waitForURL('**/home');
check(JSON.stringify(await headings()) === JSON.stringify(['추천 모임', '활동 중인 모임', '체험 가능 모임', '후기', '다가오는 정기모임']), `member 섹션 순서 ${JSON.stringify(await headings())}`);
check(await page.getByText(/^안녕하세요 데모유저님!/).isVisible(), 'member hero 인사');
check(await page.getByText(/^\d{4}년 \d+월$/).isVisible(), 'member: 월 라벨 표시');
const rec = await section('추천 모임').locator('[role="button"] p.truncate.text-body').allInnerTexts();
check(JSON.stringify(rec) === JSON.stringify(['나래필라테스 러닝 주말 모임', '하남시 6:6 풋살 매치', '북한산 등산 동호회']), 'member 추천 = homeRecommended 1~3');
const act = await section('활동 중인 모임').locator('[role="button"] p.truncate.text-body').allInnerTexts();
check(JSON.stringify(act) === JSON.stringify(['미사강변 새벽 러닝크루', '주말 골프 모임', '한강 사이클 크루']), 'member 활동 중 = activeMeetings 4~6');
check((await section('활동 중인 모임').locator('[role="button"]').first().innerText()).includes('분전 활동'), 'member 활동 카드 배지 표시');
const schedCount = await page.evaluate(() => JSON.parse(localStorage.getItem('schedules')).length);
check(await page.getByText(/^Level·/).count() === schedCount, `정기모임 전체 ${schedCount}건 표시 (날짜 필터 없음)`);
await section('추천 모임').locator('[role="button"]').first().click();
await page.waitForURL('**/meeting/m-run-2');
ok('member 추천 카드 → 상세');
await page.goBack();
await page.waitForURL('**/home');
await page.getByRole('button', { name: '모임 만들기 →' }).click();
await page.waitForURL('**/create-meeting');
ok('member CTA → /create-meeting');
await page.goBack();
await page.waitForURL('**/home');
await page.getByRole('button', { name: '알림' }).click();
await page.waitForURL('**/notifications');
ok('member bell → /notifications');
await page.goBack();
await page.waitForURL('**/home');
const heroCta = page.getByRole('button', { name: /가입하러 가기 →|일정 바로가기 →/ });
const heroLabel = await heroCta.innerText();
await heroCta.click();
await page.waitForURL(heroLabel.startsWith('가입하러') ? '**/explore' : '**/upcoming');
ok(`member hero CTA "${heroLabel}" → ${page.url().split(':5173')[1]}`);

check(errors.length === 0, `콘솔/페이지 에러 0건 ${errors.length ? JSON.stringify(errors) : ''}`);
await browser.close();
console.log(fails.length ? `\n${fails.length} FAIL` : '\nALL PASS');
process.exit(fails.length ? 1 : 0);

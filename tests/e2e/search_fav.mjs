import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:5173';
import { mkdirSync } from 'node:fs';
const SS = process.env.SS ?? 'test-results/e2e'; // 스크린샷 저장 경로 (gitignore)
mkdirSync(SS, { recursive: true });
if (!SS) { console.error('SS env required'); process.exit(2); }

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
const hearts = () => page.getByRole('button', { name: '찜하기', exact: true });

// ── 회원 로그인 (UI 이동만 — 새로고침 시 데모 로그인 풀림)
await page.goto(BASE);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForURL('**/login');
await page.getByText('이메일로 시작하기').click();
await page.waitForURL('**/email-login');
await page.locator('input').first().fill('demo@fitple.app');
await page.locator('input').nth(1).fill('demo1234');
await page.getByRole('button', { name: '로그인' }).click();
await page.waitForURL('**/home');

// 홈 검색창 → /search, 자동 포커스
await page.getByText('찾고싶은 모임이 있나요?').click();
await page.waitForURL('**/search');
check(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')) === '모임 검색', '/search: 입력창 자동 포커스');
check(await hearts().count() === 0 && !(await page.getByText('검색 결과가 없어요').isVisible()), '빈 검색어: 결과·빈 문구 없음');

const input = page.getByLabel('모임 검색');
await input.fill('등산');
const titles = await page.locator('[role="button"] p.truncate.text-body-strong').allInnerTexts();
const expected = await page.evaluate(() => JSON.parse(localStorage.getItem('meetings')).filter((m) => m.title.toLowerCase().includes('등산')).map((m) => m.title));
check(JSON.stringify(titles) === JSON.stringify(expected) && titles.length > 0, `"등산" 결과 ${titles.length}건 = 기대 ${expected.length}건`);
await page.screenshot({ path: `${SS}/v_search.png` });

await input.fill('  FC  ');
check(await page.locator('[role="button"] p.truncate.text-body-strong').count() === 0 && await page.getByText('검색 결과가 없어요').isVisible(), '"  FC  " (trim, 매칭 없음) → "검색 결과가 없어요"');
await input.fill('');
check(!(await page.getByText('검색 결과가 없어요').isVisible()), '다시 빈 검색어 → 빈 문구 숨김');

// 찜 토글 (검색 결과)
await input.fill('골프');
const firstId = await page.evaluate(() => JSON.parse(localStorage.getItem('meetings')).find((m) => m.title.includes('골프')).id);
await hearts().first().click();
await page.waitForTimeout(200);
check(await hearts().first().getAttribute('aria-pressed') === 'true', '하트 탭 → 찜 상태');
check(page.url().endsWith('/search'), '하트 탭은 상세로 이동하지 않음 (전파 차단)');
const stored = await page.evaluate(async () => {
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith('user:')) { const u = JSON.parse(localStorage.getItem(k)); if (u.email === 'demo@fitple.app') return u.favoriteMeetingIds; }
  }
  return null;
});
check(Array.isArray(stored) && stored.includes(firstId), `저장: favoriteMeetingIds = ${JSON.stringify(stored)}`);
await page.screenshot({ path: `${SS}/v_search_fav.png` });

// 행 탭 → 상세
await page.locator('[role="button"]', { hasText: '골프' }).first().click();
await page.waitForURL(`**/meeting/${firstId}`);
ok('결과 행 탭 → 모임 상세');
await page.goBack();
await page.waitForURL('**/search');

// 홈 MeetingCard 하트도 같은 상태 공유
await page.goBack();
await page.waitForURL('**/home');
await page.locator('nav').getByText('체험', { exact: true }).click();
await page.waitForURL('**/exercise');
const exHeart = page.locator('[role="button"]', { hasText: '주말 골프 모임' }).first().getByRole('button', { name: '찜하기', exact: true });
await page.waitForTimeout(200);
check(await exHeart.getAttribute('aria-pressed') === 'true', '운동 탭 MeetingCard 하트도 찜 상태 반영');
await exHeart.click();
await page.waitForTimeout(200);
check(await exHeart.getAttribute('aria-pressed') === 'false', '운동 탭에서 찜 해제');
check(page.url().endsWith('/exercise'), 'MeetingCard 하트 탭은 상세로 이동하지 않음');
await page.locator('[role="button"]', { hasText: '주말 골프 모임' }).first().click();
await page.waitForURL('**/meeting/**');
ok('MeetingCard 본문 탭 → 상세 (role=button 전환 회귀 없음)');

// Upcoming 검색 아이콘
await page.goBack();
await page.locator('nav').getByText('홈').click();
await page.waitForURL('**/home');
await page.getByRole('heading', { name: '다가오는 정기모임' }).locator('..').getByRole('button', { name: '더보기' }).click();
await page.waitForURL('**/upcoming');
await page.locator('button:has(svg.lucide-search)').first().click();
await page.waitForURL('**/search');
ok('/upcoming 검색 아이콘 → /search');

// 게스트: 하트 무반응, 검색 가능
await page.evaluate(() => localStorage.removeItem('current_user'));
await page.goto(BASE + '/login');
await page.getByText('회원가입 없이 둘러보기').click();
await page.waitForURL('**/home');
await page.getByText('찾고싶은 모임이 있나요?').click();
await page.waitForURL('**/search');
await page.getByLabel('모임 검색').fill('골프');
await hearts().first().click();
await page.waitForTimeout(200);
check(await hearts().first().getAttribute('aria-pressed') === 'false' && page.url().endsWith('/search'), 'guest: 하트 무반응 (Android 동일)');

check(errors.length === 0, `콘솔/페이지 에러 0건 ${errors.length ? JSON.stringify(errors) : ''}`);
await browser.close();
console.log(fails.length ? `\n${fails.length} FAIL` : '\nALL PASS');
process.exit(fails.length ? 1 : 0);

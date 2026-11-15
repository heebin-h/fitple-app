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
page.setDefaultTimeout(15000);
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

// fresh seed + login
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
await page.waitForTimeout(400); // SPA 전환 — networkidle은 Chrome이 보류한 웹폰트 조각 요청 때문에 끝나지 않음

// Home trial section
const trialHeader = page.getByRole('heading', { name: '체험 가능 모임' });
await trialHeader.scrollIntoViewIfNeeded();
await page.screenshot({ path: `${SS}/v_home_trial.png` });
check(await page.locator('button', { hasText: '신청하기' }).count() === 3, 'home: 체험 카드 3개 (신청하기 3)');
const reviewHeader = page.getByRole('heading', { name: '후기', exact: true });
await reviewHeader.scrollIntoViewIfNeeded();
await page.screenshot({ path: `${SS}/v_home_review.png` });

// 체험 더보기 → /trials
await trialHeader.locator('..').getByRole('button', { name: '더보기' }).click();
await page.waitForURL('**/trials');
await page.waitForTimeout(400); // SPA 전환 — networkidle은 Chrome이 보류한 웹폰트 조각 요청 때문에 끝나지 않음
check(await page.getByRole('heading', { name: '체험 가능한 모임' }).isVisible(), '/trials: 타이틀');
check(await page.locator('button', { hasText: '신청하기' }).count() === 3, '/trials: 카드 3개');
await page.screenshot({ path: `${SS}/v_trials.png`, fullPage: true });

// 신청하기 → 상세
await page.locator('button', { hasText: '신청하기' }).nth(1).click();
await page.waitForURL('**/meeting/m-trial-hik-1');
check(await page.getByText('싱글벙글 등산 크루 체험').first().isVisible(), '신청하기 → /meeting/m-trial-hik-1 상세 표시');
await page.goBack();
await page.waitForURL('**/trials');
await page.getByRole('button', { name: '뒤로가기' }).click();
await page.waitForURL('**/home');
ok('/trials 뒤로 → /home');

// 후기 더보기 → /reviews
await page.getByRole('heading', { name: '후기', exact: true }).locator('..').getByRole('button', { name: '더보기' }).click();
await page.waitForURL('**/reviews');
await page.waitForTimeout(400); // SPA 전환 — networkidle은 Chrome이 보류한 웹폰트 조각 요청 때문에 끝나지 않음
check(await page.getByRole('heading', { name: '이용 후기' }).isVisible(), '/reviews: 타이틀');
const reviewCount = await page.evaluate(() => JSON.parse(localStorage.getItem('reviews') ?? '[]').length);
check(await page.getByText(/^".*"$/).count() === reviewCount, `/reviews: 인용문 ${reviewCount}개`);
await page.screenshot({ path: `${SS}/v_reviews.png`, fullPage: true });

// 게스트 경로
await page.evaluate(() => localStorage.removeItem('current_user'));
await page.goto(BASE + '/login');
await page.getByText('회원가입 없이 둘러보기').click();
await page.waitForURL('**/home');
await page.goto(BASE + '/trials');
check(page.url().endsWith('/trials'), 'guest: /trials 접근 가능');

check(errors.length === 0, `콘솔/페이지 에러 0건 ${errors.length ? JSON.stringify(errors) : ''}`);
await browser.close();
console.log(fails.length ? `\n${fails.length} FAIL` : '\nALL PASS');
process.exit(fails.length ? 1 : 0);

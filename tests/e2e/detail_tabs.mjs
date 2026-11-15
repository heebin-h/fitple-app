import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:5173';
import { mkdirSync } from 'node:fs';
const SS = process.env.SS ?? 'test-results/e2e'; // 스크린샷 저장 경로 (gitignore)
mkdirSync(SS, { recursive: true });
const fails = [];
const ok = (m) => console.log('OK   ' + m);
const bad = (m) => { console.log('FAIL ' + m); fails.push(m); };
const check = (cond, m) => (cond ? ok(m) : bad(m));

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({ viewport: { width: 375, height: 812 } })).newPage();
page.setDefaultTimeout(10000);
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !m.text().includes('Future Flag')) errors.push(m.text().slice(0, 160)); });

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

// 채팅 시드가 없는 모임(체험)으로 진입 → 이전엔 getSnapshot 경고 발생 경로
await page.locator('button', { hasText: '신청하기' }).first().click();
await page.waitForURL('**/meeting/m-cyc-3');
await page.waitForTimeout(300);
check(await page.getByRole('button', { name: '가입하기', exact: true }).isVisible(), "홈 탭: 가입하기 버튼 표시");

const tab = (n) => page.getByRole('tab', { name: n, exact: true });
await tab('사진첩').click();
await page.waitForTimeout(300);
const photos = page.getByRole('img', { name: '모임 사진' });
check(await photos.count() === 9, `사진첩: 9장 (${await photos.count()})`);
const loaded = await photos.evaluateAll((els) => els.every((e) => e.complete && e.naturalWidth > 0));
check(loaded, '사진첩: 이미지 모두 로드');
const box = await photos.first().boundingBox();
check(box && Math.round(box.height) === 110, `사진 높이 110 (${box && box.height})`);
const cols = await photos.evaluateAll((els) => new Set(els.slice(0, 3).map((e) => Math.round(e.getBoundingClientRect().top))).size);
check(cols === 1, '3열 그리드 (첫 3장 같은 행)');
check(!(await page.getByRole('button', { name: '가입하기', exact: true }).isVisible()), '사진첩: 하단 버튼 숨김');
check(!(await page.getByText(/기능을 준비 중이에요/).isVisible()), '사진첩: 준비 중 문구 없음');
await page.screenshot({ path: `${SS}/v_tab_photos.png` });

await tab('멤버').click();
await page.waitForTimeout(300);
const rows = await page.locator('ul li').allInnerTexts();
check(JSON.stringify(rows.map((r) => r.replace(/\s+/g, ' ').trim())) ===
  JSON.stringify(['김상미 모임장', '이현우 운영진', '박지훈', '최유진', '정다은']), `멤버 5명 + 역할 칩 ${JSON.stringify(rows)}`);
check(!(await page.getByRole('button', { name: '가입하기', exact: true }).isVisible()), '멤버: 하단 버튼 숨김');
await page.screenshot({ path: `${SS}/v_tab_members.png` });

await tab('채팅').click();
await page.waitForTimeout(300);
await tab('홈').click();
await page.waitForTimeout(300);
check(await page.getByRole('button', { name: '가입하기', exact: true }).isVisible(), '홈 탭 복귀: 하단 버튼 다시 표시');

check(errors.length === 0, `콘솔 error/warning 0건 (getSnapshot 포함) ${errors.length ? JSON.stringify(errors) : ''}`);
await browser.close();
console.log(fails.length ? `\n${fails.length} FAIL` : '\nALL PASS');
process.exit(fails.length ? 1 : 0);

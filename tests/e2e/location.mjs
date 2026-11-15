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
const picker = () => page.getByRole('button', { name: /^동네 선택:/ }).first();
const dialog = () => page.getByRole('dialog', { name: '동네 선택' });

await page.goto(BASE);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForURL('**/login');

// 게스트도 위치 선택 가능
await page.getByText('회원가입 없이 둘러보기').click();
await page.waitForURL('**/home');
check((await picker().innerText()).includes('미사 1동'), 'guest 홈 기본 "미사 1동"');
await picker().click();
check(await dialog().isVisible(), 'guest: 다이얼로그 열림 (로그인 유도 없음)');
const radios = dialog().getByRole('radio');
check(await radios.count() === 8, '동네 8개');
check(await dialog().getByRole('radio', { name: '미사 1동' }).getAttribute('aria-checked') === 'true', '현재값 체크');
await page.screenshot({ path: `${SS}/v_location_dialog.png` });
await dialog().getByRole('radio', { name: '풍산동' }).click();
check(!(await dialog().isVisible()), '항목 탭 → 즉시 닫힘');
check((await picker().innerText()).includes('풍산동'), '홈 표시 "풍산동"');

// 취소 / 배경 / ESC — 값 유지
await picker().click();
await dialog().getByRole('button', { name: '취소' }).click();
check(!(await dialog().isVisible()) && (await picker().innerText()).includes('풍산동'), '취소 → 닫힘, 값 유지');
await picker().click();
await page.mouse.click(10, 10);
check(!(await dialog().isVisible()), '배경 탭 → 닫힘');
await picker().click();
await page.keyboard.press('Escape');
check(!(await dialog().isVisible()), 'ESC → 닫힘');

// 회원 로그인 후에도 세션 상태 공유 (Android LocationState 싱글턴)
await page.getByRole('button', { name: '로그인하기 →' }).click();
await page.waitForURL('**/login');
await page.getByText('이메일로 시작하기').click();
await page.waitForURL('**/email-login');
await page.locator('input').first().fill('demo@fitple.app');
await page.locator('input').nth(1).fill('demo1234');
await page.getByRole('button', { name: '로그인' }).click();
await page.waitForURL('**/home');
check((await picker().innerText()).includes('풍산동'), '회원 홈: 세션 값 "풍산동" 유지');

// 체험(운동) 화면에서 변경 → 추천 모임 · 홈 반영
await page.locator('nav').getByText('체험', { exact: true }).click();
await page.waitForURL('**/exercise');
check((await picker().innerText()).includes('풍산동'), '운동: "풍산동 ▾"');
await picker().click();
await dialog().getByRole('radio', { name: '위례동' }).click();
check((await picker().innerText()).includes('위례동'), '운동: "위례동"으로 변경');
await page.locator('nav').getByText('홈', { exact: true }).click();
await page.waitForURL('**/home');
await page.getByRole('button', { name: '더보기' }).first().click(); // 추천 모임 더보기 (탐색 탭 제거 — Android 4탭)
await page.waitForURL('**/explore');
check((await picker().innerText()).includes('위례동'), '추천 모임: 위치 칩 표시 "위례동" (신규)');
await page.screenshot({ path: `${SS}/v_location_explore.png` });
await picker().click();
await dialog().getByRole('radio', { name: '창우동' }).click();
await page.locator('nav').getByText('홈').click();
await page.waitForURL('**/home');
check((await picker().innerText()).includes('창우동'), '홈: 추천 모임에서 바꾼 "창우동" 반영');

// 새로고침 시 기본값 (세션 전용 — Android 재시작과 동일)
await page.reload();
await page.waitForTimeout(400); // SPA 전환 — networkidle은 Chrome이 보류한 웹폰트 조각 요청 때문에 끝나지 않음
const afterReload = await page.getByRole('button', { name: /^동네 선택:/ }).first().innerText().catch(() => '');
check(afterReload === '' || afterReload.includes('미사 1동'), `새로고침 → 기본값 (세션 전용) [${afterReload.trim() || 'login 화면'}]`);

check(errors.length === 0, `콘솔 error/warning 0건 ${errors.length ? JSON.stringify(errors) : ''}`);
await browser.close();
console.log(fails.length ? `\n${fails.length} FAIL` : '\nALL PASS');
process.exit(fails.length ? 1 : 0);

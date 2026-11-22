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
const toastText = async () => (await page.locator('[role="status"]').allInnerTexts()).join('|');

// ── 게스트: 홈 bell → 토스트 + /login, 채팅 탭 → 토스트, /chat 직접 진입 → /login
await page.goto(BASE);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForURL('**/login');
await page.getByText('회원가입 없이 둘러보기').click();
await page.waitForURL('**/home');
await page.locator('nav').getByText('채팅').click();
await page.waitForTimeout(300);
check((await toastText()).includes('로그인 후 이용할 수 있어요'), 'guest: 채팅 탭 → "로그인 후 이용할 수 있어요"');
check(page.url().endsWith('/home'), 'guest: 채팅 탭 후 /home 유지');
await page.locator('button:has(svg.lucide-bell)').first().click();
await page.waitForURL('**/login');
check((await toastText()).includes('로그인 후 알림 기능을 사용할 수 있어요'), 'guest: 홈 bell → 토스트 + /login');
await page.goto(BASE + '/chat');
await page.waitForURL('**/login');
ok('guest: /chat 직접 진입 → /login');

// ── 회원 로그인
await page.goto(BASE + '/login');
await page.getByText('이메일로 시작하기').click();
await page.waitForURL('**/email-login');
await page.locator('input').first().fill('demo@fitple.app');
await page.locator('input').nth(1).fill('demo1234');
await page.getByRole('button', { name: '로그인' }).click();
await page.waitForURL('**/home');

// 홈 bell → /notifications
await page.locator('button:has(svg.lucide-bell)').first().click();
await page.waitForURL('**/notifications');
check(await page.getByRole('heading', { name: '알림' }).isVisible(), '/notifications: 타이틀');
check(await page.locator('li').count() === 5, '/notifications: 5건');
check(await page.locator('nav').count() === 0, '/notifications: BottomNav 없음');
await page.screenshot({ path: `${SS}/v_noti.png` });
await page.getByRole('button', { name: '뒤로가기' }).click();
await page.waitForURL('**/home');

// Exercise / Upcoming bell (전체 새로고침 시 데모 로그인 풀림 → UI 내 이동만 사용)
await page.locator('nav').getByText('체험', { exact: true }).click();
await page.waitForURL('**/exercise');
await page.locator('button:has(svg.lucide-bell)').first().click();
await page.waitForURL('**/notifications');
ok('/exercise bell → /notifications');
await page.goBack();
await page.locator('nav').getByText('홈').click();
await page.waitForURL('**/home');
await page.getByRole('heading', { name: '다가오는 정기모임' }).locator('..').getByRole('button', { name: '더보기' }).click();
await page.waitForURL('**/upcoming');
await page.locator('button:has(svg.lucide-bell)').first().click();
await page.waitForURL('**/notifications');
ok('/upcoming bell → /notifications');
await page.goBack();
await page.waitForURL('**/upcoming');

// 채팅 탭
await page.locator('nav').getByText('채팅').click();
await page.waitForURL('**/chat');
check(await page.getByRole('heading', { name: '채팅' }).isVisible(), '/chat: 타이틀');
const rooms = await page.locator('main li, ul li').allInnerTexts();
check(rooms.length === 3, `/chat: 방 3개 (${rooms.map((r) => r.split('\n')[0]).join(', ')})`);
check(await page.locator('nav a[href="/chat"]').getAttribute('class').then((c) => c?.split(' ').includes('active')), '/chat: 채팅 탭 활성');
await page.screenshot({ path: `${SS}/v_chat.png` });

// 방 탭 → 상세 채팅 탭
await page.locator('ul li button').first().click();
await page.waitForURL('**/meeting/m-run-1');
await page.waitForTimeout(300);
const chatTabCls = await page.getByRole('tab', { name: '채팅', exact: true }).getAttribute('aria-selected');
check(chatTabCls === 'true', `상세 진입 시 '채팅' 탭 활성 (aria-selected=${chatTabCls})`);
await page.screenshot({ path: `${SS}/v_chat_detail.png` });

// 일반 상세 진입은 여전히 '홈' 탭 (회귀 확인): 체험 카드 탭으로 진입
await page.goBack();
await page.waitForURL('**/chat');
await page.locator('nav').getByText('홈').click();
await page.waitForURL('**/home');
await page.locator('button', { hasText: '신청하기' }).first().click();
await page.waitForURL('**/meeting/m-cyc-3');
await page.waitForTimeout(300);
const homeTabCls = await page.getByRole('tab', { name: '홈', exact: true }).getAttribute('aria-selected');
check(homeTabCls === chatTabCls, "일반 진입 시 기본 '홈' 탭 활성 (회귀 없음)");

check(errors.length === 0, `콘솔/페이지 에러 0건 ${errors.length ? JSON.stringify(errors) : ''}`);
await browser.close();
console.log(fails.length ? `\n${fails.length} FAIL` : '\nALL PASS');
process.exit(fails.length ? 1 : 0);

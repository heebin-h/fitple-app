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
const toasts = async () => (await page.locator('[role="status"]').allInnerTexts()).join('|');
const fab = () => page.locator('button:has(svg.lucide-plus)');

// ── 게스트: FAB / CTA → 로그인 안내 문구 + /login
await page.goto(BASE);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForURL('**/login');
await page.getByText('회원가입 없이 둘러보기').click();
await page.waitForURL('**/home');
await fab().click();
await page.waitForURL('**/login');
check((await toasts()).includes('로그인 후 모임 만들기 기능을 사용할 수 있어요'), 'guest FAB → "로그인 후 모임 만들기 기능을 사용할 수 있어요" + /login');
await page.getByText('회원가입 없이 둘러보기').click();
await page.waitForURL('**/home');
await page.getByRole('button', { name: '모임 찾아주기 →' }).click();
await page.waitForURL('**/login');
check((await toasts()).includes('로그인 후 맞춤 모임 추천 기능을 사용할 수 있어요'), 'guest CTA → "로그인 후 맞춤 모임 추천 기능을 사용할 수 있어요" + /login');

// ── 회원 로그인
await page.getByText('이메일로 시작하기').click();
await page.waitForURL('**/email-login');
await page.locator('input').first().fill('demo@fitple.app');
await page.locator('input').nth(1).fill('demo1234');
await page.getByRole('button', { name: '로그인' }).click();
await page.waitForURL('**/home');

// CTA → 생성 화면
await page.getByRole('button', { name: '모임 만들기 →' }).click();
await page.waitForURL('**/create-meeting');
check(await page.getByRole('heading', { name: '모임 만들기' }).isVisible(), '/create-meeting: 타이틀');
await page.screenshot({ path: `${SS}/v_create_empty.png`, fullPage: true });
const submit = page.getByRole('button', { name: '모임 만들기', exact: true });

// 검증 순서
await submit.click();
await page.waitForTimeout(200);
check((await toasts()).includes('모임 이름을 입력해주세요'), '이름 빈값 → "모임 이름을 입력해주세요"');
await page.getByPlaceholder('예) 미사강변 주말 러닝 크루').fill('   ');
await submit.click();
await page.waitForTimeout(200);
check((await toasts()).includes('모임 이름을 입력해주세요'), '공백 이름(trim) → 동일 토스트');
await page.getByPlaceholder('예) 미사강변 주말 러닝 크루').fill('테스트 새벽 러닝단');
await submit.click();
await page.waitForTimeout(200);
check((await toasts()).includes('종목을 선택해주세요'), '종목 미선택 → "종목을 선택해주세요"');
check(page.url().endsWith('/create-meeting'), '검증 실패 시 화면 유지');

// 종목 선택 (단일 선택)
await page.getByRole('radio', { name: '풋살' }).click();
await page.getByRole('radio', { name: '러닝' }).click();
check(await page.getByRole('radio', { name: '러닝' }).getAttribute('aria-checked') === 'true'
   && await page.getByRole('radio', { name: '풋살' }).getAttribute('aria-checked') === 'false', '종목 칩 단일 선택');
await page.getByPlaceholder('예) 20').fill('12abc');
await page.screenshot({ path: `${SS}/v_create_filled.png`, fullPage: true });

// 제출 → 상세
await submit.click();
await page.waitForURL(/\/meeting\/created_\d+$/);
check((await toasts()).includes('모임이 만들어졌어요!'), '생성 → "모임이 만들어졌어요!" + 상세 이동');
const createdId = page.url().split('/').pop();
check(await page.getByText('테스트 새벽 러닝단').first().isVisible(), '상세: 만든 모임 제목 표시');
for (const t of ['위치 미정', '일정 미정', '함께할 멤버를 기다려요!']) {
  check(await page.getByText(t).first().isVisible().catch(() => false), `상세: 기본값 "${t}"`);
}
await page.screenshot({ path: `${SS}/v_create_detail.png`, fullPage: true });
check(await page.evaluate(() => JSON.parse(localStorage.getItem('meetings')).some((m) => m.id.startsWith('created_'))) === false, 'localStorage 미저장 (세션 전용, Android 동일)');

// 뒤로 → 폼 복귀 (Android pushWithSlide)
await page.goBack();
await page.waitForURL('**/create-meeting');
ok('상세에서 뒤로 → 생성 폼 복귀');
await page.getByRole('button', { name: '뒤로가기' }).click();
await page.waitForURL('**/home');

// 홈 활동 중인 모임 맨 앞
const firstActive = await page.getByRole('heading', { name: '활동 중인 모임' }).locator('xpath=../..').locator('[role="button"]').first().innerText();
check(firstActive.includes('테스트 새벽 러닝단'), '홈 "활동 중인 모임" 맨 앞에 표시');

// 운동 / 채팅 / 검색
await page.locator('nav').getByText('체험', { exact: true }).click();
await page.waitForURL('**/exercise');
check((await page.locator('[role="button"]').first().innerText()).includes('테스트 새벽 러닝단'), '운동 목록 맨 앞에 표시');
await page.locator('nav').getByText('채팅').click();
await page.waitForURL('**/chat');
check((await page.locator('ul li').first().innerText()).includes('테스트 새벽 러닝단'), '채팅방 목록 맨 앞에 표시 (groupName = title)');
await page.locator('ul li button').first().click();
await page.waitForURL(`**/meeting/${createdId}`);
ok('채팅방 → 만든 모임 상세');
await page.goBack();
await page.locator('nav').getByText('홈').click();
await page.waitForURL('**/home');
await page.getByText('찾고싶은 모임이 있나요?').click();
await page.waitForURL('**/search');
await page.getByLabel('모임 검색').fill('새벽 러닝단');
check(await page.locator('[role="button"]', { hasText: '테스트 새벽 러닝단' }).count() === 1, '검색 결과에 표시');

check(errors.length === 0, `콘솔/페이지 에러 0건 ${errors.length ? JSON.stringify(errors) : ''}`);
await browser.close();
console.log(fails.length ? `\n${fails.length} FAIL` : '\nALL PASS');
process.exit(fails.length ? 1 : 0);

// 리뷰 지적사항 수정 검증 (H1~H3, M1~M3, L1~L6, 디자인 ①~⑤)
import { chromium } from 'playwright';
const BASE = process.env.BASE ?? 'http://localhost:5173';
import { mkdirSync } from 'node:fs';
const SS = process.env.SS ?? 'test-results/e2e'; // 스크린샷 저장 경로 (gitignore)
mkdirSync(SS, { recursive: true });
const fails = [];
const ok = (m) => console.log('OK   ' + m);
const bad = (m) => { console.log('FAIL ' + m); fails.push(m); };
const check = (c, m) => (c ? ok(m) : bad(m));
const browser = await chromium.launch({ headless: true });

async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, ...opts });
  const page = await ctx.newPage();
  page.setDefaultTimeout(10000);
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(String(e)));
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !m.text().includes('Future Flag')) page.errors.push(m.text().slice(0, 200)); });
  return page;
}
const toastTexts = (p) => p.locator('[role="status"]').allInnerTexts();
async function fresh(page) {
  await page.goto(BASE); await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.waitForURL('**/login');
}
async function loginDemo(page) {
  await page.getByText('이메일로 시작하기').click(); await page.waitForURL('**/email-login');
  await page.locator('input').first().fill('demo@fitple.app');
  await page.locator('input').nth(1).fill('demo1234');
  await page.getByRole('button', { name: '로그인' }).click(); await page.waitForURL('**/home');
}
const spaGo = (page, path) => page.evaluate((p) => { history.pushState({}, '', p); dispatchEvent(new PopStateEvent('popstate')); }, path);

// ── 회원 세션 ───────────────────────────────────────────────
const page = await newPage();
await fresh(page);

// L1 로그인 실패 문구
await page.getByText('이메일로 시작하기').click(); await page.waitForURL('**/email-login');
await page.locator('input').first().fill('demo@fitple.app');
await page.locator('input').nth(1).fill('wrongpass1');
await page.getByRole('button', { name: '로그인' }).click(); await page.waitForTimeout(400);
check((await toastTexts(page)).includes('이메일 또는 비밀번호가 맞지 않아요'), 'L1 로그인 실패 토스트 = Android "…맞지 않아요"');
await page.locator('input').nth(1).fill('demo1234');
await page.getByRole('button', { name: '로그인' }).click(); await page.waitForURL('**/home');

// H1 새로고침 시 로그인 유지
await page.reload(); await page.waitForTimeout(800);
check(new URL(page.url()).pathname === '/home', `H1 /home 새로고침 → /home 유지 [${new URL(page.url()).pathname}]`);
check(await page.getByText('안녕하세요 데모유저님!', { exact: false }).first().isVisible(), 'H1 새로고침 후 회원 홈(닉네임 인사)');
await spaGo(page, '/my'); await page.waitForURL('**/my'); await page.reload(); await page.waitForTimeout(800);
check(await page.getByText('demo@fitple.app').isVisible(), 'H1 /my 새로고침 → 프로필 유지');

// ⑤③ 하단 내비 4탭 + 활성 표시
const navLabels = (await page.locator('nav').innerText()).split('\n').map((s) => s.trim()).filter(Boolean);
check(JSON.stringify(navLabels) === JSON.stringify(['홈', '체험', '채팅', 'MY']), `⑤ 하단 탭 = 홈·체험·채팅·MY [${navLabels}]`);
const myW = await page.locator('nav').getByText('MY', { exact: true }).evaluate((e) => getComputedStyle(e).fontWeight);
const homeW = await page.locator('nav').getByText('홈', { exact: true }).evaluate((e) => getComputedStyle(e).fontWeight);
check(Number(myW) >= 700 && Number(homeW) < 700, `③ /my에서 MY 탭 활성(굵게 ${myW}) · 홈 비활성(${homeW})`);
const navBox = await page.locator('nav > div').boundingBox();
check(navBox && navBox.x >= 15 && 844 - (navBox.y + navBox.height) >= 15, `⑤ 플로팅 탭바 (좌 ${navBox?.x}px, 하단 여백 ${844 - (navBox?.y + navBox?.height)}px)`);
await page.screenshot({ path: `${SS}/f_my.png` });

// H2 스크롤: 새 화면은 맨 위, 뒤로가기는 복원
await page.locator('nav').getByText('홈', { exact: true }).click(); await page.waitForURL('**/home');
await page.mouse.wheel(0, 1200); await page.waitForTimeout(400);
const homeY = await page.evaluate(() => scrollY);
await page.locator('nav').getByText('체험', { exact: true }).click(); await page.waitForURL('**/exercise'); await page.waitForTimeout(300);
check(await page.evaluate(() => scrollY) === 0, `H2 홈(${homeY}px) → 체험 탭: scrollY 0`);
check(await page.getByText('활동 중인 모임', { exact: true }).first().isVisible(), '체험 탭 제목 "활동 중인 모임" (Android tvTitle)');
await page.goBack(); await page.waitForURL('**/home'); await page.waitForTimeout(300);
const backY = await page.evaluate(() => scrollY);
check(Math.abs(backY - homeY) < 5, `H2 뒤로가기 → 홈 스크롤 복원 (${backY} ≈ ${homeY})`);
await page.getByRole('button', { name: '더보기' }).last().click(); await page.waitForURL('**/upcoming'); await page.waitForTimeout(300);
check(await page.evaluate(() => scrollY) === 0 && await page.getByText('다가오는 정기모임').first().isVisible(), 'H2 홈 하단 → 정기모임: 툴바 보임 (scrollY 0)');
await page.goBack(); await page.waitForURL('**/home');

// ④ 추천 모임
await page.evaluate(() => scrollTo(0, 0));
await page.getByRole('button', { name: '러닝', exact: true }).first().click(); await page.waitForURL('**/explore/**'); await page.waitForTimeout(300);
await page.screenshot({ path: `${SS}/f_explore.png` });
check(await page.getByRole('button', { name: '알림' }).isVisible(), '④ 추천 모임 툴바 알림 아이콘');
check(await page.getByText('필터', { exact: false }).first().isVisible(), '④ "필터" 라벨');
const chips = page.locator('button.h-8[aria-pressed]');
check(await chips.count() === 5 && (await chips.allInnerTexts()).join(',') === '가까운 순,편하게,평일 오후,주말,초보 환영', '④ 조건 칩 5개 (초보 환영 포함)');
check((await page.locator('button.h-8[aria-pressed="true"]').count()) === 0, '④ 기본: 선택 칩 없음 (Android selectedCondition=null)');
const rows = () => page.locator('[role="button"]').filter({ has: page.locator('img') });
const allCount = await rows().count();
await page.getByRole('button', { name: '초보 환영', exact: true }).click();
const beginnerTitles = await rows().allInnerTexts();
check(beginnerTitles.length > 0 && beginnerTitles.length < allCount, `④ 초보 환영 필터 (${allCount} → ${beginnerTitles.length})`);
await page.getByRole('button', { name: '주말', exact: true }).click();
check((await page.locator('button.h-8[aria-pressed="true"]').count()) === 1, '④ 단일 선택 (주말 선택 시 초보 환영 해제)');
await page.getByRole('button', { name: '주말', exact: true }).click();
check((await page.locator('button.h-8[aria-pressed="true"]').count()) === 0 && await rows().count() === allCount, '④ 같은 칩 재탭 → 해제·전체');
check(await page.getByText(/멤버 \d+명/).first().isVisible(), '④ 행 = item_group_list ("위치 | 멤버 n명")');
await page.goBack(); await page.waitForURL('**/home');

// ① 모임 상세 (회원)
await spaGo(page, '/meeting/m-glf-1'); await page.waitForURL('**/meeting/m-glf-1'); await page.waitForTimeout(500);
await page.screenshot({ path: `${SS}/f_detail_home.png`, fullPage: true });
const tabs = await page.getByRole('tab').allInnerTexts();
check(JSON.stringify(tabs) === JSON.stringify(['홈', '공지', '채팅', '사진첩', '멤버']), `① 탭 = Android tabTitles [${tabs}]`);
for (const t of ['다가오는 정기 모임', '기본정보', '정기 모임시간', '회원수', '📢 필독: 모임 유의사항이에요', '안내사항']) {
  check(await page.getByText(t, { exact: true }).first().isVisible(), `① 홈 탭 "${t}"`);
}
check(await page.getByText(/조회 \d+ · 채팅 \d+분전 활동/).isVisible(), '① 헤더 메타 "조회 n · 채팅 n분전 활동"');
check(await page.locator('iframe[src*="maps.google.com"]').count() === 1, '① 지도 (Google Maps embed — Android WebView URL)');
for (const b of ['공유하기', '1회 체험하기', '문의하기', '가입하기']) {
  check(await page.getByRole('button', { name: b, exact: true }).isVisible(), `① 버튼 "${b}"`);
}
await page.getByRole('button', { name: '1회 체험하기' }).click(); await page.waitForTimeout(300);
check((await toastTexts(page)).includes('1회 체험 신청이 완료되었어요!') && await page.getByRole('button', { name: '1회 체험하기' }).isDisabled(), '① 1회 체험하기 → 토스트 + 비활성');
await page.getByRole('button', { name: '가입하기' }).click(); await page.waitForTimeout(300);
check((await toastTexts(page)).includes('가입 신청이 완료되었어요!') && await page.getByRole('button', { name: '가입 완료' }).isDisabled(), '① 가입하기 → 토스트 + "가입 완료" 비활성');
await page.reload(); await page.waitForTimeout(800);
check(await page.getByRole('button', { name: '가입 완료' }).isVisible(), '① 가입 상태 영속 (새로고침 후 "가입 완료")');

// 공지 탭
await page.getByRole('tab', { name: '공지' }).click(); await page.waitForTimeout(200);
check(await page.getByText('이번주는 쉽니다.').isVisible() && await page.getByText('신규 멤버 환영').isVisible() && await page.getByText('1일전 · 조회 20').isVisible(), '① 공지 탭 = Android setupNoticeList 4건');
await page.screenshot({ path: `${SS}/f_detail_notice.png` });

// M3 채팅 탭 (시드 없던 모임)
await page.getByRole('tab', { name: '채팅' }).click(); await page.waitForTimeout(300);
check(await page.getByText('(모임장) 김상미').first().isVisible() && await page.getByText('(운영진) 이현우').isVisible(), 'M3 채팅 샘플 대화 + 역할 표시 (시드 없던 m-glf-1)');
check(await page.getByText('운영진이 공지를 등록했어요', { exact: false }).isVisible(), 'M3 마지막 시스템 메시지 = ChatList 미리보기와 일치');
check(await page.getByText('🏃 골프클럽 채팅방입니다 🏃').isVisible(), '① 채팅 안내 배너');
await page.screenshot({ path: `${SS}/f_detail_chat.png` });
await page.getByRole('button', { name: /접기/ }).click();
check(!(await page.getByText('🏃 골프클럽 채팅방입니다 🏃').isVisible()), '① 배너 "접기" → 숨김');

// H3 한글 조합 중 Enter
const input = page.getByPlaceholder('작성');
const myCount = () => page.locator('.bg-orange.text-textWhite').count();
await input.fill('조합중');
const c0 = await myCount();
await input.evaluate((el) => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, isComposing: true, keyCode: 229 })));
await page.waitForTimeout(200);
check(await myCount() === c0, 'H3 조합 중 Enter → 전송 안 됨');
await input.press('Enter'); await page.waitForTimeout(200);
check(await myCount() === c0 + 1 && await page.getByText('조합중').isVisible(), 'H3 조합 끝난 Enter → 1건 전송');
await page.getByRole('button', { name: '전송', exact: true }).click();
check(await myCount() === c0 + 1, '빈 입력 "전송" → 무시');

// 이미지: 알 수 없는 키 경고 없음 + 러닝 3종 원본
await spaGo(page, '/home'); await page.waitForURL('**/home'); await page.waitForTimeout(300);
const srcs = await page.evaluate(() => [...document.images].map((i) => i.src));
check(['running_group1', 'running_night'].every((k) => srcs.some((s) => s.includes(k))), '② 러닝 원본 이미지 사용 (running_group1·running_night)');

// L6 하트 Enter → 찜만, 이동 없음
const heart = page.getByRole('button', { name: '찜하기', exact: true }).first();
const before = await heart.getAttribute('aria-pressed');
await heart.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
check(new URL(page.url()).pathname === '/home' && (await heart.getAttribute('aria-pressed')) !== before, 'L6 하트 Enter → 찜 토글, 상세 이동 없음');
await page.keyboard.press('Enter'); // 원복

// L7 Pretendard 로드
await page.evaluate(() => document.fonts.ready);
const pret = await page.evaluate(() => [...document.fonts].some((f) => f.family.replace(/"/g, '') === 'Pretendard Variable' && f.status === 'loaded'));
check(pret, 'L7 Pretendard 웹폰트 로드됨');

check(page.errors.length === 0, `회원 세션 콘솔 error/warning 0 ${page.errors.length ? JSON.stringify(page.errors) : ''}`);

// ── 회원가입 흐름 (M1, L2) ─────────────────────────────────
const p2 = await newPage();
await fresh(p2);
await p2.getByRole('button', { name: '회원가입', exact: true }).click(); await p2.waitForURL('**/signup/email');
await p2.locator('input').fill('fixcheck@test.com'); await p2.waitForTimeout(400);
await p2.getByRole('button', { name: '다음' }).click(); await p2.waitForURL('**/signup/password');
check(await p2.getByText('비밀번호를 한번 더 입력해주세요.', { exact: true }).isVisible(), 'L2 확인 라벨 = Android/PNG');
check(await p2.getByPlaceholder('비밀번호를 다시 입력해주세요').isVisible(), 'L2 확인 hint = Android');
await p2.locator('input').nth(0).fill('abcd1234'); await p2.locator('input').nth(1).fill('abcd1235');
check(await p2.getByText('작성한 비밀번호가 일치하지 않습니다.').isVisible(), 'L2 불일치 문구 = Android/PNG');
await p2.locator('input').nth(1).fill('abcd1234');
await p2.getByRole('button', { name: '다음' }).click(); await p2.waitForURL('**/signup/nickname');
const storageDump = await p2.evaluate(() => JSON.stringify({ ...sessionStorage }) + JSON.stringify({ ...localStorage }));
check(!storageDump.includes('abcd1234'), 'M1 평문 비밀번호가 session/localStorage에 없음');
await p2.locator('input').fill('검증러'); await p2.getByRole('button', { name: '다음' }).click();
await p2.getByText('모두 동의합니다.').click();
const seq = [];
p2.on('framenavigated', (f) => { if (f === p2.mainFrame()) seq.push(new URL(f.url()).pathname); });
await p2.getByRole('button', { name: '동의하고 가입하기' }).click(); await p2.waitForURL('**/signup/preference'); await p2.waitForTimeout(500);
check(JSON.stringify(seq) === '["/signup/preference"]', `M1 동의 → 선호운동 직행, 이메일 화면 경유 없음 ${JSON.stringify(seq)}`);
await p2.goBack(); await p2.waitForTimeout(500);
check(new URL(p2.url()).pathname === '/signup/nickname', `M1 선호운동에서 뒤로 → 닉네임 [${new URL(p2.url()).pathname}]`);
check(p2.errors.length === 0, `가입 흐름 콘솔 0 ${p2.errors.length ? JSON.stringify(p2.errors) : ''}`);

// ── 게스트 (L3, L5) ────────────────────────────────────────
const p3 = await newPage();
await fresh(p3);
await p3.getByText('회원가입 없이 둘러보기').click(); await p3.waitForURL('**/home');
await p3.locator('nav').getByText('MY', { exact: true }).click(); await p3.waitForTimeout(300);
check((await toastTexts(p3)).includes('로그인 후 이용할 수 있어요') && new URL(p3.url()).pathname === '/home', 'L3 게스트 MY → Android 문구, 이동 없음');
await spaGo(p3, '/meeting/m-run-1/chat'); await p3.waitForURL('**/chat'); await p3.waitForTimeout(300);
await p3.locator('input').fill('게스트메시지'); await p3.locator('input').press('Enter'); await p3.waitForTimeout(300);
check(!(await p3.getByText('게스트메시지', { exact: true }).count()) || (await p3.locator('input').inputValue()) === '게스트메시지', 'L5 PostChat 게스트 전송 차단');
const barBox = await p3.locator('input').locator('..').boundingBox();
check(barBox && barBox.width <= 430, `L5 PostChat 입력바 폭 ≤ 430 (${barBox?.width})`);
check(p3.errors.length === 0, `게스트 세션 콘솔 0 ${p3.errors.length ? JSON.stringify(p3.errors) : ''}`);

// ── M2 시간대 (KST 새벽) ───────────────────────────────────
const p4 = await newPage({ timezoneId: 'Asia/Seoul' });
await p4.clock.setFixedTime(new Date('2026-11-15T02:00:00+09:00')); // UTC로는 11/14
await fresh(p4);
await loginDemo(p4);
const hero = await p4.locator('p.whitespace-pre-line').first().innerText();
check(hero.includes('오늘 오전 8:00 · 나래 러닝 모임'), `M2 KST 02시: 오늘(11/15) 일정 인식 [${hero.replace(/\n/g, ' / ')}]`);
check(await p4.getByText('11월 15일(일)').isVisible(), 'M2 Hero 날짜 = 로컬 11월 15일');
const sched = await p4.evaluate(() => JSON.parse(localStorage.getItem('schedules')).map((s) => s.date).slice(0, 3));
check(sched[0] === '2026-11-15', `M2 시드 일정 날짜 로컬 기준 [${sched}]`);
await p4.getByRole('button', { name: '더보기' }).last().click(); await p4.waitForURL('**/upcoming'); await p4.waitForTimeout(300);
check(await p4.getByText('나래 러닝 모임').isVisible(), 'M2 정기모임 "오늘"(15일) 선택 시 오늘 일정 표시');
check(p4.errors.length === 0, `시간대 세션 콘솔 0 ${p4.errors.length ? JSON.stringify(p4.errors) : ''}`);

await browser.close();
console.log(fails.length ? `\n${fails.length} FAIL` : '\nALL PASS');
process.exit(fails.length ? 1 : 0);

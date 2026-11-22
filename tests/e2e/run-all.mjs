// 전체 E2E 회귀 실행기 — `npm run e2e`
//
// 전제: dev 서버가 떠 있어야 한다 (`npm run dev` → http://localhost:5173, 다른 주소면 BASE 환경변수).
// 각 스크립트를 순서대로 별도 프로세스로 실행하고 OK/FAIL(✅/⚠️) 줄 수를 집계한다.
// 하나라도 실패하면 exit 1. 스크린샷은 test-results/ (gitignore).
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const BASE = process.env.BASE ?? 'http://localhost:5173';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');

try {
  const res = await fetch(BASE, { signal: AbortSignal.timeout(3000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
} catch (e) {
  console.error(`[e2e] dev 서버(${BASE})에 연결할 수 없습니다 — 먼저 \`npm run dev\` 실행. (${e.message})`);
  process.exit(2);
}

// 세션 스크립트(OK/FAIL 형식) + 레포 QA 스크립트(✅/⚠️ 형식)
const suites = [
  ...['trial_review', 'noti_chat', 'search_fav', 'create', 'home', 'detail_tabs', 'location', 'fixes']
    .map((n) => ({ name: n, file: path.join(here, `${n}.mjs`), ok: /^OK /, bad: /^FAIL /, ss: `test-results/e2e` })),
  { name: 'qa', file: path.join(root, 'qa.mjs'), ok: /^✅/, bad: /^⚠️/, ss: 'test-results/qa' },
  { name: 'qa_detail', file: path.join(root, 'qa_detail.mjs'), ok: /^✅/, bad: /^(⚠️|❌)/, ss: 'test-results/qa/detail' },
];

let totalOk = 0, totalBad = 0, crashed = 0;
for (const s of suites) {
  const r = spawnSync(process.execPath, [s.file], {
    cwd: root, encoding: 'utf-8', env: { ...process.env, BASE, SS: s.ss }, timeout: 300_000,
  });
  const lines = `${r.stdout}\n${r.stderr}`.split('\n');
  const ok = lines.filter((l) => s.ok.test(l)).length;
  const bad = lines.filter((l) => s.bad.test(l));
  totalOk += ok; totalBad += bad.length;
  const status = r.status === 0 && bad.length === 0 ? 'PASS' : 'FAIL';
  if (r.status !== 0 && bad.length === 0) crashed += 1;
  console.log(`${status.padEnd(4)} ${s.name.padEnd(13)} OK=${ok} FAIL=${bad.length}${r.status !== 0 ? ` (exit ${r.status})` : ''}`);
  for (const l of bad) console.log(`       ${l.trim()}`);
  if (r.status !== 0 && bad.length === 0) {
    console.log(lines.filter((l) => /Error|Timeout|at /.test(l)).slice(0, 4).map((l) => `       ${l.trim()}`).join('\n'));
  }
}
console.log(`\n합계 OK=${totalOk} FAIL=${totalBad}${crashed ? ` 중단=${crashed}` : ''}`);
process.exit(totalBad || crashed ? 1 : 0);

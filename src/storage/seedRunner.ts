/**
 * 첫 실행 시 시드 데이터를 localStorage에 일괄 주입.
 *
 * 동작 규칙:
 *   - `seeded` 플래그가 'true'면 아무것도 하지 않음 (중복 주입 방지)
 *   - 데모 계정은 userManager.saveUser()로 등록 → SHA-256 해싱 자동 처리
 *   - 데모 계정엔 기본 선호운동까지 주입 (재개 다이얼로그 안 뜨도록)
 *   - 마지막에 `seeded='true'` 기록
 */

import { userManager } from './userManager';
import {
  SEED_DEMO_ACCOUNTS,
  SEED_MEETINGS,
  SEED_REVIEWS,
  SEED_SCHEDULES,
  SEED_CHATS,
} from '../data/seedData';

const KEY_SEEDED = 'seeded';

export async function seedIfFirstRun(): Promise<void> {
  if (localStorage.getItem(KEY_SEEDED) === 'true') return;

  // 데모 계정 등록 (saveUser가 비밀번호 SHA-256 처리)
  for (const acc of SEED_DEMO_ACCOUNTS) {
    const created = await userManager.saveUser(acc.email, acc.password, acc.nickname);
    if (created) {
      // 기본 선호운동 (재개 다이얼로그 안 뜨게 — 데모용 완성 프로필)
      await userManager.savePreferences(
        acc.email,
        ['러닝'],
        { 러닝: { '평균 페이스를 알려주세요 (1km 기준)': '5:00~5:59' } },
      );
    }
  }

  // 컬렉션 시드
  localStorage.setItem('meetings',  JSON.stringify(SEED_MEETINGS));
  localStorage.setItem('reviews',   JSON.stringify(SEED_REVIEWS));
  localStorage.setItem('schedules', JSON.stringify(SEED_SCHEDULES));
  for (const [meetingId, msgs] of Object.entries(SEED_CHATS)) {
    localStorage.setItem(`chats:${meetingId}`, JSON.stringify(msgs));
  }

  localStorage.setItem(KEY_SEEDED, 'true');
}

/**
 * 개발 편의용 — localStorage 전체 초기화 후 시드 재주입.
 * 콘솔에서 호출하기 좋게 window에도 노출 가능.
 */
export async function resetAndReseed(): Promise<void> {
  localStorage.clear();
  await seedIfFirstRun();
}

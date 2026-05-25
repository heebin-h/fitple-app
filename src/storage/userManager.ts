/**
 * 유저 데이터 관리. Android `UserManager.kt`의 1:1 포트.
 *
 * 저장 위치는 localStorage이며, 키 구조는 다음과 같음:
 *   user:{sha256(email)}   — UserProfile JSON 1건
 *   current_user           — 현재 로그인된 이메일 (없으면 비로그인)
 *   pending_signup         — 미완성 가입(닉네임까지 완료, 선호운동 미완료) 이메일
 *
 * SHA-256은 Web Crypto API 사용 — 동기 호출이 불가능하므로 모든 메서드가 async.
 */

import { sha256 } from '../utils/hash';
import type { UserProfile } from '../data/models';

const KEY_CURRENT_USER = 'current_user';
const KEY_PENDING_SIGNUP = 'pending_signup';

async function userKey(email: string): Promise<string> {
  const h = await sha256(email.trim().toLowerCase());
  return `user:${h}`;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const userManager = {
  /** SHA-256 비밀번호 해시 (외부에서도 사용 가능) */
  async hashPassword(password: string): Promise<string> {
    return sha256(password);
  },

  // ── 회원가입 ──────────────────────────────────────────────

  /**
   * 신규 유저 저장.
   * @returns true: 성공 / false: 이미 존재하는 이메일
   */
  async saveUser(email: string, password: string, nickname: string): Promise<boolean> {
    const normalized = normalizeEmail(email);
    if (await this.isEmailTaken(normalized)) return false;

    const profile: UserProfile = {
      email: normalized,
      nickname: nickname.trim(),
      passwordHash: await sha256(password),
      selectedSports: [],
      sportDetails: {},
    };
    const key = await userKey(normalized);
    localStorage.setItem(key, JSON.stringify(profile));
    return true;
  },

  /** 관심 종목 + 세부 답변 저장 (회원가입 마지막 단계) */
  async savePreferences(
    email: string,
    sports: string[],
    details: Record<string, Record<string, string>>,
  ): Promise<void> {
    const user = await this.getUserByEmail(email);
    if (!user) return;
    user.selectedSports = sports;
    user.sportDetails = details;
    const key = await userKey(email);
    localStorage.setItem(key, JSON.stringify(user));
  },

  // ── 로그인 / 세션 ──────────────────────────────────────────

  /** 이메일 + 비밀번호 검증 */
  async loginUser(email: string, password: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user) return false;
    const hashed = await sha256(password);
    return user.passwordHash === hashed;
  },

  /** 현재 로그인 사용자 지정 (세션 시작) */
  setLoggedIn(email: string): void {
    localStorage.setItem(KEY_CURRENT_USER, normalizeEmail(email));
  },

  /** 로그아웃 (세션 종료) */
  logoutUser(): void {
    localStorage.removeItem(KEY_CURRENT_USER);
  },

  /** 로그인 여부 확인 (동기) */
  isLoggedIn(): boolean {
    const v = localStorage.getItem(KEY_CURRENT_USER);
    return v !== null && v.trim() !== '';
  },

  /** 현재 로그인된 유저 프로필 */
  async getCurrentUser(): Promise<UserProfile | null> {
    const email = localStorage.getItem(KEY_CURRENT_USER);
    if (!email) return null;
    return this.getUserByEmail(email);
  },

  // ── 조회 ──────────────────────────────────────────────────

  /** 이메일로 유저 조회 */
  async getUserByEmail(email: string): Promise<UserProfile | null> {
    const key = await userKey(email);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  },

  /** 이메일 중복 여부 확인 (UI 실시간 검사용) */
  async isEmailTaken(email: string): Promise<boolean> {
    const key = await userKey(email);
    return localStorage.getItem(key) !== null;
  },

  // ── 회원가입 재개 ─────────────────────────────────────────

  /** 닉네임+약관 완료 후 미완성 가입을 추적 */
  savePendingSignup(email: string): void {
    localStorage.setItem(KEY_PENDING_SIGNUP, normalizeEmail(email));
  },

  /** 회원가입 정상 완료 시 임시 데이터 제거 */
  clearPendingSignup(): void {
    localStorage.removeItem(KEY_PENDING_SIGNUP);
  },

  /** 진행 중인 미완성 회원가입 이메일 (없으면 null) */
  getPendingSignupEmail(): string | null {
    const v = localStorage.getItem(KEY_PENDING_SIGNUP);
    return v && v.trim() !== '' ? v.trim() : null;
  },

  /** 로그인된 유저의 프로필이 불완전한지 (선호운동 미설정) */
  async isProfileIncomplete(): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;
    return user.selectedSports.length === 0;
  },
};

export type UserManager = typeof userManager;

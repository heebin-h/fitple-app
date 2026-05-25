/**
 * 입력 검증. Android의 SignupEmail/Password 단계 검증과 동일 규칙.
 */

export function isValidEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * 영문 + 숫자 조합 8~20자 (Android SignupPasswordFragment 정책과 동일).
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8 || password.length > 20) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}

export function isValidNickname(nickname: string): boolean {
  const trimmed = nickname.trim();
  return trimmed.length >= 2 && trimmed.length <= 10;
}

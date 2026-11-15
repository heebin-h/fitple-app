/**
 * 회원가입 진행 중 비밀번호 임시 보관 — **메모리 전용**.
 *
 * Password(Step 2) → Nickname(Step 3)으로 평문 비밀번호를 넘겨야 하지만,
 * navigate state(브라우저 history)나 sessionStorage에 두면 평문이 저장소에 남는다
 * (CLAUDE.md "Storing the password plaintext anywhere" 금지).
 * 모듈 변수는 새로고침/탭 종료 시 사라지고, 가입 완료 시 명시적으로 지운다.
 * Android는 Fragment arguments Bundle로 같은 값을 넘긴다(프로세스 메모리).
 */

let draftPassword: string | null = null;

export const signupDraft = {
  setPassword(pw: string): void { draftPassword = pw; },
  getPassword(): string { return draftPassword ?? ''; },
  clear(): void { draftPassword = null; },
};

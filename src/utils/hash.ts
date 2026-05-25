/**
 * Web Crypto API 기반 SHA-256 헬퍼.
 * Android UserManager.kt의 `MessageDigest.getInstance("SHA-256")`과 동일한 결과를 만듦.
 * 단, Web Crypto는 async라 호출부도 모두 await 필요.
 */
export async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

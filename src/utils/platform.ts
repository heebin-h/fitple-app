/**
 * Lightweight platform detection. We avoid pulling in `@capacitor/core` at
 * the module-evaluation level so the web/PWA build stays small. Capacitor
 * exposes a global `Capacitor` object on `window` whenever the JS runs
 * inside the iOS/Android WebView.
 */

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => 'ios' | 'android' | 'web';
}

function getCapacitor(): CapacitorGlobal | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as Window & { Capacitor?: CapacitorGlobal }).Capacitor;
}

/** True when running inside the Capacitor iOS or Android WebView. */
export function isNative(): boolean {
  return getCapacitor()?.isNativePlatform?.() ?? false;
}

/** True only inside the iOS Capacitor WebView. */
export function isIOS(): boolean {
  return getCapacitor()?.getPlatform?.() === 'ios';
}

/** True only inside the Android Capacitor WebView. */
export function isAndroid(): boolean {
  return getCapacitor()?.getPlatform?.() === 'android';
}

/** True when running in a regular browser (Vite dev server, Vercel PWA, etc.). */
export function isWeb(): boolean {
  return !isNative();
}

/**
 * iOS Safari running as a standalone PWA (installed via "Add to Home Screen").
 * Useful to enable safe-area styling outside the Capacitor shell too.
 */
export function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true
    || window.matchMedia('(display-mode: standalone)').matches;
}

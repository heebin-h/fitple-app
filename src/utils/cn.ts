/**
 * Tiny className combiner. Skips falsy values and collapses extra whitespace.
 *
 *   cn('btn', isActive && 'btn-active', undefined, 'rounded')
 *   // => 'btn btn-active rounded'
 *
 * No external dependency on `clsx` / `classnames` — keeps the bundle slim.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Design tokens as plain TS constants — useful when you need the hex value
 * in JS context (canvas drawing, dynamic style props, Capacitor plugin args
 * such as `StatusBar.setBackgroundColor`). Tailwind class names should
 * still be the default for normal styling.
 *
 * Keep in sync with `tailwind.config.ts` and SPEC.md §6.1.
 */

export const COLORS = {
  // Brand
  orange:        '#FF5722',
  orangeTint:    '#FFF0ED',

  // Text
  textPrimary:   '#111111',
  textSecondary: '#555555',
  textHint:      '#AAAAAA',
  textDisabled:  '#CCCCCC',
  textWhite:     '#FFFFFF',

  // Borders
  borderDefault: '#DDDDDD',
  borderActive:  '#333333',
  borderValid:   '#2196F3',
  borderError:   '#FF4444',

  // Surfaces
  surface:    '#FFFFFF',
  background: '#F2F2F2',

  // Buttons
  btnKakao:    '#FEE500',
  btnDisabled: '#CCCCCC',

  // Semantic
  blue:      '#2196F3',
  blueTint:  '#E3F2FD',
  green:     '#4CAF50',
  greenTint: '#E8F5E9',
  error:     '#FF4444',

  // Card tints
  cardGreen:  '#E8F5E9',
  cardBlue:   '#E3F2FD',
  cardWarm:   '#FFF3E0',
  cardPink:   '#FCE4EC',
  cardPurple: '#EDE7F6',

  // Badges / overlays
  badgeDark:     '#CC222222',
  gradientStart: '#00000000',
  gradientEnd:   '#E6000000',

  // Sport light highlight
  sportLightAccent: '#F5AA96',
  sportLightTint:   '#FFF5F2',

  // Notice
  noticeBg:  '#FEF7F7',
  noticeRed: '#EB5048',

  // Google glyph
  googleBlue:   '#4285F4',
  googleGreen:  '#34A853',
  googleYellow: '#FBBC05',
  googleRed:    '#EA4335',
} as const;

export type ColorToken = keyof typeof COLORS;

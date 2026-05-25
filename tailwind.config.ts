import type { Config } from 'tailwindcss';

/**
 * FitPle design tokens.
 *
 * Source of truth:
 *   - Colours: SPEC.md §6.1 (extracted from Android `res/values/colors.xml`).
 *   - Typography scale: SPEC.md §25.20 (derived from design exports under /designs/).
 *
 * Do not edit token values without updating SPEC.md first — the spec is the
 * authoritative design document.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Brand primary ─────────────────────────────────────────
        orange:       '#FF5722',
        orangeTint:   '#FFF0ED',

        // ── Text ──────────────────────────────────────────────────
        textPrimary:   '#111111',
        textSecondary: '#555555',
        textHint:      '#AAAAAA',
        textDisabled:  '#CCCCCC',
        textWhite:     '#FFFFFF',

        // ── Borders ───────────────────────────────────────────────
        borderDefault: '#DDDDDD',
        borderActive:  '#333333',
        borderValid:   '#2196F3',
        borderError:   '#FF4444',

        // ── Surfaces ──────────────────────────────────────────────
        surface:    '#FFFFFF',
        background: '#F2F2F2',

        // ── Buttons ───────────────────────────────────────────────
        btnKakao:    '#FEE500',
        btnDisabled: '#CCCCCC',

        // ── Semantic ─────────────────────────────────────────────
        blue:       '#2196F3',
        blueTint:   '#E3F2FD',
        green:      '#4CAF50',
        greenTint:  '#E8F5E9',
        error:      '#FF4444',

        // ── Card tints (SignupComplete preview cards) ────────────
        cardGreen:  '#E8F5E9',
        cardBlue:   '#E3F2FD',
        cardWarm:   '#FFF3E0',
        cardPink:   '#FCE4EC',
        cardPurple: '#EDE7F6',

        // ── Badges / overlays ────────────────────────────────────
        badgeDark:      '#CC222222',
        gradientStart:  '#00000000',
        gradientEnd:    '#E6000000',

        // ── Sport light highlight (preference DETAIL phase) ──────
        sportLightAccent: '#F5AA96',
        sportLightTint:   '#FFF5F2',

        // ── Notice badge ─────────────────────────────────────────
        noticeBg:  '#FEF7F7',
        noticeRed: '#EB5048',

        // ── Google brand glyph slices ────────────────────────────
        googleBlue:   '#4285F4',
        googleGreen:  '#34A853',
        googleYellow: '#FBBC05',
        googleRed:    '#EA4335',
      },

      // SPEC §25.20 — 14 typography tokens.
      fontSize: {
        display:         ['22px', { lineHeight: '1.35', fontWeight: '700' }],
        h1:              ['19px', { lineHeight: '1.30', fontWeight: '700' }],
        h2:              ['17px', { lineHeight: '1.40', fontWeight: '700' }],
        h3:              ['16px', { lineHeight: '1.40', fontWeight: '600' }],
        body:            ['15px', { lineHeight: '1.50', fontWeight: '500' }],
        'body-strong':   ['15px', { lineHeight: '1.50', fontWeight: '700' }],
        label:           ['14px', { lineHeight: '1.40', fontWeight: '500' }],
        'label-strong':  ['14px', { lineHeight: '1.40', fontWeight: '700' }],
        caption:         ['13px', { lineHeight: '1.45', fontWeight: '500' }],
        'caption-strong':['13px', { lineHeight: '1.45', fontWeight: '700' }],
        micro:           ['12px', { lineHeight: '1.40', fontWeight: '500' }],
        'micro-strong':  ['12px', { lineHeight: '1.40', fontWeight: '700' }],
        mini:            ['11px', { lineHeight: '1.30', fontWeight: '500' }],
        'mini-strong':   ['11px', { lineHeight: '1.30', fontWeight: '700' }],
      },

      maxWidth: {
        mobile: '430px',
      },

      fontFamily: {
        sans: ['Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
      },

      borderRadius: {
        card: '12px',
        sheet: '20px',
      },

      // Animation tokens — slide transitions from SPEC §6.5.
      transitionTimingFunction: {
        ios: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      transitionDuration: {
        ios: '240ms',
      },
    },
  },
  plugins: [],
} satisfies Config;

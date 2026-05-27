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
        // 출처: Figma 변수 "Text Icon/Primary" (#ff5432). 2026-05-28 디자인 기준으로
        // 기존 #FF5722에서 갱신 (HANDOFF §5 / SPEC §6 동시 갱신).
        orange:       '#ff5432',
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

        // ── Buttons / social (Figma Login 기준) ───────────────────
        btnKakao:    '#fae100',   // 카카오 옐로 (Figma)
        kakaoLabel:  '#3c1d1e',   // 카카오 버튼 글자 (다크 브라운)
        appleBg:     '#0a0b0c',   // Apple 버튼 배경 (니어 블랙)
        btnDisabled: '#CCCCCC',

        // ── Neutral scale (Figma 디자인 변수 미러) ────────────────
        neutralLow:  '#bdbdbd',   // Figma "Text Icon/Neutral/Low Emphasis" — 보더/저강조
        neutralMid:  '#999999',   // 저강조 링크 (둘러보기)
        neutralHigh: '#424242',   // Figma "Text Icon/Neutral/High Emphasis" — 링크/고강조

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

      // SPEC §25.20 — typography tokens.
      // hero / label-semibold 는 Figma Login 화면 기준으로 추가 (2026-05-28).
      fontSize: {
        hero:            ['26px', { lineHeight: '1.40', fontWeight: '600' }],
        'label-semibold':['14px', { lineHeight: '1.40', fontWeight: '600' }],
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

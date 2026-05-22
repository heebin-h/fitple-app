import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Phase 0 후반에 Android colors.xml에서 실제값 추출 예정 (현재는 placeholder)
        orange: '#FF6B35',
        btnDisabled: '#E0E0E0',
        inputBorder: '#D9D9D9',
        inputError: '#FF3B30',
        inputValid: '#34C759',
      },
      maxWidth: {
        mobile: '430px',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;

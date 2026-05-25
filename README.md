# FitPle

운동 모임 매칭 앱 FitPle의 **React 웹 + PWA** 데모. 백엔드 없음, localStorage 기반.
**Capacitor**로 iOS 앱 빌드도 가능 (본인 아이폰 테스트용, Free Apple ID).

> 별도로 Android 네이티브(Kotlin) 원본 앱이 존재하며 본 프로젝트는 그것과 데이터 공유하지 않음.

---

## 빠른 시작

```bash
npm install
npm run dev               # 로컬 개발 서버 (http://localhost:5173)
npm run dev -- --host     # LAN 공개 (같은 Wi-Fi의 폰 Safari로 접속 가능)
npm run build             # 프로덕션 빌드 (dist/)
npm run preview           # 빌드 결과 로컬 확인
```

## 데모 계정

```
demo@fitple.app / demo1234
```

앱 첫 실행 시 시드 데이터로 자동 등록 (모임/후기/스케줄/채팅 포함).

## iOS 앱으로 본인 폰에 빌드 (옵션)

전제: macOS, Xcode 설치, 본인 Apple ID, USB 케이블.

```bash
brew install cocoapods
npm run build
npx cap add ios           # 최초 1회만
npx cap sync
npx cap open ios          # Xcode 열림
# Xcode → Signing & Capabilities → Team 선택 → ▶ Run
```

⚠️ Free Apple ID는 본인 폰만, 7일 만료. 친구 폰 배포는 Apple Developer Program ($99/년) 필요.

## 문서

- **`SPEC.md`** — 전체 기술 사양 (25 섹션, 1624 줄)
- **`HANDOFF.md`** — 진행 상황 + 다음 작업 + 환경 정보 (세션 인계용)
- 외부 계획서: `/Users/heebiny/AndroidStudioProjects/FitPle/REACT_WEB_PLAN.md`

## 기술 스택

React 18 · TypeScript 5 · Vite 8 · Tailwind CSS 3 · Zustand · React Router 6 · vite-plugin-pwa · Capacitor 7

저장소: localStorage + Web Crypto SHA-256

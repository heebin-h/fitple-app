/**
 * 로그인 진입 화면. SPEC §12.2 — Figma `1.로그인` 프레임 기준 구현 (2026-05-28).
 *
 * 레이아웃(위→아래): 로고 마크 → hero 타이틀 → 체험권 배지 → 소셜 4버튼 →
 * "회원가입" 링크 → "회원가입 없이 둘러보기".
 *
 * 동작 (v1 데모 범위):
 *   - 카카오/Apple/Google : Toast "준비 중인 기능이에요" (소셜 로그인 데모 범위 외, §5)
 *   - 이메일로 시작하기   : navigate('/email-login') — Android EmailLoginFragment 흐름.
 *   - 회원가입            : navigate('/signup/email') — Android SignupEmailFragment 흐름.
 *   - 둘러보기            : authStore.enterGuest() → /home (§11.5)
 *
 * 데모 회원 홈 확인이 필요하면 /email-login 에서 demo@fitple.app / demo1234 입력.
 *
 * 색/타이포/간격은 모두 토큰 사용(룰 #1·#2). 에셋은 Figma 내보내기(assets/images/login/).
 */

import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../utils/cn';

import logoFitple from '../../assets/images/login/logo_fitple.png';
import badgeBubble from '../../assets/images/login/badge.svg';
import iconKakao from '../../assets/images/login/kakao.svg';
import iconApple from '../../assets/images/login/apple.svg';
import iconMail from '../../assets/images/login/mail.svg';
import google1 from '../../assets/images/login/google1.svg';
import google2 from '../../assets/images/login/google2.svg';
import google3 from '../../assets/images/login/google3.svg';
import google4 from '../../assets/images/login/google4.svg';

/**
 * Figma 멀티컬러 'G' — 4개 컬러 조각을 24×24 박스에 inset으로 합성.
 * 패턴: 외곽 span이 inset으로 위치/크기 잡고, 내부 img는 그 박스를 가득 채운다
 * (`<img>`에 inset만 주면 SVG intrinsic 크기 때문에 길게 늘어남).
 */
function GoogleGlyph() {
  const parts: { src: string; inset: string }[] = [
    { src: google1, inset: 'inset-[40.99%_0.97%_12.07%_51.01%]' },
    { src: google2, inset: 'inset-[59.59%_15.86%_-0.01%_6.32%]' },
    { src: google3, inset: 'inset-[27.56%_77.06%_27.53%_1.01%]' },
    { src: google4, inset: 'inset-[0_15.55%_59.56%_6.32%]' },
  ];
  return (
    <span className="relative block size-6">
      {parts.map((p, i) => (
        <span key={i} className={cn('absolute block', p.inset)}>
          <img src={p.src} alt="" className="block size-full max-w-none" />
        </span>
      ))}
    </span>
  );
}

function SocialButton({
  icon,
  label,
  className,
  labelClassName,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  className: string;
  labelClassName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('flex h-12 w-full items-center justify-center gap-1 rounded-lg', className)}
    >
      {icon}
      <span className={cn('text-label-semibold', labelClassName)}>{label}</span>
    </button>
  );
}

export function LoginScreen() {
  const navigate = useNavigate();
  const enterGuest = useAuthStore((s) => s.enterGuest);

  const handleGuest = () => {
    enterGuest();
    navigate('/home');
  };

  const notReady = () => toast('준비 중인 기능이에요');

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-surface px-[22px] pt-safe pb-safe">
      <div className="flex w-full max-w-[346px] flex-col items-center gap-[44px] pt-[60px]">
        <div className="flex w-full flex-col items-center gap-[26px]">
          {/* 로고 마크 */}
          <img src={logoFitple} alt="FitPle" className="h-[100px] w-[100px]" />

          {/* hero 타이틀 */}
          <h1 className="text-hero text-center text-black">
            가장 편한 방법으로
            <br />
            <span className="font-extrabold text-orange">핏플</span>을 시작해보세요!
          </h1>

          <div className="flex w-full flex-col items-center gap-[20px]">
            {/* 체험권 배지 */}
            <div className="relative h-[44px] w-[166px]">
              <img src={badgeBubble} alt="" className="absolute inset-0 h-full w-full" />
              <p className="absolute left-1/2 top-[7px] -translate-x-1/2 whitespace-nowrap text-micro text-textPrimary">
                회원가입하고 <span className="font-bold">1회 체험권</span> 받기!
              </p>
            </div>

            {/* 소셜 4버튼 */}
            <div className="flex w-full flex-col gap-[12px]">
              <SocialButton
                onClick={notReady}
                className="bg-btnKakao"
                labelClassName="text-kakaoLabel"
                icon={<img src={iconKakao} alt="" className="h-[18px] w-[20px]" />}
                label="카카오로 계속하기"
              />
              <SocialButton
                onClick={notReady}
                className="bg-appleBg"
                labelClassName="text-textWhite"
                icon={<img src={iconApple} alt="" className="h-[22px] w-[19px]" />}
                label="Apple로 계속하기"
              />
              <SocialButton
                onClick={notReady}
                className="border border-neutralLow bg-surface"
                labelClassName="text-textPrimary"
                icon={<GoogleGlyph />}
                label="Google로 시작하기"
              />
              <SocialButton
                onClick={() => navigate('/email-login')}
                className="bg-neutralLow"
                labelClassName="text-textWhite"
                icon={<img src={iconMail} alt="" className="h-[15px] w-[20px]" />}
                label="이메일로 시작하기"
              />
            </div>

            {/* 회원가입 → 가입 흐름 시작 (§11.3 step 1) */}
            <button
              type="button"
              onClick={() => navigate('/signup/email')}
              className="text-micro text-neutralHigh underline"
            >
              회원가입
            </button>
          </div>
        </div>

        {/* 둘러보기 */}
        <button
          type="button"
          onClick={handleGuest}
          className="text-micro text-neutralMid underline"
        >
          회원가입 없이 둘러보기
        </button>
      </div>
    </div>
  );
}

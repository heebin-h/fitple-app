/**
 * 회원가입 Step 5 — 선호운동. SPEC §12.8 / Android `SignupPreferenceFragment.kt` +
 * 디자인 `sign_signup_preference_*.png` 기준.
 *
 * SELECTION:
 *   타이틀: "거의 다했어요! 맞춤 운동을 제공 할 수 있도록 / 몇가지만 알려주세요!"
 *   서브:   "어떤 운동 선호하나요?(중복선택 가능해요)"
 *   5종목 **가로 1줄** 아이콘 그리드. 선택 시 오렌지 보더 + 라이트 오렌지 배경 + 오렌지 라벨.
 *   "다음" 활성: 1개 이상. 우상단 "건너뛰기" → 빈 sports로 직행.
 *
 * DETAIL:
 *   서브: "선택 한 운동의 필터를 설정하면 / 모임을 추천해 드려요"
 *   상단 5종목 가로 행 (선택된 종목들은 라이트 오렌지, 현재 종목은 오렌지 보더 강조,
 *   미선택 종목은 회색). 현재 종목의 모든 질문이 세로로 쌓이고, 옵션은 가로 pill 칩.
 *   "다음" 활성: 현재 종목의 모든 질문에 답 → next() → 다음 종목 또는 finishSignup.
 */

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userManager } from '../../storage/userManager';
import { useAuthStore } from '../../store/authStore';
import {
  usePreferenceStore,
  buildSavePayload,
  isSportComplete,
} from '../../store/preferenceStore';
import { SPORTS } from '../../constants/sports';
import { cn } from '../../utils/cn';
import { SignupToolbar } from '../../components/auth/SignupToolbar';

import iconRunning from '../../assets/images/sports/sport_running.png';
import iconFutsal from '../../assets/images/sports/sport_futsal.png';
import iconHiking from '../../assets/images/sports/sport_hiking.png';
import iconCycling from '../../assets/images/sports/sport_cycling.png';
import iconGolf from '../../assets/images/sports/sport_golf.png';

const ICONS: Record<string, string> = {
  러닝: iconRunning,
  풋살: iconFutsal,
  등산: iconHiking,
  사이클: iconCycling,
  골프: iconGolf,
};

export function SignupPreferenceScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((s) => s.setUser);
  const email = (location.state as { email?: string } | null)?.email ?? '';

  const phase = usePreferenceStore((s) => s.phase);
  const selectedSports = usePreferenceStore((s) => s.selectedSports);
  const detailQueue = usePreferenceStore((s) => s.detailQueue);
  const detailStep = usePreferenceStore((s) => s.detailStep);
  const detailSelections = usePreferenceStore((s) => s.detailSelections);
  const selectSport = usePreferenceStore((s) => s.selectSport);
  const beginDetail = usePreferenceStore((s) => s.beginDetail);
  const setAnswer = usePreferenceStore((s) => s.setAnswer);
  const next = usePreferenceStore((s) => s.next);
  const reset = usePreferenceStore((s) => s.reset);

  // 직접 진입 방어
  useEffect(() => {
    if (!email) navigate('/signup/email', { replace: true });
  }, [email, navigate]);

  // 화면 이탈 시 reset (다음 회원가입 깨끗하게)
  useEffect(() => () => reset(), [reset]);

  const finishSignup = async (
    sports: string[],
    details: Record<string, Record<string, string>>,
  ) => {
    if (!email) return;
    await userManager.savePreferences(email, sports, details);
    userManager.setLoggedIn(email);
    userManager.clearPendingSignup();
    setUser(await userManager.getCurrentUser());
    navigate('/signup/complete', { replace: true });
  };

  // ─────────────────────────────────────────────────────────
  // SELECTION
  // ─────────────────────────────────────────────────────────
  if (phase === 'SELECTION') {
    const canProceed = selectedSports.length > 0;
    return (
      <div className="flex min-h-dvh flex-col bg-surface px-6 pt-safe pb-safe">
        <SignupToolbar
          rightLabel="건너뛰기"
          onRightTap={() => finishSignup([], {})}
        />

        <div className="flex flex-1 flex-col">
          <h1 className="mt-4 text-display text-textPrimary">
            거의 다했어요! 맞춤 운동을 제공 할 수 있도록
            <br />
            몇가지만 알려주세요!
          </h1>
          <p className="mt-6 text-label-strong text-textPrimary">
            어떤 운동 선호하나요?<span className="text-textSecondary">(중복선택 가능해요)</span>
          </p>

          {/* 5종목 가로 1줄 */}
          <div className="mt-4 flex gap-2">
            {SPORTS.map((sport) => {
              const selected = selectedSports.includes(sport.name);
              return (
                <SportTile
                  key={sport.name}
                  name={sport.name}
                  icon={ICONS[sport.name]}
                  state={selected ? 'selected' : 'idle'}
                  onTap={() => selectSport(sport.name)}
                />
              );
            })}
          </div>
        </div>

        <div className="pb-4">
          <button
            type="button"
            onClick={() => canProceed && beginDetail()}
            disabled={!canProceed}
            className={cn(
              'h-[52px] w-full rounded-card text-body-strong text-textWhite',
              canProceed ? 'bg-orange' : 'bg-btnDisabled',
            )}
          >
            다음
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // DETAIL
  // ─────────────────────────────────────────────────────────
  const currentSport = detailQueue[detailStep];
  const def = SPORTS.find((s) => s.name === currentSport);
  if (!def) return null;

  const sportComplete = isSportComplete(currentSport, detailSelections);

  const handleNext = async () => {
    if (!sportComplete) return;
    if (next() === 'done') {
      const { sports, details } = buildSavePayload({ selectedSports, detailSelections });
      await finishSignup(sports, details);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-surface px-6 pt-safe pb-safe">
      <SignupToolbar
        rightLabel="건너뛰기"
        onRightTap={() => finishSignup([], {})}
      />

      <div className="flex flex-1 flex-col overflow-y-auto">
        <p className="mt-4 text-display text-textPrimary">
          선택 한 운동의 필터를 설정하면
          <br />
          모임을 추천해 드려요
        </p>

        {/* 5종목 가로 행 — 3상태:
            current(현재 종목 = 진한 오렌지) / light(선택했지만 현재 아님 = 연한 오렌지) / muted(미선택 = 회색).
            SPORTS 카탈로그 순서로 고정 표시 (사용자 선택 순서 무관). */}
        <div className="mt-6 flex gap-2">
          {SPORTS.map((sport) => {
            const isCurrent = sport.name === currentSport;
            const isSelected = selectedSports.includes(sport.name);
            const tileState = isCurrent ? 'current' : isSelected ? 'light' : 'muted';
            return (
              <SportTile
                key={sport.name}
                name={sport.name}
                icon={ICONS[sport.name]}
                state={tileState}
                onTap={() => undefined}
                disabled
              />
            );
          })}
        </div>

        {/* 현재 종목의 모든 질문 */}
        <div className="mt-6 flex flex-col gap-5 pb-4">
          {def.questions.map((q) => {
            const answeredIdx = detailSelections[currentSport]?.[q.question];
            return (
              <div key={q.question}>
                <p className="text-label-strong text-textPrimary">{q.question}</p>
                {/* 옵션 칩 — Android `HorizontalScrollView` 매칭: 줄바꿈 X, 가로 스크롤 O.
                    각 칩 `flex-shrink-0` 으로 폭 유지, 컨테이너 `overflow-x-auto` 로 스크롤. */}
                <div className="mt-3 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                  {q.options.map((opt, idx) => {
                    const sel = answeredIdx === idx;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswer(currentSport, q.question, idx)}
                        className={cn(
                          'inline-flex h-9 flex-shrink-0 items-center rounded-full border px-3 text-caption',
                          sel
                            ? 'border-orange bg-orangeTint text-orange'
                            : 'border-borderDefault bg-surface text-textSecondary',
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pb-4">
        <button
          type="button"
          onClick={handleNext}
          disabled={!sportComplete}
          className={cn(
            'h-[52px] w-full rounded-card text-body-strong text-textWhite',
            sportComplete ? 'bg-orange' : 'bg-btnDisabled',
          )}
        >
          다음
        </button>
      </div>
    </div>
  );
}

type TileState = 'idle' | 'selected' | 'current' | 'light' | 'muted';

function SportTile({
  name,
  icon,
  state,
  onTap,
  disabled = false,
}: {
  name: string;
  icon: string;
  state: TileState;
  onTap: () => void;
  disabled?: boolean;
}) {
  // 상태별 룩 — 명확한 시각 계층:
  //   idle    : SELECTION 미선택 (탭 가능, 회색)
  //   selected: SELECTION 선택됨 (오렌지 강조)
  //   current : DETAIL의 현재 종목 (가장 강조)
  //   light   : DETAIL에서 선택된 종목이지만 현재 아님 (라이트 오렌지)
  //   muted   : DETAIL에서 SELECTION 단계에 선택되지 않은 종목 (강한 회색 — 비활성)
  const styles: Record<TileState, { box: string; label: string; iconClass: string }> = {
    idle:     { box: 'border-borderDefault bg-background',           label: 'text-textSecondary', iconClass: 'opacity-70 grayscale' },
    selected: { box: 'border-orange bg-orangeTint',                  label: 'text-orange font-bold', iconClass: '' },
    current:  { box: 'border-orange bg-orangeTint',                  label: 'text-orange font-bold', iconClass: '' },
    light:    { box: 'border-sportLightAccent bg-sportLightTint',    label: 'text-sportLightAccent', iconClass: 'opacity-90' },
    muted:    { box: 'border-borderDefault bg-background',           label: 'text-textHint',         iconClass: 'opacity-50 grayscale' },
  };
  const s = styles[state];
  return (
    <button
      type="button"
      onClick={onTap}
      disabled={disabled}
      aria-pressed={state === 'selected' || state === 'current'}
      className={cn('flex min-w-0 flex-1 flex-col items-center gap-1.5')}
    >
      <span
        className={cn(
          'flex aspect-square w-full items-center justify-center rounded-card border-2',
          s.box,
        )}
      >
        {/* 아이콘은 타일의 ~60% — 64px 타일에서 ~40px */}
        <img src={icon} alt={name} className={cn('h-3/5 w-3/5 object-contain', s.iconClass)} />
      </span>
      <span className={cn('text-mini-strong', s.label)}>{name}</span>
    </button>
  );
}

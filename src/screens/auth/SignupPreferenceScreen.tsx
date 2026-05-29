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
      <div className="flex min-h-screen flex-col bg-surface px-5 pt-safe pb-safe">
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
    <div className="flex min-h-screen flex-col bg-surface px-5 pt-safe pb-safe">
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

        {/* 5종목 가로 행 — 모든 종목 표시, 선택/현재/미선택 3가지 상태 */}
        <div className="mt-6 flex gap-2">
          {SPORTS.map((sport) => {
            const isInQueue = detailQueue.includes(sport.name);
            const isCurrent = sport.name === currentSport;
            const state: TileState = isCurrent
              ? 'current'
              : isInQueue
                ? 'light'
                : 'muted';
            return (
              <SportTile
                key={sport.name}
                name={sport.name}
                icon={ICONS[sport.name]}
                state={state}
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
                <div className="mt-3 flex flex-wrap gap-2">
                  {q.options.map((opt, idx) => {
                    const sel = answeredIdx === idx;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswer(currentSport, q.question, idx)}
                        className={cn(
                          'inline-flex h-9 items-center rounded-full border px-3 text-caption',
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
  const styles: Record<TileState, { box: string; label: string; iconClass: string }> = {
    idle:     { box: 'border-borderDefault bg-background',  label: 'text-textSecondary', iconClass: 'opacity-60' },
    selected: { box: 'border-orange bg-orangeTint',         label: 'text-orange',        iconClass: '' },
    current:  { box: 'border-orange bg-orangeTint ring-2 ring-orange/30', label: 'text-orange', iconClass: '' },
    light:    { box: 'border-sportLightAccent bg-sportLightTint', label: 'text-sportLightAccent', iconClass: 'opacity-80' },
    muted:    { box: 'border-borderDefault bg-background',  label: 'text-textHint',      iconClass: 'opacity-40 grayscale' },
  };
  const s = styles[state];
  return (
    <button
      type="button"
      onClick={onTap}
      disabled={disabled}
      aria-pressed={state === 'selected' || state === 'current'}
      className={cn('flex flex-1 flex-col items-center gap-1.5')}
    >
      <span
        className={cn(
          'flex h-14 w-full items-center justify-center rounded-card border-2',
          s.box,
        )}
      >
        <img src={icon} alt={name} className={cn('h-8 w-8', s.iconClass)} />
      </span>
      <span className={cn('text-mini-strong', s.label)}>{name}</span>
    </button>
  );
}

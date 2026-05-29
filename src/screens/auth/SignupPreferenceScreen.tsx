/**
 * 회원가입 Step 5 — 선호운동 (SELECTION → DETAIL 2-phase). SPEC §12.8 / Android `SignupPreferenceFragment.kt`.
 *
 *   SELECTION:
 *     "관심있는 운동을 선택해주세요" + 5종목 타일 (2열 그리드 + 마지막 1개 중앙).
 *     1개 이상 선택 시 "다음" 활성화 → beginDetail() → DETAIL.
 *     toolbar 우측 "건너뛰기" → 빈 sports로 즉시 savePreferences → 완료 화면.
 *
 *   DETAIL:
 *     선택한 종목 순서대로, 각 종목의 질문을 1개씩 carousel.
 *     상단 progress strip (선택한 종목 라벨, 현재 활성 = 주황 / 나머지 = 라이트).
 *     "다음" 활성화: 현재 질문 선택지가 골라져 있을 때.
 *     마지막 질문 답하면 → savePreferences + setLoggedIn + clearPendingSignup → /signup/complete.
 *
 * 뒤로가기: DETAIL step 0 에서 뒤로 → SELECTION 으로 복귀 (답변 보존). SELECTION 에서
 * 시스템 뒤로 → 닉네임 화면 (browser back).
 */

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { userManager } from '../../storage/userManager';
import { useAuthStore } from '../../store/authStore';
import { usePreferenceStore, buildSavePayload } from '../../store/preferenceStore';
import { SPORTS } from '../../constants/sports';
import { cn } from '../../utils/cn';

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
  const back = usePreferenceStore((s) => s.back);
  const reset = usePreferenceStore((s) => s.reset);

  // 직접 진입 방어
  useEffect(() => {
    if (!email) navigate('/signup/email', { replace: true });
  }, [email, navigate]);

  // 화면 이탈 시 reset (가입 완료 후 다음 회원가입 깨끗하게)
  useEffect(() => () => reset(), [reset]);

  const finishSignup = async (sports: string[], details: Record<string, Record<string, string>>) => {
    if (!email) return;
    await userManager.savePreferences(email, sports, details);
    userManager.setLoggedIn(email);
    userManager.clearPendingSignup();
    setUser(await userManager.getCurrentUser());
    navigate('/signup/complete', { replace: true });
  };

  // ── SELECTION ────────────────────────────────────────────
  if (phase === 'SELECTION') {
    const canProceed = selectedSports.length > 0;
    return (
      <div className="flex min-h-screen flex-col bg-surface px-5 pt-safe pb-safe">
        <header className="flex h-12 items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로"
            className="-ml-2 p-2 text-textPrimary"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            type="button"
            onClick={() => finishSignup([], {})}
            className="text-caption text-neutralHigh underline"
          >
            건너뛰기
          </button>
        </header>

        <div className="flex flex-1 flex-col">
          <h1 className="mt-4 text-display text-textPrimary">관심있는 운동을 선택해주세요</h1>

          {/* 2열 그리드 + 마지막 5번째는 중앙 */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            {SPORTS.slice(0, 4).map((sport) => (
              <SportTile
                key={sport.name}
                name={sport.name}
                selected={selectedSports.includes(sport.name)}
                onTap={() => selectSport(sport.name)}
              />
            ))}
            {/* 5번째 중앙 */}
            <div className="col-span-2 flex justify-center">
              <div className="w-1/2">
                <SportTile
                  name={SPORTS[4].name}
                  selected={selectedSports.includes(SPORTS[4].name)}
                  onTap={() => selectSport(SPORTS[4].name)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pb-4">
          <button
            type="button"
            onClick={() => {
              if (!canProceed) return;
              beginDetail();
            }}
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

  // ── DETAIL ───────────────────────────────────────────────
  const step = detailQueue[detailStep];
  if (!step) return null;  // 큐 비정상 — beginDetail 직후 보호

  const answered = detailSelections[step.sport]?.[step.question];
  const canProceed = typeof answered === 'number';

  const handleNext = async () => {
    if (!canProceed) return;
    if (next() === 'done') {
      const { sports, details } = buildSavePayload({ selectedSports, detailSelections });
      await finishSignup(sports, details);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface px-5 pt-safe pb-safe">
      <header className="flex h-12 items-center">
        <button
          type="button"
          onClick={() => back()}
          aria-label="뒤로"
          className="-ml-2 p-2 text-textPrimary"
        >
          <ArrowLeft size={24} />
        </button>
      </header>

      <div className="flex flex-1 flex-col">
        {/* progress strip */}
        <div className="mt-2 flex gap-1.5">
          {selectedSports.map((s) => (
            <span
              key={s}
              className={cn(
                'rounded-full px-3 py-1 text-caption',
                s === step.sport
                  ? 'bg-orange text-textWhite'
                  : 'bg-sportLightTint text-sportLightAccent',
              )}
            >
              {s}
            </span>
          ))}
        </div>

        <h1 className="mt-6 text-display text-textPrimary">
          {step.sport} 정보를 알려주세요
        </h1>
        <p className="mt-1 text-label text-textSecondary">{step.question}</p>

        <div className="mt-6 flex flex-col gap-2">
          {step.options.map((opt, idx) => {
            const selected = answered === idx;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setAnswer(step.sport, step.question, idx)}
                className={cn(
                  'flex h-12 items-center justify-between rounded-card border px-4 text-label text-textPrimary',
                  selected ? 'border-orange bg-orangeTint' : 'border-borderDefault bg-surface',
                )}
              >
                <span>{opt}</span>
                {selected && <Check size={18} className="text-orange" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pb-4">
        <button
          type="button"
          onClick={handleNext}
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

function SportTile({
  name,
  selected,
  onTap,
}: {
  name: string;
  selected: boolean;
  onTap: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      aria-pressed={selected}
      className={cn(
        'relative flex aspect-square w-full flex-col items-center justify-center rounded-card border-2',
        selected ? 'border-orange bg-orangeTint' : 'border-borderDefault bg-surface',
      )}
    >
      <span className="text-h1 text-orange">{name.charAt(0)}</span>
      <span className="mt-2 text-label text-textPrimary">{name}</span>
      {selected && (
        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange text-textWhite">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

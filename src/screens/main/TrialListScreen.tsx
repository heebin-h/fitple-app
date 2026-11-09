/**
 * 체험 가능한 모임 전체 목록 — `/trials`.
 * Android `TrialListFragment.kt` + `fragment_trial_list.xml` 포트. 디자인 PNG 없음 → XML 기준.
 *
 *   - 툴바 56dp, 좌측 뒤로(28dp), 가운데 타이틀 "체험 가능한 모임" 17sp bold
 *   - 목록: paddingHorizontal 20 / top 12 / bottom 24, item_trial_card 세로 나열
 *   - 카드·신청하기 탭 → 모임 상세 (Android onApply/onCardClick 모두 navigateToPostDetail)
 *   - 카드 간 세로 간격: Android는 marginEnd 12dp만 있어 세로 간격 0 → 가로 간격과 같은 12px 적용(차이)
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { TrialCard } from '../../components/meeting/TrialCard';
import { TRIAL_MEETING_IDS } from '../../data/seedData';
import type { Meeting } from '../../data/models';

function readTrialMeetings(): Meeting[] {
  try {
    const all = JSON.parse(localStorage.getItem('meetings') ?? '[]') as Meeting[];
    return TRIAL_MEETING_IDS
      .map((id) => all.find((m) => m.id === id))
      .filter((m): m is Meeting => m !== undefined);
  } catch (e) {
    console.error('[TrialListScreen] meetings parse failed:', e);
    return [];
  }
}

export function TrialListScreen() {
  const navigate = useNavigate();
  const trials = useMemo(readTrialMeetings, []);
  const toDetail = (m: Meeting) => navigate(`/meeting/${m.id}`);

  return (
    <div className="flex min-h-dvh flex-col bg-surface pt-safe">
      <div className="relative flex h-14 items-center px-3">
        <button type="button" onClick={() => navigate(-1)} className="p-0.5" aria-label="뒤로가기">
          <ArrowLeft size={24} className="text-textPrimary" />
        </button>
        <h1 className="pointer-events-none absolute inset-x-0 text-center text-h2 text-textPrimary">
          체험 가능한 모임
        </h1>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3">
        {trials.map((m) => (
          <TrialCard key={m.id} meeting={m} onApply={() => toDetail(m)} onClick={() => toDetail(m)} />
        ))}
      </div>
    </div>
  );
}

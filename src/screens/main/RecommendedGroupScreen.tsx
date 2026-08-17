/**
 * 추천 모임 — 종목 필터 + 조건 칩. SPEC §12.13 / Android RecommendedGroupFragment.
 * 라우트: /explore (필터 없음) · /explore/:sport
 */

import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { MeetingCard } from '../../components/meeting/MeetingCard';
import { cn } from '../../utils/cn';
import type { Meeting } from '../../data/models';

function readMeetings(): Meeting[] {
  try { return JSON.parse(localStorage.getItem('meetings') ?? '[]') as Meeting[]; }
  catch { return []; }
}

const CHIPS = ['가까운 순', '편하게', '평일 오후', '주말'] as const;
type Chip = typeof CHIPS[number];

function applyChips(meetings: Meeting[], active: Set<Chip>): Meeting[] {
  return meetings.filter((m) => {
    if (active.has('편하게')   && m.level !== '보통') return false;
    if (active.has('평일 오후') && m.meetingTime && !/[월화수목금]/.test(m.meetingTime)) return false;
    if (active.has('주말')     && m.meetingTime && !/[토일]|주말/.test(m.meetingTime)) return false;
    return true;
  });
}

export function RecommendedGroupScreen() {
  const navigate = useNavigate();
  const { sport } = useParams<{ sport: string }>();
  const [activeChips, setActiveChips] = useState<Set<Chip>>(new Set());

  const meetings = useMemo(() => {
    const all = readMeetings();
    return sport ? all.filter((m) => m.sport === decodeURIComponent(sport)) : all;
  }, [sport]);

  const filtered = useMemo(() => applyChips(meetings, activeChips), [meetings, activeChips]);
  const title = sport ? `${decodeURIComponent(sport)} 추천 모임` : '추천 모임';

  const toggleChip = (chip: Chip) => {
    if (chip === '가까운 순') return;
    setActiveChips((prev) => {
      const next = new Set(prev);
      next.has(chip) ? next.delete(chip) : next.add(chip);
      return next;
    });
  };

  return (
    <div className="flex flex-col pt-safe">
      {/* 툴바 */}
      <div className="flex h-12 items-center gap-2 px-4">
        <button type="button" onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={22} className="text-textPrimary" />
        </button>
        <span className="flex-1 text-center text-h3 text-textPrimary">{title}</span>
        <div className="w-8" />
      </div>

      {/* 조건 칩 */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-2 pt-1 [&::-webkit-scrollbar]:hidden">
        {CHIPS.map((chip) => {
          const isActive = chip === '가까운 순' ? true : activeChips.has(chip);
          return (
            <button key={chip} type="button" onClick={() => toggleChip(chip)}
              className={cn(
                'flex-shrink-0 rounded-full border px-3 py-1 text-micro',
                isActive
                  ? 'border-orange bg-orange text-textWhite'
                  : 'border-borderDefault text-textSecondary',
              )}>
              {chip}
            </button>
          );
        })}
      </div>

      {/* 모임 목록 */}
      <div className="flex flex-col gap-2 px-5 pb-4">
        {filtered.map((m) => (
          <MeetingCard key={m.id} meeting={m} onClick={() => navigate(`/meeting/${m.id}`)} />
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-caption text-textHint">조건에 맞는 모임이 없어요</p>
        )}
      </div>
    </div>
  );
}

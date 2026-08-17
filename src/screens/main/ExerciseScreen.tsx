/**
 * 운동 — 전체 모임 목록. SPEC §12.12 / Android ExerciseFragment.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { MeetingCard } from '../../components/meeting/MeetingCard';
import type { Meeting } from '../../data/models';

function readMeetings(): Meeting[] {
  try { return JSON.parse(localStorage.getItem('meetings') ?? '[]') as Meeting[]; }
  catch { return []; }
}

export function ExerciseScreen() {
  const navigate = useNavigate();
  const meetings = useMemo(readMeetings, []);

  return (
    <div className="flex flex-col pt-safe">
      {/* 툴바 */}
      <div className="flex h-12 items-center gap-2 px-4">
        <button type="button" onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={22} className="text-textPrimary" />
        </button>
        <span className="flex-1 text-center text-h3 text-textPrimary">운동</span>
        <button type="button" onClick={() => toast('알림 기능을 준비 중이에요')} className="p-1">
          <Bell size={22} className="text-textPrimary" />
        </button>
      </div>

      {/* 위치 필터 pill */}
      <div className="px-5 py-2">
        <button type="button" onClick={() => toast('위치 변경 기능을 준비 중이에요')}
          className="rounded-full border border-borderDefault px-4 py-1.5 text-caption text-textSecondary">
          미사 1동 ▾
        </button>
      </div>

      {/* 모임 목록 */}
      <div className="flex flex-col gap-2 px-5 pb-4">
        {meetings.map((m) => (
          <MeetingCard key={m.id} meeting={m} onClick={() => navigate(`/meeting/${m.id}`)} />
        ))}
        {meetings.length === 0 && (
          <p className="py-8 text-center text-caption text-textHint">모임이 없어요</p>
        )}
      </div>
    </div>
  );
}

/**
 * 다가오는 정기모임. SPEC §12.14 / Android UpcomingMeetingFragment.
 * DateStrip (7일) + 날짜별 2열 그리드.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { meetingImg } from '../../utils/meetingImage';
import type { ScheduleItem } from '../../data/models';

function readSchedules(): ScheduleItem[] {
  try { return JSON.parse(localStorage.getItem('schedules') ?? '[]') as ScheduleItem[]; }
  catch { return []; }
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

function DateStrip({ schedules, selected, onSelect }: {
  schedules: ScheduleItem[]; selected: string; onSelect: (d: string) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    const date = d.toISOString().slice(0, 10);
    const labels = ['일','월','화','수','목','금','토'];
    return { date, label: labels[d.getDay()], num: d.getDate() };
  });
  const hasSched = (date: string) => schedules.some((s) => s.date === date);

  return (
    <div className="flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
      {days.map(({ date, label, num }) => {
        const isToday = date === todayStr();
        const isSel   = date === selected;
        return (
          <button key={date} type="button" onClick={() => onSelect(date)}
            className={cn(
              'flex flex-shrink-0 flex-col items-center gap-0.5 rounded-[8px] px-3 py-2',
              isSel ? 'bg-orange text-textWhite' : 'text-textPrimary',
            )}>
            <span className={cn('text-micro', isSel ? 'text-textWhite' : isToday ? 'text-orange' : 'text-textHint')}>
              {isToday ? '오늘' : label}
            </span>
            <span className="text-body-strong">{num}</span>
            {hasSched(date) && (
              <span className={cn('h-1 w-1 rounded-full', isSel ? 'bg-textWhite' : 'bg-orange')} />
            )}
          </button>
        );
      })}
    </div>
  );
}

export function UpcomingMeetingScreen() {
  const navigate  = useNavigate();
  const schedules = useMemo(readSchedules, []);
  const [selDate, setSelDate] = useState(todayStr());

  const now = new Date();
  const yearMonth = `${now.getFullYear()}년 ${now.getMonth() + 1}월`;

  const filtered = useMemo(
    () => schedules.filter((s) => s.date === selDate),
    [schedules, selDate],
  );

  return (
    <div className="flex min-h-dvh flex-col bg-surface pt-safe">
      {/* 툴바 */}
      <div className="flex h-12 items-center gap-2 px-4">
        <button type="button" onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={22} className="text-textPrimary" />
        </button>
        <span className="flex-1 text-center text-h3 text-textPrimary">다가오는 정기모임</span>
        <button type="button" onClick={() => toast('검색 기능을 준비 중이에요')} className="p-1">
          <Search size={20} className="text-textPrimary" />
        </button>
        <button type="button" onClick={() => toast('알림 기능을 준비 중이에요')} className="p-1">
          <Bell size={20} className="text-textPrimary" />
        </button>
      </div>

      {/* 년월 헤더 + DateStrip */}
      <div className="px-5 pb-3 pt-1">
        <p className="mb-2 text-h3 text-textPrimary">{yearMonth}</p>
        <DateStrip schedules={schedules} selected={selDate} onSelect={setSelDate} />
      </div>

      {/* 2열 그리드 */}
      <div className="flex-1 px-5 pb-4">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-caption text-textHint">이 날은 일정이 없어요</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((s) => (
              <button key={s.id} type="button"
                onClick={() => toast('모임 상세 기능을 준비 중이에요')}
                className="flex flex-col overflow-hidden rounded-card border border-borderDefault text-left">
                <div className="relative h-[100px] overflow-hidden bg-background">
                  <img src={meetingImg(s.image)} alt="" className="h-full w-full object-cover" />
                  {s.isUrgent && (
                    <span className="absolute right-2 top-2 rounded-[4px] bg-error px-1.5 py-0.5 text-[10px] text-textWhite">
                      마감임박
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 p-2.5">
                  <p className="truncate text-micro-strong text-textPrimary">{s.title}</p>
                  <p className="text-[10px] text-textSecondary">{s.time}</p>
                  <p className="text-[10px] text-textHint">{s.location} · {s.level}</p>
                  <p className="text-[10px] text-textHint">멤버 {s.memberCount}명</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

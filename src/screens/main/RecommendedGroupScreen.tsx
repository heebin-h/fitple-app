/**
 * 추천 모임 (종목 필터) (Phase 1 placeholder). SPEC §12.13 / §10.1.
 *
 * 라우트: /explore (필터 없음) · /explore/:sport (종목 필터).
 * 제목은 "{sport} 추천 모임" 또는 "추천 모임"(§12.13).
 *
 * Phase 1 범위: 시드 모임을 종목으로 필터해 제목만 나열. 조건 칩(가까운 순/편하게/
 * 평일 오후/주말)과 GroupListItem 디자인은 Phase 2/4에서.
 */

import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Meeting } from '../../data/models';

function readMeetings(): Meeting[] {
  try {
    return JSON.parse(localStorage.getItem('meetings') ?? '[]') as Meeting[];
  } catch {
    return [];
  }
}

export function RecommendedGroupScreen() {
  const navigate = useNavigate();
  const { sport } = useParams<{ sport: string }>();

  const meetings = useMemo(() => {
    const all = readMeetings();
    return sport ? all.filter((m) => m.sport === sport) : all;
  }, [sport]);

  const title = sport ? `${sport} 추천 모임` : '추천 모임';

  return (
    <div className="flex flex-col px-5 pt-safe">
      <header className="flex h-12 items-center">
        <h1 className="text-h2 text-textPrimary">{title}</h1>
      </header>

      <ul className="flex flex-col gap-2 py-2">
        {meetings.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => navigate(`/meeting/${m.id}`)}
              className="flex w-full flex-col items-start rounded-card border border-borderDefault px-4 py-3 text-left"
            >
              <span className="text-body-strong text-textPrimary">{m.title}</span>
              <span className="mt-0.5 text-caption text-textSecondary">
                {m.sport} · {m.location} · {m.memberCount}/{m.maxMembers}명
              </span>
            </button>
          </li>
        ))}
        {meetings.length === 0 && (
          <li className="py-6 text-caption text-textHint">해당 종목의 모임이 아직 없어요.</li>
        )}
      </ul>

      <p className="py-6 text-caption text-textHint">
        조건 필터 칩과 카드 디자인은 다음 단계에서 추가됩니다.
      </p>
    </div>
  );
}

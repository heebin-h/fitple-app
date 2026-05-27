/**
 * 운동(전체 모임 목록) (Phase 1 placeholder). SPEC §12.12.
 *
 * Phase 1 범위: 시드된 모임을 localStorage('meetings')에서 읽어 제목/장소만 나열.
 * 정식 MeetingCard, 위치 필터 pill, 정렬은 Phase 2(공통 컴포넌트)/Phase 4에서.
 *
 * 정식 데이터 접근은 추후 meetingsRepo로 옮긴다(§12.12 Data). 여기선 placeholder라
 * localStorage를 직접 읽되 파싱 실패는 빈 배열로 폴백한다.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Meeting } from '../../data/models';

function readMeetings(): Meeting[] {
  try {
    return JSON.parse(localStorage.getItem('meetings') ?? '[]') as Meeting[];
  } catch {
    return [];
  }
}

export function ExerciseScreen() {
  const navigate = useNavigate();
  const meetings = useMemo(readMeetings, []);

  return (
    <div className="flex flex-col px-5 pt-safe">
      <header className="flex h-12 items-center">
        <h1 className="text-h2 text-textPrimary">운동</h1>
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
      </ul>

      <p className="py-6 text-caption text-textHint">
        모임 카드 디자인과 필터는 다음 단계에서 추가됩니다.
      </p>
    </div>
  );
}

/**
 * 모임 목록 카드. HomeScreen·ExerciseScreen·RecommendedGroupScreen 공용.
 * SPEC §13 MeetingCard / Android `item_exercise_group.xml` 참조.
 */

import type { Meeting } from '../../data/models';
import { meetingImg } from '../../utils/meetingImage';

interface Props {
  meeting: Meeting;
  onClick: () => void;
}

export function MeetingCard({ meeting: m, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-card border border-borderDefault bg-surface p-3 text-left"
    >
      {/* 커버 이미지 */}
      <img
        src={meetingImg(m.image)}
        alt=""
        className="h-[80px] w-[80px] flex-shrink-0 rounded-[8px] object-cover"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* 배지 행 */}
        <div className="flex flex-wrap gap-1">
          {m.lastActiveMinutes !== undefined && (
            <span className="rounded-[4px] bg-orangeTint px-1.5 py-0.5 text-[10px] font-medium text-orange">
              {m.lastActiveMinutes}분전 활동
            </span>
          )}
          {m.isUrgent && (
            <span className="rounded-[4px] bg-error px-1.5 py-0.5 text-[10px] font-medium text-textWhite">
              한자리 남았어요!!
            </span>
          )}
        </div>

        {/* 제목 */}
        <p className="truncate text-body-strong text-textPrimary">{m.title}</p>

        {/* 정기모임 시간 */}
        {m.meetingTime && (
          <p className="text-caption text-textSecondary">{m.meetingTime}</p>
        )}

        {/* 장소 · 레벨 */}
        <p className="text-caption text-textHint">
          {m.location}
          {m.level ? ` · ${m.level}` : ''}
        </p>

        {/* 멤버 수 */}
        <p className="text-micro text-textHint">
          멤버 {m.memberCount}/{m.maxMembers}명
        </p>
      </div>
    </button>
  );
}

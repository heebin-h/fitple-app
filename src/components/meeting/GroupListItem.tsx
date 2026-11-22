/**
 * 모임 목록 행 (썸네일 + 텍스트 + 찜). SearchScreen 결과 행.
 * Android `item_group_list.xml` + SearchFragment.renderResults 바인딩 포트.
 *
 * PNG(designs/home_recommended_group_list.png) vs XML 차이 — PNG 우선:
 *   - 썸네일: XML 72dp radius 6dp(bg_img_rounded) → PNG 약 66pt radius 8 → 72px 유지, rounded-lg(8)
 *   - 설명: XML 12sp textSecondary 2줄 → PNG 약 13pt textPrimary 1줄 → text-caption textPrimary truncate
 *   - 메타 구분자: XML " · " → PNG 얇은 세로선 "|" → borderDefault 색 "|"
 *   - 메타 문구: Kotlin 코드 그대로 "멤버 {n}명" (PNG는 다른 데이터셋 예시)
 *   - 하트: 텍스트 블록 상단 정렬(gravity top) — PNG 동일
 */

import type { Meeting } from '../../data/models';
import { meetingImg } from '../../utils/meetingImage';
import { FavoriteHeart } from './FavoriteHeart';

interface Props {
  meeting: Meeting;
  onClick: () => void;
}

export function GroupListItem({ meeting: m, onClick }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
      className="flex cursor-pointer items-start bg-surface px-5 py-3.5 active:bg-background"
    >
      <img src={meetingImg(m.image)} alt=""
        className="h-[72px] w-[72px] flex-shrink-0 rounded-lg bg-background object-cover" />

      <div className="ml-3 min-w-0 flex-1">
        <p className="truncate text-body-strong text-textPrimary">{m.title}</p>
        {m.description && (
          <p className="mt-1 truncate text-caption text-textPrimary">{m.description}</p>
        )}
        <p className="mt-2 flex items-center text-micro text-textHint">
          <span className="truncate">{m.location}</span>
          <span className="mx-1 text-borderDefault">|</span>
          <span className="flex-shrink-0">멤버 {m.memberCount}명</span>
        </p>
      </div>

      <FavoriteHeart meetingId={m.id} />
    </div>
  );
}

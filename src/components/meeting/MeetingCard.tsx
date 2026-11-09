/**
 * 모임 목록 행. Home(추천·활동 중) · Exercise · RecommendedGroup 공용.
 * Android `item_meeting_card.xml` + `HomeSectionBinders.bindMeetingCard` 포트.
 *
 * variant
 *   - 'active'(기본): 배지 행 [N분전 활동][종목] + 메타 "{위치} | {정기일정} | 멤버 n/max" (bindMeetingCard)
 *   - 'recommended' : 배지 행 숨김 + 메타 "{위치} | 멤버 n명" (HomeFragment/GuestHomeFragment.setupRecommended)
 *
 * PNG(designs/home_main_postdetail_share_chat.png "홈 -가입 x") vs XML — PNG 우선:
 *   - 카드 외곽: 테두리 없는 행, 하단 1dp 구분선 없음 (XML은 구분선 있음)
 *   - 썸네일: XML 72dp → PNG 약 92pt, radius 6(bg_img_rounded)
 *   - 제목: XML bold → PNG medium (text-body)
 *   - 설명: XML 12sp → PNG 약 13pt (text-caption) textSecondary 1줄
 *   - 메타 구분자: Kotlin " · " → PNG 얇은 세로선 "|"
 *   - 활동 배지 글자: XML textSecondary → PNG 파란색
 *   - 태그 줄 "#러닝 #편하게 …": PNG에만 있음 → Meeting.tags 있을 때만 표시 (현재 시드엔 없음)
 *   - 하트: 우측 상단 정렬 (PNG)
 */

import { Fragment } from 'react';
import type { Meeting } from '../../data/models';
import { meetingImg } from '../../utils/meetingImage';
import { FavoriteHeart } from './FavoriteHeart';

interface Props {
  meeting: Meeting;
  onClick: () => void;
  variant?: 'active' | 'recommended';
  /** 비로그인 하트 탭 (게스트 홈 추천 카드 전용) */
  onGuestHeart?: () => void;
}

/** 한 줄 + 끝 말줄임 — Android tvMemberCount(TextView 1개, ellipsize end)와 동일하게 줄 끝부터 자름 */
function Meta({ parts }: { parts: string[] }) {
  return (
    <p className="mt-1 truncate text-mini text-textHint">
      {parts.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="mx-1 text-borderDefault">|</span>}
          {p}
        </Fragment>
      ))}
    </p>
  );
}

export function MeetingCard({ meeting: m, onClick, variant = 'active', onGuestHeart }: Props) {
  const meta = variant === 'recommended'
    ? [m.location, `멤버 ${m.memberCount}명`]
    : [m.location, ...(m.meetingTime ? [m.meetingTime] : []), `멤버 ${m.memberCount}/${m.maxMembers}`];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
      className="flex w-full cursor-pointer items-start py-3 text-left"
    >
      <img
        src={meetingImg(m.image)}
        alt=""
        className="h-[92px] w-[92px] flex-shrink-0 rounded-[6px] bg-background object-cover"
      />

      <div className="ml-3 min-w-0 flex-1">
        {variant === 'active' && (
          <div className="mb-1 flex gap-1">
            {m.lastActiveMinutes !== undefined && (
              <span className="rounded-[4px] bg-blueTint px-1.5 py-0.5 text-mini text-blue">
                {m.lastActiveMinutes}분전 활동
              </span>
            )}
            <span className="rounded-[4px] bg-orangeTint px-1.5 py-0.5 text-mini-strong text-orange">
              {m.sport}
            </span>
          </div>
        )}
        <p className="truncate text-body text-textPrimary">{m.title}</p>
        {m.description && (
          <p className="mt-0.5 truncate text-caption text-textSecondary">{m.description}</p>
        )}
        <Meta parts={meta} />
        {m.tags && m.tags.length > 0 && (
          <p className="mt-0.5 truncate text-mini text-textHint">{m.tags.map((t) => `#${t}`).join(' ')}</p>
        )}
      </div>

      <FavoriteHeart meetingId={m.id} onGuestTap={onGuestHeart} />
    </div>
  );
}

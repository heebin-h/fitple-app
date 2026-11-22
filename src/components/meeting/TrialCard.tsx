/**
 * 체험 가능 모임 카드. HomeScreen(가로 carousel) · TrialListScreen(세로 목록) 공용.
 * Android `item_trial_card.xml` + `HomeSectionBinders.populateTrialMeetings` 포트.
 *
 * PNG(designs/home_trial_card_detail_apply.png) vs XML 차이 — 가이드 §0에 따라 PNG 우선:
 *   - 카드 외곽: XML stroke 1dp → PNG 라인 없음 → border 제거
 *   - 이미지: XML 120dp 높이 → PNG 정사각 + 4모서리 라운드 → aspect-square rounded-card
 *   - 상단 그라데이션: XML 있음 → PNG 안 보임 → 제거
 *   - 활동 배지 글자: XML textSecondary → PNG 파란색 → text-blue (배경 blueTint는 동일)
 *   - 멤버: XML "+N" 오렌지 텍스트 → PNG 회색 아바타 4개 + 검정 원 "+N" 스택
 *   - 신청하기: XML 38dp → PNG 약 52px
 *   - 글자 크기: PNG 실측(2x) 기준 — 제목 15 / 설명 13 / 위치 12 / 멤버 13 / 버튼 14 bold
 *   - 스포츠 배지 글자: PNG는 앰버 계열이나 토큰 없음 → XML(orange/orangeTint) 유지
 *   - "한자리 남았어요!!": PNG 미노출(잔여 20) — XML 조건(잔여 ≤ 2) 그대로
 */

import { MapPin } from 'lucide-react';
import type { Meeting } from '../../data/models';
import { meetingImg } from '../../utils/meetingImage';

interface Props {
  meeting: Meeting;
  onApply: () => void;
  onClick: () => void;
}

export function TrialCard({ meeting: m, onApply, onClick }: Props) {
  const extra = Math.max(0, m.memberCount - 5);
  const spotsLeft = m.maxMembers - m.memberCount;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
      className="w-[162px] flex-shrink-0 cursor-pointer bg-surface pb-3 text-left"
    >
      {/* 이미지 + 배지 STACK */}
      <div className="relative aspect-square w-full overflow-hidden rounded-card">
        <img src={meetingImg(m.image)} alt="" className="absolute inset-0 h-full w-full object-cover" />

        <div className="absolute left-2 top-2 flex gap-1">
          {m.lastActiveMinutes !== undefined && (
            <span className="rounded-full bg-blueTint px-2 py-1 text-mini text-blue">
              {m.lastActiveMinutes}분전 활동
            </span>
          )}
          <span className="rounded-full bg-orangeTint px-2 py-1 text-mini text-orange">
            {m.sport}
          </span>
        </div>

        {spotsLeft <= 2 && (
          <span className="absolute bottom-2 left-2 rounded-lg bg-orange px-2 py-1 text-mini-strong text-textWhite">
            한자리 남았어요!!
          </span>
        )}
      </div>

      {/* 텍스트 */}
      <div className="px-1.5">
        <p className="mt-2 truncate text-body text-textPrimary">{m.title}</p>
        {m.description && (
          <p className="mt-1 truncate text-caption text-textPrimary">{m.description}</p>
        )}

        <div className="mt-1.5 flex items-center gap-1">
          <MapPin size={14} className="flex-shrink-0 fill-textPrimary text-surface" />
          <span className="truncate text-micro text-textSecondary">{m.location}</span>
        </div>

        {/* 멤버 아바타 스택 */}
        <div className="mt-1.5 flex items-center">
          <div className="flex">
            {[0, 1, 2, 3].map((i) => (
              <span key={i}
                className="-ml-2 h-[22px] w-[22px] rounded-full border border-surface bg-background first:ml-0" />
            ))}
            <span className="-ml-2 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-textPrimary text-mini text-textWhite">
              +{extra}
            </span>
          </div>
          <span className="ml-2 text-caption text-textHint">
            멤버 {m.memberCount}/{m.maxMembers}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onApply(); }}
        className="mt-3 h-[52px] w-full rounded-lg bg-orange text-label-strong text-textWhite"
      >
        신청하기
      </button>
    </div>
  );
}

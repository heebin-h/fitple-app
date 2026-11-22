/**
 * 추천 모임. SPEC §12.13 / Android `RecommendedGroupFragment.kt` + designs/home_recommended_group_list.png.
 *
 *   툴바: ← | "{종목} 추천 모임" 또는 "추천 모임" | 알림(/notifications)
 *   위치: "{동네} ▼" — 탭 → 동네 선택 다이얼로그 (LocationState 공유)
 *   필터: [필터] | 가까운 순 · 편하게 · 평일 오후 · 주말 · 초보 환영 — **단일 선택**, 다시 탭하면 해제
 *   목록: item_group_list 행(GroupListItem) — 썸네일 · 제목 · 설명 · "위치 | 멤버 n명" · 찜
 *
 * 조건 매칭 = Android matchesCondition 그대로 (meetingTime 문자열 파싱):
 *   평일 오후 → "오후" 포함 && (월~금 중 하나 || "매일")
 *   주말      → 토/일 포함 || "매일"
 *   초보 환영 → 설명에 "초보" 또는 "입문"
 *   가까운 순 · 편하게 → 거리/난이도 데이터 없음 → 전체 통과 (Android 주석 동일)
 * 칩 스타일: PNG(옅은 주황 바탕 + 주황 테두리·글자). 선택 칩은 채운 주황으로 구분.
 */

import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bell, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useLocationPicker } from '../../components/common/LocationPicker';
import { GroupListItem } from '../../components/meeting/GroupListItem';
import type { Meeting } from '../../data/models';

function readMeetings(): Meeting[] {
  try { return JSON.parse(localStorage.getItem('meetings') ?? '[]') as Meeting[]; }
  catch (e) { console.error('[RecommendedGroup] meetings parse failed:', e); return []; }
}

const CONDITIONS = ['가까운 순', '편하게', '평일 오후', '주말', '초보 환영'] as const;
type Condition = typeof CONDITIONS[number];

function matchesCondition(m: Meeting, condition: Condition | null): boolean {
  const time = m.meetingTime ?? '';
  const desc = m.description ?? '';
  switch (condition) {
    case '평일 오후': return time.includes('오후') && (/[월화수목금]/.test(time) || time.includes('매일'));
    case '주말':      return /[토일]/.test(time) || time.includes('매일');
    case '초보 환영': return desc.includes('초보') || desc.includes('입문');
    default:          return true;
  }
}

export function RecommendedGroupScreen() {
  const navigate = useNavigate();
  const location = useLocationPicker();
  const { sport } = useParams<{ sport: string }>();
  const sportName = sport ? decodeURIComponent(sport) : '';
  const [selected, setSelected] = useState<Condition | null>(null);

  const all = useMemo(readMeetings, []);
  const meetings = useMemo(
    () => all.filter((m) => (!sportName || m.sport === sportName) && matchesCondition(m, selected)),
    [all, sportName, selected],
  );

  return (
    <div className="flex flex-col pt-safe">
      {/* 툴바 */}
      <div className="flex h-12 items-center gap-2 px-4">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로" className="p-1">
          <ArrowLeft size={22} className="text-textPrimary" />
        </button>
        <span className="flex-1 text-center text-h2 text-textPrimary">{sportName ? `${sportName} 추천 모임` : '추천 모임'}</span>
        <button type="button" onClick={() => navigate('/notifications')} aria-label="알림" className="p-1">
          <Bell size={22} className="text-textPrimary" />
        </button>
      </div>

      {/* 위치 — tvLocationFilter "{current} ▼" */}
      <div className="px-5 pb-2 pt-2">
        <button type="button" onClick={location.openPicker} aria-label={`동네 선택: ${location.current}`}
          className="text-body-strong text-textPrimary">
          {location.current} ▼
        </button>
      </div>

      {/* 필터 행 */}
      <div className="flex items-center border-b border-borderDefault pb-4 pl-5 pt-2">
        <span className="flex flex-shrink-0 items-center gap-1 text-label text-textSecondary">
          <SlidersHorizontal size={14} /> 필터
        </span>
        <span className="mx-3 h-5 w-px flex-shrink-0 bg-borderDefault" />
        <div className="flex gap-2 overflow-x-auto pr-5 [&::-webkit-scrollbar]:hidden">
          {CONDITIONS.map((c) => {
            const on = selected === c;
            return (
              <button key={c} type="button" aria-pressed={on}
                onClick={() => setSelected(on ? null : c)}
                className={cn('h-8 flex-shrink-0 rounded-full border border-orange px-3 text-caption',
                  on ? 'bg-orange text-textWhite' : 'bg-orangeTint text-orange')}>
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* 목록 */}
      <div className="flex flex-col pb-4 pt-1">
        {meetings.map((m) => (
          <GroupListItem key={m.id} meeting={m} onClick={() => navigate(`/meeting/${m.id}`)} />
        ))}
        {meetings.length === 0 && (
          <p className="py-8 text-center text-caption text-textHint">조건에 맞는 모임이 없어요</p>
        )}
      </div>
      {location.dialog}
    </div>
  );
}

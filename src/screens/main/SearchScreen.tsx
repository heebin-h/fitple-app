/**
 * 모임 검색 — `/search`.
 * Android `SearchFragment.kt` + `fragment_search.xml` 포트. 검색 화면 자체 디자인 PNG 없음 → XML 기준.
 *
 *   - 툴바 56dp, paddingHorizontal 12: 뒤로(28dp) + 검색창(44dp, marginStart 8, radius 12, 1dp orange 테두리,
 *     paddingHorizontal 14, 우측 ic_search, hint "찾고싶은 모임이 있나요?")
 *   - 진입 시 입력창 자동 포커스 (Android requestFocus + showSoftInput)
 *   - 입력 변경마다 즉시 필터: trim 후 빈 문자열이면 결과·빈 문구 모두 숨김
 *   - 검색 풀: Android `UserCreatedMeetings + SampleData.allMeetings` → createdMeetingsStore + localStorage `meetings`
 *   - 매칭: title.contains(query, ignoreCase = true)
 *   - 결과 없음: "검색 결과가 없어요" 14sp textHint, marginTop 80
 *   - 결과 행: GroupListItem(item_group_list) → 탭 시 모임 상세
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { GroupListItem } from '../../components/meeting/GroupListItem';
import type { Meeting } from '../../data/models';
import { useCreatedMeetingsStore } from '../../store/createdMeetingsStore';

function readMeetings(): Meeting[] {
  try {
    return JSON.parse(localStorage.getItem('meetings') ?? '[]') as Meeting[];
  } catch (e) {
    console.error('[SearchScreen] meetings parse failed:', e);
    return [];
  }
}

export function SearchScreen() {
  const navigate = useNavigate();
  const created = useCreatedMeetingsStore((s) => s.meetings);
  const seeded = useMemo(readMeetings, []);
  const pool = useMemo(() => [...created, ...seeded], [created, seeded]);
  const [raw, setRaw] = useState('');

  const query = raw.trim().toLowerCase();
  const results = useMemo(
    () => (query === '' ? [] : pool.filter((m) => m.title.toLowerCase().includes(query))),
    [pool, query],
  );

  return (
    <div className="flex min-h-dvh flex-col bg-surface pt-safe">
      <div className="flex h-14 items-center px-3">
        <button type="button" onClick={() => navigate(-1)} className="flex-shrink-0 p-0.5" aria-label="뒤로가기">
          <ArrowLeft size={24} className="text-textPrimary" />
        </button>
        <label className="ml-2 flex h-11 min-w-0 flex-1 items-center rounded-card border border-orange bg-surface px-3.5">
          <input
            type="search"
            enterKeyHint="search"
            autoFocus
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="찾고싶은 모임이 있나요?"
            aria-label="모임 검색"
            className="min-w-0 flex-1 bg-transparent text-label text-textPrimary outline-none placeholder:text-textHint [&::-webkit-search-cancel-button]:hidden"
          />
          <Search size={20} className="ml-2 flex-shrink-0 text-textPrimary" />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto pb-[calc(24px+env(safe-area-inset-bottom))]">
        {query !== '' && results.length === 0 && (
          <p className="mt-20 text-center text-label text-textHint">검색 결과가 없어요</p>
        )}
        {results.map((m) => (
          <GroupListItem key={m.id} meeting={m} onClick={() => navigate(`/meeting/${m.id}`)} />
        ))}
      </div>
    </div>
  );
}

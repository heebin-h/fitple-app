/**
 * 모임 만들기 — `/create-meeting` (회원 전용).
 * Android `CreateMeetingFragment.kt` + `fragment_create_meeting.xml` 포트. 디자인 PNG 없음 → XML 기준.
 *
 *   - 툴바 56dp: 뒤로 + 가운데 "모임 만들기" 17sp bold
 *   - 본문 px 20 / top 16 / bottom 24. 라벨 13sp bold, 입력 44dp(bg_search_bar: radius 12, 1dp orange) mt 8,
 *     섹션 간 20dp. 소개는 96dp 멀티라인. 제출 버튼 54dp(btn_height_lg) radius 12 16sp bold, mt 28
 *   - 종목 칩: 13sp, 선택 = orangeTint + 1.5dp orange 테두리 + orange 글자 / 미선택 = surface + 1dp borderDefault
 *     + textSecondary, radius 20. (Android setPadding(36,16,36,16)·marginEnd 10 은 px 단위 → xxhdpi 기준 약 12/5dp, 3dp)
 *   - 검증 순서(Android 그대로): 이름 빈값 → "모임 이름을 입력해주세요" / 종목 미선택 → "종목을 선택해주세요"
 *   - 기본값: 위치 "위치 미정" / 일정 "일정 미정" / 정원 정수 아니면 20 / 소개 "함께할 멤버를 기다려요!"
 *   - 생성: id created_{epoch ms}, groupName = title, memberCount 1, lastActiveMinutes 0, 종목별 대표 이미지
 *   - 완료: 토스트 "모임이 만들어졌어요!" → 모임 상세 push (Android pushWithSlide — 뒤로 가면 이 폼으로 복귀)
 *   - 저장: createdMeetingsStore (세션 메모리 전용, Android UserCreatedMeetings 동일)
 */

import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useCreatedMeetingsStore } from '../../store/createdMeetingsStore';
import { cn } from '../../utils/cn';
import type { Meeting } from '../../data/models';

/** Android CreateMeetingFragment.sports — 종목 + 대표 이미지 (seed image 키) */
const SPORTS: readonly { name: string; image: string }[] = [
  { name: '러닝',   image: 'img_meeting_running_group1' },
  { name: '풋살',   image: 'img_meeting_futsal_field1' },
  { name: '등산',   image: 'img_meeting_hiking_group1' },
  { name: '사이클', image: 'img_meeting_cycling_group1' },
  { name: '골프',   image: 'img_meeting_golf_field1' },
];

/** Kotlin String.toIntOrNull() 동등 — 부호 허용 정수만, 그 외 null */
function toIntOrNull(s: string): number | null {
  return /^[+-]?\d+$/.test(s) ? Number(s) : null;
}

const LABEL = 'text-caption-strong text-textPrimary';
const FIELD = 'mt-2 w-full rounded-card border border-orange bg-surface px-3.5 text-label text-textPrimary outline-none placeholder:text-textHint';

export function CreateMeetingScreen() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const addMeeting = useCreatedMeetingsStore((s) => s.add);

  const [title, setTitle] = useState('');
  const [sport, setSport] = useState<(typeof SPORTS)[number] | null>(null);
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [maxMembers, setMaxMembers] = useState('');
  const [description, setDescription] = useState('');

  if (!currentUser) return <Navigate to="/login" replace />;

  function submit() {
    const t = title.trim();
    if (t === '') { toast('모임 이름을 입력해주세요'); return; }
    if (!sport)   { toast('종목을 선택해주세요'); return; }

    const meeting: Meeting = {
      id: `created_${Date.now()}`,
      title: t,
      groupName: t,
      sport: sport.name,
      image: sport.image,
      location: location.trim() || '위치 미정',
      memberCount: 1,
      maxMembers: toIntOrNull(maxMembers) ?? 20,
      lastActiveMinutes: 0,
      description: description.trim() || '함께할 멤버를 기다려요!',
      meetingTime: time.trim() || '일정 미정',
    };
    addMeeting(meeting);
    toast('모임이 만들어졌어요!');
    navigate(`/meeting/${meeting.id}`);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface pt-safe">
      <div className="relative flex h-14 flex-shrink-0 items-center px-3">
        <button type="button" onClick={() => navigate(-1)} className="p-0.5" aria-label="뒤로가기">
          <ArrowLeft size={24} className="text-textPrimary" />
        </button>
        <h1 className="pointer-events-none absolute inset-x-0 text-center text-h2 text-textPrimary">
          모임 만들기
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-4">
        <label className="block">
          <span className={LABEL}>모임 이름</span>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="예) 미사강변 주말 러닝 크루" className={cn(FIELD, 'h-11')} />
        </label>

        <p className={cn(LABEL, 'mt-5')}>종목</p>
        <div className="mt-2 flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden" role="radiogroup" aria-label="종목">
          {SPORTS.map((s) => {
            const selected = sport?.name === s.name;
            return (
              <button key={s.name} type="button" role="radio" aria-checked={selected}
                onClick={() => setSport(s)}
                className={cn(
                  'flex-shrink-0 rounded-full px-3 py-1.5 text-caption',
                  selected
                    ? 'border-[1.5px] border-orange bg-orangeTint text-orange'
                    : 'border border-borderDefault bg-surface text-textSecondary',
                )}>
                {s.name}
              </button>
            );
          })}
        </div>

        <label className="mt-5 block">
          <span className={LABEL}>위치</span>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
            placeholder="예) 미사역" className={cn(FIELD, 'h-11')} />
        </label>

        <label className="mt-5 block">
          <span className={LABEL}>일정</span>
          <input type="text" value={time} onChange={(e) => setTime(e.target.value)}
            placeholder="예) 매주 토 오전 8:00" className={cn(FIELD, 'h-11')} />
        </label>

        <label className="mt-5 block">
          <span className={LABEL}>정원</span>
          <input type="text" inputMode="numeric" value={maxMembers} onChange={(e) => setMaxMembers(e.target.value)}
            placeholder="예) 20" className={cn(FIELD, 'h-11')} />
        </label>

        <label className="mt-5 block">
          <span className={LABEL}>소개</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="어떤 모임인지 소개해주세요" className={cn(FIELD, 'h-24 resize-none py-3.5')} />
        </label>

        <button type="button" onClick={submit}
          className="mt-7 h-[54px] w-full rounded-card bg-orange text-h3 font-bold text-textWhite">
          모임 만들기
        </button>
      </div>
    </div>
  );
}

/**
 * 회원가입 Step 6 — 가입 완료. SPEC §12.9 / Android `fragment_signup_complete.xml` 1:1.
 *
 * 레이아웃 (ConstraintLayout 가이드라인 88% → flex로 재현):
 *   - 상단 블록 (flex-1, 중앙): 완료 체크 아이콘(80px orange) + "가입이 완료 되었어요!" (display bold)
 *   - 하단 블록 (버튼 위):
 *       · 서브타이틀 "어떤 모임이 있을까?" (textSecondary)
 *       · 5개 추천 모임 가로 carousel (그라데이션 오버레이 + 타이틀 + 메타)
 *   - "핏플 시작하기" 풀와이드 버튼 (h-[54px] orange)
 *
 * 카드 데이터/이미지는 Android XML 그대로(싱글벙글 러닝/호랑이 풋살/중급 골프/상도동 자전거/관악 등산).
 */

import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

import imgRunning from '../../assets/images/meetings/running_beach.png';
import imgFutsal from '../../assets/images/meetings/futsal_field1.png';
import imgGolf from '../../assets/images/meetings/golf_field1.png';
import imgCycling from '../../assets/images/meetings/cycling_group1.png';
import imgHiking from '../../assets/images/meetings/hiking_group1.png';

interface MeetingCard {
  image: string;
  title: string;
  meta: string;
}

const CARDS: MeetingCard[] = [
  { image: imgRunning, title: '싱글 벙글 러닝 모임',  meta: '영등포구 ㅣ 매주 (수) 오후 8:00 ㅣ 멤버 10/30' },
  { image: imgFutsal,  title: '호랑이 풋살 모임',     meta: '동작구 ㅣ 매주 (금) 오후 8:00 ㅣ 멤버 10/15' },
  { image: imgGolf,    title: '중급 골프 모임',        meta: '여의도구 ㅣ 매주 (토) 오전 9:00 ㅣ 멤버 4/10' },
  { image: imgCycling, title: '상도동 자전거 동호회',  meta: '동작구 ㅣ 매주 (일) 오전 9:00 ㅣ 멤버 7/10' },
  { image: imgHiking,  title: '관악 등산 모임',        meta: '동작구 ㅣ 매주 (토) 오전 9:00 ㅣ 멤버 7/10' },
];

export function SignupCompleteScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh flex-col bg-surface pt-safe pb-safe">
      {/* ① 상단 블록 — 화면 상반부에 중앙 정렬 */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-orange text-textWhite">
          <Check size={40} strokeWidth={3} />
        </span>
        <h1 className="mt-4 text-display text-textPrimary">가입이 완료 되었어요!</h1>
      </div>

      {/* ② 하단 블록 — 서브타이틀 + 가로 carousel */}
      <div className="pb-6">
        <p className="mb-4 px-6 text-body text-textSecondary">어떤 모임이 있을까?</p>
        <div className="flex gap-2.5 overflow-x-auto px-6 pb-1 [&::-webkit-scrollbar]:hidden">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="relative h-[100px] w-[160px] flex-shrink-0 overflow-hidden rounded-card"
            >
              <img
                src={card.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* 하단 검정 그라데이션 (Android bg_review_gradient) */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
              <div className="absolute inset-x-3 bottom-2.5 flex flex-col gap-1">
                <p className="text-mini-strong text-textWhite">{card.title}</p>
                <p className="text-[10px] leading-[1.3] text-textWhite/70">{card.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ③ "핏플 시작하기" — 풀와이드 */}
      <div className="px-6 pb-4">
        <button
          type="button"
          onClick={() => navigate('/home', { replace: true })}
          className="h-[54px] w-full rounded-card bg-orange text-h3 text-textWhite"
        >
          핏플 시작하기
        </button>
      </div>
    </div>
  );
}

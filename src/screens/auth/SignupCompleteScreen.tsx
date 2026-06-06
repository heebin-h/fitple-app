/**
 * 회원가입 Step 6 — 가입 완료. SPEC §12.9 / Android `fragment_signup_complete.xml` +
 * `dimens.xml` 정확 매핑.
 *
 * Android dimens 매핑:
 *   icon_complete       = 96dp → h-24 w-24 (CheckCircleIcon 96)
 *   text_heading        = 24sp → text-[24px] font-bold
 *   page_margin         = 20dp → px-5
 *   spacing_xl          = 24dp (서브타이틀 margin-bottom)
 *   card_preview_width  = 140dp → w-[140px]
 *   card_preview_height = 160dp → h-[160px] (세로가 더 김!)
 *   btn_height_lg       = 54dp → h-[54px]
 *
 * 체크 아이콘은 `ic_check_circle` 인라인 SVG 그대로(텍스트 컬러로 색 제어).
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
      {/* ① 상단 — 화면 상반부에 중앙 정렬.
          체크 아이콘: 96dp 오렌지 원 + 흰 체크 (Android ic_check_circle 시각 매칭 —
          inline SVG의 evenodd 카브아웃보다 합성 방식이 디자인 PNG의 Material 스타일에 더 가까움). */}
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-orange text-textWhite">
          {/* strokeWidth 2.5 — Android `ic_check_white.xml` 정확 매칭 */}
          <Check size={56} strokeWidth={2.5} />
        </span>
        <h1 className="mt-5 text-[24px] font-bold leading-tight text-textPrimary">
          가입이 완료 되었어요!
        </h1>
      </div>

      {/* ② 서브타이틀 + 가로 carousel */}
      <div className="pb-6">
        <p className="mb-6 px-5 text-h3 text-textSecondary">어떤 모임이 있을까?</p>
        <div className="flex gap-2.5 overflow-x-auto px-5 pb-1 [&::-webkit-scrollbar]:hidden">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="relative h-[160px] w-[140px] flex-shrink-0 overflow-hidden rounded-card"
            >
              <img
                src={card.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* 하단 검정 그라데이션 (bg_review_gradient) */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/85" />
              {/* 카드 텍스트 — Android dimens.xml 정확 매칭:
                  - title: text_sm(12sp) + bold
                  - meta:  text_tiny(10sp), 색 colorWhite60(#99FFFFFF)
                  - title-meta gap: spacing_xs(4dp) */}
              <div className="absolute inset-x-3 bottom-3 flex flex-col gap-1">
                <p className="text-[12px] font-bold leading-tight text-textWhite">{card.title}</p>
                <p className="text-[10px] leading-[1.3] text-textWhite/60">{card.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ③ "핏플 시작하기" 풀와이드 (54dp) */}
      <div className="px-5 pb-6">
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

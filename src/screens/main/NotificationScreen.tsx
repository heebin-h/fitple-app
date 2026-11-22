/**
 * 알림 목록 — `/notifications`.
 * Android `NotificationFragment.kt` + `fragment_notification.xml` + `item_notification.xml` 포트.
 * 디자인 PNG 없음 → XML 기준.
 *
 *   - 툴바 56dp, 좌측 뒤로(28dp), 가운데 타이틀 "알림" 17sp bold
 *   - 행: paddingHorizontal 20 / vertical 14, 40dp 원형 orangeTint 배경 + ic_bell_filled(orange, padding 8)
 *         본문 14sp textPrimary (lineSpacingExtra 2dp) / 시간 11sp textHint, marginTop 4
 *   - 데이터: Android가 Fragment 안에 하드코딩한 5건 그대로 (탭 동작 없음)
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell } from 'lucide-react';

interface NotiItem {
  text: string;
  time: string;
}

const NOTIFICATIONS: readonly NotiItem[] = [
  { text: "김상미님이 '나래필라테스 러닝 주말 모임' 채팅방에 메시지를 남겼어요", time: '10분 전' },
  { text: "'한강 사이클 크루' 모임이 내일 오전 7시에 있어요",                     time: '1시간 전' },
  { text: "'미사강변 새벽 러닝크루'에 새 멤버가 가입했어요",                      time: '3시간 전' },
  { text: "찜한 모임 '북한산 등산 동호회'에 빈자리가 얼마 남지 않았어요",           time: '어제' },
  { text: '가입하신 모임의 정기 일정이 등록되었어요',                              time: '2일 전' },
];

export function NotificationScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh flex-col bg-surface pt-safe">
      <div className="relative flex h-14 items-center px-3">
        <button type="button" onClick={() => navigate(-1)} className="p-0.5" aria-label="뒤로가기">
          <ArrowLeft size={24} className="text-textPrimary" />
        </button>
        <h1 className="pointer-events-none absolute inset-x-0 text-center text-h2 text-textPrimary">
          알림
        </h1>
      </div>

      <ul className="flex-1 overflow-y-auto pb-[calc(24px+env(safe-area-inset-bottom))]">
        {NOTIFICATIONS.map((n) => (
          <li key={n.text} className="flex items-center gap-3 px-5 py-3.5">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orangeTint">
              <Bell size={24} className="fill-orange text-orange" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-label leading-[1.55] text-textPrimary">{n.text}</p>
              <p className="mt-1 text-mini text-textHint">{n.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

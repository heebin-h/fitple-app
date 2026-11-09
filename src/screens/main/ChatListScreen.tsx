/**
 * 채팅방 목록 — `/chat` (BottomNav 채팅 탭).
 * Android `ChatListFragment.kt` + `fragment_chat_list.xml` + `item_chat_room.xml` 포트. 디자인 PNG 없음 → XML 기준.
 *
 *   - 툴바 56dp, paddingHorizontal 20, 좌측 정렬 타이틀 "채팅" 20sp(text_title_lg) bold, 뒤로 버튼 없음(탭 루트)
 *   - 행: paddingHorizontal 20 / vertical 14, 썸네일 56dp radius 6dp(bg_img_rounded) +
 *         모임명(groupName) 15sp bold 1줄 / 미리보기 13sp textSecondary 1줄 + 우측 시간 11sp textHint
 *   - 미리보기·시간: Android 상수 고정("운영진이 공지를 등록했어요" / "오후 3:40")
 *   - 방 목록: Android `UserCreatedMeetings + SampleData.activeMeetings` → 모임 만들기 미구현이라 ACTIVE_MEETING_IDS만
 *   - 탭 → 모임 상세 '채팅' 탭 (Android initialTab = 2)
 *   - 게스트: Android는 탭 자체를 막음(BottomNav) → 직접 URL 진입도 /login으로 돌려보냄
 */

import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ACTIVE_MEETING_IDS } from '../../data/seedData';
import { meetingImg } from '../../utils/meetingImage';
import type { Meeting } from '../../data/models';

const LAST_MESSAGE_PREVIEW = '운영진이 공지를 등록했어요';
const LAST_MESSAGE_TIME    = '오후 3:40';

function readRooms(): Meeting[] {
  try {
    const all = JSON.parse(localStorage.getItem('meetings') ?? '[]') as Meeting[];
    return ACTIVE_MEETING_IDS
      .map((id) => all.find((m) => m.id === id))
      .filter((m): m is Meeting => m !== undefined);
  } catch (e) {
    console.error('[ChatListScreen] meetings parse failed:', e);
    return [];
  }
}

export function ChatListScreen() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const rooms = useMemo(readRooms, []);

  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <div className="flex flex-col bg-surface pt-safe">
      <div className="flex h-14 items-center px-5">
        <h1 className="text-heading text-textPrimary">채팅</h1>
      </div>

      {rooms.length === 0 ? (
        <p className="mt-[120px] whitespace-pre-line text-center text-label text-textHint">
          {'가입한 모임이 없어요.\n모임에 가입하면 채팅방이 생겨요!'}
        </p>
      ) : (
        <ul>
          {rooms.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => navigate(`/meeting/${m.id}`, { state: { initialTab: '채팅' } })}
                className="flex w-full items-center px-5 py-3.5 text-left active:bg-background"
              >
                <img src={meetingImg(m.image)} alt=""
                  className="h-14 w-14 flex-shrink-0 rounded-[6px] bg-background object-cover" />
                <div className="ml-3 min-w-0 flex-1">
                  <p className="truncate text-body-strong text-textPrimary">{m.groupName}</p>
                  <p className="mt-1 truncate text-caption text-textSecondary">{LAST_MESSAGE_PREVIEW}</p>
                </div>
                <span className="ml-2 flex-shrink-0 text-mini text-textHint">{LAST_MESSAGE_TIME}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

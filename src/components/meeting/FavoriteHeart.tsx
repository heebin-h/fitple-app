/**
 * 찜(하트) 토글. Android `HomeSectionBinders.bindFavoriteHeart` 포트.
 * MeetingCard(item_meeting_card) · GroupListItem(item_group_list) 공용.
 *
 *   - 상태: userManager.isFavorite / toggleFavorite (UserProfile.favoriteMeetingIds)
 *   - 색: 찜 = orange / 미찜 = textSecondary (Android imageTintList)
 *   - 모양: 미찜은 디자인 PNG(home_recommended_group_list)대로 outline, 찜은 Android ic_heart(filled)
 *   - 비로그인(게스트): Android는 email null이면 리스너 미등록 → 탭해도 무반응. 동일하게 처리
 *   - 카드 클릭으로 전파되지 않도록 stopPropagation
 */

import { useEffect, useState, type MouseEvent } from 'react';
import { Heart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { userManager } from '../../storage/userManager';
import { cn } from '../../utils/cn';

interface Props {
  meetingId: string;
  /** 비로그인 탭 처리. 미지정 = 무반응(bindFavoriteHeart). 게스트 홈 추천 카드는 로그인 안내(showLoginRequired("찜하기")). */
  onGuestTap?: () => void;
}

export function FavoriteHeart({ meetingId, onGuestTap }: Props) {
  const email = useAuthStore((s) => s.currentUser?.email ?? null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!email) { setLiked(false); return; }
    let alive = true;
    userManager.isFavorite(email, meetingId)
      .then((v) => { if (alive) setLiked(v); })
      .catch((e) => console.error('[FavoriteHeart] isFavorite failed:', e));
    return () => { alive = false; };
  }, [email, meetingId]);

  const onTap = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!email) { onGuestTap?.(); return; }
    try {
      setLiked(await userManager.toggleFavorite(email, meetingId));
    } catch (err) {
      console.error('[FavoriteHeart] toggleFavorite failed:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={onTap}
      aria-label="찜하기"
      aria-pressed={liked}
      className="ml-2 flex-shrink-0"
    >
      <Heart size={24} className={cn(liked ? 'fill-orange text-orange' : 'text-textSecondary')} />
    </button>
  );
}

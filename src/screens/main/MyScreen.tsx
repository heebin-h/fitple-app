/**
 * MY (마이페이지). SPEC §12.17 / Android MyFragment.
 */

import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { userManager } from '../../storage/userManager';

export function MyScreen() {
  const navigate    = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const setUser     = useAuthStore((s) => s.setUser);

  function handleLogout() {
    userManager.logoutUser();
    setUser(null);
    navigate('/login', { replace: true });
  }

  const nick  = currentUser?.nickname ?? '-';
  const email = currentUser?.email    ?? '-';
  const initial = nick.charAt(0).toUpperCase();

  const rows = [
    { label: '이용약관',          onTap: () => toast('준비 중이에요') },
    { label: '개인정보처리방침',   onTap: () => toast('준비 중이에요') },
    { label: '버전 1.0.0',        onTap: undefined },
    { label: '로그아웃',          onTap: handleLogout, danger: true },
  ];

  return (
    <div className="flex flex-col pt-safe">
      {/* 헤더 */}
      <div className="flex h-12 items-center px-5">
        <span className="text-h2 text-textPrimary">MY</span>
      </div>

      {/* 프로필 */}
      <div className="flex items-center gap-4 px-5 py-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange">
          <span className="text-display text-textWhite">{initial}</span>
        </div>
        <div>
          <p className="text-h2 text-textPrimary">{nick}</p>
          <p className="mt-0.5 text-caption text-textSecondary">{email}</p>
        </div>
      </div>

      {/* 메뉴 */}
      <div className="mt-2 divide-y divide-borderDefault border-t border-borderDefault">
        {rows.map(({ label, onTap, danger }) => (
          <button
            key={label}
            type="button"
            onClick={onTap}
            disabled={!onTap}
            className="flex w-full items-center justify-between px-5 py-4 text-left disabled:opacity-100"
          >
            <span className={danger ? 'text-body text-error' : 'text-body text-textPrimary'}>
              {label}
            </span>
            {onTap && <ChevronRight size={18} className="text-textHint" />}
          </button>
        ))}
      </div>
    </div>
  );
}

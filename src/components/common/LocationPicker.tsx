/**
 * 동네 선택 다이얼로그 — Android `FragmentNavExt.showLocationPicker` 포트.
 * Android AlertDialog(setSingleChoiceItems): 제목 "동네 선택", 동네 8개 단일 선택(현재값 체크),
 * 항목 탭 = 즉시 반영 + 닫힘, "취소" 버튼. 디자인 PNG 없음 → AlertDialog 구조를 앱 토큰으로.
 *
 * useLocationPicker(): [현재 동네, 열기 함수, 다이얼로그 엘리먼트] — 호출 화면은 엘리먼트를 렌더만 하면 됨.
 */

import { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { NEIGHBORHOODS, useLocationStore } from '../../store/locationStore';

function LocationPickerDialog({ onClose }: { onClose: () => void }) {
  const current = useLocationStore((s) => s.current);
  const setCurrent = useLocationStore((s) => s.setCurrent);

  // ESC 닫기 (Android 뒤로가기 = 다이얼로그 취소와 동일)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-8" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-picker-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[320px] rounded-card bg-surface pb-2 pt-5 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.15)]"
      >
        <h2 id="location-picker-title" className="px-6 pb-2 text-section text-textPrimary">동네 선택</h2>
        <div role="radiogroup" aria-labelledby="location-picker-title" className="max-h-[50dvh] overflow-y-auto">
          {NEIGHBORHOODS.map((name) => {
            const checked = name === current;
            return (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => { setCurrent(name); onClose(); }}
                className="flex h-12 w-full items-center gap-4 px-6 text-left active:bg-background"
              >
                <span className={cn('flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2',
                  checked ? 'border-orange' : 'border-textHint')}>
                  {checked && <span className="h-2.5 w-2.5 rounded-full bg-orange" />}
                </span>
                <span className="text-body text-textPrimary">{name}</span>
              </button>
            );
          })}
        </div>
        <div className="flex justify-end px-4 pt-1">
          <button type="button" onClick={onClose} className="h-10 px-3 text-label-strong text-orange">취소</button>
        </div>
      </div>
    </div>
  );
}

export function useLocationPicker() {
  const current = useLocationStore((s) => s.current);
  const [open, setOpen] = useState(false);
  const dialog = open ? <LocationPickerDialog onClose={() => setOpen(false)} /> : null;
  return { current, openPicker: () => setOpen(true), dialog };
}

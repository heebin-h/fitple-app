/**
 * 약관 동의 BottomSheet. SPEC §12.7 / Android `TermsBottomSheetFragment.kt`.
 *
 * Vaul Drawer로 구현 (BottomSheetDialogFragment의 React 대응).
 * 필수 5개 + "모두 동의" 마스터 토글. 라벨 앞에 주황 **필수** 배지.
 * 5개 모두 체크되면 "동의하고 가입하기" 활성화 → onAgree 콜백.
 *
 * Android와 동일하게 Figma 시안은 캐시에 없어 SPEC §12.7 + Android XML 기준으로 구성.
 */

import { useMemo, useState } from 'react';
import { Drawer } from 'vaul';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

const TERMS: string[] = [
  '만 14세 이상입니다.',
  '서비스 이용약관 동의',
  '커뮤니티 이용약관 동의',
  '개인정보 수집 및 이용 동의',
  '위치 정보 수집 동의',
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgree: () => void;
}

export function TermsBottomSheet({ open, onOpenChange, onAgree }: Props) {
  const [checked, setChecked] = useState<boolean[]>(() => TERMS.map(() => false));
  const allChecked = useMemo(() => checked.every(Boolean), [checked]);

  const toggleAt = (i: number) =>
    setChecked((arr) => arr.map((v, idx) => (idx === i ? !v : v)));
  const toggleAll = () => {
    const next = !allChecked;
    setChecked(TERMS.map(() => next));
  };

  const handleAgree = () => {
    if (!allChecked) return;
    onOpenChange(false);
    // 다음 진입 시 깨끗하게
    setChecked(TERMS.map(() => false));
    onAgree();
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-mobile flex-col rounded-t-sheet bg-surface px-5 pt-3 pb-safe">
          {/* drag handle */}
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-borderDefault" />
          <Drawer.Title className="mb-4 text-h2 text-textPrimary">
            약관에 동의해주세요
          </Drawer.Title>

          {/* 모두 동의 */}
          <button
            type="button"
            onClick={toggleAll}
            className="flex h-12 items-center gap-3 rounded-card border border-borderDefault px-3"
          >
            <CheckCircle checked={allChecked} />
            <span className="text-body-strong text-textPrimary">모두 동의</span>
          </button>

          {/* 5개 필수 항목 */}
          <ul className="mt-2 flex flex-col">
            {TERMS.map((label, i) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => toggleAt(i)}
                  className="flex h-12 w-full items-center gap-3 px-1 text-left"
                >
                  <CheckCircle checked={checked[i]} />
                  <span className="text-label text-textPrimary">
                    <span className="font-bold text-orange">필수</span>{'  '}
                    {label}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={handleAgree}
            disabled={!allChecked}
            className={cn(
              'mt-6 h-[52px] w-full rounded-card text-body-strong text-textWhite',
              allChecked ? 'bg-orange' : 'bg-btnDisabled',
            )}
          >
            동의하고 가입하기
          </button>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function CheckCircle({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-full border-2',
        checked ? 'border-orange bg-orange text-textWhite' : 'border-neutralLow text-transparent',
      )}
    >
      <Check size={14} strokeWidth={3} />
    </span>
  );
}

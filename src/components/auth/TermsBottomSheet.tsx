/**
 * 약관 동의 BottomSheet. SPEC §12.7 / Android `layout_bottom_sheet_terms.xml` +
 * `TermsBottomSheetFragment.kt` 1:1.
 *
 * 레이아웃:
 *   - 핸들바 40×4 borderDefault, mt-3 mb-6
 *   - 타이틀(18sp bold, 2줄): "회원가입을 위해서는\n아래의 약관동의가 필요해요"
 *   - "모두 동의합니다." 행 (48dp, 24×24 사각 체크박스, 15sp bold)
 *   - 1px 구분선(colorBackground)
 *   - 5개 필수 항목 (48dp): 사각 체크박스 24×24 + "[필수] {label}" + > 화살표 18px gray
 *   - 취소 / 동의하고 가입하기 두 버튼 (54dp 가로 분할, mt-6 — 바닥에 안 붙음)
 *
 * 체크박스: Android ic_checkbox_unchecked/checked = **사각 corner_xs(4dp)**.
 *   - 미체크: 흰색 + 1.5dp gray 보더
 *   - 체크:   오렌지 solid + 흰 체크 (안)
 *
 * "필수" 배지: Android Fragment에서 HTML로 prepend — 주황 굵게 + 공백 2칸 + 항목 텍스트.
 */

import { useMemo, useState } from 'react';
import { Drawer } from 'vaul';
import { Check } from 'lucide-react';
import { ChevronRightIcon } from '../icons';
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
    setChecked(TERMS.map(() => false));
    onAgree();
  };

  const handleCancel = () => onOpenChange(false);

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[70] mx-auto flex max-w-mobile flex-col rounded-t-sheet bg-surface px-6 pb-safe">
          {/* 핸들바 */}
          <div className="mx-auto mt-3 mb-6 h-1 w-10 rounded-full bg-borderDefault" />

          {/* 타이틀 */}
          <Drawer.Title className="mb-6 whitespace-pre-line text-[18px] font-bold leading-[1.4] text-textPrimary">
            {'회원가입을 위해서는\n아래의 약관동의가 필요해요'}
          </Drawer.Title>

          {/* 모두 동의 */}
          <button
            type="button"
            onClick={toggleAll}
            className="flex h-12 items-center gap-2"
          >
            <SquareCheck checked={allChecked} />
            <span className="text-body-strong text-textPrimary">모두 동의합니다.</span>
          </button>

          {/* 구분선 */}
          <div className="my-2 h-px bg-background" />

          {/* 5개 필수 항목 */}
          <ul>
            {TERMS.map((label, i) => (
              <li key={label}>
                <div className="flex h-12 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAt(i)}
                    aria-label={`${label} 체크`}
                    className="flex items-center"
                  >
                    <SquareCheck checked={checked[i]} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAt(i)}
                    className="flex-1 text-left text-label text-textPrimary"
                  >
                    <span className="font-bold text-orange">필수</span>{'  '}
                    {label}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // 약관 상세는 v1 데모 범위 외 — 기능은 비어두되 화살표는 표시
                    }}
                    aria-label={`${label} 상세 보기`}
                    className="text-textHint"
                  >
                    <ChevronRightIcon size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* 취소 / 동의하고 가입하기 — 가로 분할, mt-6, mb-8 (바닥에 안 붙음) */}
          <div className="mt-6 mb-8 flex h-[54px] gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-card border border-borderDefault text-body text-textPrimary"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleAgree}
              disabled={!allChecked}
              className={cn(
                'flex-1 rounded-card text-label text-textWhite',
                allChecked ? 'bg-orange' : 'bg-btnDisabled',
              )}
            >
              동의하고 가입하기
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/**
 * 약관 체크박스 — 디자인 PNG 기준 **원형**으로 유지 (사용자 지시).
 * Android XML은 사각이지만 디자인 PNG 우선.
 *   - 미체크: 흰색 + 1.5px gray 보더 + 원형
 *   - 체크:   오렌지 solid + 흰 체크 + 원형
 */
function SquareCheck({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-full',
        checked
          ? 'bg-orange text-textWhite'
          : 'border-[1.5px] border-textHint bg-surface text-transparent',
      )}
    >
      <Check size={16} strokeWidth={3} />
    </span>
  );
}

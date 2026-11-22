/**
 * 회원가입 Step 5 — 선호운동 상태 머신. SPEC §9 / §12.8 / Android `SignupPreferenceFragment.kt`
 * + 디자인 `sign_signup_preference_*.png` 기준.
 *
 * 2-phase:
 *   SELECTION : 5종목 가로 행에서 관심 운동 다중 선택 (선택 순서 보존)
 *   DETAIL    : 현재 종목의 **모든 질문**을 한 화면에 세로로 쌓아 표시. "다음" = 다음 종목으로.
 *
 * `detailQueue` = 선택한 종목 이름 배열 (Android와 동일). `detailStep` = 현재 종목 인덱스.
 * 각 종목 화면에서 답한 옵션 인덱스를 `detailSelections[sport][question] = idx` 로 누적.
 * 마지막 종목까지 끝나면 `buildSavePayload()` 로 텍스트 변환해 savePreferences 에 넘긴다.
 */

import { create } from 'zustand';
import { SPORTS } from '../constants/sports';

export type Phase = 'SELECTION' | 'DETAIL';

interface PreferenceState {
  phase: Phase;
  selectedSports: string[];                                       // 선택 순서 보존
  detailQueue: string[];                                          // = selectedSports snapshot at beginDetail
  detailStep: number;                                             // detailQueue 인덱스 (현재 종목)
  detailSelections: Record<string, Record<string, number>>;       // sport → question → option index

  selectSport: (sport: string) => void;                           // toggle
  beginDetail: () => void;                                        // SELECTION 종료 → DETAIL 진입
  setAnswer: (sport: string, question: string, optionIdx: number) => void;
  next: () => 'continue' | 'done';                                // done = 마지막 종목 직후
  back: () => 'continue' | 'toSelection';                         // toSelection = step 0에서 뒤로
  jumpToSport: (sport: string) => void;                           // DETAIL: 상단 종목 행 클릭 → 그 종목으로 점프
  reset: () => void;
}

const initial = {
  phase: 'SELECTION' as Phase,
  selectedSports: [] as string[],
  detailQueue: [] as string[],
  detailStep: 0,
  detailSelections: {} as Record<string, Record<string, number>>,
};

export const usePreferenceStore = create<PreferenceState>((set, get) => ({
  ...initial,

  selectSport: (sport) =>
    set((s) => {
      const isRemoving = s.selectedSports.includes(sport);
      if (isRemoving) {
        // 미선택 전환 시 그 종목의 답변도 같이 제거 — 재선택 시 zombie 답변 방지
        const { [sport]: _removed, ...rest } = s.detailSelections;
        return {
          selectedSports: s.selectedSports.filter((x) => x !== sport),
          detailSelections: rest,
        };
      }
      return { selectedSports: [...s.selectedSports, sport] };
    }),

  beginDetail: () => {
    const { selectedSports } = get();
    // 사용자가 풋살→러닝→골프 순으로 골라도 DETAIL 진행 순서는
    // SPORTS 카탈로그 순서(러닝→풋살→등산→사이클→골프)로 통일.
    const order = SPORTS.map((s) => s.name);
    const sorted = [...selectedSports].sort(
      (a, b) => order.indexOf(a) - order.indexOf(b),
    );
    set({ phase: 'DETAIL', detailQueue: sorted, detailStep: 0 });
  },

  setAnswer: (sport, question, optionIdx) =>
    set((s) => ({
      detailSelections: {
        ...s.detailSelections,
        [sport]: { ...(s.detailSelections[sport] ?? {}), [question]: optionIdx },
      },
    })),

  next: () => {
    const { detailStep, detailQueue } = get();
    if (detailStep + 1 >= detailQueue.length) return 'done';
    set({ detailStep: detailStep + 1 });
    return 'continue';
  },

  back: () => {
    const { detailStep } = get();
    if (detailStep === 0) {
      set({ phase: 'SELECTION', detailStep: 0 });
      return 'toSelection';
    }
    set({ detailStep: detailStep - 1 });
    return 'continue';
  },

  jumpToSport: (sport) => {
    const { detailQueue } = get();
    const idx = detailQueue.indexOf(sport);
    if (idx >= 0) set({ detailStep: idx });
  },

  reset: () => set({ ...initial }),
}));

/** 종목 1개의 모든 질문이 답됐는지 — "다음" 활성화 조건. */
export function isSportComplete(
  sport: string,
  detailSelections: Record<string, Record<string, number>>,
): boolean {
  const def = SPORTS.find((s) => s.name === sport);
  if (!def) return true;
  const answers = detailSelections[sport] ?? {};
  return def.questions.every((q) => typeof answers[q.question] === 'number');
}

/**
 * 저장용 변환: `detailSelections` (option **index**) → option **text** 값.
 * userManager.savePreferences 는 sport별 `Record<question, optionText>` 형식.
 */
export function buildSavePayload(state: Pick<PreferenceState, 'selectedSports' | 'detailSelections'>) {
  const details: Record<string, Record<string, string>> = {};
  for (const sport of state.selectedSports) {
    const def = SPORTS.find((s) => s.name === sport);
    if (!def) continue;
    const answers: Record<string, string> = {};
    const selectionsForSport = state.detailSelections[sport] ?? {};
    for (const q of def.questions) {
      const idx = selectionsForSport[q.question];
      if (typeof idx === 'number' && q.options[idx]) {
        answers[q.question] = q.options[idx];
      }
    }
    details[sport] = answers;
  }
  return { sports: state.selectedSports, details };
}

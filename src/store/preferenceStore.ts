/**
 * 회원가입 Step 5 — 선호운동 상태 머신. SPEC §9 / §12.8 / Android `SignupPreferenceFragment.kt`.
 *
 * 2-phase:
 *   SELECTION : 5종목 타일에서 관심 운동 다중 선택 (선택 순서 보존)
 *   DETAIL    : 선택한 종목 순서대로, 각 종목의 질문을 1개씩 차례로 표시
 *
 * `detailQueue` 는 `beginDetail()` 시점에 SELECTION 결과를 `SPORTS` 카탈로그와 매칭해
 * (sport, question, options) 단위로 평탄화한 큐. `detailStep` 이 인덱스를 가리킨다.
 *
 * 화면은 phase + 현재 step의 항목 + 누적된 selections만 읽고, next/back/setAnswer 만
 * 디스패치한다. 답변은 sport별로 grouping된 `detailSelections` 에 누적 — 종료 후
 * userManager.savePreferences(email, sports, details) 에 그대로 넘긴다.
 */

import { create } from 'zustand';
import { SPORTS } from '../constants/sports';

export type Phase = 'SELECTION' | 'DETAIL';

export interface DetailStep {
  sport: string;
  question: string;
  options: string[];
}

interface PreferenceState {
  phase: Phase;
  selectedSports: string[];                                       // 선택 순서 보존
  detailQueue: DetailStep[];                                      // SELECTION 결과의 평탄화
  detailStep: number;                                             // detailQueue 인덱스
  detailSelections: Record<string, Record<string, number>>;       // sport → question → option index

  selectSport: (sport: string) => void;                           // toggle
  beginDetail: () => void;                                        // SELECTION 종료 → DETAIL 진입
  setAnswer: (sport: string, question: string, optionIdx: number) => void;
  next: () => 'continue' | 'done';                                // done = 마지막 질문 답한 직후
  back: () => 'continue' | 'toSelection';                         // toSelection = step 0에서 뒤로
  reset: () => void;
}

const initial = {
  phase: 'SELECTION' as Phase,
  selectedSports: [] as string[],
  detailQueue: [] as DetailStep[],
  detailStep: 0,
  detailSelections: {} as Record<string, Record<string, number>>,
};

export const usePreferenceStore = create<PreferenceState>((set, get) => ({
  ...initial,

  selectSport: (sport) =>
    set((s) => ({
      selectedSports: s.selectedSports.includes(sport)
        ? s.selectedSports.filter((x) => x !== sport)
        : [...s.selectedSports, sport],
    })),

  beginDetail: () => {
    const { selectedSports } = get();
    const queue: DetailStep[] = [];
    for (const name of selectedSports) {
      const def = SPORTS.find((s) => s.name === name);
      if (!def) continue;
      for (const q of def.questions) {
        queue.push({ sport: name, question: q.question, options: q.options });
      }
    }
    set({ phase: 'DETAIL', detailQueue: queue, detailStep: 0 });
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

  reset: () => set({ ...initial }),
}));

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

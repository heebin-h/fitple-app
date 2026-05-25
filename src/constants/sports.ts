/**
 * Sport catalog and preference question bank.
 *
 * Source of truth: SPEC.md §15 — verbatim port of
 * `app/src/main/java/com/example/fitple/ui/auth/SignupPreferenceFragment.kt`
 * from the Android codebase. Do not edit names, questions, or option order
 * without updating SPEC.md first; the seed data and pre-existing demo
 * accounts depend on these exact strings.
 *
 * The five sports are ordered to match the SELECTION tile row in the
 * design exports under /designs/sign_signup_preference_*.png.
 */

export interface SportQuestion {
  question: string;
  options: string[];
}

export interface SportDef {
  /** Korean display name. Used as the canonical id throughout the app. */
  name: string;
  /** Asset filename (without extension) for the line-art icon under public/icons/. */
  icon: string;
  /** Ordered list of detail-phase questions. Empty array allowed. */
  questions: SportQuestion[];
}

export const SPORTS: SportDef[] = [
  {
    name: '러닝',
    icon: 'sport_running',
    questions: [
      {
        question: '평균 페이스를 알려주세요(1km 기준)',
        options: [
          '4:59 이하',
          '5:00~5:59',
          '6:00~6:59',
          '7:00~7:59',
          '상관없어요(잘 몰라요)',
        ],
      },
      {
        question: '주로 뛰는 거리를 알려주세요!',
        options: ['1~3km', '3~5km', '5~10km', '상관없어요(잘 몰라요)'],
      },
    ],
  },
  {
    name: '풋살',
    icon: 'sport_futsal',
    questions: [
      {
        question: '풋살 레벨은 어느정도 이신가요?',
        options: [
          '입문(처음이에요)',
          '초보(룰은 아는데 실전은 적어요)',
          '중급(경험 있음, 기본기 가능)',
          '상급(대회 출전 등 강한 경기 선호)',
          '상관없어요(잘 몰라요)',
        ],
      },
      {
        question: '선호하는 포지션을 알려주세요!',
        options: ['공격수(피벗)', '윙어(아마)', '수비수(픽소)', '골키퍼(골레이로)'],
      },
      {
        question: '선호하는 인원을 알려주세요!',
        options: ['5:5', '6:6', '상관없어요(잘 몰라요)'],
      },
      {
        question: '선호하는 팀 구성을 알려주세요!',
        options: ['남자 팀', '여자 팀', '혼성 팀', '상관없어요(잘 몰라요)'],
      },
    ],
  },
  {
    name: '등산',
    icon: 'sport_hiking',
    questions: [
      {
        question: '등산 레벨은 어느정도 이신가요?',
        options: [
          '입문(처음이에요)',
          '초보(쉬운 코스 위주)',
          '중급(장거리 가능)',
          '고급(험한 코스도 OK)',
          '상관없어요(잘 몰라요)',
        ],
      },
      {
        question: '선호하는 시간대를 알려주세요!',
        options: ['이른 아침', '오전', '오후', '상관없어요(잘 몰라요)'],
      },
    ],
  },
  {
    name: '사이클',
    icon: 'sport_cycling',
    questions: [
      {
        question: '사이클 레벨은 어느정도이신가요?',
        options: [
          '이제 막 타기 시작(초보)',
          '어느정도 탈 줄 앎(중급)',
          '장거리도 문제없음(고급)',
          '상관없어요(잘 몰라요)',
        ],
      },
      {
        question: '선호하는 방식을 알려주세요!',
        options: ['혼자', '팀 라이딩', '상관없어요'],
      },
      {
        question: '어떤 분기를 선호하나요?',
        options: ['단거리', '장거리', '상관없어요'],
      },
    ],
  },
  {
    name: '골프',
    icon: 'sport_golf',
    questions: [
      {
        question: '골프 레벨은 어느정도이신가요?',
        options: [
          '입문(처음이에요)',
          '초보(잘 모르지만 재밌어요)',
          '중급(경험 있음, 기본기 가능)',
          '상급(대회 출전 등 강한 경기 선호)',
          '상관없어요(잘 몰라요)',
        ],
      },
      {
        question: '평균 스코어를 알려주세요!',
        options: ['90대 이하', '100대', '110대 이상', '상관없어요(잘 몰라요)'],
      },
      {
        question: '선호하는 방식을 알려주세요!',
        options: ['스크린', '필드', '상관없어요(둘 다 좋아요)'],
      },
    ],
  },
];

/** Convenience: `['러닝', '풋살', '등산', '사이클', '골프']`. */
export const SPORT_NAMES = SPORTS.map((s) => s.name);

/** Look up a sport definition by its Korean name. Returns `undefined` if unknown. */
export function getSport(name: string): SportDef | undefined {
  return SPORTS.find((s) => s.name === name);
}

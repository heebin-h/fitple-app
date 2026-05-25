/**
 * 종목 정의. Android `SignupPreferenceFragment.kt` 내부 종목/질문 데이터의 placeholder.
 * 실제 질문/선지는 Android 원본을 보고 Phase 3-7 직전에 정확히 맞춤.
 */

export interface SportQuestion {
  question: string;
  options: string[];
}

export interface SportDef {
  name: string;
  icon: string;          // lucide-react 또는 SVG 파일명
  questions: SportQuestion[];
}

export const SPORTS: SportDef[] = [
  {
    name: '러닝',
    icon: 'footprints',
    questions: [
      {
        question: '평균 페이스를 알려주세요 (1km 기준)',
        options: ['7:00 이상', '6:00~6:59', '5:00~5:59', '4:00~4:59', '4:00 미만'],
      },
      {
        question: '주로 어느 시간대에 뛰시나요?',
        options: ['새벽', '아침', '점심', '저녁', '밤'],
      },
    ],
  },
  {
    name: '골프',
    icon: 'flag',
    questions: [
      {
        question: '평균 스코어를 알려주세요',
        options: ['100 이상', '90~99', '80~89', '70~79', '70 미만'],
      },
    ],
  },
  {
    name: '테니스',
    icon: 'circle-dot',
    questions: [
      {
        question: '구력을 알려주세요',
        options: ['1년 미만', '1~3년', '3~5년', '5년 이상'],
      },
    ],
  },
  {
    name: '클라이밍',
    icon: 'mountain',
    questions: [
      {
        question: '난이도를 알려주세요',
        options: ['빨강 이하', '주황', '노랑', '초록', '파랑 이상'],
      },
    ],
  },
  {
    name: '자전거',
    icon: 'bike',
    questions: [
      {
        question: '주행 거리를 알려주세요',
        options: ['10km 미만', '10~30km', '30~50km', '50km 이상'],
      },
    ],
  },
];

export const SPORT_NAMES = SPORTS.map((s) => s.name);

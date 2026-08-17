/**
 * 데이터 모델. Android `app/src/main/java/com/example/fitple/data/model/*.kt`와 필드 1:1.
 */

export interface UserProfile {
  email: string;
  nickname: string;
  passwordHash: string;
  selectedSports: string[];
  sportDetails: Record<string, Record<string, string>>;
}

export interface Meeting {
  id: string;
  title: string;
  groupName: string;
  sport: string;            // one of SPORT_NAMES — see constants/sports.ts
  image: string;            // asset filename or url
  location: string;         // freeform Korean text (e.g. '미사 1동')
  memberCount: number;
  maxMembers: number;
  level?: string;           // '보통' | '중급' | '상급' | ...
  date?: string;            // YYYY-MM-DD
  time?: string;            // HH:mm
  description?: string;
  isUrgent?: boolean;       // surfaces "한자리 남았어요!!" badge
  lastActiveMinutes?: number;  // "{n}분전 활동" — minutes since last group activity
  meetingTime?: string;        // human-readable cadence, e.g. '매주 토 오전 8:00'
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  senderName: string;
  message: string;
  timestamp: number;        // Unix epoch ms
  isMe: boolean;
  isSystem: boolean;
}

export interface Review {
  id: string;
  nickname: string;
  activity: string;
  text: string;
  image: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  date: string;             // YYYY-MM-DD
  time: string;             // 한국어 표기, e.g. '오전 8:00' / '오후 8:30'
  sport: string;
  image: string;
  day: string;              // 월/화/수…
  level: string;
  location: string;
  memberCount: number;
  isUrgent: boolean;
}

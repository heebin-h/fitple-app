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
  sport: string;
  image: string;            // 에셋 파일명 또는 url
  location: string;
  memberCount: number;
  maxMembers: number;
  level?: string;
  date?: string;            // YYYY-MM-DD
  time?: string;            // HH:mm
  description?: string;
  isUrgent?: boolean;
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
  time: string;             // HH:mm
  sport: string;
  image: string;
  day: string;              // 월/화/수…
  level: string;
  location: string;
  memberCount: number;
  isUrgent: boolean;
}

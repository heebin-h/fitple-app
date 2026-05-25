/**
 * Demo seed data — injected into localStorage on first launch by `seedRunner.ts`.
 *
 * Source of truth: aligned with the Android sample data inside
 * `app/src/main/java/com/example/fitple/ui/home/HomeFragment.kt`,
 * `ExerciseFragment.kt`, and `RecommendedGroupFragment.kt`.
 *
 * Sport list (must match SPEC §15 + `constants/sports.ts`):
 *   러닝 · 풋살 · 등산 · 사이클 · 골프
 *
 * Image filenames reference assets under `src/assets/images/` (the Android
 * `res/drawable/img_meeting_*.png` files copied verbatim). The components
 * resolve them via Vite asset imports; see SPEC §14.
 */

import type { Meeting, Review, ScheduleItem, ChatMessage } from './models';

// ────────────────────────────────────────────────────────────────────────
// Demo accounts
// ────────────────────────────────────────────────────────────────────────

export const SEED_DEMO_ACCOUNTS = [
  { email: 'demo@fitple.app',  password: 'demo1234', nickname: '데모유저' },
  { email: 'alice@fitple.app', password: 'alice123', nickname: '앨리스'   },
  { email: 'bob@fitple.app',   password: 'bob12345', nickname: '밥'       },
];

// ────────────────────────────────────────────────────────────────────────
// Meetings — 15 entries (3 per sport × 5 sports)
// ────────────────────────────────────────────────────────────────────────

export const SEED_MEETINGS: Meeting[] = [
  // ── 러닝
  { id: 'm-run-1', title: '미사강변 새벽 러닝크루', groupName: '새벽러너스',     sport: '러닝',   image: 'img_meeting_running_night',  location: '미사강변공원',   memberCount: 18, maxMembers: 25, level: '보통', date: '2026-05-25', time: '05:00', lastActiveMinutes:  1, description: '새벽 5시 미사강변에서 함께 달려요',                 meetingTime: '매일 오전 5:00' },
  { id: 'm-run-2', title: '나래필라테스 러닝 주말 모임', groupName: '나래필라테스', sport: '러닝',   image: 'img_meeting_running_group1', location: '미사역 근처',     memberCount: 15, maxMembers: 20, level: '보통', date: '2026-05-30', time: '08:00', lastActiveMinutes:  3, description: '매주 토요일 한강 미사대교에서 함께 달려요!',          meetingTime: '매주 토 오전 8:00' },
  { id: 'm-run-3', title: '한강 야간 라이트 러닝',       groupName: '나이트러너',   sport: '러닝',   image: 'img_meeting_running_track',  location: '청계천',           memberCount: 18, maxMembers: 30, level: '보통', date: '2026-05-27', time: '20:30', lastActiveMinutes: 12, description: '야간 LED 라이트 착용 후 안전 러닝!',                  meetingTime: '매주 수 오후 8:30', isUrgent: true },

  // ── 풋살
  { id: 'm-fut-1', title: '하남시 6:6 풋살 매치',  groupName: '하남FC',         sport: '풋살',   image: 'img_meeting_futsal_field1',  location: '하남 풋살장',     memberCount: 24, maxMembers: 30, level: '중급', date: '2026-05-27', time: '20:00', lastActiveMinutes: 12, description: '하남시 직장인 풋살 리그! 실력 무관 환영',             meetingTime: '매주 수 오후 8:00' },
  { id: 'm-fut-2', title: '경기남부 풋살 리그',     groupName: '경기풋살',       sport: '풋살',   image: 'img_meeting_futsal_field1',  location: '분당 풋살장',     memberCount: 32, maxMembers: 40, level: '상급', date: '2026-05-28', time: '21:00', lastActiveMinutes:  8, description: '경기남부 직장인 풋살 리그 참가팀 모집',               meetingTime: '매주 목 오후 9:00' },
  { id: 'm-fut-3', title: '주말 친선 풋살 매치',    groupName: '주말풋살',       sport: '풋살',   image: 'img_meeting_futsal_field1',  location: '구리 야외 코트', memberCount: 16, maxMembers: 20, level: '보통', date: '2026-05-31', time: '10:00', lastActiveMinutes: 25, description: '주말 친선 경기. 초보자도 환영!',                       meetingTime: '매주 일 오전 10:00' },

  // ── 등산
  { id: 'm-hik-1', title: '북한산 등산 동호회',    groupName: '북한산등산',     sport: '등산',   image: 'img_meeting_hiking_group1',  location: '북한산 입구',     memberCount: 32, maxMembers: 50, level: '보통', date: '2026-05-31', time: '07:00', lastActiveMinutes:  5, description: '매주 일요일 아침 등산! 초보자 환영합니다',            meetingTime: '매주 일 오전 7:00' },
  { id: 'm-hik-2', title: '수리산 트레킹 모임',    groupName: '수리산트레킹',   sport: '등산',   image: 'img_meeting_hiking_group2',  location: '수리산 입구',     memberCount: 15, maxMembers: 25, level: '중급', date: '2026-05-31', time: '08:00', lastActiveMinutes: 20, description: '매주 일요일 수리산 트레킹! 중급자 이상',              meetingTime: '매주 일 오전 8:00' },
  { id: 'm-hik-3', title: '겨울 등산 동호회',      groupName: '겨울동호회',     sport: '등산',   image: 'img_meeting_hiking_winter',  location: '미사 1동',         memberCount: 18, maxMembers: 25, level: '보통', date: '2026-05-28', time: '10:30', lastActiveMinutes:  1, description: '등산 입문자 환영합니다',                              meetingTime: '매주 목 오전 10:30' },

  // ── 사이클
  { id: 'm-cyc-1', title: '한강 사이클 크루',      groupName: '한강사이클',     sport: '사이클', image: 'img_meeting_cycling_group1', location: '여의도한강공원', memberCount: 12, maxMembers: 20, level: '보통', date: '2026-05-30', time: '07:00', lastActiveMinutes:  8, description: '한강 자전거길 50km 라이딩',                           meetingTime: '매주 토 오전 7:00' },
  { id: 'm-cyc-2', title: '주말 사이클 크루',      groupName: '주말사이클',     sport: '사이클', image: 'img_meeting_cycling_group2', location: '한강시민공원',   memberCount: 20, maxMembers: 30, level: '보통', date: '2026-05-31', time: '07:30', lastActiveMinutes: 12, description: '주말 아침 한강 라이딩! 입문자 환영',                  meetingTime: '매주 일 오전 7:30' },
  { id: 'm-cyc-3', title: '싱글벙글 사이클 크루 체험', groupName: '싱글벙글사이클', sport: '사이클', image: 'img_trial_cycling_group',    location: '동작구',         memberCount: 10, maxMembers: 30, level: '보통', date: '2026-05-30', time: '07:00', lastActiveMinutes:  3, description: '초보자들도 환영합니다~',                              meetingTime: '매주 토 오전 7:00' },

  // ── 골프
  { id: 'm-glf-1', title: '주말 골프 모임',        groupName: '골프클럽',       sport: '골프',   image: 'img_meeting_golf_field1',    location: '남양주CC',         memberCount:  8, maxMembers: 12, level: '상급', date: '2026-05-30', time: '06:00', lastActiveMinutes: 30, description: '주말 라운딩 함께할 분! 스크린골프도 진행',           meetingTime: '매주 토 오전 6:00' },
  { id: 'm-glf-2', title: '골린이들 골프 모임',    groupName: '골린이골프',     sport: '골프',   image: 'img_meeting_golf_field1',    location: '미사 1동',         memberCount: 12, maxMembers: 16, level: '보통', date: '2026-05-28', time: '16:20', lastActiveMinutes: 12, description: '골린이들 모집합니다. 같이 배워요',                    meetingTime: '매주 목 오후 4:20' },
  { id: 'm-glf-3', title: '남양주 골프 모임',      groupName: '남양주골프',     sport: '골프',   image: 'img_meeting_golf_field1',    location: '남양주CC',         memberCount:  8, maxMembers: 12, level: '상급', date: '2026-05-30', time: '06:00', lastActiveMinutes: 45, description: '주말 라운딩 동호회. 스크린 + 필드',                    meetingTime: '매주 토 오전 6:00' },
];

// ────────────────────────────────────────────────────────────────────────
// Reviews
// ────────────────────────────────────────────────────────────────────────

export const SEED_REVIEWS: Review[] = [
  { id: 'r-1', nickname: '유린이남',   activity: '싱글벙글 러닝크루 후기', text: '다른 사람들이랑 같이 뛰니깐 너무 좋아요! 운동이 잘 되네요', image: 'img_meeting_running_night' },
  { id: 'r-2', nickname: '운동 갈남',  activity: '등산 모임 후기',          text: '한번 정상까지 좋은 추억이 됐습니다.',                       image: 'img_meeting_hiking_group1' },
  { id: 'r-3', nickname: '만남 초보님',activity: '2030 러닝모임 후기',     text: '또래 분들이랑 같이 달려서 러닝이 더 쉬웠어요',              image: 'img_meeting_outdoor_winter' },
  { id: 'r-4', nickname: '사이클 입문',activity: '한강 사이클 크루 후기',  text: '바람맞으며 달리니까 스트레스가 다 날아가요!',                image: 'img_meeting_cycling_group1' },
  { id: 'r-5', nickname: '풋살 신참',  activity: '하남FC 풋살 후기',        text: '실력 무관이라더니 정말 친절하게 알려주셨어요.',              image: 'img_meeting_futsal_field1' },
  { id: 'r-6', nickname: '주말 골퍼',  activity: '남양주 골프 라운딩 후기',text: '필드 처음 나갔는데 매너있게 챙겨주셔서 감사했어요.',         image: 'img_meeting_golf_field1' },
];

// ────────────────────────────────────────────────────────────────────────
// Schedules — 7-day strip, today-centered
// ────────────────────────────────────────────────────────────────────────

function todayPlus(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function dayKor(days: number): string {
  const names = ['일', '월', '화', '수', '목', '금', '토'];
  const d = new Date();
  d.setDate(d.getDate() + days);
  return names[d.getDay()];
}

export const SEED_SCHEDULES: ScheduleItem[] = [
  { id: 's-1', title: '나래 러닝 모임',     date: todayPlus(0), time: '오전 8:00',  sport: '러닝',   image: 'img_meeting_running_group1',  day: dayKor(0), level: '보통', location: '미사역',     memberCount: 18, isUrgent: false },
  { id: 's-2', title: '하남FC 풋살 매치',   date: todayPlus(0), time: '오후 8:00',  sport: '풋살',   image: 'img_meeting_futsal_field1',   day: dayKor(0), level: '중급', location: '하남구',     memberCount: 24, isUrgent: true  },
  { id: 's-3', title: '북한산 등산 모임',   date: todayPlus(1), time: '오전 7:00',  sport: '등산',   image: 'img_meeting_hiking_group1',   day: dayKor(1), level: '보통', location: '도봉구',     memberCount: 32, isUrgent: false },
  { id: 's-4', title: '주말 골프 라운딩',   date: todayPlus(3), time: '오전 6:00',  sport: '골프',   image: 'img_meeting_golf_field1',     day: dayKor(3), level: '상급', location: '남양주',     memberCount:  8, isUrgent: true  },
  { id: 's-5', title: '미사강변 러닝크루', date: todayPlus(5), time: '오전 5:00',  sport: '러닝',   image: 'img_meeting_running_night',   day: dayKor(5), level: '보통', location: '하남시',     memberCount: 18, isUrgent: false },
  { id: 's-6', title: '한강 사이클 크루',  date: todayPlus(7), time: '오전 7:00',  sport: '사이클', image: 'img_meeting_cycling_group1',  day: dayKor(7), level: '보통', location: '여의도구',   memberCount: 12, isUrgent: false },
];

// ────────────────────────────────────────────────────────────────────────
// Chats — only a couple of meetings have seeded transcripts so empty
// chat tabs still feel populated when reached from PostDetail.
// ────────────────────────────────────────────────────────────────────────

function ts(daysAgo: number, hour: number, min: number): number {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, min, 0, 0);
  return d.getTime();
}

export const SEED_CHATS: Record<string, ChatMessage[]> = {
  'm-run-1': [
    { id: 'c-1-1', senderName: '',         message: '운영진이 공지를 등록했어요\n핏플에서 배려하고, 존중하는 건강한 채팅 해요~', timestamp: ts(2, 22, 0),  isMe: false, isSystem: true  },
    { id: 'c-1-2', senderName: '김상미',   message: '안녕하세요! 이번 주 모임 참석 가능할까요?',                                  timestamp: ts(2, 15, 20), isMe: false, isSystem: false },
    { id: 'c-1-3', senderName: '나',       message: '네! 저도 참가합니다 😊',                                                     timestamp: ts(2, 15, 22), isMe: true,  isSystem: false },
    { id: 'c-1-4', senderName: '박지훈',   message: '저도요! 이번에 처음 참여해봅니다',                                           timestamp: ts(2, 15, 25), isMe: false, isSystem: false },
    { id: 'c-1-5', senderName: '김상미',   message: '좋아요! 환영합니다~ 준비물은 편한 운동복이랑 물이면 충분해요',              timestamp: ts(2, 15, 27), isMe: false, isSystem: false },
    { id: 'c-1-6', senderName: '이현우',   message: '오 새 멤버가! 반갑습니다 👋',                                                 timestamp: ts(2, 15, 30), isMe: false, isSystem: false },
    { id: 'c-1-7', senderName: '나',       message: '감사합니다! 장소가 미사역 맞죠?',                                            timestamp: ts(2, 15, 32), isMe: true,  isSystem: false },
    { id: 'c-1-8', senderName: '김상미',   message: '네 맞아요! 미사역 3번 출구 앞에서 만나요. 집합시간은 7시 50분입니다!',       timestamp: ts(2, 15, 35), isMe: false, isSystem: false },
  ],
  'm-fut-1': [
    { id: 'c-2-1', senderName: '',         message: '하남FC 풋살 매치 채팅방이 시작되었습니다.',                                  timestamp: ts(3, 20, 0),  isMe: false, isSystem: true  },
    { id: 'c-2-2', senderName: '하남캡틴', message: '이번 주 토요일 풋살장 예약 완료했습니다!',                                   timestamp: ts(3, 20, 10), isMe: false, isSystem: false },
    { id: 'c-2-3', senderName: '나',       message: '몇시에 모이나요?',                                                            timestamp: ts(3, 20, 12), isMe: true,  isSystem: false },
    { id: 'c-2-4', senderName: '하남캡틴', message: '오후 8시 시작이라 7시 30분까지 모여요',                                       timestamp: ts(3, 20, 14), isMe: false, isSystem: false },
  ],
  'm-hik-1': [
    { id: 'c-3-1', senderName: '',         message: '북한산 등산 동호회 채팅방이 시작되었습니다.',                                 timestamp: ts(4, 19, 0),  isMe: false, isSystem: true  },
    { id: 'c-3-2', senderName: '등산왕',   message: '이번 주 일요일 날씨가 좋다네요!',                                             timestamp: ts(4, 19, 15), isMe: false, isSystem: false },
    { id: 'c-3-3', senderName: '나',       message: '신발은 어떤 거 신고 가면 좋을까요?',                                          timestamp: ts(4, 19, 20), isMe: true,  isSystem: false },
    { id: 'c-3-4', senderName: '등산왕',   message: '운동화도 괜찮지만 가능하면 등산화 추천드려요!',                                timestamp: ts(4, 19, 22), isMe: false, isSystem: false },
  ],
};

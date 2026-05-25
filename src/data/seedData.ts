/**
 * 데모용 시드 데이터.
 * 첫 실행 시 seedRunner가 localStorage에 일괄 주입.
 *
 * 분량 — 화면이 비지 않을 정도의 최소량으로 작성:
 *   - 데모 계정 3명 (로그인 시연용)
 *   - 모임 12개 (5종목 × 약 2~3개)
 *   - 후기 6개
 *   - 스케줄 7일치 × 종목별 1개
 *   - 채팅 일부 모임 (모임당 6~10개)
 */

import type { Meeting, Review, ScheduleItem, ChatMessage } from './models';

export const SEED_DEMO_ACCOUNTS = [
  { email: 'demo@fitple.app',  password: 'demo1234', nickname: '데모유저' },
  { email: 'alice@fitple.app', password: 'alice123', nickname: '앨리스' },
  { email: 'bob@fitple.app',   password: 'bob12345', nickname: '밥' },
];

export const SEED_MEETINGS: Meeting[] = [
  // ── 러닝
  { id: 'm-run-1', title: '한강 새벽 러닝',     groupName: '러닝클럽 알파', sport: '러닝',   image: 'img_meeting_running_1', location: '여의도 한강공원', memberCount: 12, maxMembers: 20, level: '초급', date: '2026-05-25', time: '06:00' },
  { id: 'm-run-2', title: '주말 5km 그룹런',    groupName: '러너스',         sport: '러닝',   image: 'img_meeting_running_2', location: '잠실 한강공원',   memberCount:  8, maxMembers: 15, level: '중급', date: '2026-05-26', time: '08:00' },
  { id: 'm-run-3', title: '야간 라이트런',      groupName: '나이트러너',     sport: '러닝',   image: 'img_meeting_running_3', location: '청계천',           memberCount: 18, maxMembers: 30, level: '초급', date: '2026-05-27', time: '20:30', isUrgent: true },

  // ── 골프
  { id: 'm-glf-1', title: '주말 스크린골프 같이', groupName: '버디파크',     sport: '골프',   image: 'img_meeting_golf_1',    location: '강남 스크린골프', memberCount:  4, maxMembers:  6, level: '중급', date: '2026-05-25', time: '14:00' },
  { id: 'm-glf-2', title: '초보 필드 라운딩',     groupName: '그린마스터',   sport: '골프',   image: 'img_meeting_golf_2',    location: '용인 CC',         memberCount:  3, maxMembers:  4, level: '초급', date: '2026-05-31', time: '07:00' },

  // ── 테니스
  { id: 'm-tns-1', title: '평일 저녁 복식 매치', groupName: '테니스러버스', sport: '테니스', image: 'img_meeting_tennis_1',  location: '잠실종합운동장',   memberCount:  6, maxMembers:  8, level: '중급', date: '2026-05-26', time: '19:00' },
  { id: 'm-tns-2', title: '주말 단식 대결',       groupName: '백핸드클럽',   sport: '테니스', image: 'img_meeting_tennis_2',  location: '양재시민의숲',     memberCount:  2, maxMembers:  4, level: '고급', date: '2026-05-25', time: '10:00' },

  // ── 클라이밍
  { id: 'm-clm-1', title: '실내 클라이밍 함께',   groupName: '온더록',       sport: '클라이밍', image: 'img_meeting_climbing_1', location: '강북 더클라임',  memberCount:  9, maxMembers: 15, level: '초급', date: '2026-05-25', time: '19:00' },
  { id: 'm-clm-2', title: '볼더링 토요 세션',     groupName: '록픽업',       sport: '클라이밍', image: 'img_meeting_climbing_2', location: '홍대 클라임존',  memberCount:  5, maxMembers: 10, level: '중급', date: '2026-05-26', time: '15:00' },

  // ── 자전거
  { id: 'm-bik-1', title: '한강 라이딩 50km',     groupName: '윈드라이더',   sport: '자전거', image: 'img_meeting_cycling_1', location: '뚝섬한강공원',   memberCount: 14, maxMembers: 25, level: '중급', date: '2026-05-26', time: '07:00' },
  { id: 'm-bik-2', title: '북악스카이 라이드',    groupName: '오르막클럽',   sport: '자전거', image: 'img_meeting_cycling_2', location: '북악스카이웨이', memberCount:  6, maxMembers: 10, level: '고급', date: '2026-05-30', time: '08:00' },
  { id: 'm-bik-3', title: '입문자 한강 둘러보기', groupName: '바이크프렌즈', sport: '자전거', image: 'img_meeting_cycling_3', location: '반포한강공원',   memberCount: 22, maxMembers: 30, level: '초급', date: '2026-05-25', time: '10:00', isUrgent: true },
];

export const SEED_REVIEWS: Review[] = [
  { id: 'r-1', nickname: '러닝좋아',   activity: '한강 새벽 러닝',     text: '새벽 공기 마시면서 페이스 맞춰서 뛰니까 너무 좋았어요!',     image: 'img_review_1' },
  { id: 'r-2', nickname: '골프초보',   activity: '초보 필드 라운딩',   text: '처음 필드 나갔는데 친절하게 알려주셔서 무사히 마쳤습니다.',  image: 'img_review_2' },
  { id: 'r-3', nickname: '테니스맨',   activity: '평일 저녁 복식 매치', text: '실력 비슷한 사람들이라 게임이 재밌게 흘러갔어요.',           image: 'img_review_3' },
  { id: 'r-4', nickname: '클라이머A', activity: '실내 클라이밍 함께', text: '난이도별로 코치해주시고 분위기 좋았어요. 또 가고 싶어요!',  image: 'img_review_4' },
  { id: 'r-5', nickname: '바이커J',    activity: '한강 라이딩 50km',    text: '페이스 잘 맞춰주셔서 즐겁게 완주했습니다.',                  image: 'img_review_5' },
  { id: 'r-6', nickname: '운동친구',   activity: '주말 5km 그룹런',     text: '혼자 뛰는 것보다 훨씬 동기부여돼요. 추천!',                  image: 'img_review_6' },
];

export const SEED_SCHEDULES: ScheduleItem[] = [
  { id: 's-1', title: '월요일 러닝',       date: '2026-05-25', time: '06:00', sport: '러닝',     image: 'img_schedule_1', day: '월', level: '초급', location: '여의도 한강공원', memberCount: 12, isUrgent: false },
  { id: 's-2', title: '화요일 클라이밍',   date: '2026-05-26', time: '19:00', sport: '클라이밍', image: 'img_schedule_2', day: '화', level: '초급', location: '강북 더클라임',   memberCount:  9, isUrgent: false },
  { id: 's-3', title: '수요일 테니스',     date: '2026-05-27', time: '19:00', sport: '테니스',   image: 'img_schedule_3', day: '수', level: '중급', location: '잠실종합운동장', memberCount:  6, isUrgent: true  },
  { id: 's-4', title: '목요일 골프 연습',  date: '2026-05-28', time: '20:00', sport: '골프',     image: 'img_schedule_4', day: '목', level: '초급', location: '강남 스크린골프', memberCount:  4, isUrgent: false },
  { id: 's-5', title: '금요일 자전거',     date: '2026-05-29', time: '07:00', sport: '자전거',   image: 'img_schedule_5', day: '금', level: '중급', location: '뚝섬한강공원',   memberCount: 14, isUrgent: false },
  { id: 's-6', title: '토요일 그룹런',     date: '2026-05-30', time: '08:00', sport: '러닝',     image: 'img_schedule_6', day: '토', level: '중급', location: '잠실 한강공원',   memberCount:  8, isUrgent: false },
  { id: 's-7', title: '일요일 클라이밍',   date: '2026-05-31', time: '15:00', sport: '클라이밍', image: 'img_schedule_7', day: '일', level: '중급', location: '홍대 클라임존',   memberCount:  5, isUrgent: false },
];

function ts(daysAgo: number, hour: number, min: number): number {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, min, 0, 0);
  return d.getTime();
}

/**
 * 모임별 초기 채팅. 일부 모임에만 시드를 주입 — 채팅 페이지 클릭 시 빈 화면 방지.
 * 'isMe' 는 디폴트 false로 (사용자가 누구인지 시점 따라 다르므로).
 */
export const SEED_CHATS: Record<string, ChatMessage[]> = {
  'm-run-1': [
    { id: 'c-1-1', senderName: '시스템',   message: '한강 새벽 러닝 모임이 시작되었습니다.', timestamp: ts(2, 22, 0),  isMe: false, isSystem: true  },
    { id: 'c-1-2', senderName: '러닝좋아', message: '안녕하세요! 처음 참여해요.',             timestamp: ts(2, 22, 5),  isMe: false, isSystem: false },
    { id: 'c-1-3', senderName: '데모유저', message: '환영합니다! 6시 정문 앞 모이는 거 맞죠?', timestamp: ts(2, 22, 7),  isMe: false, isSystem: false },
    { id: 'c-1-4', senderName: '앨리스',   message: '네 맞아요. 늦지 마세요~',                timestamp: ts(2, 22, 12), isMe: false, isSystem: false },
    { id: 'c-1-5', senderName: '러닝좋아', message: '내일 비 오면 어떻게 하나요?',            timestamp: ts(1, 18, 30), isMe: false, isSystem: false },
    { id: 'c-1-6', senderName: '데모유저', message: '강수 5mm 이상이면 카톡으로 공지할게요.', timestamp: ts(1, 18, 35), isMe: false, isSystem: false },
  ],
  'm-tns-1': [
    { id: 'c-2-1', senderName: '시스템',   message: '평일 저녁 복식 매치 모임이 시작되었습니다.', timestamp: ts(3, 20, 0),  isMe: false, isSystem: true  },
    { id: 'c-2-2', senderName: '백핸드',   message: '실력 어느정도 되시는 분들이세요?',           timestamp: ts(3, 20, 10), isMe: false, isSystem: false },
    { id: 'c-2-3', senderName: '데모유저', message: '대부분 구력 3년 이상이에요!',                timestamp: ts(3, 20, 12), isMe: false, isSystem: false },
    { id: 'c-2-4', senderName: '앨리스',   message: '저는 1년차인데 괜찮을까요?',                 timestamp: ts(2, 21, 30), isMe: false, isSystem: false },
    { id: 'c-2-5', senderName: '밥',       message: '복식이라 함께 즐길 수 있어요.',              timestamp: ts(2, 21, 35), isMe: false, isSystem: false },
  ],
  'm-clm-1': [
    { id: 'c-3-1', senderName: '시스템',   message: '실내 클라이밍 함께 모임이 시작되었습니다.', timestamp: ts(4, 19, 0),  isMe: false, isSystem: true  },
    { id: 'c-3-2', senderName: '록스타',   message: '난이도는 어디까지 보세요?',                  timestamp: ts(4, 19, 15), isMe: false, isSystem: false },
    { id: 'c-3-3', senderName: '데모유저', message: '주황까지가 무난해요. 노랑은 도전 코스로!',   timestamp: ts(4, 19, 20), isMe: false, isSystem: false },
  ],
};

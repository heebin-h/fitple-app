/**
 * 채팅 메시지 목록 — Android `item_chat_message.xml` / `item_chat_message_me.xml` /
 * `PostDetailFragment.addOtherMessage·addMyMessage·addSystemMessage` 포트.
 * PostDetailScreen 채팅 탭과 PostChatScreen이 공유한다.
 *
 *   상대: 아바타 36 + [왕관 13 + "(모임장) 이름"] + 말풍선 + 시각 10sp textHint
 *   나  : (좌측 48dp 여백) 말풍선(주황, 흰 14sp) + 시각, 우측 아바타 36
 *   스타일은 디자인 PNG(home_postdetail_noticelist_chattab.png) 우선: 상대 말풍선 회색 채움·테두리 없음,
 *   양쪽 radius 20, 이름 14 textPrimary — "(모임장)"만 금색(crownGold). XML은 흰 배경+테두리·12sp.
 *   시스템: 전폭 colorBackground 띠, 12sp textHint 가운데 정렬
 *   아바타: 김상미 → img_profile_sample1, 그 외·나 → img_profile_default
 */

import type { ChatMessage } from '../../data/models';
import profileDefault from '../../assets/images/profile/profile_default.png';
import profileSample1 from '../../assets/images/profile/profile_sample1.png';
import crownGold from '../../assets/images/chat/ic_crown_gold.png';
import crownBlue from '../../assets/images/chat/ic_crown_blue.png';

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours(), m = d.getMinutes();
  return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${String(m).padStart(2, '0')}`;
}

function Avatar({ src }: { src: string }) {
  return <img src={src} alt="" className="h-9 w-9 flex-shrink-0 rounded-full bg-background object-cover" />;
}

function OtherMessage({ msg }: { msg: ChatMessage }) {
  const name = msg.role ? `(${msg.role}) ${msg.senderName}` : msg.senderName;
  const crown = msg.role === '모임장' ? crownGold : msg.role === '운영진' ? crownBlue : null;
  return (
    <div className="flex items-start gap-2 py-1">
      <Avatar src={msg.senderName === '김상미' ? profileSample1 : profileDefault} />
      <div className="flex min-w-0 flex-col items-start pr-12">
        <div className="flex items-center gap-1">
          {crown && <img src={crown} alt="" className="h-[13px] w-[13px] object-contain" />}
          <span className={msg.role === '모임장' ? 'text-label text-crownGold' : 'text-label text-textPrimary'}>{name}</span>
        </div>
        <p className="mt-1 whitespace-pre-line break-words rounded-[20px] bg-background px-4 py-2.5 text-label text-textPrimary">
          {msg.message}
        </p>
        <span className="mt-0.5 text-tiny text-textHint">{formatTime(msg.timestamp)}</span>
      </div>
    </div>
  );
}

function MyMessage({ msg }: { msg: ChatMessage }) {
  return (
    <div className="flex items-start justify-end gap-2 py-1">
      <div className="flex min-w-0 flex-col items-end pl-12">
        <p className="whitespace-pre-line break-words rounded-[20px] bg-orange px-4 py-2.5 text-label text-textWhite">
          {msg.message}
        </p>
        <span className="mt-0.5 text-tiny text-textHint">{formatTime(msg.timestamp)}</span>
      </div>
      <Avatar src={profileDefault} />
    </div>
  );
}

function SystemMessage({ msg }: { msg: ChatMessage }) {
  return (
    <p className="my-2 whitespace-pre-line bg-background px-3 py-1.5 text-center text-micro text-textHint">
      {msg.message}
    </p>
  );
}

export function ChatMessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <>
      {messages.map((msg) =>
        msg.isSystem ? <SystemMessage key={msg.id} msg={msg} />
          : msg.isMe ? <MyMessage key={msg.id} msg={msg} />
            : <OtherMessage key={msg.id} msg={msg} />,
      )}
    </>
  );
}

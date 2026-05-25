/**
 * Date helpers built on top of `dayjs`. Centralises every date format
 * the UI uses so behaviour stays consistent across DateStrip, Hero card,
 * and ScheduleCard.
 *
 * Korean weekday/month labels match the Android source (HomeFragment.kt
 * setupDateStrip / setupHero / UpcomingMeetingFragment.kt).
 */

import dayjs, { type Dayjs } from 'dayjs';

const DAY_KOR = ['일', '월', '화', '수', '목', '금', '토'] as const;
const MONTH_KOR = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월',
] as const;

/** "5/25" — used by Android `ScheduleItem.date`. */
export function monthDay(d: Dayjs | Date | string = new Date()): string {
  const x = dayjs(d);
  return `${x.month() + 1}/${x.date()}`;
}

/** "2026-05-25" — ISO style used throughout the iOS port. */
export function isoDate(d: Dayjs | Date | string = new Date()): string {
  return dayjs(d).format('YYYY-MM-DD');
}

/** "11월 17일(월)" — used by the Hero card date tag. */
export function heroDate(d: Dayjs | Date | string = new Date()): string {
  const x = dayjs(d);
  return `${x.month() + 1}월 ${x.date()}일(${DAY_KOR[x.day()]})`;
}

/** "2026년 5월" — used by UpcomingMeeting header. */
export function yearMonth(d: Dayjs | Date | string = new Date()): string {
  const x = dayjs(d);
  return `${x.year()}년 ${MONTH_KOR[x.month()]}`;
}

/** Korean weekday letter: 일/월/화/수/목/금/토. */
export function weekdayKor(d: Dayjs | Date | string = new Date()): string {
  return DAY_KOR[dayjs(d).day()];
}

/**
 * 7-day strip centred on today: offsets `-3, -2, -1, 0, 1, 2, 3`.
 * Each entry exposes the values DateStrip needs to render a single cell.
 */
export interface DateStripCell {
  date: Dayjs;
  iso: string;     // 'YYYY-MM-DD' — used as React key + match against ScheduleItem.date
  number: number;  // day-of-month, 1..31
  weekday: string; // 일/월/화/수/목/금/토
  isToday: boolean;
}

export function buildDateStrip(today: Dayjs | Date | string = new Date()): DateStripCell[] {
  const base = dayjs(today);
  const out: DateStripCell[] = [];
  for (let offset = -3; offset <= 3; offset += 1) {
    const d = base.add(offset, 'day');
    out.push({
      date: d,
      iso: d.format('YYYY-MM-DD'),
      number: d.date(),
      weekday: DAY_KOR[d.day()],
      isToday: offset === 0,
    });
  }
  return out;
}

/** "오전 8:00" / "오후 8:30" — used by ScheduleItem.time display. */
export function koreanTime(hour24: number, minute: number): string {
  const period = hour24 < 12 ? '오전' : '오후';
  const h = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const m = String(minute).padStart(2, '0');
  return `${period} ${h}:${m}`;
}

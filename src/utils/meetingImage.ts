/**
 * 시드 데이터의 image 키(img_meeting_*)를 실제 Vite 에셋 경로로 변환.
 * 알 수 없는 키는 running_beach 로 폴백.
 */

import imgRunning  from '../assets/images/meetings/running_beach.png';
import imgFutsal   from '../assets/images/meetings/futsal_field1.png';
import imgGolf     from '../assets/images/meetings/golf_field1.png';
import imgHiking   from '../assets/images/meetings/hiking_group1.png';
import imgCycling  from '../assets/images/meetings/cycling_group1.png';

const MAP: Record<string, string> = {
  img_meeting_running_night:  imgRunning,
  img_meeting_running_group1: imgRunning,
  img_meeting_running_track:  imgRunning,
  img_meeting_outdoor_winter: imgRunning,
  img_meeting_futsal_field1:  imgFutsal,
  img_meeting_hiking_group1:  imgHiking,
  img_meeting_hiking_group2:  imgHiking,
  img_meeting_hiking_winter:  imgHiking,
  img_meeting_cycling_group1: imgCycling,
  img_meeting_cycling_group2: imgCycling,
  img_trial_cycling_group:    imgCycling,
  img_meeting_golf_field1:    imgGolf,
};

export function meetingImg(key: string): string {
  return MAP[key] ?? imgRunning;
}

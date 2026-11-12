/**
 * 시드 데이터의 image 키(img_meeting_*)를 실제 Vite 에셋 경로로 변환.
 * 알 수 없는 키는 running_beach 로 폴백.
 */

import imgRunning  from '../assets/images/meetings/running_beach.png';
import imgFutsal   from '../assets/images/meetings/futsal_field1.png';
import imgGolf     from '../assets/images/meetings/golf_field1.png';
import imgHiking   from '../assets/images/meetings/hiking_group1.png';
import imgCycling  from '../assets/images/meetings/cycling_group1.png';
// 체험 카드 이미지: Android img_trial_*.png는 배지("3분전 활동/종목")가 그림에 박혀 있어
// 코드 배지와 이중 노출됨 → 배지 없는 버전 사용 (디자인 PNG home_trial_card_detail_apply 기준).
//   - trial_cycling_group.png = img_trial_cycling_group.png 상단 32px(배지 영역) 크롭본 (140×108)
//   - img_trial_hiking_group1/2 → img_meeting_hiking_group3/2 (디자인과 동일한 사진, 배지 없음)
import imgGroupPhoto1  from '../assets/images/meetings/group_photo1.png';
import imgOutdoorWinter from '../assets/images/meetings/outdoor_winter.png';
import imgTrialCycling from '../assets/images/meetings/trial_cycling_group.png';
import imgHiking2      from '../assets/images/meetings/hiking_group2.png';
import imgHiking3      from '../assets/images/meetings/hiking_group3.png';

const MAP: Record<string, string> = {
  img_meeting_running_night:  imgRunning,
  img_meeting_running_group1: imgRunning,
  img_meeting_running_track:  imgRunning,
  img_meeting_outdoor_winter: imgOutdoorWinter,
  img_meeting_group_photo1:   imgGroupPhoto1,
  img_meeting_running_beach:  imgRunning,
  img_meeting_futsal_field1:  imgFutsal,
  img_meeting_hiking_group1:  imgHiking,
  img_meeting_hiking_group2:  imgHiking,
  img_meeting_hiking_winter:  imgHiking,
  img_meeting_cycling_group1: imgCycling,
  img_meeting_cycling_group2: imgCycling,
  img_trial_cycling_group:    imgTrialCycling,
  img_trial_hiking_group1:    imgHiking3,
  img_trial_hiking_group2:    imgHiking2,
  img_meeting_golf_field1:    imgGolf,
};

export function meetingImg(key: string): string {
  return MAP[key] ?? imgRunning;
}

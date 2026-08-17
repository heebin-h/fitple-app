/**
 * 라우트 테이블. SPEC §10.1.
 *
 * ① MainLayout 그룹 (BottomNav 있음): /home · /exercise · /explore · /my
 * ② 인증 전용 그룹 (BottomNav 없음): /meeting/:id · /upcoming
 * ③ 비인증 공개: / · /login · /email-login · /signup/*
 */

import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { MobileFrame }            from '../components/layout/MobileFrame';
import { MainLayout }             from '../components/layout/MainLayout';
import { RequireAuth }            from './RequireAuth';
import { SplashScreen }           from '../screens/SplashScreen';
import { LoginScreen }            from '../screens/auth/LoginScreen';
import { EmailLoginScreen }       from '../screens/auth/EmailLoginScreen';
import { SignupEmailScreen }      from '../screens/auth/SignupEmailScreen';
import { SignupPasswordScreen }   from '../screens/auth/SignupPasswordScreen';
import { SignupNicknameScreen }   from '../screens/auth/SignupNicknameScreen';
import { SignupPreferenceScreen } from '../screens/auth/SignupPreferenceScreen';
import { SignupCompleteScreen }   from '../screens/auth/SignupCompleteScreen';
import { HomeScreen }             from '../screens/main/HomeScreen';
import { ExerciseScreen }         from '../screens/main/ExerciseScreen';
import { RecommendedGroupScreen } from '../screens/main/RecommendedGroupScreen';
import { PostDetailScreen }       from '../screens/main/PostDetailScreen';
import { UpcomingMeetingScreen }  from '../screens/main/UpcomingMeetingScreen';
import { MyScreen }               from '../screens/main/MyScreen';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <MobileFrame>
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/"                  element={<SplashScreen />} />
          <Route path="/login"             element={<LoginScreen />} />
          <Route path="/email-login"       element={<EmailLoginScreen />} />
          <Route path="/signup/email"      element={<SignupEmailScreen />} />
          <Route path="/signup/password"   element={<SignupPasswordScreen />} />
          <Route path="/signup/nickname"   element={<SignupNicknameScreen />} />
          <Route path="/signup/preference" element={<SignupPreferenceScreen />} />
          <Route path="/signup/complete"   element={<SignupCompleteScreen />} />

          {/* ① 탭 화면 (BottomNav 있음) */}
          <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
            <Route path="/home"             element={<HomeScreen />} />
            <Route path="/exercise"         element={<ExerciseScreen />} />
            <Route path="/explore"          element={<RecommendedGroupScreen />} />
            <Route path="/explore/:sport"   element={<RecommendedGroupScreen />} />
            <Route path="/my"               element={<MyScreen />} />
          </Route>

          {/* ② 인증 전용, BottomNav 없음 */}
          <Route element={<RequireAuth><Outlet /></RequireAuth>}>
            <Route path="/meeting/:id" element={<PostDetailScreen />} />
            <Route path="/upcoming"    element={<UpcomingMeetingScreen />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MobileFrame>
    </BrowserRouter>
  );
}

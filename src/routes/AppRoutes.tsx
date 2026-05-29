/**
 * 라우트 테이블. SPEC §10.1.
 *
 * BrowserRouter — Capacitor가 번들의 index.html을 서빙하므로 hash 라우팅 불필요(룰 #8).
 * MobileFrame이 전 화면을 감싸고, 탭 화면들은 RequireAuth + MainLayout(BottomNav) 아래 중첩.
 *
 * Phase 1 구현 라우트: / · /login · /home · /exercise · /explore[/:sport].
 * 회원가입 플로우(/signup/*), /email-login, /meeting/* 등은 후속 Phase에서 추가(§10.1).
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MobileFrame } from '../components/layout/MobileFrame';
import { MainLayout } from '../components/layout/MainLayout';
import { RequireAuth } from './RequireAuth';
import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { EmailLoginScreen } from '../screens/auth/EmailLoginScreen';
import { SignupEmailScreen } from '../screens/auth/SignupEmailScreen';
import { SignupPasswordScreen } from '../screens/auth/SignupPasswordScreen';
import { SignupNicknameScreen } from '../screens/auth/SignupNicknameScreen';
import { SignupPreferenceScreen } from '../screens/auth/SignupPreferenceScreen';
import { SignupCompleteScreen } from '../screens/auth/SignupCompleteScreen';
import { HomeScreen } from '../screens/main/HomeScreen';
import { ExerciseScreen } from '../screens/main/ExerciseScreen';
import { RecommendedGroupScreen } from '../screens/main/RecommendedGroupScreen';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <MobileFrame>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/email-login" element={<EmailLoginScreen />} />
          <Route path="/signup/email" element={<SignupEmailScreen />} />
          <Route path="/signup/password" element={<SignupPasswordScreen />} />
          <Route path="/signup/nickname" element={<SignupNicknameScreen />} />
          <Route path="/signup/preference" element={<SignupPreferenceScreen />} />
          <Route path="/signup/complete" element={<SignupCompleteScreen />} />

          <Route
            element={
              <RequireAuth>
                <MainLayout />
              </RequireAuth>
            }
          >
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/exercise" element={<ExerciseScreen />} />
            <Route path="/explore" element={<RecommendedGroupScreen />} />
            <Route path="/explore/:sport" element={<RecommendedGroupScreen />} />
          </Route>

          {/* 미구현 경로는 스플래시로 보내 부트 분기를 다시 태운다. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MobileFrame>
    </BrowserRouter>
  );
}

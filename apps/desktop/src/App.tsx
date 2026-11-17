import { useEffect, useMemo, useState } from 'react';
import type { UserState } from '@core/types.ts';
import { Shell } from './components/Shell.tsx';
import { Mascot, Notice, setMascotGear } from './components/ui.tsx';
import { AppContext, errorMessage } from './lib/app.tsx';
import type { Route } from './lib/app.tsx';
import { LocalBackend } from './lib/backend/local.ts';
import type { Backend, Session } from './lib/backend/types.ts';
import { setSoundEnabled } from './lib/sound.ts';
import { applyAppearance, applyLastAppearance } from './lib/theme.ts';
import { AchievementsScreen } from './screens/Achievements.tsx';
import { AiTeacherScreen } from './screens/AiTeacher.tsx';
import { AnalyticsScreen } from './screens/Analytics.tsx';
import { AudioRoomScreen } from './screens/AudioRoom.tsx';
import { AuthScreen } from './screens/Auth.tsx';
import { DashboardScreen } from './screens/Dashboard.tsx';
import { DailyWordsScreen } from './screens/DailyWords.tsx';
import { GamesScreen } from './screens/Games.tsx';
import { ReportScreen } from './screens/Report.tsx';
import { HubScreen } from './screens/Hub.tsx';
import { BossScreen } from './screens/Boss.tsx';
import { LevelExamScreen } from './screens/LevelExam.tsx';
import { FriendsScreen } from './screens/Friends.tsx';
import { LessonScreen } from './screens/Lesson.tsx';
import { MapScreen } from './screens/Map.tsx';
import { NotebookScreen } from './screens/Notebook.tsx';
import { OnboardingScreen } from './screens/Onboarding.tsx';
import { PlacementScreen } from './screens/Placement.tsx';
import { PlannerScreen } from './screens/Planner.tsx';
import { PracticeScreen } from './screens/Practice.tsx';
import { ProfileScreen } from './screens/Profile.tsx';
import { ReviewScreen } from './screens/Review.tsx';
import { SettingsScreen } from './screens/Settings.tsx';
import { StatusScreen } from './screens/Status.tsx';
import { UnitScreen } from './screens/Unit.tsx';
import { VocabularyScreen } from './screens/Vocabulary.tsx';

// Bulut bağlantısı eklendiğinde burada yapılandırmaya göre SupabaseBackend seçilecek.
function createBackend(): Backend {
  return new LocalBackend();
}

applyLastAppearance();

export function App() {
  const backend = useMemo(createBackend, []);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [state, setStateRaw] = useState<UserState | null>(null);
  const [route, setRoute] = useState<Route>({ name: 'dashboard' });
  const [fatal, setFatal] = useState('');

  const setState = (next: UserState) => {
    setStateRaw(next);
  };

  // Kullanıcının görünüm tercihleri her değiştiğinde uygulanır.
  const appearanceKey = state ? JSON.stringify(state.profile.appearance) : '';
  useEffect(() => {
    if (!state) return;
    applyAppearance(state.profile.appearance);
    setSoundEnabled(state.profile.appearance.sound);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appearanceKey]);

  const loadSession = async (next: Session | null) => {
    try {
      setSession(next);
      setStateRaw(next ? await backend.getState() : null);
      setRoute({ name: 'dashboard' });
    } catch (err) {
      setFatal(errorMessage(err));
    }
  };

  useEffect(() => {
    backend.getSession().then(loadSession).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  setMascotGear(state?.panda?.equipped);

  if (fatal) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <div className="max-w-lg"><Notice tone="error"><b>Uygulama başlatılamadı.</b> {fatal}</Notice></div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Mascot size={120} className="animate-float" />
        <p className="mt-4 font-bold text-fg-2">We Can açılıyor…</p>
      </div>
    );
  }
  if (!session || !state) return <AuthScreen backend={backend} onSession={loadSession} />;

  const value = {
    backend,
    session,
    state,
    setState,
    route,
    go: setRoute,
    signOut: async () => {
      await backend.signOut();
      await loadSession(null);
    },
  };

  let body;
  if (!state.profile.onboardingDone) body = <OnboardingScreen />;
  else if (!state.profile.placementDone) body = <PlacementScreen />;
  else if (route.name === 'lesson') body = <LessonScreen key={route.code} code={route.code} />;
  else if (route.name === 'practice') body = <PracticeScreen />;
  else if (route.name === 'levelExam') body = <LevelExamScreen key={route.level} level={route.level} />;
  else {
    body = (
      <Shell>
        {route.name === 'dashboard' && <DashboardScreen />}
        {route.name === 'map' && <MapScreen />}
        {route.name === 'unit' && <UnitScreen unitId={route.unitId} />}
        {route.name === 'review' && <ReviewScreen />}
        {route.name === 'vocab' && <VocabularyScreen />}
        {route.name === 'audio' && <AudioRoomScreen />}
        {route.name === 'ai' && <AiTeacherScreen />}
        {route.name === 'analytics' && <AnalyticsScreen />}
        {route.name === 'notebook' && <NotebookScreen />}
        {route.name === 'friends' && <FriendsScreen />}
        {route.name === 'daily' && <DailyWordsScreen />}
        {route.name === 'games' && <GamesScreen key={route.game ?? 'g'} game={route.game} />}
        {route.name === 'report' && <ReportScreen />}
        {route.name === 'boss' && <BossScreen key={route.unitId} unitId={route.unitId} />}
        {route.name === 'hub' && <HubScreen key={route.tab ?? 'all'} tab={route.tab} />}
        {route.name === 'planner' && <PlannerScreen />}
        {route.name === 'achievements' && <AchievementsScreen />}
        {route.name === 'profile' && <ProfileScreen />}
        {route.name === 'settings' && <SettingsScreen />}
        {route.name === 'status' && <StatusScreen />}
      </Shell>
    );
  }
  return <AppContext.Provider value={value}>{body}</AppContext.Provider>;
}

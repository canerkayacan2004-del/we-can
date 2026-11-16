import { createContext, useContext } from 'react';
import type { UserState } from '@core/types.ts';
import type { Backend, Session } from './backend/types.ts';

export type Route =
  | { name: 'dashboard' }
  | { name: 'map' }
  | { name: 'unit'; unitId: string }
  | { name: 'lesson'; code: string }
  | { name: 'practice' }
  | { name: 'review' }
  | { name: 'vocab' }
  | { name: 'audio' }
  | { name: 'ai' }
  | { name: 'analytics' }
  | { name: 'notebook' }
  | { name: 'planner' }
  | { name: 'achievements' }
  | { name: 'profile' }
  | { name: 'settings' }
  | { name: 'status' }
  | { name: 'friends' }
  | { name: 'daily' }
  | { name: 'games' }
  | { name: 'report' };

export interface AppContextValue {
  backend: Backend;
  session: Session;
  state: UserState;
  setState: (state: UserState) => void;
  route: Route;
  go: (route: Route) => void;
  signOut: () => Promise<void>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('AppContext bulunamadı');
  return ctx;
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu.';
}

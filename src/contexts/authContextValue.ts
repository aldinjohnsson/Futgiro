import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { AccountProfile } from '@/types/futgiro';

export type AuthContextValue = {
  session: Session | null;
  profile: AccountProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

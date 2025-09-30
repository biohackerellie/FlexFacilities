'use client';
import * as React from 'react';

import type { Session } from '@/lib/types';

const AuthContext = React.createContext<Session | null>(null);

export function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session;
}) {
  return (
    <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}

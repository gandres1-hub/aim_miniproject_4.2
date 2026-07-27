'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'reader' | 'signatory';

interface RoleContextValue {
  role: Role;
  attemptSignatoryLogin: (password: string) => boolean;
  switchToReader: () => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('reader');

  function attemptSignatoryLogin(password: string): boolean {
    const correctPassword = process.env.NEXT_PUBLIC_SIGNATORY_PASSWORD;
    if (password === correctPassword) {
      setRole('signatory');
      return true;
    }
    return false;
  }

  function switchToReader() {
    setRole('reader');
  }

  return (
    <RoleContext.Provider value={{ role, attemptSignatoryLogin, switchToReader }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
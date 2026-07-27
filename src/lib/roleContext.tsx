'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'reader' | 'signatory';

interface RoleContextValue {
  role: Role;
  toggleRole: () => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('reader');

  function toggleRole() {
    setRole((prev) => (prev === 'reader' ? 'signatory' : 'reader'));
  }

  return (
    <RoleContext.Provider value={{ role, toggleRole }}>
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
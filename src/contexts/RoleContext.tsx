"use client";

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { Role } from '@/types';

interface RoleContextType {
  role: Role;
  setRole: Dispatch<SetStateAction<Role>>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('user'); // Default role

  // Persist role in localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem('rapidryde-role') as Role | null;
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rapidryde-role', role);
  }, [role]);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

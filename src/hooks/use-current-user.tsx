"use client";

import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User, Role, Permission } from '@/lib/types';
import { users, roles, userMappings } from '@/lib/mock-data';
import { HIERARCHY } from '@/lib/constants';

// --- Helper Functions ---

const canImpersonate = (actor: User, target: User): boolean => {
  if (!actor || !target || actor.id === target.id) return false;

  const actorLevel = HIERARCHY.indexOf(actor.role);
  const targetLevel = HIERARCHY.indexOf(target.role);

  if (actorLevel === -1 || targetLevel === -1 || actorLevel >= targetLevel) {
    return false;
  }

  // SUPER_ADMIN can impersonate anyone below them
  if (actor.role === 'SUPER_ADMIN') return true;

  // Check mapping
  let currentMappings = userMappings[actor.id] || [];
  if (actor.role === 'ADMIN' && target.role === 'ASSOCIATE') {
    return currentMappings.includes(target.id);
  }
  if (actor.role === 'ADMIN' && target.role === 'CUSTOMER') {
    const associates = currentMappings;
    for (const associateId of associates) {
      if ((userMappings[associateId] || []).includes(target.id)) {
        return true;
      }
    }
  }
  if (actor.role === 'ASSOCIATE' && target.role === 'CUSTOMER') {
    return currentMappings.includes(target.id);
  }

  return false;
};

const hasPermission = (user: User, permission: Permission): boolean => {
  const userRoleData = roles.find(r => r.name === user.role);
  return userRoleData?.permissions.includes(permission) ?? false;
};

// --- Context Definition ---

interface UserContextType {
  currentUser: User | null;
  impersonatedUser: User | null;
  effectiveUser: User | null;
  login: (userId: string) => void;
  logout: () => void;
  impersonate: (userId: string) => void;
  stopImpersonation: () => void;
  canImpersonate: (targetUser: User) => boolean;
  hasPermission: (permission: Permission) => boolean;
  allUsers: User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// --- Provider Component ---

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(users.find(u => u.role === 'SUPER_ADMIN') || null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const login = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setImpersonatedUser(null);
      router.push('/');
    }
  }, [router]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setImpersonatedUser(null);
    // In a real app, you'd redirect to a login page.
    // Here we'll just log in the default user.
    if (users.length > 0) {
      login(users[0].id);
    }
  }, [login]);

  const impersonate = useCallback((userId: string) => {
    if (!currentUser) return;
    const target = users.find(u => u.id === userId);
    if (target && canImpersonate(currentUser, target)) {
      setImpersonatedUser(target);
      // Redirect to dashboard on impersonation
      if(pathname !== '/') {
        router.push('/');
      }
    } else {
      console.error("Impersonation not allowed");
    }
  }, [currentUser, router, pathname]);

  const stopImpersonation = useCallback(() => {
    setImpersonatedUser(null);
  }, []);

  const effectiveUser = useMemo(() => impersonatedUser || currentUser, [impersonatedUser, currentUser]);

  const value = useMemo(() => ({
    currentUser,
    impersonatedUser,
    effectiveUser,
    login,
    logout,
    impersonate,
    stopImpersonation,
    canImpersonate: (targetUser: User) => currentUser ? canImpersonate(currentUser, targetUser) : false,
    hasPermission: (permission: Permission) => effectiveUser ? hasPermission(effectiveUser, permission) : false,
    allUsers: users,
  }), [currentUser, impersonatedUser, effectiveUser, login, logout, impersonate, stopImpersonation]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// --- Hook ---

export const useCurrentUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within a UserProvider');
  }
  return context;
};

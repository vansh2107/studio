'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { users, userMappings } from '@/lib/mock-data';
import { HIERARCHY, Role, PERMISSIONS, PERMISSION_MODULES, Permission, PermissionModule, Permissions } from '@/lib/constants';
import type { User } from '@/lib/types';
import { useDoc, useFirestore, useMemoFirebase, useFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { AppLayoutSkeleton } from '@/components/layout/app-layout';


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
  hasPermission: (module: PermissionModule, permission: Permission) => boolean;
  allUsers: User[];
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// --- Provider Component ---

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  const db = useFirestore();

  useEffect(() => {
    const storedUserId = localStorage.getItem('currentUser');
    if (storedUserId) {
      const user = users.find(u => u.id === storedUserId);
      setCurrentUser(user || null);
    }
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    if (!isLoading && !currentUser && pathname !== '/login') {
        router.push('/login');
    }
    if (!isLoading && currentUser && pathname === '/login') {
        router.push('/');
    }
  }, [currentUser, isLoading, pathname, router]);


  const effectiveUser = useMemo(() => impersonatedUser || currentUser, [impersonatedUser, currentUser]);
  
  const permissionsDocRef = useMemoFirebase(() => {
    if (!effectiveUser || !db) {
      return null;
    }
    return doc(db, 'permissions', effectiveUser.role);
  }, [effectiveUser, db]);
  
  const { data: permissions, isLoading: permissionsLoading } = useDoc<Permissions>(permissionsDocRef);

  const login = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      localStorage.setItem('currentUser', user.id);
      setCurrentUser(user);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setImpersonatedUser(null);
    router.push('/login');
  }, [router]);

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

  const hasPermission = useCallback((module: PermissionModule, permission: Permission): boolean => {
    if (!effectiveUser) return false;
    if (effectiveUser.role === 'SUPER_ADMIN') return true;
    if (permissionsLoading || !permissions) return false;
    return permissions[module]?.[permission] ?? false;
  }, [effectiveUser, permissions, permissionsLoading]);


  const value = useMemo(() => ({
    currentUser,
    impersonatedUser,
    effectiveUser,
    login,
    logout,
    impersonate,
    stopImpersonation,
    canImpersonate: (targetUser: User) => currentUser ? canImpersonate(currentUser, targetUser) : false,
    hasPermission,
    allUsers: users,
    isLoading: isLoading || (!!effectiveUser && permissionsLoading),
  }), [currentUser, impersonatedUser, effectiveUser, login, logout, impersonate, stopImpersonation, hasPermission, isLoading, permissionsLoading]);

  if (value.isLoading && pathname !== '/login') {
      return <AppLayoutSkeleton />;
  }
  
  if (!currentUser && pathname !== '/login') {
    return <AppLayoutSkeleton />; // Or a dedicated loading screen
  }

  if (!currentUser && pathname === '/login') {
     return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
     )
  }

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

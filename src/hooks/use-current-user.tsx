

'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { users, permissions as mockPermissions, getRMsForAdmin, getAssociatesForRM, getClientsForAssociate, getAllRMs, getAllAssociates as allAssociatesData } from '@/lib/mock-data';
import { User, Client, Associate, Admin, SuperAdmin, RelationshipManager } from '@/lib/types';
import { HIERARCHY, Role, Permission, PermissionModule } from '@/lib/constants';
import { AppLayout } from '@/components/layout/app-layout';

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

  if (actor.role === 'ADMIN') {
    const allRMs = getAllRMs();
    const allAssociates = require('@/lib/mock-data').associates;
    const targetAdminId = (target as RelationshipManager | Associate | Client).role === 'RM'
      ? (target as RelationshipManager).adminId
      : (target as Associate).role === 'ASSOCIATE'
      ? allRMs.find((rm: RelationshipManager) => rm.id === (target as Associate).rmId)?.adminId
      : (target as Client).role === 'CUSTOMER'
      ? allRMs.find((rm: RelationshipManager) => rm.id === allAssociates.find((a: Associate) => a.id === (target as Client).associateId)?.rmId)?.adminId
      : undefined;
    return targetAdminId === actor.id;
  }
  
  if(actor.role === 'RM') {
      const allAssociates = require('@/lib/mock-data').associates;
      const targetRmId = (target as Associate | Client).role === 'ASSOCIATE'
        ? (target as Associate).rmId
        : (target as Client).role === 'CUSTOMER'
        ? allAssociates.find((a: Associate) => a.id === (target as Client).associateId)?.rmId
        : undefined;
      return targetRmId === actor.id;
  }

  if (actor.role === 'ASSOCIATE') {
    if (target.role === 'CUSTOMER') {
      return (target as Client).associateId === actor.id;
    }
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
  associates: Associate[];
  relationshipManagers: RelationshipManager[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// --- Provider Component ---

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    const checkUser = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const impersonateId = urlParams.get('impersonate_id');
      const actorId = urlParams.get('actor_id');

      try {
        if (impersonateId && actorId) {
          // This is an impersonation tab being opened.
          const actor = users.find(u => u.id === actorId);
          const target = users.find(u => u.id === impersonateId);

          if (actor && target && canImpersonate(actor, target)) {
            if (isMounted) {
              setCurrentUser(actor);
              setImpersonatedUser(target);
              localStorage.setItem('currentUser', actorId); // Persist the ACTOR for this tab
              // Clean the URL to avoid re-triggering this logic on reload
              window.history.replaceState({}, '', window.location.pathname);
            }
          } else {
            console.error("Invalid impersonation attempt from URL.");
            // Fallback to normal login check
            const storedUserId = localStorage.getItem('currentUser');
            const user = storedUserId ? users.find(u => u.id === storedUserId) : null;
            if(isMounted) setCurrentUser(user || null);
          }
        } else {
          // Normal login flow
          const storedUserId = localStorage.getItem('currentUser');
          const user = storedUserId ? users.find(u => u.id === storedUserId) : null;
          if (isMounted) setCurrentUser(user || null);
        }
      } catch (e) {
        console.error("Error during user check:", e);
      }
      if (isMounted) setIsLoading(false);
    };

    checkUser();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array means this runs once on initial mount
  
  useEffect(() => {
    if (!isLoading) {
      if (!currentUser && pathname !== '/login') {
        router.push('/login');
      }
    }
  }, [currentUser, isLoading, pathname, router]);

  const effectiveUser = useMemo(() => impersonatedUser || currentUser, [impersonatedUser, currentUser]);

  const login = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      try {
        localStorage.setItem('currentUser', user.id);
      } catch (e) {
        // localStorage not available
      }
      setCurrentUser(user);
      setImpersonatedUser(null);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('currentUser');
    } catch(e) {
      // localStorage not available
    }
    setCurrentUser(null);
    setImpersonatedUser(null);
    router.push('/login');
  }, [router]);

  const impersonate = useCallback((userId: string) => {
    if (!currentUser) return;
    const target = users.find(u => u.id === userId);
    if (target && canImpersonate(currentUser, target)) {
      const url = `/?impersonate_id=${target.id}&actor_id=${currentUser.id}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      console.error("Impersonation not allowed");
    }
  }, [currentUser]);

  const stopImpersonation = useCallback(() => {
    setImpersonatedUser(null);
  }, []);
  
  const hasPermission = useCallback((module: PermissionModule, permission: Permission): boolean => {
    if (!effectiveUser) return false;

    // Super Admins have all permissions
    if (effectiveUser.role === 'SUPER_ADMIN') {
      return true;
    }

    // Get the permissions for the user's role
    const rolePermissions = mockPermissions[effectiveUser.role];
    if (!rolePermissions) {
      return false;
    }

    // Get the specific permissions for the given module
    const modulePermissions = rolePermissions[module];
    if (!modulePermissions) {
      return false;
    }

    // Check if the specific permission is granted
    return modulePermissions[permission] === true;
  }, [effectiveUser]);

  const { associates, relationshipManagers } = useMemo(() => {
    if (!effectiveUser) return { associates: [], relationshipManagers: [] };

    switch (effectiveUser.role) {
      case 'SUPER_ADMIN':
        return { associates: allAssociatesData(), relationshipManagers: getAllRMs() };
      case 'ADMIN':
        const rms = getRMsForAdmin(effectiveUser.id);
        return {
          associates: rms.flatMap(rm => getAssociatesForRM(rm.id)),
          relationshipManagers: rms,
        };
       case 'RM':
        return { associates: getAssociatesForRM(effectiveUser.id), relationshipManagers: [effectiveUser as RelationshipManager] };
      default:
        return { associates: [], relationshipManagers: [] };
    }
  }, [effectiveUser]);


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
    isLoading: isLoading,
    associates,
    relationshipManagers,
  }), [currentUser, impersonatedUser, effectiveUser, login, logout, impersonate, stopImpersonation, hasPermission, isLoading, associates, relationshipManagers]);

  if (pathname === '/login') {
     return (
       <UserContext.Provider value={value}>
         {children}
       </UserContext.Provider>
     );
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

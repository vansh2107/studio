

'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { users, permissions as mockPermissions, User, Client, Associate, Admin, SuperAdmin, RelationshipManager, getRMsForAdmin, getAssociatesForRM, getClientsForAssociate } from '@/lib/mock-data';
import { HIERARCHY, Role, Permission, PermissionModule } from '@/lib/constants';
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

  if (actor.role === 'ADMIN') {
    const targetAdminId = (target as RelationshipManager | Associate | Client).role === 'RM'
      ? (target as RelationshipManager).adminId
      : (target as Associate).role === 'ASSOCIATE'
      ? relationshipManagers.find(rm => rm.id === (target as Associate).rmId)?.adminId
      : (target as Client).role === 'CUSTOMER'
      ? relationshipManagers.find(rm => rm.id === associates.find(a => a.id === (target as Client).associateId)?.rmId)?.adminId
      : undefined;
    return targetAdminId === actor.id;
  }
  
  if(actor.role === 'RM') {
      const targetRmId = (target as Associate | Client).role === 'ASSOCIATE'
        ? (target as Associate).rmId
        : (target as Client).role === 'CUSTOMER'
        ? associates.find(a => a.id === (target as Client).associateId)?.rmId
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
    try {
      const storedUserId = localStorage.getItem('currentUser');
      if (storedUserId) {
        const user = users.find(u => u.id === storedUserId);
        setCurrentUser(user || null);
      }
    } catch (e) {
      // localStorage not available
    }
    setIsLoading(false);
  }, []);
  
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
      setImpersonatedUser(target);
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
        return { associates: require('@/lib/mock-data').associates, relationshipManagers: require('@/lib/mock-data').relationshipManagers };
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
  }), [currentUser, impersonatedUser, effectiveUser, login, logout, impersonate, stopImpersonation, hasPermission, isLoading]);

  if (isLoading) {
    return <AppLayoutSkeleton />;
  }

  if (!currentUser && pathname !== '/login') {
    return <AppLayoutSkeleton />;
  }

  if (currentUser && pathname === '/login') {
    // This case is handled by redirect logic, but as a fallback, show skeleton.
    return <AppLayoutSkeleton />;
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

import React, { createContext, useContext, ReactNode } from 'react';

export type DashboardType = 'cowork' | 'rise';
export type UserRole = 'mentor' | 'mentee';

interface DashboardPanelContextValue {
  dashboardType: DashboardType;
  userId: string;
  userRole: UserRole;
  userName: string;
}

const DashboardPanelContext = createContext<DashboardPanelContextValue | null>(null);

export function useDashboardPanel() {
  const context = useContext(DashboardPanelContext);
  if (!context) {
    throw new Error('useDashboardPanel must be used within DashboardPanelProvider');
  }
  return context;
}

interface DashboardPanelProviderProps {
  children: ReactNode;
  dashboardType: DashboardType;
  userId: string;
  userRole: UserRole;
  userName: string;
}

export function DashboardPanelProvider({
  children,
  dashboardType,
  userId,
  userRole,
  userName,
}: DashboardPanelProviderProps) {
  const value: DashboardPanelContextValue = {
    dashboardType,
    userId,
    userRole,
    userName,
  };

  return (
    <DashboardPanelContext.Provider value={value}>
      {children}
    </DashboardPanelContext.Provider>
  );
}

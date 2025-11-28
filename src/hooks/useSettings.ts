import { useState, useEffect, useCallback } from 'react';

export interface DashboardSettings {
  defaultTab: number;
  layout: 'grid' | 'list';
  showTaskList: boolean;
  showLiveUpdates: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
}

export interface PanelSettings {
  workspace: { visible: boolean; order: number }; // Unified workspace (combines docs, figma, opportunities, tasks)
  learning: { visible: boolean; order: number };
  aiJournal: { visible: boolean; order: number };
  web3?: { visible: boolean; order: number }; // Optional - deprecated, ENS info now in profile page
  focus: { visible: boolean; order: number };
  aiAgent: { visible: boolean; order: number };
}

export interface ApiKeys {
  revidApiKey?: string;
}

export interface UserSettings {
  dashboard: DashboardSettings;
  panels: PanelSettings;
  apiKeys?: ApiKeys;
}

const DEFAULT_DASHBOARD_SETTINGS: DashboardSettings = {
  defaultTab: 0,
  layout: 'grid',
  showTaskList: true,
  showLiveUpdates: true,
  autoRefresh: true,
  refreshInterval: 300, // 5 minutes
};

const DEFAULT_PANEL_SETTINGS: PanelSettings = {
  workspace: { visible: true, order: 0 }, // Unified workspace (combines docs, figma, opportunities, tasks)
  learning: { visible: true, order: 1 },
  aiJournal: { visible: true, order: 2 },
  // web3: { visible: false, order: 3 }, // Removed - ENS info now in profile
  // streaming: removed - now on /live page
  focus: { visible: true, order: 3 },
  aiAgent: { visible: true, order: 4 },
};

const STORAGE_KEY = 'user_dashboard_settings';

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    if (typeof window === 'undefined') {
      return {
        dashboard: DEFAULT_DASHBOARD_SETTINGS,
        panels: DEFAULT_PANEL_SETTINGS,
        apiKeys: {},
      };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          dashboard: { ...DEFAULT_DASHBOARD_SETTINGS, ...parsed.dashboard },
          panels: { ...DEFAULT_PANEL_SETTINGS, ...parsed.panels },
          apiKeys: parsed.apiKeys || {},
        };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }

    return {
      dashboard: DEFAULT_DASHBOARD_SETTINGS,
      panels: DEFAULT_PANEL_SETTINGS,
      apiKeys: {},
    };
  });

  const updateDashboardSettings = useCallback((updates: Partial<DashboardSettings>) => {
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        dashboard: { ...prev.dashboard, ...updates },
      };
      
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        } catch (error) {
          console.error('Error saving settings:', error);
        }
      }
      
      return newSettings;
    });
  }, []);

  const updatePanelSettings = useCallback((panelKey: keyof PanelSettings, updates: Partial<PanelSettings[keyof PanelSettings]>) => {
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        panels: {
          ...prev.panels,
          [panelKey]: { ...prev.panels[panelKey], ...updates },
        },
      };
      
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        } catch (error) {
          console.error('Error saving settings:', error);
        }
      }
      
      return newSettings;
    });
  }, []);

  const updateApiKeys = useCallback((updates: Partial<ApiKeys>) => {
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        apiKeys: { ...prev.apiKeys, ...updates },
      };
      
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        } catch (error) {
          console.error('Error saving settings:', error);
        }
      }
      
      return newSettings;
    });
  }, []);

  const resetSettings = useCallback(() => {
    const defaultSettings = {
      dashboard: DEFAULT_DASHBOARD_SETTINGS,
      panels: DEFAULT_PANEL_SETTINGS,
      apiKeys: {},
    };
    
    setSettings(defaultSettings);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    }
  }, []);

  const getVisiblePanels = useCallback(() => {
    return Object.entries(settings.panels)
      .filter(([key, config]) => {
        // Filter out web3 panel (removed - ENS info now in profile)
        // Also filter out old panels that are now part of workspace
        // Filter out streaming (moved to /live page)
        if (key === 'web3' || key === 'figma' || key === 'docs' || key === 'opportunities' || key === 'streaming') return false;
        return config.visible;
      })
      .sort(([_, a], [__, b]) => a.order - b.order)
      .map(([key]) => key as keyof PanelSettings);
  }, [settings.panels]);

  return {
    settings,
    updateDashboardSettings,
    updatePanelSettings,
    updateApiKeys,
    resetSettings,
    getVisiblePanels,
  };
}


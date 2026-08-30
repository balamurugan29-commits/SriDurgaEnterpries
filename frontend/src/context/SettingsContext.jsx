import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

const SETTINGS_STORAGE_KEY = 'sri_durga_app_settings';

const DEFAULT_SETTINGS = {
  theme: 'dark',       // 'dark' | 'light'
  layout: 'side',      // 'side' | 'top'
  navMode: 'full',     // 'full' | 'icons'
};

const normalizeSettings = (raw) => {
  if (!raw || typeof raw !== 'object') return DEFAULT_SETTINGS;
  const normalized = { ...DEFAULT_SETTINGS, ...raw };
  if (normalized.layout === 'topbar' || normalized.layout === 'top') {
    normalized.layout = 'top';
  } else {
    normalized.layout = 'side';
  }
  if (normalized.navMode === 'collapsed' || normalized.navMode === 'icons') {
    normalized.navMode = 'icons';
  } else {
    normalized.navMode = 'full';
  }
  return normalized;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return normalizeSettings(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to parse saved settings, using defaults:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(() => {
    try {
      const saved = localStorage.getItem('sri_durga_sidebar_hidden');
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  const toggleSidebarHidden = () => {
    setSidebarHidden(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sri_durga_sidebar_hidden', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Sync settings with DOM attributes and localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to persist settings:', e);
    }

    // Apply data attributes to documentElement and body
    const root = document.documentElement;
    root.setAttribute('data-theme', settings.theme);
    root.setAttribute('data-layout', settings.layout);
    root.setAttribute('data-nav-mode', settings.navMode);

    if (settings.theme === 'light') {
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
    } else {
      document.body.classList.add('theme-dark');
      document.body.classList.remove('theme-light');
    }
  }, [settings]);

  const setTheme = (theme) => {
    setSettings((prev) => ({ ...prev, theme: theme === 'light' ? 'light' : 'dark' }));
  };

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const setLayout = (layout) => {
    const normalized = (layout === 'topbar' || layout === 'top') ? 'top' : 'side';
    setSettings((prev) => ({ ...prev, layout: normalized }));
  };

  const setNavMode = (navMode) => {
    const normalized = (navMode === 'collapsed' || navMode === 'icons') ? 'icons' : 'full';
    setSettings((prev) => ({ ...prev, navMode: normalized }));
  };

  const toggleNavMode = () => {
    setSettings((prev) => ({
      ...prev,
      navMode: prev.navMode === 'full' ? 'icons' : 'full',
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider
      value={{
        theme: settings.theme,
        layout: settings.layout,
        navMode: settings.navMode,
        setTheme,
        toggleTheme,
        setLayout,
        setNavMode,
        toggleNavMode,
        resetSettings,
        isSettingsOpen,
        setIsSettingsOpen,
        mobileMenuOpen,
        setMobileMenuOpen,
        sidebarHidden,
        setSidebarHidden,
        toggleSidebarHidden,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

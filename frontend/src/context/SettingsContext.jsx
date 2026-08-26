import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

const SETTINGS_STORAGE_KEY = 'sri_durga_app_settings';

const DEFAULT_SETTINGS = {
  theme: 'dark',       // 'dark' | 'light'
  layout: 'side',      // 'side' | 'top'
  navMode: 'full',     // 'full' | 'icons'
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to parse saved settings, using defaults:', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setSettings((prev) => ({ ...prev, theme }));
  };

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const setLayout = (layout) => {
    setSettings((prev) => ({ ...prev, layout }));
  };

  const setNavMode = (navMode) => {
    setSettings((prev) => ({ ...prev, navMode }));
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

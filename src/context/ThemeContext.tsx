import React, { createContext, useState, useEffect, useContext } from 'react';

interface ThemeContextType {
  themeColor: string;
  setThemeColor: (color: string) => void;
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeColor: '#2563eb',
  setThemeColor: () => {},
  isOfflineMode: true,
  toggleOfflineMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeColor, setThemeColor] = useState('#2563eb');
  const [isOfflineMode, setIsOfflineMode] = useState(true);
  
  // Load settings from database on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await window.database.getSettings();
        if (settings && settings.theme_color) {
          setThemeColor(settings.theme_color);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Update theme CSS variables when themeColor changes
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', themeColor);
    
    // Generate lighter and darker variants
    const lightenColor = (color: string, amount: number): string => {
      const hex = color.replace('#', '');
      const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + amount);
      const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + amount);
      const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + amount);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };
    
    const darkenColor = (color: string, amount: number): string => {
      const hex = color.replace('#', '');
      const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - amount);
      const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - amount);
      const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - amount);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };
    
    document.documentElement.style.setProperty('--primary-light', lightenColor(themeColor, 40));
    document.documentElement.style.setProperty('--primary-dark', darkenColor(themeColor, 40));
  }, [themeColor]);
  
  const toggleOfflineMode = () => {
    setIsOfflineMode(prev => !prev);
    // Here you would implement any actual network disabling logic
  };
  
  return (
    <ThemeContext.Provider 
      value={{ 
        themeColor, 
        setThemeColor,
        isOfflineMode,
        toggleOfflineMode
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const ThemeModeContext = createContext({
  mode: 'dark',
  toggleTheme: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem('pulseforge_theme_mode');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    return 'dark'; // default to dark athletic theme
  });

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('pulseforge_theme_mode', next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    document.body.style.backgroundColor = mode === 'dark' ? '#0B0F19' : '#F8FAFC';
    document.body.style.color = mode === 'dark' ? '#FFFFFF' : '#0F172A';
  }, [mode]);

  const theme = useMemo(() => {
    const isDark = mode === 'dark';
    return createTheme({
      palette: {
        mode,
        primary: {
          main: '#ff9800',
          light: '#ffb74d',
          dark: '#f57c00',
          contrastText: '#000000',
        },
        secondary: {
          main: '#a855f7',
          light: '#c084fc',
          dark: '#7e22ce',
          contrastText: '#ffffff',
        },
        background: {
          default: isDark ? '#0B0F19' : '#F8FAFC',
          paper: isDark ? '#131B2E' : '#FFFFFF',
          sidebar: isDark ? '#0F172A' : '#1E293B',
          card: isDark ? '#1E293B' : '#FFFFFF',
        },
        text: {
          primary: isDark ? '#F8FAFC' : '#0F172A',
          secondary: isDark ? '#94A3B8' : '#64748B',
          muted: isDark ? '#64748B' : '#94A3B8',
        },
        divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
      },
      typography: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      },
      shape: {
        borderRadius: 12,
      },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              borderRadius: 16,
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 10,
              textTransform: 'none',
              fontWeight: 600,
            },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

function getInitial() {
  if (typeof localStorage !== 'undefined' && localStorage.theme) {
    return localStorage.theme === 'dark';
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    localStorage.theme = dark ? 'dark' : 'light';
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  return ctx || { dark: false, toggle: () => {} };
}

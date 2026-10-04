import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";

export type ColorTheme = "sky" | "cyan" | "emerald" | "violet" | "indigo" | "amber" | "rose";

export interface ThemeColorPalette {
  id: ColorTheme;
  name: string;
  primary: string;
  secondary: string;
}

export const THEME_PALETTES: ThemeColorPalette[] = [
  { id: "sky", name: "Sky Cobalt", primary: "#0284c7", secondary: "#0369a1" },
  { id: "cyan", name: "Digital Cyan", primary: "#06b6d4", secondary: "#0891b2" },
  { id: "emerald", name: "Kendra Emerald", primary: "#10b981", secondary: "#059669" },
  { id: "violet", name: "Royal Violet", primary: "#8b5cf6", secondary: "#7c3aed" },
  { id: "indigo", name: "Deep Indigo", primary: "#6366f1", secondary: "#4f46e5" },
  { id: "amber", name: "Sunset Amber", primary: "#f59e0b", secondary: "#d97706" },
  { id: "rose", name: "Ruby Rose", primary: "#f43f5e", secondary: "#e11d48" },
];

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  colorTheme: ColorTheme;
  setColorTheme: (c: ColorTheme) => void;
  palettes: ThemeColorPalette[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem("sevadesk_theme");
      if (saved === "dark" || saved === "light") return saved;
      return "light"; // default is light mode
    } catch (e) {
      return "light";
    }
  });

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    try {
      const saved = localStorage.getItem("sevadesk_color_theme") as ColorTheme;
      if (THEME_PALETTES.some((p) => p.id === saved)) return saved;
      return "sky"; // default is Sky Cobalt
    } catch (e) {
      return "sky";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("sevadesk_theme", theme);
    } catch (e) {}
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-color-theme", colorTheme);
    try {
      localStorage.setItem("sevadesk_color_theme", colorTheme);
    } catch (e) {}
  }, [colorTheme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  const setColorTheme = (c: ColorTheme) => {
    setColorThemeState(c);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        colorTheme,
        setColorTheme,
        palettes: THEME_PALETTES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

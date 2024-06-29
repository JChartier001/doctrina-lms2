"use client";

import { createTheme, useMediaQuery } from "@mui/material";

import { PaletteMode } from "@mui/material";
import { Poppins } from "next/font/google";
import { Theme } from "@mui/material/styles";
import * as colors from "@mui/material/colors";

import { createContext, useState, useEffect } from "react";
import { dark, light } from "@mui/material/styles/createPalette";


const poppins = Poppins({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});
const getDesignTokens = (mode: PaletteMode) => {
  const isLightMode = mode === "light";
  const backgroundDefault = isLightMode ? '#fdfdfd' : '#262626';  // Adjust colors as needed

  return {
    palette: {
      mode,
      ...(mode === "light"
        ? {
          primary: {
            light: '#9560f0',
            main: "#7b39ed",
            dark: '#5627a5',
            contrastText: '#fff',
          },
          secondary: {
            main: "#d539ed",
            light: '#dd60f0',
            dark: '#9527a5',
            contrastText: '#fff'
          },
          background: {
            default: '#fafafa',
            paper: '#f5f5f5'
          },
          text: {
            primary: '#000000de',
            secondary: '#00000099',
            disabled: '#00000061',
            dark: '#000000de'
      
            
          },
          border: {
            primary: "#e5e7eb",
          },
          error: {
            main: "#d32f2f",
            light: "#ef5350",
            dark: "#c62828",
            contrastText: "#fff",
          },
          warning: {
            main: "#ffa726",
            light: "#ffb74d",
            dark: "#f57c00",
            contrastText: "#000000",
          },
          success: {
            main: '#66bb6a',
            dark: '#388e3c',
            light: '#81c784',
            contrastText: "#000000",
          },
          ...colors,
        }
        : {
          // palette values for dark mode
          primary: {
            light: '#9560f0',
            main: "#9560f0",
            dark: '#5627a5',
            contrastText: '#fff',
          },
          secondary: {
            main: "#d539ed",
            light: '#dd60f0',
            dark: '#9527a5',
            contrastText: '#fff'
          },
          background: {
            default: '#262626',
            paper: '#404040',
          
          },
          text: {
            primary: '#fff',
            secondary: '#ffffffb3',
            disabled: '#ffffff80',
            dark: '#000000de'
          },
          error: {
            main: "#d32f2f",
            light: "#e57373",
            dark: "#d32f2f",
            contrastText: "#fff",
          },
          warning: {
            main: "#ffa726",
            light: "#ffb74d",
            dark: "#f57c00",
            contrastText: "#000000de",
          },
          success: {
            main: '#66bb6a',
            dark: '#388e3c',
            light: '#81c784',
            contrastText: "#000000de",
          },
          ...colors,
        }),
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
        xxl: 1920,
        xxxl: 2560,
      },
    },
    overrides: {
      MuiCssBaseline: {
        "@global": {
          body: {
            backgroundColor: backgroundDefault,
          },
        },
      },
    },
    components: {},
    typography: {
      fontFamily: poppins.style.fontFamily,
      h1: {
        fontSize: "3rem",
        fontWeight: 700,
        fontFamily: poppins.style.fontFamily,
      },
      h2: {
        fontSize: "2.5rem",
        fontWeight: 700,
      },
      h3: {
        fontSize: "2rem",
        fontWeight: 700,
      },
      h4: {
        fontSize: "1.75rem",
        fontWeight: 700,
      },
      h5: {
        fontSize: "1.25rem",
        fontWeight: 700,
      },
      h6: {
        fontSize: "1rem",
        fontWeight: 700,
      },
      body1: {
        fontSize: "1.125rem",
        fontWeight: 400,
      },
      body2: {
        fontSize: "0.875rem",
        fontWeight: 400,
        color: colors.grey[500],
      },
      button: {
        fontSize: "1rem",
        fontWeight: 700,
      },
      span: {
        fontSize: "1.125rem",
        fontWeight: 400,
      },
      paragraph: {
        fontSize: "1.125rem",
        fontWeight: 400,
      },
    
    },
  };
}

export const ThemeContext = createContext<{
  mode: boolean;
  setMode: (newState: boolean) => void;
  theme: Theme;
}>({
  mode: false,
  setMode: () => {},
  theme: createTheme(getDesignTokens("light")),
});
export default function ThemeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const prefersMode = useMediaQuery("(prefers-color-scheme: dark)");

  const [mode, setMode] = useState(true);

  useEffect(() => {
    setMode(true);
  }, [prefersMode]);

  const theme = createTheme(getDesignTokens(mode ? "dark" : "light"));
  

  return (
    <ThemeContext.Provider value={{ mode, setMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

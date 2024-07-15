'use client';

import { createTheme, useMediaQuery } from '@mui/material';
import { PaletteMode } from '@mui/material';
import { Poppins } from 'next/font/google';
import { Theme } from '@mui/material/styles';
import * as colors from '@mui/material/colors';

import { createContext, useState, useEffect } from 'react';

const poppins = Poppins({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const getDesignTokens = (mode: PaletteMode) => {
  const isLightMode = mode === 'light';
  const backgroundDefault = isLightMode ? '#fdfdfd' : '#262626';

  return {
		palette: {
			mode,
			...(mode === 'light'
				? {
						primary: {
							main: '#8350FF',
							light: '#9B73FF',
							dark: '#5B38B2',
							contrastText: '#fff',
						},
						secondary: {
							main: '#9C27B0',
							light: '#AF52BF',
							dark: '#6D1B7B',
							contrastText: '#FFFFFF',
						},
						background: {
							default: '#fafafa',
							paper: '#f5f5f5',
						},
						text: {
							primary: '#000000de',
							secondary: '#00000099',
							disabled: '#00000061',
							dark: '#000000de',
							onDark: '#fff',
							onDarkMuted: '#ffffffb3',
						},
						border: {
							border: {
								primary: '#e5e7eb',
							},
						},
						error: {
							main: '#d32f2f',
							light: '#ef5350',
							dark: '#c62828',
							contrastText: '#fff',
						},
						warning: {
							main: '#ffa726',
							light: '#ffb74d',
							dark: '#f57c00',
							contrastText: '#000000',
						},
						success: {
							main: '#66bb6a',
							dark: '#388e3c',
							light: '#81c784',
							contrastText: '#000000',
						},
						...colors,
					}
				: {
						primary: {
							main: '#8350FF',
							light: '#9B73FF',
							dark: '#5B38B2',
							contrastText: '#fff',
						},
						secondary: {
							main: '#9C27B0',
							light: '#AF52BF',
							dark: '#6D1B7B',
							contrastText: '#FFFFFF',
						},
						background: {
							default: '#262626',
							paper: '#404040',
						},
						text: {
							primary: '#fff',
							secondary: '#ffffffb3',
							disabled: '#ffffff80',
							onDark: '#fff',
							onDarkMuted: '#ffffffb3',
						},
						error: {
							main: '#d32f2f',
							light: '#e57373',
							dark: '#d32f2f',
							contrastText: '#fff',
						},
						warning: {
							main: '#ffa726',
							light: '#ffb74d',
							dark: '#f57c00',
							contrastText: '#000000de',
						},
						success: {
							main: '#66bb6a',
							dark: '#388e3c',
							light: '#81c784',
							contrastText: '#000000de',
						},
						...colors,
					}),
		},
		breakpoints: {
			values: {
				xs: 0,
				sm: 600,
				md: 960,
				lg: 1280,
				xl: 1920,
				xxl: 2300,
				xxxl: 2620,
				xxxxl: 3000,
			},
		},
		overrides: {
			MuiCssBaseline: {
				'@global': {
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
				fontSize: '2rem',
				fontWeight: 700,
				'@media (min-width:600px)': {
					fontSize: '3rem',
				},
			},
			h2: {
				fontSize: '1.5rem',
				fontWeight: 700,
				'@media (min-width:600px)': {
					fontSize: '2rem',
				},
			},
			h3: {
				fontSize: '1.5rem',
				fontWeight: 700,
				'@media (min-width:600px)': {
					fontSize: '2rem',
				},
			},
			h4: {
				fontSize: '1.25rem',
				fontWeight: 700,
				'@media (min-width:600px)': {
					fontSize: '1.75rem',
				},
			},
			h5: {
				fontSize: '1rem',
				fontWeight: 700,
				'@media (min-width:600px)': {
					fontSize: '1.5rem',
				},
			},
			h6: {
				fontSize: '0.8rem',
				fontWeight: 700,
				'@media (min-width:600px)': {
					fontSize: '1.125rem',
				},
			},
			body1: {
				fontSize: '0.9rem',
				fontWeight: 400,
				'@media (min-width:600px)': {
					fontSize: '1.125rem',
				},
			},
			body2: {
				fontSize: '0.875rem',
				fontWeight: 400,
			},
			button: {
				fontSize: '1rem',
				fontWeight: 700,
			},
			span: {
				fontSize: '1.125rem',
				fontWeight: 400,
			},
			
		},
	};
};

export const ThemeContext = createContext<{
  mode: boolean;
  setMode: (newState: boolean) => void;
  theme: Theme;
}>({
  mode: false,
  setMode: () => {},
  theme: createTheme(getDesignTokens('light')),
});
export default function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const [mode, setMode] = useState(prefersDarkMode);
  console.log(mode, "MODE")

  useEffect(() => {
    setMode(prefersDarkMode);
  }, [prefersDarkMode]);

  const theme = createTheme(getDesignTokens(mode ? 'dark' : 'light'));

  return <ThemeContext.Provider value={{ mode, setMode, theme }}>{children}</ThemeContext.Provider>;
}

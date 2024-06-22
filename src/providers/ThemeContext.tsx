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

const getDesignTokens = (mode: PaletteMode) => ({
	palette: {
		mode,
		...(mode === 'light'
			? {
					primary: {
						main: '#7b39ed',
					},
					secondary: {
						main: '#f3f4f6',
					},
					background: {
						primary: '#ffffff',
						muted: '#f3f4f6',
						accent: '#f3f4f6',
						input: '#e5e7eb',
					},
					text: {
						primary: '#f8f9fa',
						secondary: '#111827',
						default: '#020611',
						muted: '#9ca2ae',
						accent: '#111827',
						error: '#f8f9fa',
					},
					border: {
						primary: '#e5e7eb',
					},
					error: {
						main: '#ee4444',
					},
					...colors,
			  }
			: {
					// palette values for dark mode
					primary: {
						main: '#7b39ed',
					},
					secondary: {
						main: '#1f2937',
					},
					background: {
						// default: grey[800],
						paper: colors.grey[900],
						primary: '#020611',
						muted: '#1f2937',
						accent: '#1f2937',
						input: '#1f2937',
						warning: '#fef3c7',
					},
					text: {
						primary: '#f8f9fa',
						secondary: '#f8f9fa',
						default: '#f8f9fa',
						muted: '#9ca2ae',
						accent: '#f8f9fa',
						error: '#f8f9fa',
					},
					border: {
						primary: '#1f2937',
						main: colors.grey[400],
					},
					error: {
						main: '#7f1d1d',
					},
					warning: {
						main: '#f59e0b',
						background: '#fef3c7',
					},
					success: {
						main: colors.green[500],
						dark: colors.green['A400'],
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
			'@global': {
				body: {
					backgroundColor: 'background.default',
				},
			},
		},
	},
	components: {},
	typography: {
		fontFamily: poppins.style.fontFamily,
		h1: {
			fontSize: '3rem',
			fontWeight: 700,
			fontFamily: poppins.style.fontFamily,
		},
		h2: {
			fontSize: '2.5rem',
			fontWeight: 700,
		},
		h3: {
			fontSize: '2rem',
			fontWeight: 700,
		},
		h4: {
			fontSize: '1.5rem',
			fontWeight: 700,
		},
		h5: {
			fontSize: '1.25rem',
			fontWeight: 700,
		},
		h6: {
			fontSize: '1rem',
			fontWeight: 700,
		},
		body1: {
			fontSize: '1.125rem',
			fontWeight: 400,
		},
		body2: {
			fontSize: '0.875rem',
			fontWeight: 400,
			color: colors.grey[500],
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
});

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
  const prefersMode = useMediaQuery('(prefers-color-scheme: dark)');

  const [mode, setMode] = useState(prefersMode);

  useEffect(() => {
    setMode(prefersMode);
  }, [prefersMode]);

  const theme = createTheme(getDesignTokens(mode ? 'dark' : 'light'));

  return <ThemeContext.Provider value={{ mode, setMode, theme }}>{children}</ThemeContext.Provider>;
}

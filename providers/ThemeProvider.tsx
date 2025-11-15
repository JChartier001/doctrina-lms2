'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes';
import { useTheme as useNextTheme } from 'next-themes';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext<
	| {
			theme: string;
			setTheme: (theme: string) => void;
	  }
	| undefined
>(undefined);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const t = setTimeout(() => setMounted(true), 0);
		return () => clearTimeout(t);
	}, []);

	return (
		<NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>
			<ThemeContextProvider mounted={mounted}>{children}</ThemeContextProvider>
		</NextThemesProvider>
	);
}

function ThemeContextProvider({ children, mounted }: { children: React.ReactNode; mounted: boolean }) {
	const { theme, setTheme } = useNextTheme();

	// Prevent hydration mismatch by not rendering until mounted
	if (!mounted) {
		return null;
	}

	const value = {
		theme: theme || 'system',
		setTheme: (theme: string) => setTheme(theme),
	};

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
};

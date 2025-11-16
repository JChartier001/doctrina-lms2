import './globals.css';

import type { Metadata } from 'next';
import { Fira_Code, Montserrat, Noto_Serif_Georgian } from 'next/font/google';
import type React from 'react';

import { LayoutContent } from '@/components/layout-content';
import { Providers } from '@/providers';

export const metadata: Metadata = {
	title: 'Doctrina - Medical Aesthetics Education',
	description: 'Professional education platform for medical aesthetics',
	generator: 'v0.dev',
};

const firaCode = Fira_Code({
	variable: '--font-fira-code',
	subsets: ['latin'],
});

const montserrat = Montserrat({
	variable: '--font-montserrat',
	subsets: ['latin'],
});

const georgia = Noto_Serif_Georgian({
	variable: '--font-georgia',
	subsets: ['latin'],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>): React.ReactNode {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${firaCode.variable} ${montserrat.variable} ${georgia.variable} antialiased`}>
				<Providers>
					<LayoutContent>{children}</LayoutContent>
				</Providers>
			</body>
		</html>
	);
}

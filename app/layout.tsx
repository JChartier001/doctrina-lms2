import './globals.css';

import type { Metadata } from 'next';
import { Fira_Code, Montserrat, Noto_Serif_Georgian } from 'next/font/google';
import type React from 'react';

import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import Providers from '@/providers';

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
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${firaCode.variable} ${montserrat.variable} ${georgia.variable} antialiased`}>
				<Providers>
					<div className="flex min-h-screen flex-col">
						<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
							<div className="container flex h-16 items-center">
								<MainNav />
								<div className="ml-auto flex items-center space-x-4">
									<UserNav />
								</div>
							</div>
						</header>
						<main className="flex-1 px-4">{children}</main>
					</div>
				</Providers>
			</body>
		</html>
	);
}

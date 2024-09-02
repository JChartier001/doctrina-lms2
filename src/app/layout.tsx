import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import ContextProviders from '@/providers';
import './globals.css';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';

const poppins = Poppins({
	weight: ['400', '500', '700'],
	style: ['normal', 'italic'],
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Doctrina LMS',
	description: 'All-in-one aesthetics education platform',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={poppins.className}>
				<ContextProviders>
					<AppRouterCacheProvider>{children}</AppRouterCacheProvider>
				</ContextProviders>
			</body>
		</html>
	);
}

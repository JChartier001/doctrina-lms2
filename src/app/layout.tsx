import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import ContextProviders from '@/providers';
import './globals.css';

const poppins = Poppins({
	weight: ['400', '500', '700'],
	style: ['normal', 'italic'],
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Doctrina LMS',
	description: 'All-in-one aesthetics education platform',
};

export const user = {
	id: '66185b98a5a35b86cc440cdd',
	name: 'Jennifer Chartier',
	email: 'jchartier001@gmail.com',
	username: 'jchartier001',
	role: 'INSTRUCTOR',

	image: 'https://utfs.io/f/a0e1ab16-a713-46f0-be8c-ef372ce40423-etbbo5.svg',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<ContextProviders>
				<body >{children}</body>
			</ContextProviders>
		</html>
	);
}

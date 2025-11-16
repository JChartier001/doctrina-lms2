'use client';
import { ClerkProvider } from '@clerk/nextjs';

import { AuthProvider } from '@/lib/auth';

import { ConvexClientProvider } from './ConvexProvider';
import { ThemeProvider } from './ThemeProvider';

const Providers = ({ children }: { children: React.ReactNode }) => {
	return (
		<ClerkProvider>
			<ConvexClientProvider>
				<ThemeProvider>
					<AuthProvider>{children}</AuthProvider>
				</ThemeProvider>
			</ConvexClientProvider>
		</ClerkProvider>
	);
};
export { Providers };

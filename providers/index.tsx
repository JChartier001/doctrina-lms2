'use client';
import { AuthProvider } from '@/lib/auth';
import ConvexClientProvider from './ConvexProvider';
import { ThemeProvider } from './ThemeProvider';
import { ClerkProvider } from '@clerk/nextjs';

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
export default Providers;

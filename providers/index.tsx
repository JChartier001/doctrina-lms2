'use client';
import { AuthProvider } from '@/lib/auth';
import ConvexClientProvider from './ConvexProvider';
import { FeatureFlagsProvider } from './FeatureFlagProvider';
import { ThemeProvider } from './ThemeProvider';
import { ClerkProvider } from '@clerk/nextjs';

const Providers = ({ children }: { children: React.ReactNode }) => {
	return (
		<ClerkProvider>
			<ConvexClientProvider>
				<ThemeProvider>
					<AuthProvider>
						<FeatureFlagsProvider>{children}</FeatureFlagsProvider>
					</AuthProvider>
				</ThemeProvider>
			</ConvexClientProvider>
		</ClerkProvider>
	);
};
export default Providers;

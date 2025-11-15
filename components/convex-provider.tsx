'use client';

import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import type React from 'react';
import { useEffect } from 'react';

import { api } from '@/convex/_generated/api';
import { convex } from '@/lib/convexClient';

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
	const useAuth = useClerkAuth;
	const ensure = useMutation(api.users.ensureCurrentUser);
	const { isSignedIn } = useClerkAuth();

	useEffect(() => {
		if (isSignedIn) {
			ensure().catch(() => {});
		}
	}, [isSignedIn, ensure]);

	return (
		<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
			{children}
		</ConvexProviderWithClerk>
	);
}

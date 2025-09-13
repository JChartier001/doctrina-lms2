'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export type FeatureFlag =
	| 'convex_courses'
	| 'convex_resources'
	| 'convex_live_sessions'
	| 'convex_favorites'
	| 'convex_notifications'
	| 'convex_payments'
	| 'convex_certificates';

interface FeatureFlagsContextType {
	flags: Record<FeatureFlag, boolean>;
	setFlag: (flag: FeatureFlag, enabled: boolean) => void;
	isEnabled: (flag: FeatureFlag) => boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | null>(null);

const defaultFlags: Record<FeatureFlag, boolean> = {
	convex_courses: true, // Backend complete, enable for testing
	convex_resources: true, // Backend complete, enable for testing
	convex_live_sessions: true, // Backend complete, enable for testing
	convex_favorites: true, // Backend complete, enable for testing
	convex_notifications: true, // Already migrated
	convex_payments: true, // Already migrated
	convex_certificates: true, // Already migrated
};

export function FeatureFlagsProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [flags, setFlags] =
		useState<Record<FeatureFlag, boolean>>(defaultFlags);

	useEffect(() => {
		// Load flags from localStorage
		const stored = localStorage.getItem('doctrina-feature-flags');
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				setFlags({ ...defaultFlags, ...parsed });
			} catch (e) {
				console.error('Failed to parse feature flags from localStorage', e);
			}
		}
	}, []);

	const setFlag = (flag: FeatureFlag, enabled: boolean) => {
		const newFlags = { ...flags, [flag]: enabled };
		setFlags(newFlags);
		localStorage.setItem('doctrina-feature-flags', JSON.stringify(newFlags));
	};

	const isEnabled = (flag: FeatureFlag) => flags[flag] ?? false;

	return (
		<FeatureFlagsContext.Provider value={{ flags, setFlag, isEnabled }}>
			{children}
		</FeatureFlagsContext.Provider>
	);
}

export function useFeatureFlags() {
	const context = useContext(FeatureFlagsContext);
	if (!context) {
		throw new Error(
			'useFeatureFlags must be used within a FeatureFlagsProvider'
		);
	}
	return context;
}

// Hook for easy feature flag checking
export function useFeatureFlag(flag: FeatureFlag) {
	const { isEnabled } = useFeatureFlags();
	return isEnabled(flag);
}

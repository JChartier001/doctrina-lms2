'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import type React from 'react';
import { createContext, useContext, useMemo } from 'react';

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

type Role = 'admin' | 'instructor' | 'student';

type User = {
	id: Id<'users'>;
	name: string;
	email: string;
	image?: string;
	bio?: string;
	isInstructor: boolean;
	isAdmin: boolean;
	isVerified: boolean;
};

type AuthContextType = {
	user: User | null;
	isInstructor: boolean;
	isAdmin: boolean;
	isLoading: boolean;

	login: (email: string, password: string) => Promise<boolean>;
	signup: (name: string, email: string, password: string, role: Role | string) => Promise<boolean>;
	logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { isLoaded, isSignedIn, user: clerkUser } = useUser();
	const { signOut } = useClerk();

	const convexUser = useQuery(
		api.users.getByExternalId,
		isLoaded && isSignedIn && clerkUser?.id ? { externalId: clerkUser.id } : 'skip',
	);

	const user: User | null = useMemo(() => {
		if (!isLoaded || !isSignedIn || !clerkUser) return null;
		if (convexUser) {
			return {
				id: convexUser._id,
				name: `${convexUser.firstName} ${convexUser.lastName}`,
				email: convexUser.email,
				image: convexUser.image,
				isInstructor: convexUser.isInstructor,
				isAdmin: convexUser.isAdmin,
				// TODO: Add verification status
				isVerified: false,
			};
		}
		return null;
	}, [isLoaded, isSignedIn, clerkUser, convexUser]);

	const isLoading = !isLoaded || (isSignedIn && !convexUser);

	const login = async () => {
		// Clerk handles sign-in automatically through SignInButton component
		return true;
	};

	const signup = async () => {
		// Clerk handles sign-up automatically through SignUpButton component
		return true;
	};

	const logout = () => {
		void signOut();
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isInstructor: user?.isInstructor ?? false,
				isAdmin: user?.isAdmin ?? false,
				isLoading,
				login,
				signup,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}

'use client';

import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { Icons } from '@/components/icons';
import { MainNav } from '@/components/main-nav';
import { MarketingFooter } from '@/components/marketing-footer';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';

export function LayoutContent({ children }: { children: React.ReactNode }): React.ReactElement {
	const pathname = usePathname();
	const { isSignedIn, isLoaded } = useUser();

	// Show marketing page only on homepage when user is NOT signed in
	const isLandingPage = pathname === '/' && isLoaded && !isSignedIn;

	return (
		<div className="flex min-h-screen flex-col">
			{isLandingPage ? (
				// Marketing Header for Landing Page
				<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="container flex h-16 items-center justify-between px-4">
						<Link href="/" className="flex items-center space-x-2">
							<Icons.logo className="h-6 w-6" />
							<span className="font-bold text-xl">Doctrina</span>
						</Link>
						<nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
							<Link href="/courses" className="transition-colors hover:text-foreground/80 text-foreground/60">
								Courses
							</Link>
							<Link href="/resources" className="transition-colors hover:text-foreground/80 text-foreground/60">
								Resources
							</Link>
							<Link href="/live" className="transition-colors hover:text-foreground/80 text-foreground/60">
								Live Sessions
							</Link>
						</nav>
						<div className="flex items-center gap-2">
							<Button variant="ghost" asChild>
								<SignInButton>Log In</SignInButton>
							</Button>
							<Button asChild>
								<SignUpButton>Sign Up</SignUpButton>
							</Button>
						</div>
					</div>
				</header>
			) : (
				// App Header for Authenticated/Dashboard Pages
				<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="container flex h-16 items-center">
						<MainNav />
						<div className="ml-auto flex items-center space-x-4">
							<UserNav />
						</div>
					</div>
				</header>
			)}
			<main className={isLandingPage ? 'flex-1' : 'flex-1 px-4'}>{children}</main>
			{isLandingPage && <MarketingFooter />}
		</div>
	);
}

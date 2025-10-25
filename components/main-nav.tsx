'use client';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

import { Icons } from '@/components/icons';
import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

export function MainNav() {
	const pathname = usePathname();
	const router = useRouter();
	const isDesktop = useMediaQuery('(min-width: 1024px)');

	return (
		<div className="mr-4 flex items-center px-4">
			<Link href="/" className="mr-6 flex items-center space-x-2">
				<Icons.logo className="h-6 w-6" />
				<span className="hidden font-bold sm:inline-block">Doctrina</span>
			</Link>
			<nav className="flex items-center space-x-6 text-sm font-medium">
				<Link
					href="/dashboard"
					className={cn(
						'transition-colors hover:text-foreground/80',
						pathname === '/dashboard' ? 'text-foreground' : 'text-foreground/60',
					)}
				>
					Dashboard
				</Link>
				<Link
					href="/programs"
					className={cn(
						'transition-colors hover:text-foreground/80',
						pathname?.startsWith('/programs') ? 'text-foreground' : 'text-foreground/60',
					)}
				>
					Programs
				</Link>
				<Link
					href="/courses"
					className={cn(
						'transition-colors hover:text-foreground/80',
						pathname?.startsWith('/courses') ? 'text-foreground' : 'text-foreground/60',
					)}
				>
					Courses
				</Link>
				<Link
					href="/resources"
					className={cn(
						'transition-colors hover:text-foreground/80',
						pathname?.startsWith('/resources') ? 'text-foreground' : 'text-foreground/60',
					)}
				>
					Resources
				</Link>
				<Link
					href="/live"
					className={cn(
						'transition-colors hover:text-foreground/80',
						pathname?.startsWith('/live') ? 'text-foreground' : 'text-foreground/60',
					)}
				>
					Live Sessions
				</Link>
				<Link
					href="/community"
					className={cn(
						'transition-colors hover:text-foreground/80',
						pathname?.startsWith('/community') ? 'text-foreground' : 'text-foreground/60',
					)}
				>
					Community
				</Link>
			</nav>
			{isDesktop ? (
				<div className="ml-6 w-64">
					<SearchBar placeholder="Search..." />
				</div>
			) : (
				<Button variant="ghost" size="icon" className="ml-2" onClick={() => router.push('/search')}>
					<Search className="h-5 w-5" />
					<span className="sr-only">Search</span>
				</Button>
			)}
		</div>
	);
}

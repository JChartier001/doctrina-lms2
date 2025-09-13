'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
// Make sure the import path is correct
import { NotificationCenter } from '@/components/notification-center';
import { Award, CreditCard, Video } from 'lucide-react';
import Link from 'next/link';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

export function UserNav() {
	const { user, role, logout } = useAuth();
	const router = useRouter();

	if (!user) {
		return (
			<div className='flex items-center gap-2'>
				<Button variant='outline' asChild>
					<SignInButton>Login</SignInButton>
				</Button>
				<Button asChild>
					<SignUpButton>Sign Up</SignUpButton>
				</Button>
			</div>
		);
	}

	return (
		<div className='flex items-center gap-2'>
			<NotificationCenter />
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant='ghost' className='relative h-8 w-8 rounded-full'>
						<Avatar className='h-8 w-8'>
							<AvatarImage
								src={user.image || '/placeholder.svg'}
								alt={user.name}
							/>
							<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className='w-56' align='end' forceMount>
					<DropdownMenuLabel className='font-normal'>
						<div className='flex flex-col space-y-1'>
							<p className='text-sm font-medium leading-none'>{user.name}</p>
							<p className='text-xs leading-none text-muted-foreground'>
								{user.email}
							</p>
							<p className='text-xs leading-none text-muted-foreground capitalize'>
								{role}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem onClick={() => router.push('/profile')}>
							Profile
							<DropdownMenuShortcut>⇧P</DropdownMenuShortcut>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href='/profile/certificates'>
								<Award className='mr-2 h-4 w-4' />
								<span>My Certificates</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link href='/profile/purchases'>
								<CreditCard className='mr-2 h-4 w-4' />
								<span>Purchase History</span>
							</Link>
						</DropdownMenuItem>
						{role === 'instructor' && (
							<>
								<DropdownMenuItem asChild>
									<Link href='/instructor/live-sessions'>
										<Video className='mr-2 h-4 w-4' />
										<span>Live Sessions</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => router.push('/instructor/dashboard')}
								>
									Instructor Dashboard
									<DropdownMenuShortcut>⇧I</DropdownMenuShortcut>
								</DropdownMenuItem>
							</>
						)}
						{role === 'admin' && (
							<DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
								Admin Dashboard
								<DropdownMenuShortcut>⇧A</DropdownMenuShortcut>
							</DropdownMenuItem>
						)}
						<DropdownMenuItem onClick={() => router.push('/settings')}>
							Settings
							<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={logout}>
						Log out
						<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

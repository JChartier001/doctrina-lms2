'use client';

import { Bell, CheckCircle, Filter, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
	deleteUserNotification,
	fetchUserNotifications,
	markAllNotificationsAsRead,
	markNotificationAsRead,
} from '@/app/actions/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';
import { formatRelativeTime, type Notification } from '@/lib/notification-service';

export default function NotificationsPage() {
	const { user } = useAuth();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('all');
	const router = useRouter();

	useEffect(() => {
		if (user) {
			loadNotifications();
		}
	}, [user]);

	const loadNotifications = async () => {
		if (!user) return;

		setLoading(true);
		try {
			const userNotifications = await fetchUserNotifications(user.id);
			setNotifications(userNotifications);
		} catch (error) {
			console.error('Failed to fetch notifications:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleMarkAsRead = async (id: string) => {
		try {
			await markNotificationAsRead(id);
			setNotifications(
				notifications.map(notification => (notification.id === id ? { ...notification, read: true } : notification)),
			);
		} catch (error) {
			console.error('Failed to mark notification as read:', error);
		}
	};

	const handleMarkAllAsRead = async () => {
		if (!user) return;

		try {
			await markAllNotificationsAsRead(user.id);
			setNotifications(notifications.map(notification => ({ ...notification, read: true })));
		} catch (error) {
			console.error('Failed to mark all notifications as read:', error);
		}
	};

	const handleDeleteNotification = async (id: string) => {
		try {
			await deleteUserNotification(id);
			setNotifications(notifications.filter(notification => notification.id !== id));
		} catch (error) {
			console.error('Failed to delete notification:', error);
		}
	};

	const handleNotificationClick = (notification: Notification) => {
		if (!notification.read) {
			handleMarkAsRead(notification.id);
		}

		if (notification.link) {
			router.push(notification.link);
		}
	};

	const filteredNotifications = notifications.filter(notification => {
		if (activeTab === 'all') return true;
		if (activeTab === 'unread') return !notification.read;
		return notification.type === activeTab;
	});

	const getIconForType = (type: string) => {
		switch (type) {
			case 'course_update':
				return (
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-5 w-5 text-blue-600"
						>
							<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
						</svg>
					</div>
				);
			case 'certificate':
				return (
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-5 w-5 text-green-600"
						>
							<path d="M12 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
							<path d="M12 2c-1.4 0-2.8.5-3.9 1.6A5.6 5.6 0 0 0 6.5 7c-.2.6-.3 1.3-.3 2v4.2c0 .9.3 1.8 1 2.5.6.7 1.5 1.1 2.5 1.3l2.3 2.3 2.3-2.3c1-.2 1.9-.6 2.5-1.3.7-.7 1-1.6 1-2.5V9c0-.7-.1-1.4-.3-2a5.6 5.6 0 0 0-1.6-3.4A5.6 5.6 0 0 0 12 2z" />
							<path d="M16 14v3l2 2" />
							<path d="M8 14v3l-2 2" />
						</svg>
					</div>
				);
			case 'message':
				return (
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-5 w-5 text-purple-600"
						>
							<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
						</svg>
					</div>
				);
			case 'live_session':
				return (
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-5 w-5 text-red-600"
						>
							<path d="M23 7 16 12 23 17 23 7z" />
							<rect width="15" height="14" x="1" y="5" rx="2" ry="2" />
						</svg>
					</div>
				);
			case 'community':
				return (
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-5 w-5 text-amber-600"
						>
							<path d="M17 8h1a4 4 0 1 1 0 8h-1" />
							<path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
							<line x1="6" x2="6" y1="2" y2="4" />
							<line x1="10" x2="10" y1="2" y2="4" />
							<line x1="14" x2="14" y1="2" y2="4" />
						</svg>
					</div>
				);
			case 'milestone':
				return (
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-5 w-5 text-indigo-600"
						>
							<path d="M12 2v4" />
							<path d="M12 18v4" />
							<path d="m4.93 4.93 2.83 2.83" />
							<path d="m16.24 16.24 2.83 2.83" />
							<path d="M2 12h4" />
							<path d="M18 12h4" />
							<path d="m4.93 19.07 2.83-2.83" />
							<path d="m16.24 7.76 2.83-2.83" />
						</svg>
					</div>
				);
			case 'announcement':
				return (
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-5 w-5 text-cyan-600"
						>
							<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
							<line x1="12" y1="9" x2="12" y2="13" />
							<line x1="12" y1="17" x2="12.01" y2="17" />
						</svg>
					</div>
				);
			default:
				return (
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-5 w-5 text-gray-600"
						>
							<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
							<path d="M13.73 21a2 2 0 0 1-3.46 0" />
						</svg>
					</div>
				);
		}
	};

	if (!user) {
		return (
			<div className="container py-10">
				<Card>
					<CardHeader>
						<CardTitle>Notifications</CardTitle>
						<CardDescription>You need to be logged in to view notifications.</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className="container py-10">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-3xl font-bold">Notifications</h1>
				<div className="flex gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								<Filter className="mr-2 h-4 w-4" />
								Filter
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Filter by type</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem onClick={() => setActiveTab('all')}>All notifications</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setActiveTab('unread')}>Unread only</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={() => setActiveTab('course_update')}>Course updates</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setActiveTab('message')}>Messages</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setActiveTab('live_session')}>Live sessions</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setActiveTab('certificate')}>Certificates</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setActiveTab('community')}>Community</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>

					<Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
						<CheckCircle className="mr-2 h-4 w-4" />
						Mark all as read
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
							<TabsTrigger value="all" className="flex items-center gap-2">
								<Bell className="h-4 w-4" />
								<span className="hidden sm:inline">All</span>
							</TabsTrigger>
							<TabsTrigger value="unread" className="flex items-center gap-2">
								<div className="relative">
									<Bell className="h-4 w-4" />
									<span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-red-500"></span>
								</div>
								<span className="hidden sm:inline">Unread</span>
							</TabsTrigger>
							<TabsTrigger value="course_update" className="hidden lg:flex items-center gap-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="h-4 w-4"
								>
									<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
								</svg>
								<span className="hidden sm:inline">Courses</span>
							</TabsTrigger>
							<TabsTrigger value="message" className="hidden lg:flex items-center gap-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="h-4 w-4"
								>
									<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
								</svg>
								<span className="hidden sm:inline">Messages</span>
							</TabsTrigger>
							<TabsTrigger value="live_session" className="hidden lg:flex items-center gap-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="h-4 w-4"
								>
									<path d="M23 7 16 12 23 17 23 7z" />
									<rect width="15" height="14" x="1" y="5" rx="2" ry="2" />
								</svg>
								<span className="hidden sm:inline">Live</span>
							</TabsTrigger>
							<TabsTrigger value="certificate" className="hidden lg:flex items-center gap-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="h-4 w-4"
								>
									<path d="M12 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
									<path d="M12 2c-1.4 0-2.8.5-3.9 1.6A5.6 5.6 0 0 0 6.5 7c-.2.6-.3 1.3-.3 2v4.2c0 .9.3 1.8 1 2.5.6.7 1.5 1.1 2.5 1.3l2.3 2.3 2.3-2.3c1-.2 1.9-.6 2.5-1.3.7-.7 1-1.6 1-2.5V9c0-.7-.1-1.4-.3-2a5.6 5.6 0 0 0-1.6-3.4A5.6 5.6 0 0 0 12 2z" />
									<path d="M16 14v3l2 2" />
									<path d="M8 14v3l-2 2" />
								</svg>
								<span className="hidden sm:inline">Certificates</span>
							</TabsTrigger>
							<TabsTrigger value="community" className="hidden lg:flex items-center gap-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="h-4 w-4"
								>
									<path d="M17 8h1a4 4 0 1 1 0 8h-1" />
									<path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
									<line x1="6" x2="6" y1="2" y2="4" />
									<line x1="10" x2="10" y1="2" y2="4" />
									<line x1="14" x2="14" y1="2" y2="4" />
								</svg>
								<span className="hidden sm:inline">Community</span>
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="space-y-4">
							{[1, 2, 3, 4, 5].map(i => (
								<div key={i} className="flex items-start gap-4 p-4 border-b">
									<Skeleton className="h-10 w-10 rounded-full" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-5 w-3/4" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-1/4" />
									</div>
								</div>
							))}
						</div>
					) : filteredNotifications.length > 0 ? (
						<div className="divide-y">
							{filteredNotifications.map(notification => (
								<div
									key={notification.id}
									className={`flex items-start gap-4 p-4 ${!notification.read ? 'bg-muted/30' : ''}`}
								>
									{getIconForType(notification.type)}
									<div className="flex-1 cursor-pointer" onClick={() => handleNotificationClick(notification)}>
										<h3 className={`text-base ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
											{notification.title}
										</h3>
										<p className="text-sm text-muted-foreground">{notification.description}</p>
										<p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(notification.createdAt)}</p>
									</div>
									<div className="flex items-center gap-2">
										{!notification.read && (
											<Button
												variant="ghost"
												size="icon"
												onClick={e => {
													e.stopPropagation();
													handleMarkAsRead(notification.id);
												}}
											>
												<CheckCircle className="h-4 w-4" />
												<span className="sr-only">Mark as read</span>
											</Button>
										)}
										<Button
											variant="ghost"
											size="icon"
											onClick={e => {
												e.stopPropagation();
												handleDeleteNotification(notification.id);
											}}
										>
											<Trash2 className="h-4 w-4" />
											<span className="sr-only">Delete</span>
										</Button>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-12">
							<Bell className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="text-lg font-medium">No notifications</h3>
							<p className="text-sm text-muted-foreground">
								{activeTab === 'all'
									? "You don't have any notifications yet."
									: `You don't have any ${activeTab.replace('_', ' ')} notifications.`}
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

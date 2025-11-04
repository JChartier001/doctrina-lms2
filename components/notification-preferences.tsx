'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function NotificationPreferences() {
	const [preferences, setPreferences] = useState({
		courseUpdates: true,
		messages: true,
		communityActivity: true,
		liveSessions: true,
		certificates: true,
		milestones: true,
		announcements: true,
		email: true,
		push: true,
		inApp: true,
	});

	const handleToggle = (key: keyof typeof preferences) => {
		setPreferences({
			...preferences,
			[key]: !preferences[key],
		});
	};

	const handleSave = () => {
		// In a real app, this would save to a database
		toast.success('Preferences updated. Your notification preferences have been saved.');
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Notification Preferences</CardTitle>
				<CardDescription>
					Choose what notifications you want to receive and how you want to receive them.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-4">
					<h3 className="text-lg font-medium">Notification Types</h3>
					<div className="grid gap-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="courseUpdates">Course Updates</Label>
								<p className="text-sm text-muted-foreground">
									Receive notifications when courses are updated or new content is added
								</p>
							</div>
							<Switch
								id="courseUpdates"
								checked={preferences.courseUpdates}
								onCheckedChange={() => handleToggle('courseUpdates')}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="messages">Messages</Label>
								<p className="text-sm text-muted-foreground">
									Receive notifications for new messages from instructors or students
								</p>
							</div>
							<Switch id="messages" checked={preferences.messages} onCheckedChange={() => handleToggle('messages')} />
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="communityActivity">Community Activity</Label>
								<p className="text-sm text-muted-foreground">
									Receive notifications for replies to your posts or mentions
								</p>
							</div>
							<Switch
								id="communityActivity"
								checked={preferences.communityActivity}
								onCheckedChange={() => handleToggle('communityActivity')}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="liveSessions">Live Sessions</Label>
								<p className="text-sm text-muted-foreground">Receive notifications for upcoming live sessions</p>
							</div>
							<Switch
								id="liveSessions"
								checked={preferences.liveSessions}
								onCheckedChange={() => handleToggle('liveSessions')}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="certificates">Certificates</Label>
								<p className="text-sm text-muted-foreground">Receive notifications when you earn a certificate</p>
							</div>
							<Switch
								id="certificates"
								checked={preferences.certificates}
								onCheckedChange={() => handleToggle('certificates')}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="milestones">Learning Milestones</Label>
								<p className="text-sm text-muted-foreground">
									Receive notifications when you reach learning milestones
								</p>
							</div>
							<Switch
								id="milestones"
								checked={preferences.milestones}
								onCheckedChange={() => handleToggle('milestones')}
							/>
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="announcements">Platform Announcements</Label>
								<p className="text-sm text-muted-foreground">
									Receive notifications for important platform announcements
								</p>
							</div>
							<Switch
								id="announcements"
								checked={preferences.announcements}
								onCheckedChange={() => handleToggle('announcements')}
							/>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<h3 className="text-lg font-medium">Delivery Methods</h3>
					<div className="grid gap-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="email">Email Notifications</Label>
								<p className="text-sm text-muted-foreground">Receive notifications via email</p>
							</div>
							<Switch id="email" checked={preferences.email} onCheckedChange={() => handleToggle('email')} />
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="push">Push Notifications</Label>
								<p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
							</div>
							<Switch id="push" checked={preferences.push} onCheckedChange={() => handleToggle('push')} />
						</div>
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="inApp">In-App Notifications</Label>
								<p className="text-sm text-muted-foreground">Receive notifications within the application</p>
							</div>
							<Switch id="inApp" checked={preferences.inApp} onCheckedChange={() => handleToggle('inApp')} />
						</div>
					</div>
				</div>

				<Button onClick={handleSave}>Save Preferences</Button>
			</CardContent>
		</Card>
	);
}

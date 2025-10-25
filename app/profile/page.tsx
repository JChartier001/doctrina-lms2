'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';

export default function ProfilePage() {
	const { user, role } = useAuth();
	const router = useRouter();

	// Form state
	const [name, setName] = useState('');
	const [bio, setBio] = useState('');
	const [specialty, setSpecialty] = useState('');
	const [location, setLocation] = useState('');
	const [website, setWebsite] = useState('');
	const [isEditing, setIsEditing] = useState(false);

	// Mock data
	const certifications = [
		{
			id: '1',
			title: 'Advanced Botox Certification',
			issueDate: '2023-04-10',
			expiryDate: '2025-04-10',
			issuer: 'American Board of Medical Aesthetics',
			credentialId: 'ABMA-2023-78942',
		},
		{
			id: '2',
			title: 'Dermal Fillers Proficiency',
			issueDate: '2023-03-22',
			expiryDate: '2025-03-22',
			issuer: 'Institute of Cosmetic Medicine',
			credentialId: 'ICM-DF-2023-1456',
		},
	];

	const activities = [
		{
			id: '1',
			type: 'course_completion',
			title: 'Completed Advanced Botox Techniques',
			date: '2023-05-05T14:30:00',
		},
		{
			id: '2',
			type: 'discussion',
			title: "Posted in 'Best practices for dermal fillers in male patients'",
			date: '2023-05-10T09:15:00',
		},
		{
			id: '3',
			type: 'certificate',
			title: 'Earned Dermal Fillers Proficiency Certificate',
			date: '2023-03-22T11:00:00',
		},
		{
			id: '4',
			type: 'course_enrollment',
			title: 'Enrolled in Laser Therapy Fundamentals',
			date: '2023-04-28T16:45:00',
		},
	];

	const achievements = [
		{
			id: '1',
			title: 'Course Creator',
			description: 'Created your first educational course',
			icon: '🎓',
			date: '2023-02-15',
		},
		{
			id: '2',
			title: 'Discussion Starter',
			description: 'Started 5 community discussions',
			icon: '💬',
			date: '2023-03-10',
		},
		{
			id: '3',
			title: 'Problem Solver',
			description: 'Provided 10 solutions in the community',
			icon: '⭐',
			date: '2023-04-05',
		},
	];

	useEffect(() => {
		if (!user) {
			router.push('/sign-in');
			return;
		}

		// Initialize form values
		setName(user.name || '');
		setBio(
			'Board-certified dermatologist with 10+ years of experience in medical aesthetics, specializing in non-surgical facial rejuvenation techniques.',
		);
		setSpecialty('Dermatology');
		setLocation('New York, NY');
		setWebsite('www.example.com');
	}, [user, router]);

	const handleSaveProfile = () => {
		toast.success('Profile updated. Your profile has been updated successfully.');
		setIsEditing(false);
	};

	if (!user) {
		return null;
	}

	return (
		<div className="container py-10">
			<div className="flex flex-col md:flex-row gap-6">
				<div className="md:w-1/3">
					<Card className="mb-6">
						<CardContent className="p-6">
							<div className="flex flex-col items-center text-center">
								<Avatar className="h-24 w-24 mb-4">
									<AvatarImage src={user.image || '/placeholder.svg'} alt={user.name} />
									<AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
								</Avatar>

								<h1 className="text-2xl font-bold">{user.name}</h1>
								<p className="text-muted-foreground capitalize">{role}</p>

								{role === 'instructor' && user.isVerified && <Badge className="mt-2">Verified Instructor</Badge>}

								{!isEditing ? (
									<>
										<p className="mt-4 text-sm">{bio}</p>

										<div className="w-full mt-4 space-y-2 text-sm">
											<div className="flex items-center gap-2">
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
													className="h-4 w-4 text-muted-foreground"
												>
													<path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
												</svg>
												<span>Specialty: {specialty}</span>
											</div>
											<div className="flex items-center gap-2">
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
													className="h-4 w-4 text-muted-foreground"
												>
													<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
													<circle cx="12" cy="10" r="3" />
												</svg>
												<span>Location: {location}</span>
											</div>
											<div className="flex items-center gap-2">
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
													className="h-4 w-4 text-muted-foreground"
												>
													<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
													<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
												</svg>
												<span>Website: {website}</span>
											</div>
										</div>

										<Button className="mt-6 w-full" onClick={() => setIsEditing(true)}>
											Edit Profile
										</Button>
									</>
								) : (
									<div className="w-full mt-4 space-y-4">
										<div className="space-y-2 text-left">
											<Label htmlFor="name">Full Name</Label>
											<Input id="name" value={name} onChange={e => setName(e.target.value)} />
										</div>

										<div className="space-y-2 text-left">
											<Label htmlFor="bio">Bio</Label>
											<Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} rows={4} />
										</div>

										<div className="space-y-2 text-left">
											<Label htmlFor="specialty">Specialty</Label>
											<Input id="specialty" value={specialty} onChange={e => setSpecialty(e.target.value)} />
										</div>

										<div className="space-y-2 text-left">
											<Label htmlFor="location">Location</Label>
											<Input id="location" value={location} onChange={e => setLocation(e.target.value)} />
										</div>

										<div className="space-y-2 text-left">
											<Label htmlFor="website">Website</Label>
											<Input id="website" value={website} onChange={e => setWebsite(e.target.value)} />
										</div>

										<div className="flex gap-2">
											<Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
												Cancel
											</Button>
											<Button className="flex-1" onClick={handleSaveProfile}>
												Save
											</Button>
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Achievements</CardTitle>
							<CardDescription>Your earned badges and achievements</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{achievements.map(achievement => (
									<div key={achievement.id} className="flex items-start gap-3">
										<div className="flex-shrink-0 text-3xl">{achievement.icon}</div>
										<div>
											<h4 className="font-medium">{achievement.title}</h4>
											<p className="text-sm text-muted-foreground">{achievement.description}</p>
											<p className="text-xs text-muted-foreground mt-1">
												Earned on {new Date(achievement.date).toLocaleDateString()}
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="md:w-2/3">
					<Tabs defaultValue="activity" className="w-full">
						<TabsList className="mb-4 grid w-full grid-cols-3">
							<TabsTrigger value="activity">Activity</TabsTrigger>
							<TabsTrigger value="certifications">Certifications</TabsTrigger>
							<TabsTrigger value="courses">My Courses</TabsTrigger>
						</TabsList>

						<TabsContent value="activity">
							<Card>
								<CardHeader>
									<CardTitle>Recent Activity</CardTitle>
									<CardDescription>Your recent actions and achievements</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{activities.map(activity => (
											<div key={activity.id} className="flex items-start gap-4">
												<div className="mt-1 p-2 rounded-full bg-primary/10">
													{activity.type === 'course_completion' && (
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
															className="h-4 w-4 text-primary"
														>
															<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
															<path d="m9 11 3 3L22 4" />
														</svg>
													)}
													{activity.type === 'discussion' && (
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
															className="h-4 w-4 text-primary"
														>
															<path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
															<path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
														</svg>
													)}
													{activity.type === 'certificate' && (
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
															className="h-4 w-4 text-primary"
														>
															<path d="M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
															<path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" />
														</svg>
													)}
													{activity.type === 'course_enrollment' && (
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
															className="h-4 w-4 text-primary"
														>
															<path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
														</svg>
													)}
												</div>
												<div className="flex-1">
													<p className="font-medium">{activity.title}</p>
													<p className="text-sm text-muted-foreground">
														{new Date(activity.date).toLocaleDateString()} at{' '}
														{new Date(activity.date).toLocaleTimeString([], {
															hour: '2-digit',
															minute: '2-digit',
														})}
													</p>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="certifications">
							<Card>
								<CardHeader>
									<CardTitle>My Certifications</CardTitle>
									<CardDescription>Your earned credentials and certifications</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-6">
										{certifications.map(cert => (
											<div key={cert.id} className="border rounded-lg p-4">
												<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
													<div>
														<h3 className="font-medium text-lg">{cert.title}</h3>
														<p className="text-muted-foreground">{cert.issuer}</p>
													</div>
													<Badge variant="outline" className="w-fit">
														Valid until {new Date(cert.expiryDate).toLocaleDateString()}
													</Badge>
												</div>

												<Separator className="my-4" />

												<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
													<div>
														<p className="text-muted-foreground">Issue Date</p>
														<p>{new Date(cert.issueDate).toLocaleDateString()}</p>
													</div>
													<div>
														<p className="text-muted-foreground">Credential ID</p>
														<p>{cert.credentialId}</p>
													</div>
												</div>

												<div className="flex gap-2 mt-4">
													<Button variant="outline" className="flex-1">
														View
													</Button>
													<Button className="flex-1">Download</Button>
												</div>
											</div>
										))}

										<Button variant="outline" className="w-full">
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
												className="mr-2 h-4 w-4"
											>
												<path d="M5 12h14" />
												<path d="M12 5v14" />
											</svg>
											Add External Certification
										</Button>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="courses">
							<Card>
								<CardHeader>
									<CardTitle>My Courses</CardTitle>
									<CardDescription>Courses you are enrolled in or teaching</CardDescription>
								</CardHeader>
								<CardContent>
									<Tabs defaultValue="enrolled" className="w-full">
										<TabsList className="mb-4 w-full">
											<TabsTrigger value="enrolled" className="flex-1">
												Enrolled Courses
											</TabsTrigger>
											{role === 'instructor' && (
												<TabsTrigger value="teaching" className="flex-1">
													Teaching
												</TabsTrigger>
											)}
										</TabsList>

										<TabsContent value="enrolled" className="space-y-4">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div className="border rounded-lg p-4 flex gap-4">
													<div className="flex-shrink-0">
														<img
															src="/placeholder.svg?height=80&width=140"
															alt="Course thumbnail"
															className="w-[140px] h-20 object-cover rounded-md"
														/>
													</div>
													<div className="flex-1">
														<h3 className="font-medium">Advanced Botox Techniques</h3>
														<p className="text-sm text-muted-foreground">Dr. Sarah Johnson</p>
														<div className="flex items-center justify-between mt-2">
															<span className="text-xs text-muted-foreground">65% complete</span>
															<Button size="sm" variant="outline">
																Continue
															</Button>
														</div>
													</div>
												</div>

												<div className="border rounded-lg p-4 flex gap-4">
													<div className="flex-shrink-0">
														<img
															src="/placeholder.svg?height=80&width=140"
															alt="Course thumbnail"
															className="w-[140px] h-20 object-cover rounded-md"
														/>
													</div>
													<div className="flex-1">
														<h3 className="font-medium">Dermal Fillers Masterclass</h3>
														<p className="text-sm text-muted-foreground">Dr. Michael Chen</p>
														<div className="flex items-center justify-between mt-2">
															<span className="text-xs text-muted-foreground">30% complete</span>
															<Button size="sm" variant="outline">
																Continue
															</Button>
														</div>
													</div>
												</div>
											</div>

											<Button variant="outline" className="w-full">
												View All Enrolled Courses
											</Button>
										</TabsContent>

										{role === 'instructor' && (
											<TabsContent value="teaching" className="space-y-4">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div className="border rounded-lg p-4 flex gap-4">
														<div className="flex-shrink-0">
															<img
																src="/placeholder.svg?height=80&width=140"
																alt="Course thumbnail"
																className="w-[140px] h-20 object-cover rounded-md"
															/>
														</div>
														<div className="flex-1">
															<h3 className="font-medium">Advanced Botox Techniques</h3>
															<div className="flex items-center mt-1">
																<Badge variant="outline">Published</Badge>
																<span className="text-xs text-muted-foreground ml-2">124 students</span>
															</div>
															<div className="flex gap-2 mt-2">
																<Button size="sm" variant="outline" className="flex-1">
																	Edit
																</Button>
																<Button size="sm" className="flex-1">
																	Analytics
																</Button>
															</div>
														</div>
													</div>

													<div className="border rounded-lg p-4 flex gap-4">
														<div className="flex-shrink-0">
															<img
																src="/placeholder.svg?height=80&width=140"
																alt="Course thumbnail"
																className="w-[140px] h-20 object-cover rounded-md"
															/>
														</div>
														<div className="flex-1">
															<h3 className="font-medium">Dermal Fillers Masterclass</h3>
															<div className="flex items-center mt-1">
																<Badge variant="outline">Draft</Badge>
																<span className="text-xs text-muted-foreground ml-2">Not published</span>
															</div>
															<div className="flex gap-2 mt-2">
																<Button size="sm" variant="outline" className="flex-1">
																	Edit
																</Button>
																<Button size="sm" className="flex-1">
																	Publish
																</Button>
															</div>
														</div>
													</div>
												</div>

												<Button variant="outline" className="w-full">
													View All My Courses
												</Button>
											</TabsContent>
										)}
									</Tabs>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}

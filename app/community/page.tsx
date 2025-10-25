'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';

// Mock data for community discussions
const discussionTopics = [
	{
		id: '1',
		title: 'Best practices for dermal fillers in male patients',
		author: {
			name: 'Dr. Sarah Johnson',
			image: '/placeholder.svg?height=40&width=40',
		},
		date: '2023-05-10T14:30:00',
		replies: 12,
		views: 156,
		tags: ['Fillers', 'Male Aesthetics', 'Clinical'],
		solved: true,
	},
	{
		id: '2',
		title: 'Managing patient expectations for Botox treatments',
		author: {
			name: 'Dr. Michael Chen',
			image: '/placeholder.svg?height=40&width=40',
		},
		date: '2023-05-08T09:15:00',
		replies: 8,
		views: 102,
		tags: ['Botox', 'Patient Care', 'Business'],
		solved: false,
	},
	{
		id: '3',
		title: 'Laser settings for darker skin types - recommendations?',
		author: {
			name: 'Dr. Emily Rodriguez',
			image: '/placeholder.svg?height=40&width=40',
		},
		date: '2023-05-05T16:45:00',
		replies: 15,
		views: 230,
		tags: ['Laser', 'Skin Types', 'Clinical'],
		solved: true,
	},
	{
		id: '4',
		title: 'Protocols for combining treatments in the same session',
		author: {
			name: 'Dr. James Wilson',
			image: '/placeholder.svg?height=40&width=40',
		},
		date: '2023-05-02T11:20:00',
		replies: 7,
		views: 89,
		tags: ['Combination Therapy', 'Protocols', 'Clinical'],
		solved: false,
	},
];

// Mock data for study groups
const studyGroups = [
	{
		id: '1',
		name: 'Advanced Injection Techniques',
		members: 24,
		description:
			'A group focused on mastering advanced injection techniques for aesthetic treatments.',
		image: '/placeholder.svg?height=100&width=100',
	},
	{
		id: '2',
		name: 'Practice Management',
		members: 18,
		description:
			'Discussions on running a successful aesthetic practice, from marketing to patient retention.',
		image: '/placeholder.svg?height=100&width=100',
	},
	{
		id: '3',
		name: 'Complication Management',
		members: 32,
		description:
			'Sharing experiences and protocols for managing and preventing treatment complications.',
		image: '/placeholder.svg?height=100&width=100',
	},
];

export default function CommunityPage() {
	const [searchQuery, setSearchQuery] = useState('');
	const { user } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!user) {
			router.push('/login');
		}
	}, [user, router]);

	const handleCreateTopic = () => {
		router.push('/community/new-topic');
	};

	const handleJoinGroup = (groupId: string) => {
		toast.success(
			'Group joined. You have successfully joined this study group.'
		);
	};

	if (!user) {
		return null;
	}

	return (
		<div className='container py-10'>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6'>
				<div>
					<h1 className='text-3xl font-bold'>Community</h1>
					<p className='text-muted-foreground'>
						Connect with other medical professionals in the field
					</p>
				</div>
				<div className='flex gap-2'>
					<Button onClick={handleCreateTopic}>Create Topic</Button>
				</div>
			</div>

			<div className='flex flex-col md:flex-row gap-6'>
				<div className='md:w-2/3'>
					<Tabs defaultValue='all' className='w-full mb-6'>
						<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4'>
							<TabsList>
								<TabsTrigger value='all'>All Topics</TabsTrigger>
								<TabsTrigger value='trending'>Trending</TabsTrigger>
								<TabsTrigger value='solved'>Solved</TabsTrigger>
								<TabsTrigger value='unanswered'>Unanswered</TabsTrigger>
							</TabsList>
							<div className='w-full sm:w-auto'>
								<Input
									placeholder='Search discussions...'
									value={searchQuery}
									onChange={e => setSearchQuery(e.target.value)}
									className='w-full sm:w-[250px]'
								/>
							</div>
						</div>

						<TabsContent value='all' className='space-y-4'>
							{discussionTopics.map(topic => (
								<Card
									key={topic.id}
									className='cursor-pointer hover:bg-accent/50 transition-colors'
									onClick={() => router.push(`/community/topic/${topic.id}`)}
								>
									<CardContent className='p-4'>
										<div className='flex gap-4'>
											<Avatar className='h-10 w-10'>
												<AvatarImage
													src={topic.author.image || '/placeholder.svg'}
													alt={topic.author.name}
												/>
												<AvatarFallback>
													{topic.author.name.charAt(0)}
												</AvatarFallback>
											</Avatar>
											<div className='flex-1'>
												<div className='flex items-start justify-between'>
													<div>
														<h3 className='font-medium'>{topic.title}</h3>
														<div className='flex items-center gap-2 text-xs text-muted-foreground mt-1'>
															<span>{topic.author.name}</span>
															<span>•</span>
															<span>
																{new Date(topic.date).toLocaleDateString()}
															</span>
															{topic.solved && (
																<>
																	<span>•</span>
																	<Badge
																		variant='outline'
																		className='bg-green-50 text-green-700 border-green-200'
																	>
																		Solved
																	</Badge>
																</>
															)}
														</div>
													</div>
													<div className='text-xs text-muted-foreground'>
														<div>{topic.replies} replies</div>
														<div>{topic.views} views</div>
													</div>
												</div>
												<div className='flex flex-wrap gap-2 mt-3'>
													{topic.tags.map(tag => (
														<Badge
															key={tag}
															variant='secondary'
															className='text-xs'
														>
															{tag}
														</Badge>
													))}
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</TabsContent>

						<TabsContent value='trending' className='space-y-4'>
							{discussionTopics
								.sort((a, b) => b.views - a.views)
								.map(topic => (
									<Card
										key={topic.id}
										className='cursor-pointer hover:bg-accent/50 transition-colors'
										onClick={() => router.push(`/community/topic/${topic.id}`)}
									>
										<CardContent className='p-4'>
											<div className='flex gap-4'>
												<Avatar className='h-10 w-10'>
													<AvatarImage
														src={topic.author.image || '/placeholder.svg'}
														alt={topic.author.name}
													/>
													<AvatarFallback>
														{topic.author.name.charAt(0)}
													</AvatarFallback>
												</Avatar>
												<div className='flex-1'>
													<div className='flex items-start justify-between'>
														<div>
															<h3 className='font-medium'>{topic.title}</h3>
															<div className='flex items-center gap-2 text-xs text-muted-foreground mt-1'>
																<span>{topic.author.name}</span>
																<span>•</span>
																<span>
																	{new Date(topic.date).toLocaleDateString()}
																</span>
																{topic.solved && (
																	<>
																		<span>•</span>
																		<Badge
																			variant='outline'
																			className='bg-green-50 text-green-700 border-green-200'
																		>
																			Solved
																		</Badge>
																	</>
																)}
															</div>
														</div>
														<div className='text-xs text-muted-foreground'>
															<div>{topic.replies} replies</div>
															<div>{topic.views} views</div>
														</div>
													</div>
													<div className='flex flex-wrap gap-2 mt-3'>
														{topic.tags.map(tag => (
															<Badge
																key={tag}
																variant='secondary'
																className='text-xs'
															>
																{tag}
															</Badge>
														))}
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
						</TabsContent>

						<TabsContent value='solved' className='space-y-4'>
							{discussionTopics
								.filter(topic => topic.solved)
								.map(topic => (
									<Card
										key={topic.id}
										className='cursor-pointer hover:bg-accent/50 transition-colors'
										onClick={() => router.push(`/community/topic/${topic.id}`)}
									>
										<CardContent className='p-4'>
											<div className='flex gap-4'>
												<Avatar className='h-10 w-10'>
													<AvatarImage
														src={topic.author.image || '/placeholder.svg'}
														alt={topic.author.name}
													/>
													<AvatarFallback>
														{topic.author.name.charAt(0)}
													</AvatarFallback>
												</Avatar>
												<div className='flex-1'>
													<div className='flex items-start justify-between'>
														<div>
															<h3 className='font-medium'>{topic.title}</h3>
															<div className='flex items-center gap-2 text-xs text-muted-foreground mt-1'>
																<span>{topic.author.name}</span>
																<span>•</span>
																<span>
																	{new Date(topic.date).toLocaleDateString()}
																</span>
																<span>•</span>
																<Badge
																	variant='outline'
																	className='bg-green-50 text-green-700 border-green-200'
																>
																	Solved
																</Badge>
															</div>
														</div>
														<div className='text-xs text-muted-foreground'>
															<div>{topic.replies} replies</div>
															<div>{topic.views} views</div>
														</div>
													</div>
													<div className='flex flex-wrap gap-2 mt-3'>
														{topic.tags.map(tag => (
															<Badge
																key={tag}
																variant='secondary'
																className='text-xs'
															>
																{tag}
															</Badge>
														))}
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
						</TabsContent>

						<TabsContent value='unanswered' className='space-y-4'>
							{discussionTopics
								.filter(topic => !topic.solved)
								.map(topic => (
									<Card
										key={topic.id}
										className='cursor-pointer hover:bg-accent/50 transition-colors'
										onClick={() => router.push(`/community/topic/${topic.id}`)}
									>
										<CardContent className='p-4'>
											<div className='flex gap-4'>
												<Avatar className='h-10 w-10'>
													<AvatarImage
														src={topic.author.image || '/placeholder.svg'}
														alt={topic.author.name}
													/>
													<AvatarFallback>
														{topic.author.name.charAt(0)}
													</AvatarFallback>
												</Avatar>
												<div className='flex-1'>
													<div className='flex items-start justify-between'>
														<div>
															<h3 className='font-medium'>{topic.title}</h3>
															<div className='flex items-center gap-2 text-xs text-muted-foreground mt-1'>
																<span>{topic.author.name}</span>
																<span>•</span>
																<span>
																	{new Date(topic.date).toLocaleDateString()}
																</span>
															</div>
														</div>
														<div className='text-xs text-muted-foreground'>
															<div>{topic.replies} replies</div>
															<div>{topic.views} views</div>
														</div>
													</div>
													<div className='flex flex-wrap gap-2 mt-3'>
														{topic.tags.map(tag => (
															<Badge
																key={tag}
																variant='secondary'
																className='text-xs'
															>
																{tag}
															</Badge>
														))}
													</div>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
						</TabsContent>
					</Tabs>
				</div>

				<div className='md:w-1/3 space-y-6'>
					<Card>
						<CardHeader>
							<CardTitle>Study Groups</CardTitle>
							<CardDescription>
								Join groups to collaborate with peers
							</CardDescription>
						</CardHeader>
						<CardContent className='space-y-4'>
							{studyGroups.map(group => (
								<div key={group.id} className='flex gap-3 items-start'>
									<img
										src={group.image || '/placeholder.svg'}
										alt={group.name}
										className='w-12 h-12 rounded-md object-cover'
									/>
									<div className='flex-1'>
										<h4 className='font-medium'>{group.name}</h4>
										<p className='text-xs text-muted-foreground'>
											{group.members} members
										</p>
										<p className='text-sm mt-1 line-clamp-2'>
											{group.description}
										</p>
										<Button
											variant='outline'
											size='sm'
											className='mt-2'
											onClick={() => handleJoinGroup(group.id)}
										>
											Join Group
										</Button>
									</div>
								</div>
							))}
							<Button variant='outline' className='w-full'>
								View All Groups
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Popular Tags</CardTitle>
							<CardDescription>Browse topics by tag</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='flex flex-wrap gap-2'>
								<Badge className='cursor-pointer'>Botox</Badge>
								<Badge className='cursor-pointer'>Fillers</Badge>
								<Badge className='cursor-pointer'>Laser</Badge>
								<Badge className='cursor-pointer'>Complications</Badge>
								<Badge className='cursor-pointer'>Patient Care</Badge>
								<Badge className='cursor-pointer'>Business</Badge>
								<Badge className='cursor-pointer'>Marketing</Badge>
								<Badge className='cursor-pointer'>Clinical</Badge>
								<Badge className='cursor-pointer'>Research</Badge>
								<Badge className='cursor-pointer'>Protocols</Badge>
								<Badge className='cursor-pointer'>Legal</Badge>
								<Badge className='cursor-pointer'>Training</Badge>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Community Leaderboard</CardTitle>
							<CardDescription>Most active members this month</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-3'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<Avatar className='h-8 w-8'>
											<AvatarImage
												src='/placeholder.svg?height=40&width=40'
												alt='Dr. Sarah Johnson'
											/>
											<AvatarFallback>SJ</AvatarFallback>
										</Avatar>
										<span className='font-medium'>Dr. Sarah Johnson</span>
									</div>
									<Badge>1,245 pts</Badge>
								</div>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<Avatar className='h-8 w-8'>
											<AvatarImage
												src='/placeholder.svg?height=40&width=40'
												alt='Dr. Michael Chen'
											/>
											<AvatarFallback>MC</AvatarFallback>
										</Avatar>
										<span className='font-medium'>Dr. Michael Chen</span>
									</div>
									<Badge>980 pts</Badge>
								</div>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<Avatar className='h-8 w-8'>
											<AvatarImage
												src='/placeholder.svg?height=40&width=40'
												alt='Dr. Emily Rodriguez'
											/>
											<AvatarFallback>ER</AvatarFallback>
										</Avatar>
										<span className='font-medium'>Dr. Emily Rodriguez</span>
									</div>
									<Badge>845 pts</Badge>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/lib/auth';
import {
	getCategoryDisplayName,
	getResourceTypeDisplayName,
} from '@/lib/resource-library-service';
import { ResourceCard } from '@/components/resource-library/resource-card';
import {
	Heart,
	Download,
	Calendar,
	User,
	FileText,
	Video,
	Book,
	PenToolIcon as Tool,
	Clipboard,
	FileSpreadsheet,
	ArrowLeft,
	Star,
} from 'lucide-react';

interface ResourceDetailProps {
	resourceId: string;
}

export function ResourceDetail({ resourceId }: ResourceDetailProps) {
	const { user } = useAuth();

	// Use Convex hooks
	const resource = useQuery(api.resources.get, { id: resourceId as any });
	const relatedResources = useQuery(api.resources.list, { limit: 3 }) || [];
	const isFavorited = useQuery(api.favorites.isFavorited, {
		userId: user?.id as any,
		resourceId: resourceId as any,
	});

	const addToFavoritesMutation = useMutation(api.favorites.add);
	const removeFromFavoritesMutation = useMutation(api.favorites.remove);

	const isLoading = resource === undefined;

	const handleToggleFavorite = async () => {
		if (!resource || !user) return;

		setIsActionLoading(true);
		try {
			if (isFavorited) {
				await removeFromFavoritesMutation({
					userId: user.id as any,
					resourceId: resource._id,
				});
			} else {
				await addToFavoritesMutation({
					userId: user.id as any,
					resourceId: resource._id,
				});
			}
		} catch (error) {
			console.error('Error toggling favorite:', error);
		} finally {
			setIsActionLoading(false);
		}
	};

	const handleDownload = async () => {
		if (!resource) return;

		setIsActionLoading(true);
		try {
			// In a real app, this would trigger the actual download
			alert(`Downloading ${resource.title}...`);
		} catch (error) {
			console.error('Error downloading resource:', error);
		} finally {
			setIsActionLoading(false);
		}
	};

	const getResourceIcon = () => {
		if (!resource) return <FileText className='h-6 w-6' />;

		switch (resource.type) {
			case 'pdf':
				return <FileText className='h-6 w-6' />;
			case 'video':
				return <Video className='h-6 w-6' />;
			case 'article':
				return <FileText className='h-6 w-6' />;
			case 'tool':
				return <Tool className='h-6 w-6' />;
			case 'template':
				return <Clipboard className='h-6 w-6' />;
			case 'guide':
				return <Book className='h-6 w-6' />;
			case 'research':
				return <FileSpreadsheet className='h-6 w-6' />;
			case 'case-study':
				return <Clipboard className='h-6 w-6' />;
			default:
				return <FileText className='h-6 w-6' />;
		}
	};

	if (isLoading) {
		return (
			<div className='space-y-6'>
				<div className='flex items-center'>
					<Button variant='ghost' size='sm' asChild className='mb-4'>
						<Link href='/resources'>
							<ArrowLeft className='h-4 w-4 mr-2' />
							Back to Resources
						</Link>
					</Button>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
					<div className='md:col-span-2 space-y-6'>
						<Skeleton className='h-[300px] w-full rounded-md' />
						<div className='space-y-4'>
							<Skeleton className='h-8 w-3/4' />
							<Skeleton className='h-4 w-full' />
							<Skeleton className='h-4 w-full' />
							<Skeleton className='h-4 w-2/3' />
						</div>
					</div>
					<div className='space-y-6'>
						<div className='border rounded-lg p-4 space-y-4'>
							<Skeleton className='h-8 w-full' />
							<Skeleton className='h-8 w-full' />
							<Skeleton className='h-8 w-full' />
						</div>
						<div className='border rounded-lg p-4 space-y-4'>
							<Skeleton className='h-5 w-1/2' />
							<Skeleton className='h-4 w-full' />
							<Skeleton className='h-4 w-full' />
							<Skeleton className='h-4 w-3/4' />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!resource) {
		return (
			<div className='flex flex-col items-center justify-center py-12 text-center'>
				<h2 className='text-2xl font-bold mb-2'>Resource Not Found</h2>
				<p className='text-muted-foreground mb-6'>
					The requested resource could not be found.
				</p>
				<Button asChild>
					<Link href='/resources'>Return to Resource Library</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center'>
				<Button variant='ghost' size='sm' asChild className='mb-4'>
					<Link href='/resources'>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Back to Resources
					</Link>
				</Button>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
				<div className='md:col-span-2 space-y-6'>
					<div className='relative rounded-lg overflow-hidden'>
						<img
							src={
								resource.thumbnailUrl || '/placeholder.svg?height=400&width=800'
							}
							alt={resource.title}
							className='w-full object-cover aspect-video'
						/>
						{resource.featured && (
							<Badge className='absolute top-4 right-4 bg-primary'>
								Featured
							</Badge>
						)}
					</div>

					<div>
						<div className='flex items-center gap-2 mb-3'>
							<Badge variant='outline' className='flex items-center gap-1'>
								{getResourceIcon()}
								<span>{getResourceTypeDisplayName(resource.type)}</span>
							</Badge>
							<Badge variant='secondary' className='capitalize'>
								{resource.difficulty}
							</Badge>
							{resource.restricted && (
								<Badge variant='destructive'>Premium</Badge>
							)}
						</div>

						<h1 className='text-3xl font-bold mb-4'>{resource.title}</h1>

						<div className='flex flex-wrap gap-2 mb-4'>
							{resource.categories.map(category => (
								<Link key={category} href={`/resources?category=${category}`}>
									<Badge variant='outline'>
										{getCategoryDisplayName(category)}
									</Badge>
								</Link>
							))}
						</div>

						<Tabs defaultValue='overview' className='mt-6'>
							<TabsList>
								<TabsTrigger value='overview'>Overview</TabsTrigger>
								<TabsTrigger value='details'>Details</TabsTrigger>
								{resource.type === 'video' && (
									<TabsTrigger value='video'>Watch</TabsTrigger>
								)}
							</TabsList>

							<TabsContent value='overview' className='space-y-4 mt-4'>
								<p className='text-muted-foreground'>{resource.description}</p>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
									euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl,
									eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel
									ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl
									nisl sit amet nisl.
								</p>
								<p>
									Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam
									nisl, eget aliquam nisl nisl sit amet nisl. Lorem ipsum dolor
									sit amet, consectetur adipiscing elit.
								</p>
							</TabsContent>

							<TabsContent value='details' className='space-y-4 mt-4'>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<h3 className='font-medium'>Resource Information</h3>
										<ul className='space-y-1 text-sm'>
											<li className='flex items-center gap-2'>
												<span className='text-muted-foreground'>Type:</span>
												<span>{getResourceTypeDisplayName(resource.type)}</span>
											</li>
											<li className='flex items-center gap-2'>
												<span className='text-muted-foreground'>
													Difficulty:
												</span>
												<span className='capitalize'>
													{resource.difficulty}
												</span>
											</li>
											{resource.fileSize && (
												<li className='flex items-center gap-2'>
													<span className='text-muted-foreground'>
														File Size:
													</span>
													<span>{resource.fileSize}</span>
												</li>
											)}
											{resource.duration && (
												<li className='flex items-center gap-2'>
													<span className='text-muted-foreground'>
														Duration:
													</span>
													<span>{resource.duration}</span>
												</li>
											)}
										</ul>
									</div>

									<div className='space-y-2'>
										<h3 className='font-medium'>Tags</h3>
										<div className='flex flex-wrap gap-2'>
											{resource.tags.map(tag => (
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
							</TabsContent>

							{resource.type === 'video' && (
								<TabsContent value='video' className='space-y-4 mt-4'>
									<div className='aspect-video bg-muted rounded-md flex items-center justify-center'>
										<p className='text-muted-foreground'>
											Video player would be displayed here
										</p>
									</div>
								</TabsContent>
							)}
						</Tabs>
					</div>

					{relatedResources.length > 0 && (
						<div className='mt-8'>
							<h2 className='text-xl font-semibold mb-4'>Related Resources</h2>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								{relatedResources.map(relatedResource => (
									<ResourceCard
										key={relatedResource.id}
										resource={relatedResource}
									/>
								))}
							</div>
						</div>
					)}
				</div>

				<div className='space-y-6'>
					<div className='border rounded-lg p-4 space-y-4'>
						<Button
							className='w-full'
							onClick={handleDownload}
							disabled={isActionLoading}
						>
							<Download className='mr-2 h-4 w-4' />
							Download Resource
						</Button>

						<Button
							variant='outline'
							className='w-full'
							onClick={handleToggleFavorite}
							disabled={isActionLoading}
						>
							<Heart
								className={`mr-2 h-4 w-4 ${isFavorited ? 'fill-current text-red-500' : ''}`}
							/>
							{isFavorited ? 'Saved to Library' : 'Save to Library'}
						</Button>

						{resource.courseId && (
							<Button variant='outline' className='w-full' asChild>
								<Link href={`/courses/${resource.courseId}`}>
									View Related Course
								</Link>
							</Button>
						)}
					</div>

					<div className='border rounded-lg p-4 space-y-4'>
						<h3 className='font-medium'>Resource Details</h3>

						<div className='space-y-3 text-sm'>
							<div className='flex items-center'>
								<User className='h-4 w-4 mr-2 text-muted-foreground' />
								<span className='text-muted-foreground mr-2'>Author:</span>
								<span>{resource.author}</span>
							</div>

							<div className='flex items-center'>
								<Calendar className='h-4 w-4 mr-2 text-muted-foreground' />
								<span className='text-muted-foreground mr-2'>Published:</span>
								<span>{new Date(resource.dateAdded).toLocaleDateString()}</span>
							</div>

							<div className='flex items-center'>
								<Download className='h-4 w-4 mr-2 text-muted-foreground' />
								<span className='text-muted-foreground mr-2'>Downloads:</span>
								<span>{resource.downloadCount}</span>
							</div>

							<div className='flex items-center'>
								<Heart className='h-4 w-4 mr-2 text-muted-foreground' />
								<span className='text-muted-foreground mr-2'>Saved:</span>
								<span>{resource.favoriteCount} times</span>
							</div>

							<div className='flex items-center'>
								<Star className='h-4 w-4 mr-2 text-muted-foreground' />
								<span className='text-muted-foreground mr-2'>Rating:</span>
								<span>
									{resource.rating} ({resource.reviewCount} reviews)
								</span>
							</div>
						</div>

						<Separator />

						<div className='flex items-center justify-between'>
							<span className='text-sm text-muted-foreground'>
								Share this resource:
							</span>
							<div className='flex items-center gap-2'>
								{/* Social sharing buttons would go here */}
								<Button variant='ghost' size='icon' className='h-8 w-8'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										width='16'
										height='16'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
										className='lucide lucide-twitter'
									>
										<path d='M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z' />
									</svg>
								</Button>
								<Button variant='ghost' size='icon' className='h-8 w-8'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										width='16'
										height='16'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
										className='lucide lucide-linkedin'
									>
										<path d='M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' />
										<rect width='4' height='12' x='2' y='9' />
										<circle cx='4' cy='4' r='2' />
									</svg>
								</Button>
								<Button variant='ghost' size='icon' className='h-8 w-8'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										width='16'
										height='16'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
										className='lucide lucide-mail'
									>
										<rect width='20' height='16' x='2' y='4' rx='2' />
										<path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' />
									</svg>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

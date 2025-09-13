'use client';

import { useAuth } from '@/lib/auth';
import { useUserPurchases } from '@/lib/payment-service';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, CreditCard, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { Id } from '@/convex/_generated/dataModel';

export default function PurchasesPage() {
	const { user, isLoading } = useAuth();

	// Fetch user purchases using Convex query (always call the hook to maintain order)
	const purchases = useUserPurchases(user?.id);

	if (isLoading || purchases === undefined) {
		return (
			<div className='container py-10'>
				<div className='flex justify-center items-center min-h-[50vh]'>
					<div className='animate-pulse space-y-4'>
						<div className='h-12 bg-muted rounded w-[300px]'></div>
						<div className='h-64 bg-muted rounded w-[600px]'></div>
					</div>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className='container py-10'>
				<Card>
					<CardHeader>
						<CardTitle>Authentication Required</CardTitle>
						<CardDescription>
							Please log in to view your purchase history.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild>
							<Link href='/sign-in?redirect=/profile/purchases'>Log In</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='container py-10'>
			<h1 className='text-3xl font-bold mb-6'>Purchase History</h1>

			{purchases.length === 0 ? (
				<Card>
					<CardHeader>
						<CardTitle>No Purchases Yet</CardTitle>
						<CardDescription>
							You haven't made any purchases yet. Browse our courses to get
							started.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild>
							<Link href='/courses'>Browse Courses</Link>
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className='space-y-6'>
					{purchases.map(purchase => (
						<Card key={purchase._id}>
							<CardHeader>
								<div className='flex justify-between items-start'>
									<div>
										<CardTitle>Course Purchase</CardTitle>
										<CardDescription>Order ID: {purchase._id}</CardDescription>
									</div>
									<div className='text-right'>
										<div className='font-bold'>
											${purchase.amount.toFixed(2)}
										</div>
										<div className='text-sm text-muted-foreground'>
											{new Date(purchase.createdAt).toLocaleDateString()}
										</div>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									<div className='flex flex-wrap gap-4'>
										<div className='flex items-center text-sm'>
											<CreditCard className='mr-2 h-4 w-4 text-muted-foreground' />
											<span className='capitalize'>{purchase.currency}</span>
										</div>
										<div className='flex items-center text-sm'>
											<Calendar className='mr-2 h-4 w-4 text-muted-foreground' />
											<span>
												Purchased on{' '}
												{new Date(purchase.createdAt).toLocaleDateString()}
											</span>
										</div>
										<div className='flex items-center text-sm'>
											<Clock className='mr-2 h-4 w-4 text-muted-foreground' />
											<span
												className={`capitalize ${purchase.status === 'complete' ? 'text-green-600' : 'text-orange-600'}`}
											>
												{purchase.status}
											</span>
										</div>
									</div>

									<Separator />

									<div className='flex justify-end'>
										<Button asChild>
											<Link href={`/courses/${purchase.courseId}`}>
												Access Course
												<ArrowRight className='ml-2 h-4 w-4' />
											</Link>
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

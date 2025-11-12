'use client';

import { useQuery } from 'convex/react';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { use, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/lib/auth';
import { useCompletePurchase, useCreatePurchase } from '@/lib/payment-service';

export default function CheckoutPage({ params }: { params: Promise<{ courseId: string }> }) {
	const { courseId } = use(params);
	const { user, isLoading: authLoading } = useAuth();
	const router = useRouter();

	// Fetch course data from Convex
	const courseData = useQuery(api.courses.get, { id: courseId as Id<'courses'> });

	// Convex mutations
	const createPurchase = useCreatePurchase();
	const completePurchase = useCompletePurchase();

	const [processing, setProcessing] = useState(false);
	const [purchaseId, setPurchaseId] = useState<string | null>(null);

	// Form state
	const [cardNumber, setCardNumber] = useState('');
	const [cardExpiry, setCardExpiry] = useState('');
	const [cardCvc, setCardCvc] = useState('');
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');

	// Format card number with spaces
	const formatCardNumber = (value: string) => {
		const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
		const matches = v.match(/\d{4,16}/g);
		const match = (matches && matches[0]) || '';
		const parts = [];

		for (let i = 0, len = match.length; i < len; i += 4) {
			parts.push(match.substring(i, i + 4));
		}

		if (parts.length) {
			return parts.join(' ');
		} else {
			return value;
		}
	};

	// Format card expiry date
	const formatExpiry = (value: string) => {
		const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');

		if (v.length >= 3) {
			return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
		}

		return value;
	};

	// Initialize checkout session
	useEffect(() => {
		if (authLoading || courseData === undefined) return;

		// Handle course not found
		if (courseData === null) {
			toast.error('Course not found. The requested course could not be found.');
			router.push('/courses');
			return;
		}

		// Initialize form with user data
		setEmail(user?.email || '');
		setName(user?.name || '');

		// Create purchase record
		const initPurchase = async () => {
			if (purchaseId) return; // Already initialized

			try {
				const newPurchaseId = await createPurchase({
					userId: user!.id as Id<'users'>,
					courseId: courseData._id,
					amount: courseData.price ?? 0,
					status: 'open',
				});
				setPurchaseId(newPurchaseId);
			} catch (_error) {
				toast.error('Failed to initialize checkout. Please try again.');
			}
		};

		initPurchase();
	}, [courseId, user, authLoading, courseData, router, createPurchase, purchaseId]);

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!purchaseId || !courseData) return;

		setProcessing(true);

		try {
			// Simulate payment processing (in production, integrate with Stripe/PayPal)
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Simulate payment success/failure
			const paymentSuccess = Math.random() > 0.1; // 90% success rate

			if (!paymentSuccess) {
				throw new Error('Payment failed. Please try again.');
			}

			// Complete the purchase using Convex
			await completePurchase({ id: purchaseId as Id<'purchases'> });

			// Redirect to success page
			router.push(`/checkout/success?purchase=${purchaseId}`);
		} catch (error: unknown) {
			toast.error((error as Error).message || 'There was an error processing your payment. Please try again.');
			setProcessing(false);
		}
	};

	// Loading state - show skeleton
	if (authLoading || courseData === undefined) {
		return (
			<div className="container py-10">
				<Skeleton className="h-10 w-40 mb-6" />
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="md:col-span-2">
						<Skeleton className="h-96 w-full" />
					</div>
					<div>
						<Skeleton className="h-64 w-full" />
					</div>
				</div>
			</div>
		);
	}

	// Error state - course not found
	if (courseData === null) {
		return null; // Will redirect via useEffect
	}

	return (
		<div className="container py-10">
			<Button variant="ghost" className="mb-6" onClick={() => router.back()}>
				<ArrowLeft className="mr-2 h-4 w-4" />
				Back to Course
			</Button>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div className="md:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl">Checkout</CardTitle>
							<CardDescription>Complete your purchase to gain access to this course</CardDescription>
						</CardHeader>

						<CardContent>
							<Tabs defaultValue="card">
								<TabsList className="mb-6">
									<TabsTrigger value="card">Credit Card</TabsTrigger>
									<TabsTrigger value="paypal" disabled>
										PayPal
									</TabsTrigger>
								</TabsList>

								<TabsContent value="card">
									<form onSubmit={handleSubmit} className="space-y-6">
										<div className="space-y-4">
											<div className="space-y-2">
												<Label htmlFor="name">Cardholder Name</Label>
												<Input
													id="name"
													value={name}
													onChange={e => setName(e.target.value)}
													placeholder="John Smith"
													required
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor="email">Email</Label>
												<Input
													id="email"
													type="email"
													value={email}
													onChange={e => setEmail(e.target.value)}
													placeholder="john@example.com"
													required
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor="cardNumber">Card Number</Label>
												<div className="relative">
													<Input
														id="cardNumber"
														value={cardNumber}
														onChange={e => setCardNumber(formatCardNumber(e.target.value))}
														placeholder="4242 4242 4242 4242"
														maxLength={19}
														required
													/>
													<CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
												</div>
											</div>

											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label htmlFor="expiry">Expiry Date</Label>
													<Input
														id="expiry"
														value={cardExpiry}
														onChange={e => setCardExpiry(formatExpiry(e.target.value))}
														placeholder="MM/YY"
														maxLength={5}
														required
													/>
												</div>

												<div className="space-y-2">
													<Label htmlFor="cvc">CVC</Label>
													<Input
														id="cvc"
														value={cardCvc}
														onChange={e => setCardCvc(e.target.value.replace(/\D/g, ''))}
														placeholder="123"
														maxLength={4}
														required
													/>
												</div>
											</div>
										</div>

										<div className="flex items-center text-sm text-muted-foreground">
											<Lock className="h-4 w-4 mr-2" />
											Your payment information is secure and encrypted
										</div>

										<Button type="submit" className="w-full" size="lg" disabled={processing || !purchaseId}>
											{processing ? 'Processing...' : `Pay $${(courseData.price ?? 0).toFixed(2)}`}
										</Button>
									</form>
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>
				</div>

				<div>
					<Card>
						<CardHeader>
							<CardTitle>Order Summary</CardTitle>
						</CardHeader>

						<CardContent className="space-y-4">
							<div className="flex gap-4">
								<Image
									src={courseData.thumbnailUrl || '/placeholder.svg'}
									alt={courseData.title}
									width={80}
									height={80}
									className="w-20 h-20 object-cover rounded-md"
								/>
								<div>
									<h3 className="font-medium">{courseData.title}</h3>
									<p className="text-sm text-muted-foreground">By Instructor</p>
								</div>
							</div>

							<Separator />

							<div className="space-y-2">
								<div className="flex justify-between">
									<span>Course Price</span>
									<span>${(courseData.price ?? 0).toFixed(2)}</span>
								</div>

								<div className="flex justify-between font-medium">
									<span>Total</span>
									<span>${(courseData.price ?? 0).toFixed(2)}</span>
								</div>
							</div>
						</CardContent>

						<CardFooter className="bg-muted/50 text-sm">
							<p>By completing your purchase, you agree to our Terms of Service and Privacy Policy.</p>
						</CardFooter>
					</Card>
				</div>
			</div>
		</div>
	);
}

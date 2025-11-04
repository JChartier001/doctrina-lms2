'use client';

import { format } from 'date-fns';
import dayjs from 'dayjs';
import { CalendarIcon, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { CourseData } from '@/app/instructor/courses/wizard/page';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PricingStepProps {
	courseData: CourseData;
	updateCourseData: (data: Partial<CourseData>) => void;
}

export function PricingStep({ courseData, updateCourseData }: PricingStepProps) {
	const [pricingModel, setPricingModel] = useState('one-time');
	const [price, setPrice] = useState(courseData.price || '99.99');

	const [earlyBirdEnabled, setEarlyBirdEnabled] = useState(false);
	const [earlyBirdPrice, setEarlyBirdPrice] = useState('79.99');
	const [earlyBirdEndDate, setEarlyBirdEndDate] = useState<Date | undefined>(undefined);

	useEffect(() => {
		const t = setTimeout(() => {
			setEarlyBirdEndDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
		}, 0);
		return () => clearTimeout(t);
	}, []);
	const [couponEnabled, setCouponEnabled] = useState(false);
	const [couponCode, setCouponCode] = useState('');
	const [couponDiscount, setCouponDiscount] = useState('20');
	const platformFeePercentage = 15; // 15% platform fee

	// Generate random coupon code
	const generateCouponCode = () => {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let result = '';
		for (let i = 0; i < 8; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		setCouponCode(result);
	};

	// Calculate instructor earnings
	const calculateEarnings = (coursePrice: number) => {
		const platformFee = (coursePrice * platformFeePercentage) / 100;
		return coursePrice - platformFee;
	};

	// Update course price
	useEffect(() => {
		updateCourseData({ price });
	}, [price, updateCourseData]);

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold mb-4">Course Pricing</h2>
				<p className="text-muted-foreground mb-6">
					Set your course pricing model, price, and optional promotional offers.
				</p>
			</div>

			<Tabs defaultValue="pricing" className="w-full">
				<TabsList className="mb-4">
					<TabsTrigger value="pricing">Pricing Options</TabsTrigger>
					<TabsTrigger value="promotions">Promotions</TabsTrigger>
					<TabsTrigger value="revenue">Revenue Calculator</TabsTrigger>
				</TabsList>

				<TabsContent value="pricing" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Pricing Model</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div
									className={`border rounded-lg p-4 cursor-pointer ${
										pricingModel === 'one-time' ? 'border-primary bg-primary/5' : ''
									}`}
									onClick={() => setPricingModel('one-time')}
								>
									<h3 className="font-medium mb-2">One-time Payment</h3>
									<p className="text-sm text-muted-foreground">Students pay once for lifetime access to your course.</p>
								</div>
								<div
									className={`border rounded-lg p-4 cursor-pointer ${
										pricingModel === 'subscription' ? 'border-primary bg-primary/5' : ''
									}`}
									onClick={() => setPricingModel('subscription')}
								>
									<h3 className="font-medium mb-2">Subscription</h3>
									<p className="text-sm text-muted-foreground">
										Students pay a recurring fee for access to your course.
									</p>
								</div>
								<div
									className={`border rounded-lg p-4 cursor-pointer ${
										pricingModel === 'free' ? 'border-primary bg-primary/5' : ''
									}`}
									onClick={() => setPricingModel('free')}
								>
									<h3 className="font-medium mb-2">Free</h3>
									<p className="text-sm text-muted-foreground">Offer your course for free to all students.</p>
								</div>
							</div>

							{pricingModel !== 'free' && (
								<div className="space-y-4 pt-4">
									<div className="space-y-2">
										<Label htmlFor="price">Course Price ($USD)</Label>
										<div className="relative">
											<span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
											<Input
												id="price"
												type="number"
												min="0"
												step="0.01"
												value={price}
												onChange={e => setPrice(e.target.value)}
												className="pl-8"
											/>
										</div>
										<p className="text-xs text-muted-foreground">
											Set a competitive price based on your course content, length, and value.
										</p>
									</div>

									{pricingModel === 'subscription' && (
										<div className="space-y-2">
											<Label htmlFor="billingCycle">Billing Cycle</Label>
											<Select defaultValue="monthly">
												<SelectTrigger id="billingCycle">
													<SelectValue placeholder="Select billing cycle" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="monthly">Monthly</SelectItem>
													<SelectItem value="quarterly">Quarterly</SelectItem>
													<SelectItem value="annually">Annually</SelectItem>
												</SelectContent>
											</Select>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="promotions" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Early Bird Pricing</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="earlyBirdToggle">Enable Early Bird Pricing</Label>
									<p className="text-sm text-muted-foreground">
										Offer a special discounted price for early enrollments
									</p>
								</div>
								<Switch id="earlyBirdToggle" checked={earlyBirdEnabled} onCheckedChange={setEarlyBirdEnabled} />
							</div>

							{earlyBirdEnabled && (
								<div className="space-y-4 pt-2">
									<div className="space-y-2">
										<Label htmlFor="earlyBirdPrice">Early Bird Price ($USD)</Label>
										<div className="relative">
											<span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
											<Input
												id="earlyBirdPrice"
												type="number"
												min="0"
												step="0.01"
												value={earlyBirdPrice}
												onChange={e => setEarlyBirdPrice(e.target.value)}
												className="pl-8"
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="earlyBirdEndDate">Early Bird End Date</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className="w-full justify-start text-left font-normal"
													id="earlyBirdEndDate"
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{earlyBirdEndDate ? format(earlyBirdEndDate, 'PPP') : <span>Pick a date</span>}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0">
												<Calendar
													selected={earlyBirdEndDate ? dayjs(earlyBirdEndDate) : undefined}
													onSelect={date => setEarlyBirdEndDate(date ? date.toDate() : undefined)}
												/>
											</PopoverContent>
										</Popover>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Coupon Codes</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="couponToggle">Enable Coupon Code</Label>
									<p className="text-sm text-muted-foreground">Create a coupon code for special promotions</p>
								</div>
								<Switch id="couponToggle" checked={couponEnabled} onCheckedChange={setCouponEnabled} />
							</div>

							{couponEnabled && (
								<div className="space-y-4 pt-2">
									<div className="space-y-2">
										<Label htmlFor="couponCode">Coupon Code</Label>
										<div className="flex gap-2">
											<Input
												id="couponCode"
												value={couponCode}
												onChange={e => setCouponCode(e.target.value.toUpperCase())}
												className="uppercase"
												placeholder="e.g., WELCOME20"
											/>
											<Button variant="outline" size="icon" onClick={generateCouponCode} title="Generate random code">
												<RefreshCw className="h-4 w-4" />
											</Button>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="couponDiscount">Discount Percentage (%)</Label>
										<div className="relative">
											<Input
												id="couponDiscount"
												type="number"
												min="1"
												max="100"
												value={couponDiscount}
												onChange={e => setCouponDiscount(e.target.value)}
												className="pr-8"
											/>
											<span className="absolute right-3 top-1/2 -translate-y-1/2">%</span>
										</div>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="revenue" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Revenue Calculator</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>Course Price</Label>
										<div className="text-2xl font-bold">${Number.parseFloat(price).toFixed(2)}</div>
									</div>
									<div className="space-y-2">
										<Label>Platform Fee ({platformFeePercentage}%)</Label>
										<div className="text-2xl font-bold text-destructive">
											-$
											{((Number.parseFloat(price) * platformFeePercentage) / 100).toFixed(2)}
										</div>
									</div>
								</div>

								<div className="border-t pt-4">
									<div className="space-y-2">
										<Label>Your Earnings Per Sale</Label>
										<div className="text-3xl font-bold text-green-600">
											${calculateEarnings(Number.parseFloat(price)).toFixed(2)}
										</div>
									</div>
								</div>

								{earlyBirdEnabled && (
									<div className="border-t pt-4">
										<h3 className="font-medium mb-2">Early Bird Pricing</h3>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label>Early Bird Price</Label>
												<div className="text-xl font-bold">${Number.parseFloat(earlyBirdPrice).toFixed(2)}</div>
											</div>
											<div className="space-y-2">
												<Label>Your Earnings</Label>
												<div className="text-xl font-bold text-green-600">
													${calculateEarnings(Number.parseFloat(earlyBirdPrice)).toFixed(2)}
												</div>
											</div>
										</div>
									</div>
								)}

								{couponEnabled && (
									<div className="border-t pt-4">
										<h3 className="font-medium mb-2">With Coupon Applied</h3>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label>Discounted Price</Label>
												<div className="text-xl font-bold">
													${(Number.parseFloat(price) * (1 - Number.parseInt(couponDiscount) / 100)).toFixed(2)}
												</div>
											</div>
											<div className="space-y-2">
												<Label>Your Earnings</Label>
												<div className="text-xl font-bold text-green-600">
													$
													{calculateEarnings(
														Number.parseFloat(price) * (1 - Number.parseInt(couponDiscount) / 100),
													).toFixed(2)}
												</div>
											</div>
										</div>
									</div>
								)}
							</div>

							<div className="bg-muted p-4 rounded-lg mt-4">
								<h3 className="font-medium mb-2">Potential Monthly Revenue</h3>
								<div className="grid grid-cols-3 gap-4">
									<div className="space-y-1 text-center">
										<div className="text-xl font-bold">
											${(calculateEarnings(Number.parseFloat(price)) * 10).toFixed(2)}
										</div>
										<p className="text-xs text-muted-foreground">10 sales</p>
									</div>
									<div className="space-y-1 text-center">
										<div className="text-xl font-bold">
											${(calculateEarnings(Number.parseFloat(price)) * 50).toFixed(2)}
										</div>
										<p className="text-xs text-muted-foreground">50 sales</p>
									</div>
									<div className="space-y-1 text-center">
										<div className="text-xl font-bold">
											${(calculateEarnings(Number.parseFloat(price)) * 100).toFixed(2)}
										</div>
										<p className="text-xs text-muted-foreground">100 sales</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}

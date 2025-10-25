'use client';

import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';

export default function InstructorVerificationPage() {
	const [licenseNumber, setLicenseNumber] = useState('');
	const [licenseState, setLicenseState] = useState('');
	const [licenseExpiry, setLicenseExpiry] = useState('');
	const [licenseFile, setLicenseFile] = useState<File | null>(null);
	const [idFile, setIdFile] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useAuth();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		// In a real app, this would upload the files and submit the verification request
		setTimeout(() => {
			toast.success('Verification submitted. Your verification documents have been submitted for review.');
			router.push('/instructor/dashboard');
			setIsLoading(false);
		}, 2000);
	};

	if (!user) {
		router.push('/sign-in');
		return null;
	}

	return (
		<div className="container py-10">
			<h1 className="text-3xl font-bold mb-6">Instructor Verification</h1>

			<Card>
				<CardHeader>
					<CardTitle>Complete Your Verification</CardTitle>
					<CardDescription>Please provide your medical license and government ID for verification</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="license" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="license">Medical License</TabsTrigger>
							<TabsTrigger value="id">Government ID</TabsTrigger>
						</TabsList>

						<form onSubmit={handleSubmit}>
							<TabsContent value="license" className="space-y-4 mt-4">
								<div className="space-y-2">
									<Label htmlFor="licenseNumber">License Number</Label>
									<Input
										id="licenseNumber"
										value={licenseNumber}
										onChange={e => setLicenseNumber(e.target.value)}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="licenseState">State/Province/Region</Label>
									<Input
										id="licenseState"
										value={licenseState}
										onChange={e => setLicenseState(e.target.value)}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="licenseExpiry">Expiration Date</Label>
									<Input
										id="licenseExpiry"
										type="date"
										value={licenseExpiry}
										onChange={e => setLicenseExpiry(e.target.value)}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="licenseFile">Upload License Document</Label>
									<Input
										id="licenseFile"
										type="file"
										accept=".pdf,.jpg,.jpeg,.png"
										onChange={e => {
											if (e.target.files && e.target.files[0]) {
												setLicenseFile(e.target.files[0]);
											}
										}}
										required
									/>
									<p className="text-sm text-muted-foreground">
										Please upload a clear, legible copy of your medical license
									</p>
								</div>
							</TabsContent>

							<TabsContent value="id" className="space-y-4 mt-4">
								<div className="space-y-2">
									<Label htmlFor="idFile">Upload Government ID</Label>
									<Input
										id="idFile"
										type="file"
										accept=".pdf,.jpg,.jpeg,.png"
										onChange={e => {
											if (e.target.files && e.target.files[0]) {
												setIdFile(e.target.files[0]);
											}
										}}
										required
									/>
									<p className="text-sm text-muted-foreground">
										Please upload a clear, legible copy of your government-issued ID (passport, driver's license, etc.)
									</p>
								</div>

								<div className="rounded-md bg-muted p-4 mt-4">
									<div className="flex items-center gap-3">
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
											className="h-5 w-5 text-primary"
										>
											<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
											<path d="m9 12 2 2 4-4" />
										</svg>
										<div>
											<h4 className="text-sm font-medium">Privacy Protection</h4>
											<p className="text-sm text-muted-foreground">
												Your documents are securely stored and only used for verification purposes.
											</p>
										</div>
									</div>
								</div>
							</TabsContent>

							<Separator className="my-6" />

							<div className="flex justify-end">
								<Button type="submit" disabled={isLoading}>
									{isLoading ? 'Submitting...' : 'Submit for Verification'}
								</Button>
							</div>
						</form>
					</Tabs>
				</CardContent>
				<CardFooter className="flex justify-between">
					<p className="text-sm text-muted-foreground">Verification typically takes 1-2 business days</p>
				</CardFooter>
			</Card>
		</div>
	);
}

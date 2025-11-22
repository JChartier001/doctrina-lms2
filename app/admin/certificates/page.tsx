'use client';

import { useMutation, useQuery } from 'convex/react';
import { Eye, MoreHorizontal, Search, Trash } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { CertificateDisplay } from '@/components/certificate-display';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/lib/auth';

export default function AdminCertificatesPage() {
	const { user, isLoading } = useAuth();

	// Convex queries for certificates and templates
	const certificates = useQuery(api.certificates.listAll);
	const templates = useQuery(api.certificates.listTemplates);

	// Convex mutation for removing certificates
	const removeCertificateMutation = useMutation(api.certificates.remove);

	// UI state only
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCertificate, setSelectedCertificate] = useState<NonNullable<typeof certificates>[number] | null>(null);

	// Derived state: filter certificates based on search query
	const filteredCertificates = useMemo(() => {
		if (!certificates) return [];

		const query = searchQuery.trim().toLowerCase();
		if (query === '') return certificates;

		return certificates.filter(
			cert =>
				cert.userName.toLowerCase().includes(query) ||
				cert.courseName.toLowerCase().includes(query) ||
				cert.verificationCode.toLowerCase().includes(query),
		);
	}, [certificates, searchQuery]);

	const handleDeleteCertificate = async (certId: Id<'certificates'>) => {
		try {
			await removeCertificateMutation({ id: certId });
			toast.success('Certificate Deleted. The certificate has been deleted successfully.');
		} catch (error) {
			console.error('Failed to delete certificate:', error);
			toast.error('Failed to delete the certificate. Please try again.');
		}
	};

	if (isLoading || !user || !user.isAdmin) {
		return null;
	}

	// Show loading skeleton while data is being fetched
	if (certificates === undefined || templates === undefined) {
		return (
			<div className="container py-10">
				<h1 className="text-3xl font-bold mb-6">Certificate Management</h1>
				<div className="space-y-4">
					<Skeleton className="h-10 w-full max-w-sm" />
					<Skeleton className="h-[400px] w-full" />
				</div>
			</div>
		);
	}

	return (
		<div className="container py-10">
			<h1 className="text-3xl font-bold mb-6">Certificate Management</h1>

			<div className="flex items-center justify-between mb-6">
				<div className="relative w-full max-w-sm">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search certificates..."
						className="pl-8"
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			<Card className="mb-8">
				<CardHeader>
					<CardTitle>All Certificates</CardTitle>
					<CardDescription>Manage all certificates issued on the platform</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Certificate ID</TableHead>
								<TableHead>Student</TableHead>
								<TableHead>Course</TableHead>
								<TableHead>Issue Date</TableHead>
								<TableHead>Verification Code</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredCertificates.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-4">
										No certificates found
									</TableCell>
								</TableRow>
							) : (
								filteredCertificates.map(cert => (
									<TableRow key={cert._id}>
										<TableCell className="font-mono text-xs">{cert._id}</TableCell>
										<TableCell>{cert.userName}</TableCell>
										<TableCell>{cert.courseName}</TableCell>
										<TableCell>{new Date(cert.issueDate).toLocaleDateString()}</TableCell>
										<TableCell className="font-mono text-xs">{cert.verificationCode}</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon">
														<MoreHorizontal className="h-4 w-4" />
														<span className="sr-only">Actions</span>
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuLabel>Actions</DropdownMenuLabel>
													<DropdownMenuSeparator />
													<Dialog>
														<DialogTrigger asChild>
															<DropdownMenuItem
																onSelect={e => {
																	e.preventDefault();
																	setSelectedCertificate(cert);
																}}
															>
																<Eye className="mr-2 h-4 w-4" />
																View Certificate
															</DropdownMenuItem>
														</DialogTrigger>
														<DialogContent className="max-w-4xl">
															<DialogHeader>
																<DialogTitle>Certificate Preview</DialogTitle>
																<DialogDescription>
																	{cert.courseName} - {cert.userName}
																</DialogDescription>
															</DialogHeader>
															{selectedCertificate && (
																<CertificateDisplay certificate={selectedCertificate} showControls={false} />
															)}
														</DialogContent>
													</Dialog>
													<DropdownMenuItem
														className="text-red-600"
														onSelect={e => {
															e.preventDefault();
															handleDeleteCertificate(cert._id);
														}}
													>
														<Trash className="mr-2 h-4 w-4" />
														Delete Certificate
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Certificate Templates</CardTitle>
					<CardDescription>Manage certificate templates used for different course types</CardDescription>
				</CardHeader>
				<CardContent>
					{templates.length === 0 ? (
						<p className="text-muted-foreground text-center py-8">No templates available</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{templates.map(template => (
								<Card key={template.id} className="overflow-hidden">
									<div
										className="aspect-[1.414/1] bg-cover bg-center bg-muted"
										style={{
											backgroundImage: `url(${template.previewUrl})`,
										}}
									></div>
									<CardContent className="p-4">
										<h3 className="font-medium">{template.name}</h3>
										<p className="text-sm text-muted-foreground">{template.description}</p>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

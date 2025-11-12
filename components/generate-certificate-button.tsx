'use client';

import { Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/lib/auth';
import { useGenerateCertificate } from '@/lib/certificate-service';

interface GenerateCertificateButtonProps {
	courseId: string;
	courseName: string;
	instructorId: string;
	instructorName: string;
	disabled?: boolean;
	onSuccess?: () => void;
}

export function GenerateCertificateButton({
	courseId,
	courseName,
	instructorId,
	instructorName,
	disabled = false,
	onSuccess,
}: GenerateCertificateButtonProps) {
	const { user } = useAuth();
	const router = useRouter();
	const [isGenerating, setIsGenerating] = useState(false);

	const generateCertificateMutation = useGenerateCertificate();

	const handleGenerateCertificate = async () => {
		setIsGenerating(true);

		try {
			// Generate certificate using Convex mutation
			const certificateId = await generateCertificateMutation({
				userId: user.id as Id<'users'>,
				userName: user.name,
				courseId: courseId as Id<'courses'>,
				courseName,
				instructorId: instructorId as Id<'users'>,
				instructorName,
				templateId: 'template-1', // Default template
			});

			toast.success('Certificate Generated. Your certificate has been generated successfully.');

			// Navigate to certificate view
			router.push(`/profile/certificates?certId=${certificateId}`);

			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			console.error('Error generating certificate:', error);
			toast.error('There was an error generating your certificate. Please try again.');
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<Button onClick={handleGenerateCertificate} disabled={disabled || isGenerating} className="flex items-center">
			<Award className="mr-2 h-4 w-4" />
			{isGenerating ? 'Generating Certificate...' : 'Generate Certificate'}
		</Button>
	);
}

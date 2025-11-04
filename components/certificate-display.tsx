'use client';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, Share2 } from 'lucide-react';
import Image from 'next/image';
import { QRCodeCanvas } from 'qrcode.react';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { type Certificate } from '@/lib/certificate-service';

interface CertificateDisplayProps {
	certificate: Certificate;
	showControls?: boolean;
}

export function CertificateDisplay({ certificate, showControls = true }: CertificateDisplayProps) {
	const certificateRef = useRef<HTMLDivElement>(null);
	const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

	// TODO: Get template from Convex
	const template = {
		id: certificate.templateId,
		name: 'Standard Certificate',
		description: 'Standard certificate for course completion',
		imageUrl: '/placeholder.svg?height=600&width=800',
		primaryColor: '#4f46e5',
		secondaryColor: '#818cf8',
	};

	const downloadAsPDF = async () => {
		if (!certificateRef.current) return;

		setIsGeneratingPDF(true);

		try {
			const canvas = await html2canvas(certificateRef.current, {
				scale: 2,
				logging: false,
				useCORS: true,
			});

			const imgData = canvas.toDataURL('image/jpeg', 1.0);
			const pdf = new jsPDF({
				orientation: 'landscape',
				unit: 'mm',
			});

			const imgWidth = 297;
			const imgHeight = (canvas.height * imgWidth) / canvas.width;

			pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
			pdf.save(`${certificate.courseName.replace(/\s+/g, '_')}_Certificate.pdf`);

			toast.success('Certificate downloaded. Your certificate has been downloaded successfully.');
		} catch (error) {
			console.error('Error generating PDF:', error);
			toast.error('Download failed. There was an error downloading your certificate. Please try again.');
		} finally {
			setIsGeneratingPDF(false);
		}
	};

	const shareCertificate = () => {
		const verificationUrl = `${window.location.origin}/certificates/verify?code=${certificate.verificationCode}`;

		if (navigator.share) {
			navigator
				.share({
					title: `${certificate.courseName} Certificate`,
					text: `Check out my certificate for completing ${certificate.courseName}`,
					url: verificationUrl,
				})
				.then(() => {
					toast.success('Certificate shared. Your certificate has been shared successfully.');
				})
				.catch(error => {
					console.error('Error sharing:', error);
				});
		} else {
			navigator.clipboard.writeText(verificationUrl).then(() => {
				toast.success('Link copied. Verification link copied to clipboard.');
			});
		}
	};

	const verificationUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/certificates/verify?code=${certificate.verificationCode}`;

	return (
		<div className="flex flex-col items-center">
			<div
				ref={certificateRef}
				className="relative w-full max-w-3xl aspect-[1.414/1] bg-white border rounded-lg overflow-hidden shadow-lg"
				style={{
					backgroundImage: template
						? `linear-gradient(135deg, ${template.primaryColor}22, ${template.secondaryColor}22)`
						: undefined,
				}}
			>
				{/* Certificate Border */}
				<div
					className="absolute inset-4 border-4 border-double rounded-lg"
					style={{ borderColor: template?.primaryColor || '#4f46e5' }}
				></div>

				{/* Certificate Content */}
				<div className="flex flex-col items-center justify-between h-full p-8 text-center">
					{/* Header */}
					<div className="w-full">
						<div className="flex justify-center mb-2">
							<Image src="/placeholder.svg?height=60&width=200" alt="Doctrina Logo" className="h-12" />
						</div>
						<h2 className="text-xl font-semibold text-gray-600">CERTIFICATE OF COMPLETION</h2>
					</div>

					{/* Body */}
					<div className="flex flex-col items-center justify-center flex-grow py-4">
						<p className="text-gray-600 mb-2">This is to certify that</p>
						<h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: template?.primaryColor || '#4f46e5' }}>
							{certificate.userName}
						</h1>
						<p className="text-gray-600 mb-4">has successfully completed the course</p>
						<h2 className="text-2xl sm:text-3xl font-semibold mb-4">{certificate.courseName}</h2>
						<p className="text-gray-600">
							Issued on{' '}
							{new Date(certificate.issueDate).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})}
						</p>
					</div>

					{/* Footer */}
					<div className="w-full flex flex-col sm:flex-row justify-between items-center">
						{/* Instructor Signature */}
						<div className="text-center sm:text-left mb-4 sm:mb-0">
							<Image src="/placeholder.svg?height=40&width=150" alt="Instructor Signature" className="h-10 mb-1" />
							<p className="text-sm font-medium">{certificate.instructorName}</p>
							<p className="text-xs text-gray-500">Instructor</p>
						</div>

						{/* QR Code */}
						<div className="text-center">
							<div className="bg-white p-1 rounded-md inline-block mb-1">
								<QRCodeCanvas value={verificationUrl} size={80} level="H" />
							</div>
							<p className="text-xs text-gray-500">Verification Code</p>
							<p className="text-xs font-mono">{certificate.verificationCode}</p>
						</div>
					</div>
				</div>
			</div>

			{showControls && (
				<Card className="w-full max-w-3xl mt-4 p-4 flex justify-center space-x-4">
					<Button onClick={downloadAsPDF} disabled={isGeneratingPDF} className="flex items-center">
						<Download className="mr-2 h-4 w-4" />
						{isGeneratingPDF ? 'Generating PDF...' : 'Download Certificate'}
					</Button>
					<Button variant="outline" onClick={shareCertificate} className="flex items-center">
						<Share2 className="mr-2 h-4 w-4" />
						Share Certificate
					</Button>
				</Card>
			)}
		</div>
	);
}

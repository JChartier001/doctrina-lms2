'use client';

import { CheckCircle, Search, XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useEffectEvent, useState } from 'react';

import { CertificateDisplay } from '@/components/certificate-display';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { type Certificate, verifyCertificate } from '@/lib/certificate-service';

export default function VerifyCertificatePage() {
	const searchParams = useSearchParams();
	const codeFromUrl = searchParams.get('code');

	const [verificationCode, setVerificationCode] = useState(codeFromUrl || '');
	const [certificate, setCertificate] = useState<Certificate | null>(null);
	const [isVerified, setIsVerified] = useState<boolean | null>(null);
	const [isVerifying, setIsVerifying] = useState(false);

	// Regular function for button onClick
	const handleVerify = () => {
		if (!verificationCode.trim()) return;

		setIsVerifying(true);

		// Simulate API call delay
		setTimeout(() => {
			const result = verifyCertificate(verificationCode);

			if (result) {
				setCertificate(result);
				setIsVerified(true);
			} else {
				setCertificate(null);
				setIsVerified(false);
			}

			setIsVerifying(false);
		}, 1000);
	};

	// Effect Event for auto-verification
	const performAutoVerify = useEffectEvent(() => {
		if (!verificationCode.trim()) return;

		setIsVerifying(true);

		setTimeout(() => {
			const result = verifyCertificate(verificationCode);

			if (result) {
				setCertificate(result);
				setIsVerified(true);
			} else {
				setCertificate(null);
				setIsVerified(false);
			}

			setIsVerifying(false);
		}, 1000);
	});

	useEffect(() => {
		if (codeFromUrl) {
			performAutoVerify();
		}
	}, [codeFromUrl, performAutoVerify]);

	return (
		<div className="container py-10">
			<div className="max-w-3xl mx-auto">
				<h1 className="text-3xl font-bold mb-6 text-center">Certificate Verification</h1>

				<Card className="mb-8">
					<CardHeader>
						<CardTitle>Verify a Certificate</CardTitle>
						<CardDescription>
							Enter the verification code from the certificate to verify its authenticity.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex gap-2">
							<Input
								placeholder="Enter verification code (e.g., DOCTRINA-ABC123)"
								value={verificationCode}
								onChange={e => setVerificationCode(e.target.value)}
								className="flex-1"
							/>
							<Button onClick={handleVerify} disabled={isVerifying}>
								{isVerifying ? (
									'Verifying...'
								) : (
									<>
										<Search className="mr-2 h-4 w-4" />
										Verify
									</>
								)}
							</Button>
						</div>

						{isVerified !== null && (
							<div className={`mt-4 p-4 rounded-lg ${isVerified ? 'bg-green-50' : 'bg-red-50'}`}>
								{isVerified ? (
									<div className="flex items-center text-green-700">
										<CheckCircle className="h-5 w-5 mr-2" />
										<span>Certificate verified successfully!</span>
									</div>
								) : (
									<div className="flex items-center text-red-700">
										<XCircle className="h-5 w-5 mr-2" />
										<span>Invalid certificate. This certificate could not be verified.</span>
									</div>
								)}
							</div>
						)}
					</CardContent>
				</Card>

				{certificate && isVerified && (
					<div className="mb-8">
						<h2 className="text-2xl font-bold mb-4">Certificate Details</h2>
						<CertificateDisplay certificate={certificate} showControls={false} />
					</div>
				)}

				<Card>
					<CardHeader>
						<CardTitle>About Certificate Verification</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="mb-4">
							Doctrina certificates include a unique verification code and QR code that can be used to verify the
							authenticity of the certificate.
						</p>
						<p className="mb-4">To verify a certificate:</p>
						<ol className="list-decimal list-inside space-y-2 mb-4">
							<li>Enter the verification code found on the certificate</li>
							<li>Or scan the QR code on the certificate using your phone</li>
							<li>The system will check if the certificate is valid and display the results</li>
						</ol>
						<p>If you have any questions about certificate verification, please contact our support team.</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

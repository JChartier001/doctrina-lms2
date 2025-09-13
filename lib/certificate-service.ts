import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

// Certificate types - now using Convex types
export interface Certificate {
	_id: Id<'certificates'>;
	_creationTime: number;
	userId: Id<'users'>;
	userName: string;
	courseId: Id<'courses'>;
	courseName: string;
	instructorId: Id<'users'>;
	instructorName: string;
	issueDate: string;
	expiryDate?: string;
	verificationCode: string;
	templateId: string;
}

// Certificate template types (keeping as static data since templates are UI-related)
export interface CertificateTemplate {
	id: string;
	name: string;
	description: string;
	imageUrl: string;
	primaryColor: string;
	secondaryColor: string;
	badgeUrl?: string;
}

// Certificate templates (static UI data)
const certificateTemplates: CertificateTemplate[] = [
	{
		id: 'template-1',
		name: 'Standard Certificate',
		description: 'Standard certificate for course completion',
		imageUrl: '/placeholder.svg?height=600&width=800',
		primaryColor: '#4f46e5',
		secondaryColor: '#818cf8',
	},
	{
		id: 'template-2',
		name: 'Advanced Certificate',
		description: 'Certificate for advanced course completion',
		imageUrl: '/placeholder.svg?height=600&width=800',
		primaryColor: '#0891b2',
		secondaryColor: '#22d3ee',
		badgeUrl: '/placeholder.svg?height=100&width=100',
	},
	{
		id: 'template-3',
		name: 'Specialist Certificate',
		description: 'Certificate for specialist course completion',
		imageUrl: '/placeholder.svg?height=600&width=800',
		primaryColor: '#7c3aed',
		secondaryColor: '#a78bfa',
		badgeUrl: '/placeholder.svg?height=100&width=100',
	},
];

// React hooks for Convex integration

// Get all certificates for a user
export function useUserCertificates(userId: Id<'users'>) {
	return useQuery(api.certificates.listForUser, { userId });
}

// Get a specific certificate by ID
export function useCertificate(certId: Id<'certificates'>) {
	return useQuery(api.certificates.get, { id: certId });
}

// Verify a certificate by verification code
export function useVerifyCertificate(code: string) {
	return useQuery(api.certificates.verify, { code });
}

// Generate a new certificate mutation
export function useGenerateCertificate() {
	return useMutation(api.certificates.generate);
}

// Delete a certificate mutation
export function useRemoveCertificate() {
	return useMutation(api.certificates.remove);
}

// Legacy functions for backward compatibility (deprecated - use hooks instead)

// Get all certificates for a user
export function getUserCertificates(userId: string): Certificate[] {
	// This function is deprecated - use useUserCertificates hook instead
	console.warn(
		'getUserCertificates is deprecated. Use useUserCertificates hook instead.'
	);
	return [];
}

// Get a specific certificate by ID
export function getCertificateById(certId: string): Certificate | undefined {
	// This function is deprecated - use useCertificate hook instead
	console.warn(
		'getCertificateById is deprecated. Use useCertificate hook instead.'
	);
	return undefined;
}

// Verify a certificate by verification code
export function verifyCertificate(
	verificationCode: string
): Certificate | undefined {
	// This function is deprecated - use useVerifyCertificate hook instead
	console.warn(
		'verifyCertificate is deprecated. Use useVerifyCertificate hook instead.'
	);
	return undefined;
}

// Generate a new certificate (deprecated - use mutation hook)
export function generateCertificate(
	userId: string,
	userName: string,
	courseId: string,
	courseName: string,
	instructorId: string,
	instructorName: string,
	templateId = 'template-1'
): Certificate {
	// This function is deprecated - use useGenerateCertificate mutation hook instead
	console.warn(
		'generateCertificate is deprecated. Use useGenerateCertificate mutation hook instead.'
	);
	throw new Error(
		'This function is deprecated. Use the Convex mutation hook instead.'
	);
}

// Get a certificate template
export function getCertificateTemplate(
	templateId: string
): CertificateTemplate | undefined {
	return certificateTemplates.find(template => template.id === templateId);
}

// Get all certificate templates
export function getAllCertificateTemplates(): CertificateTemplate[] {
	return certificateTemplates;
}

// Delete a certificate (deprecated - use mutation hook)
export function deleteCertificate(certId: string): boolean {
	// This function is deprecated - use useRemoveCertificate mutation hook instead
	console.warn(
		'deleteCertificate is deprecated. Use useRemoveCertificate mutation hook instead.'
	);
	throw new Error(
		'This function is deprecated. Use the Convex mutation hook instead.'
	);
}

// Check if a user has a certificate for a specific course (deprecated - use query)
export function userHasCertificate(userId: string, courseId: string): boolean {
	// This function is deprecated - check certificates from useUserCertificates hook instead
	console.warn(
		'userHasCertificate is deprecated. Check certificates from useUserCertificates hook instead.'
	);
	return false;
}

import { useMutation, useQuery } from 'convex/react';

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
const _certificateTemplates: CertificateTemplate[] = [
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

import type { Metadata } from 'next';

import { ResourceDetailPageClient } from './client';

interface ResourceDetailPageProps {
	id: string;
}

export async function generateMetadata(): Promise<Metadata> {
	// For now, return generic metadata since we can't use Convex hooks during SSR
	return {
		title: 'Resource | Doctrina Resource Library',
		description: 'View detailed resource information and download materials.',
	};
}

export default async function ResourceDetailPage({ params }: { params: Promise<ResourceDetailPageProps> }) {
	const { id } = await params;
	return <ResourceDetailPageClient resourceId={id} />;
}

import type { Metadata } from 'next';

import { ResourceDetailPageClient } from './client';

interface ResourceDetailPageProps {
	params: {
		id: string;
	};
}

export async function generateMetadata({ params: _params }: ResourceDetailPageProps): Promise<Metadata> {
	// For now, return generic metadata since we can't use Convex hooks during SSR
	return {
		title: 'Resource | Doctrina Resource Library',
		description: 'View detailed resource information and download materials.',
	};
}

export default function ResourceDetailPage({ params: _params }: ResourceDetailPageProps) {
	return <ResourceDetailPageClient resourceId={params.id} />;
}

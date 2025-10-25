import { ConvexReactClient } from 'convex/react';

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) {
	console.warn('NEXT_PUBLIC_CONVEX_URL is not set. Convex client will fail to connect.');
}

export const convex = new ConvexReactClient(url || '');

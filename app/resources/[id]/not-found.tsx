import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function ResourceNotFound() {
	return (
		<div className="container py-16 flex flex-col items-center justify-center text-center">
			<h1 className="text-4xl font-bold mb-4">Resource Not Found</h1>
			<p className="text-muted-foreground mb-8 max-w-md">
				The resource you are looking for does not exist or may have been removed.
			</p>
			<Button asChild>
				<Link href="/resources">Return to Resource Library</Link>
			</Button>
		</div>
	);
}

'use client';

import { ArrowRight, Book, Clipboard, FileSpreadsheet, FileText, PenToolIcon as Tool, Video } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getResourceTypeDisplayName, type ResourceType, useResourceTypes } from '@/lib/resource-library-service';

export function ResourceTypeList() {
	const { data: resourceTypes, isLoading } = useResourceTypes();

	const getTypeIcon = (type: ResourceType) => {
		switch (type) {
			case 'pdf':
				return <FileText className="h-5 w-5" />;
			case 'video':
				return <Video className="h-5 w-5" />;
			case 'article':
				return <FileText className="h-5 w-5" />;
			case 'tool':
				return <Tool className="h-5 w-5" />;
			case 'template':
				return <Clipboard className="h-5 w-5" />;
			case 'guide':
				return <Book className="h-5 w-5" />;
			case 'research':
				return <FileSpreadsheet className="h-5 w-5" />;
			case 'case-study':
				return <Clipboard className="h-5 w-5" />;
			default:
				return <FileText className="h-5 w-5" />;
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<h2 className="text-xl font-semibold">Browse by Type</h2>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-20 w-full rounded-md" />
					))}
				</div>
			</div>
		);
	}

	if (resourceTypes.length === 0) {
		return null;
	}

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">Browse by Type</h2>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{resourceTypes
					.sort((a, b) => b.count - a.count)
					.slice(0, 8)
					.map(({ type, count }) => (
						<Link key={type} href={`/resources?type=${type}`}>
							<Button
								variant="outline"
								className="w-full h-full min-h-[5rem] justify-start p-4 hover:bg-accent/50 hover:text-accent-foreground"
							>
								<div className="flex flex-col items-start">
									<div className="flex items-center mb-2">
										{getTypeIcon(type)}
										<span className="ml-2 text-sm text-muted-foreground">{count} resources</span>
									</div>
									<span className="font-medium">{getResourceTypeDisplayName(type)}</span>
								</div>
								<ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
							</Button>
						</Link>
					))}
			</div>
		</div>
	);
}

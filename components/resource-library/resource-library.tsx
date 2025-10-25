'use client';

import { Filter, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';

import { FeaturedResources } from '@/components/resource-library/featured-resources';
import { ResourceCategoryList } from '@/components/resource-library/resource-category-list';
import { ResourceFilters } from '@/components/resource-library/resource-filters';
import { ResourceGrid } from '@/components/resource-library/resource-grid';
import { ResourceTypeList } from '@/components/resource-library/resource-type-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	type ResourceCategory,
	type ResourceType,
	useAllResources,
	useSearchResources,
} from '@/lib/resource-library-service';

export function ResourceLibrary() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
	const [activeTab, setActiveTab] = useState('all');

	// Get filters from URL
	const typeFilter = searchParams.get('type')?.split(',') as ResourceType[] | undefined;
	const categoryFilter = searchParams.get('category')?.split(',') as ResourceCategory[] | undefined;
	const difficultyFilter = searchParams.get('difficulty')?.split(',') as
		| ('beginner' | 'intermediate' | 'advanced')[]
		| undefined;

	// Use Convex hooks instead of async functions
	const allResources = useAllResources();
	const searchResults = useSearchResources(searchQuery);

	// Determine which data to use
	const resourcesData = searchQuery ? searchResults : allResources;
	const { data: resources, isLoading } = resourcesData;

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();

		// Update URL with search query
		const params = new URLSearchParams(searchParams.toString());
		if (searchQuery) {
			params.set('q', searchQuery);
		} else {
			params.delete('q');
		}

		router.push(`/resources?${params.toString()}`);
	};

	const handleTabChange = (value: string) => {
		setActiveTab(value);

		// Update URL with tab
		const params = new URLSearchParams(searchParams.toString());
		if (value !== 'all') {
			params.set('tab', value);
		} else {
			params.delete('tab');
		}

		router.push(`/resources?${params.toString()}`);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row gap-4">
				<form onSubmit={handleSearch} className="flex-1">
					<div className="relative">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search resources..."
							className="pl-8"
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
						/>
					</div>
				</form>
				<div className="flex items-center gap-2">
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" size="sm" className="md:hidden">
								<Filter className="h-4 w-4 mr-2" />
								Filters
							</Button>
						</SheetTrigger>
						<SheetContent side="right" className="w-[300px] sm:w-[400px]">
							<div className="py-4">
								<h3 className="mb-4 text-lg font-medium">Filters</h3>
								<ResourceFilters />
							</div>
						</SheetContent>
					</Sheet>
					<Button type="submit" onClick={handleSearch}>
						Search
					</Button>
				</div>
			</div>

			<div className="flex flex-col md:flex-row gap-6">
				<div className="hidden md:block w-64 space-y-6">
					<ResourceFilters />
				</div>

				<div className="flex-1">
					<Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="space-y-4">
						<TabsList>
							<TabsTrigger value="all">All Resources</TabsTrigger>
							<TabsTrigger value="featured">Featured</TabsTrigger>
							<TabsTrigger value="recent">Recently Added</TabsTrigger>
							<TabsTrigger value="popular">Most Popular</TabsTrigger>
						</TabsList>

						<TabsContent value="all" className="space-y-6">
							{!searchQuery && !typeFilter && !categoryFilter && !difficultyFilter && <FeaturedResources />}
							<ResourceTypeList />
							<ResourceCategoryList />
							<ResourceGrid
								resources={resources}
								isLoading={isLoading}
								emptyMessage="No resources found. Try adjusting your search or filters."
							/>
						</TabsContent>

						<TabsContent value="featured" className="space-y-6">
							<ResourceGrid
								resources={resources.filter(r => r.featured)}
								isLoading={isLoading}
								emptyMessage="No featured resources found."
							/>
						</TabsContent>

						<TabsContent value="recent" className="space-y-6">
							<ResourceGrid
								resources={[...resources].sort(
									(a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
								)}
								isLoading={isLoading}
								emptyMessage="No recent resources found."
							/>
						</TabsContent>

						<TabsContent value="popular" className="space-y-6">
							<ResourceGrid
								resources={[...resources].sort((a, b) => b.downloadCount - a.downloadCount)}
								isLoading={isLoading}
								emptyMessage="No popular resources found."
							/>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}

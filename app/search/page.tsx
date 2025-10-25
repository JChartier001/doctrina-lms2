'use client';

import { Filter, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { SearchBar } from '@/components/search-bar';
import { SearchResultItem } from '@/components/search-result-item';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	getPopularSearches,
	type SearchResult,
	type SearchResultType,
	trackSearch,
	useUnifiedSearch,
} from '@/lib/search-service';

export default function SearchPage() {
	const searchParams = useSearchParams();
	const initialQuery = searchParams.get('q') || '';
	const [searchQuery, setSearchQuery] = useState(initialQuery);
	const [results, setResults] = useState<SearchResult[]>([]);
	const [activeTab, setActiveTab] = useState('all');
	const [popularSearches, setPopularSearches] = useState<{ query: string; count: number }[]>([]);
	const [selectedTypes, setSelectedTypes] = useState<SearchResultType[]>([]);
	const router = useRouter();

	// Content type options for filtering
	const contentTypeOptions: { value: SearchResultType; label: string }[] = [
		{ value: 'course', label: 'Courses' },
		{ value: 'program', label: 'Programs' },
		{ value: 'instructor', label: 'Instructors' },
		{ value: 'community', label: 'Community Posts' },
		{ value: 'lesson', label: 'Lessons' },
		{ value: 'resource', label: 'Resources' },
	];

	// Use Convex search hook
	const searchResult = useUnifiedSearch(searchQuery, 50, selectedTypes.length > 0 ? selectedTypes : undefined);
	const { data: convexResults, isLoading: convexLoading } = searchResult;

	// Update results when Convex data changes
	useEffect(() => {
		if (convexResults) {
			setResults(convexResults);
		} else if (!searchQuery) {
			setResults([]);
		}
	}, [convexResults, searchQuery]);

	// Get popular searches
	useEffect(() => {
		setPopularSearches(getPopularSearches());
	}, []);

	// Update URL when search query changes
	useEffect(() => {
		if (searchQuery !== initialQuery) {
			const params = new URLSearchParams(searchParams);
			if (searchQuery) {
				params.set('q', searchQuery);
			} else {
				params.delete('q');
			}
			router.push(`/search?${params.toString()}`);
		}
	}, [searchQuery, initialQuery, router, searchParams]);

	// Track search queries
	useEffect(() => {
		if (searchQuery) {
			trackSearch(searchQuery);
		}
	}, [searchQuery]);

	const handleSearch = (query: string) => {
		setSearchQuery(query);
	};

	const handleFilterChange = (type: SearchResultType, checked: boolean) => {
		setSelectedTypes(prev => {
			if (checked) {
				return [...prev, type];
			} else {
				return prev.filter(t => t !== type);
			}
		});
	};

	const applyFilters = () => {
		// Filters are applied automatically through the hook
	};

	const clearFilters = () => {
		setSelectedTypes([]);
		// Filters are applied automatically through the hook
	};

	// Filter results based on active tab
	const filteredResults = activeTab === 'all' ? results : results.filter(result => result.type === activeTab);

	// Count results by type
	const resultCounts = results.reduce(
		(counts, result) => {
			counts[result.type] = (counts[result.type] || 0) + 1;
			return counts;
		},
		{} as Record<string, number>,
	);

	return (
		<div className="container py-10">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-6">Search</h1>

				<SearchBar
					placeholder="Search for courses, programs, topics..."
					value={searchQuery}
					onSearch={handleSearch}
					showButton
					autoFocus
					className="max-w-3xl"
				/>
			</div>

			{searchQuery ? (
				<>
					<div className="flex justify-between items-center mb-6">
						<p className="text-muted-foreground">
							{results.length} results for <span className="font-medium text-foreground">"{searchQuery}"</span>
						</p>

						<Sheet>
							<SheetTrigger asChild>
								<Button variant="outline" size="sm">
									<Filter className="h-4 w-4 mr-2" />
									Filter
								</Button>
							</SheetTrigger>
							<SheetContent>
								<SheetHeader>
									<SheetTitle>Filter Results</SheetTitle>
									<SheetDescription>Narrow down your search results by content type.</SheetDescription>
								</SheetHeader>
								<div className="py-4">
									<h3 className="font-medium mb-2">Content Type</h3>
									<div className="space-y-2">
										{contentTypeOptions.map(option => (
											<div key={option.value} className="flex items-center space-x-2">
												<Checkbox
													id={`filter-${option.value}`}
													checked={selectedTypes.includes(option.value)}
													onCheckedChange={checked => handleFilterChange(option.value, checked as boolean)}
												/>
												<Label htmlFor={`filter-${option.value}`}>{option.label}</Label>
											</div>
										))}
									</div>
									<Separator className="my-4" />
									<div className="flex justify-between">
										<Button variant="outline" onClick={clearFilters}>
											Clear Filters
										</Button>
										<Button onClick={applyFilters}>Apply Filters</Button>
									</div>
								</div>
							</SheetContent>
						</Sheet>
					</div>

					{convexLoading ? (
						<div className="flex justify-center items-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
						</div>
					) : (
						<>
							<Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
								<TabsList className="mb-6">
									<TabsTrigger value="all">All Results ({results.length})</TabsTrigger>
									<TabsTrigger value="course">Courses ({resultCounts.course || 0})</TabsTrigger>
									<TabsTrigger value="program">Programs ({resultCounts.program || 0})</TabsTrigger>
									<TabsTrigger value="instructor">Instructors ({resultCounts.instructor || 0})</TabsTrigger>
									<TabsTrigger value="community">Community ({resultCounts.community || 0})</TabsTrigger>
									<TabsTrigger value="lesson">Lessons ({resultCounts.lesson || 0})</TabsTrigger>
								</TabsList>

								<TabsContent value={activeTab} className="space-y-4">
									{filteredResults.length > 0 ? (
										filteredResults.map(result => (
											<SearchResultItem key={`${result.type}-${result.id}`} result={result} />
										))
									) : (
										<div className="text-center py-12">
											<h2 className="text-2xl font-bold">No results found</h2>
											<p className="text-muted-foreground mt-2">Try different keywords or browse our categories</p>
										</div>
									)}
								</TabsContent>
							</Tabs>
						</>
					)}
				</>
			) : (
				<div className="py-12">
					<div className="max-w-3xl mx-auto">
						<h2 className="text-2xl font-bold mb-4">Search for courses, programs, and more</h2>
						<p className="text-muted-foreground mb-8">Enter keywords to find what you're looking for</p>

						{popularSearches.length > 0 && (
							<div className="mb-8">
								<h3 className="font-medium mb-2">Popular Searches</h3>
								<div className="flex flex-wrap gap-2">
									{popularSearches.map(item => (
										<Badge
											key={item.query}
											variant="secondary"
											className="cursor-pointer hover:bg-secondary/80"
											onClick={() => handleSearch(item.query)}
										>
											{item.query}
										</Badge>
									))}
								</div>
							</div>
						)}

						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<Card className="text-center">
								<CardContent className="p-6">
									<div className="rounded-full bg-primary/10 p-3 mx-auto mb-4 w-12 h-12 flex items-center justify-center">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="h-6 w-6 text-primary"
										>
											<path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2v-2" />
											<path d="M18 8h4v4h-4z" />
											<path d="M15 22v-4a2 2 0 0 1 2-2h4" />
										</svg>
									</div>
									<h3 className="font-medium mb-2">Courses</h3>
									<p className="text-sm text-muted-foreground">Find individual courses on specific topics</p>
								</CardContent>
							</Card>

							<Card className="text-center">
								<CardContent className="p-6">
									<div className="rounded-full bg-primary/10 p-3 mx-auto mb-4 w-12 h-12 flex items-center justify-center">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="h-6 w-6 text-primary"
										>
											<path d="M16 6h3a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1" />
											<path d="M14 15V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h2" />
											<path d="M9 22h6" />
											<path d="M9 5v16" />
										</svg>
									</div>
									<h3 className="font-medium mb-2">Programs</h3>
									<p className="text-sm text-muted-foreground">Explore comprehensive educational programs</p>
								</CardContent>
							</Card>

							<Card className="text-center">
								<CardContent className="p-6">
									<div className="rounded-full bg-primary/10 p-3 mx-auto mb-4 w-12 h-12 flex items-center justify-center">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="h-6 w-6 text-primary"
										>
											<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
											<circle cx="9" cy="7" r="4" />
											<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
											<path d="M16 3.13a4 4 0 0 1 0 7.75" />
										</svg>
									</div>
									<h3 className="font-medium mb-2">Instructors</h3>
									<p className="text-sm text-muted-foreground">Find expert instructors in medical aesthetics</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

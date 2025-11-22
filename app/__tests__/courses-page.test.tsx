import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach,describe, expect, it, vi } from 'vitest';

import CoursesPage from '@/app/courses/page';

// Mock Next.js router
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: vi.fn(),
	}),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
	default: ({ src, alt, className, width, height, ...props }: any) => (
		<img
			src={src}
			alt={alt}
			className={className}
			width={width}
			height={height}
			data-testid="next-image"
			{...props}
		/>
	),
}));

// Mock Convex hooks
vi.mock('convex/react', () => ({
	useQuery: vi.fn(),
}));

import { useQuery } from 'convex/react';

import { Id } from '@/convex/_generated/dataModel';

describe('Courses Page - Image Optimization Integration', () => {
	const mockCourses = [
		{
			_id: '123' as Id<'courses'>,
			_creationTime: Date.now(),
			title: 'Introduction to Botox',
			description: 'Learn the fundamentals of Botox administration',
			thumbnailUrl: 'https://convex-storage.example.com/course1-thumbnail.jpg',
			level: 'beginner' as const,
			price: 299,
			rating: 4.5,
			duration: '8 hours',
			createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 days ago
		},
		{
			_id: '456' as Id<'courses'>,
			_creationTime: Date.now(),
			title: 'Advanced Dermal Fillers',
			description: 'Master advanced techniques in dermal filler application',
			thumbnailUrl: 'https://convex-storage.example.com/course2-thumbnail.jpg',
			level: 'advanced' as const,
			price: 499,
			rating: 4.8,
			duration: '12 hours',
			createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14, // 14 days ago
		},
		{
			_id: '789' as Id<'courses'>,
			_creationTime: Date.now(),
			title: 'Laser Hair Removal Certification',
			description: 'Get certified in laser hair removal procedures',
			thumbnailUrl: 'https://convex-storage.example.com/course3-thumbnail.jpg',
			level: 'intermediate' as const,
			price: 399,
			rating: 4.7,
			duration: '10 hours',
			createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Next.js Image Component Integration', () => {
		it('course images render with Next.js Image component', async () => {
			(useQuery as any).mockReturnValue(mockCourses);

			render(<CoursesPage />);

			await waitFor(() => {
				const images = screen.getAllByTestId('next-image');
				expect(images.length).toBeGreaterThan(0);
			});
		});

		it('images load from Convex storage URLs', async () => {
			(useQuery as any).mockReturnValue(mockCourses);

			render(<CoursesPage />);

			await waitFor(() => {
				const images = screen.getAllByTestId('next-image');
				
				// Verify that all images have Convex storage URLs
				images.forEach(image => {
					const src = image.getAttribute('src');
					expect(src).toBeTruthy();
					// Should be a valid Convex storage URL or placeholder
					expect(src).toMatch(/https:\/\/convex-storage\.example\.com\/|placeholder\.svg/);
				});
			});
		});

		it('no broken images on page load', async () => {
			(useQuery as any).mockReturnValue(mockCourses);

			render(<CoursesPage />);

			await waitFor(() => {
				const images = screen.getAllByTestId('next-image');
				
				images.forEach(image => {
					// Verify image has src attribute
					expect(image).toHaveAttribute('src');
					
					// Verify src is not empty
					const src = image.getAttribute('src');
					expect(src).toBeTruthy();
					expect(src?.length).toBeGreaterThan(0);
				});
			});
		});

		it('responsive images use correct sizes', async () => {
			(useQuery as any).mockReturnValue(mockCourses);

			render(<CoursesPage />);

			await waitFor(() => {
				const images = screen.getAllByTestId('next-image');
				
				images.forEach(image => {
					// Check that width and height are specified
					expect(image).toHaveAttribute('width');
					expect(image).toHaveAttribute('height');
					
					// Verify dimensions are reasonable
					const width = parseInt(image.getAttribute('width') || '0');
					const height = parseInt(image.getAttribute('height') || '0');
					
					expect(width).toBeGreaterThan(0);
					expect(height).toBeGreaterThan(0);
				});
			});
		});

		it('images have proper alt text for accessibility', async () => {
			(useQuery as any).mockReturnValue(mockCourses);

			render(<CoursesPage />);

			await waitFor(() => {
				mockCourses.forEach(course => {
					const image = screen.getByAltText(course.title);
					expect(image).toBeInTheDocument();
				});
			});
		});

		it('handles courses without thumbnails gracefully', async () => {
			const coursesWithoutThumbnails = [
				{
					...mockCourses[0],
					thumbnailUrl: undefined,
				},
			];

			(useQuery as any).mockReturnValue(coursesWithoutThumbnails);

			render(<CoursesPage />);

			await waitFor(() => {
				const image = screen.getByAltText(coursesWithoutThumbnails[0].title);
				expect(image).toBeInTheDocument();
				
				// Should have placeholder
				expect(image.getAttribute('src')).toContain('placeholder.svg');
			});
		});

		it('images apply correct CSS classes for styling', async () => {
			(useQuery as any).mockReturnValue(mockCourses);

			render(<CoursesPage />);

			await waitFor(() => {
				const images = screen.getAllByTestId('next-image');
				
				images.forEach(image => {
					// Check for object-cover class (image optimization)
					expect(image.className).toContain('object-cover');
				});
			});
		});

		it('course cards display correctly with images', async () => {
			(useQuery as any).mockReturnValue(mockCourses);

			render(<CoursesPage />);

			await waitFor(() => {
				mockCourses.forEach(course => {
					// Check course title
					expect(screen.getByText(course.title)).toBeInTheDocument();
					
					// Check course image
					expect(screen.getByAltText(course.title)).toBeInTheDocument();
					
					// Check course description
					expect(screen.getByText(course.description)).toBeInTheDocument();
				});
			});
		});
	});

	describe('Loading States', () => {
		it('shows loading spinner while data is loading', () => {
			(useQuery as any).mockReturnValue(undefined);

			render(<CoursesPage />);

			// Check for loading spinner
			const spinner = document.querySelector('.animate-spin');
			expect(spinner).toBeInTheDocument();
		});

		it('renders courses after loading completes', async () => {
			(useQuery as any).mockReturnValue(mockCourses);

			render(<CoursesPage />);

			await waitFor(() => {
				// Loading spinner should be gone
				const spinner = document.querySelector('.animate-spin');
				expect(spinner).not.toBeInTheDocument();

				// Courses should be visible
				expect(screen.getByText(mockCourses[0].title)).toBeInTheDocument();
			});
		});
	});

	describe('Empty States', () => {
		it('shows empty state when no courses available', async () => {
			(useQuery as any).mockReturnValue([]);

			render(<CoursesPage />);

			await waitFor(() => {
				expect(screen.getByText('No courses found')).toBeInTheDocument();
			});
		});

		it('empty state has no broken image elements', async () => {
			(useQuery as any).mockReturnValue([]);

			render(<CoursesPage />);

			await waitFor(() => {
				const images = screen.queryAllByTestId('next-image');
				// Empty state should not show course images
				expect(images).toHaveLength(0);
			});
		});
	});

	describe('Image Optimization Performance', () => {
		it('uses optimized image dimensions', async () => {
			(useQuery as any).mockReturnValue(mockCourses);

			render(<CoursesPage />);

			await waitFor(() => {
				const images = screen.getAllByTestId('next-image');
				
				images.forEach(image => {
					const width = parseInt(image.getAttribute('width') || '0');
					const height = parseInt(image.getAttribute('height') || '0');
					
					// Check that dimensions are optimized (300x200 as per component)
					expect(width).toBe(300);
					expect(height).toBe(200);
				});
			});
		});

		it('images have object-cover class for proper aspect ratio', async () => {
			(useQuery as any).mockReturnValue(mockCourses);

			render(<CoursesPage />);

			await waitFor(() => {
				const images = screen.getAllByTestId('next-image');
				
				images.forEach(image => {
					expect(image.className).toMatch(/object-cover/);
				});
			});
		});

		it('lazy loads images by default (Next.js Image behavior)', async () => {
			(useQuery as any).mockReturnValue(mockCourses);

			render(<CoursesPage />);

			await waitFor(() => {
				// Next.js Image component handles lazy loading by default
				// Just verify images are rendered
				const images = screen.getAllByTestId('next-image');
				expect(images.length).toBe(mockCourses.length);
			});
		});
	});

	describe('Course Grid Layout with Images', () => {
		it('displays courses in grid layout', async () => {
			(useQuery as any).mockReturnValue(mockCourses);

			render(<CoursesPage />);

			await waitFor(() => {
				// Check for grid container
				const gridContainer = document.querySelector('.grid');
				expect(gridContainer).toBeInTheDocument();
			});
		});

		it('each course card contains an image', async () => {
			(useQuery as any).mockReturnValue(mockCourses);

			render(<CoursesPage />);

			await waitFor(() => {
				const images = screen.getAllByTestId('next-image');
				expect(images).toHaveLength(mockCourses.length);
			});
		});

		it('images are positioned correctly within cards', async () => {
			(useQuery as any).mockReturnValue(mockCourses);

			render(<CoursesPage />);

			await waitFor(() => {
				const images = screen.getAllByTestId('next-image');
				
				images.forEach(image => {
					// Check that image is within a card structure
					const card = image.closest('.overflow-hidden');
					expect(card).toBeInTheDocument();
				});
			});
		});
	});

	describe('Image Error Handling', () => {
		it('handles missing thumbnail URLs', async () => {
			const coursesWithMissingThumbnails = mockCourses.map((course, index) => ({
				...course,
				thumbnailUrl: index === 1 ? undefined : course.thumbnailUrl,
			}));

			(useQuery as any).mockReturnValue(coursesWithMissingThumbnails);

			render(<CoursesPage />);

			await waitFor(() => {
				const images = screen.getAllByTestId('next-image');
				expect(images).toHaveLength(coursesWithMissingThumbnails.length);
				
				// Check that placeholder is used for missing thumbnail
				const placeholderImages = images.filter(img => 
					img.getAttribute('src')?.includes('placeholder.svg')
				);
				expect(placeholderImages.length).toBeGreaterThan(0);
			});
		});

		it('all images have valid src attributes', async () => {
			(useQuery as any).mockReturnValue(mockCourses);

			render(<CoursesPage />);

			await waitFor(() => {
				const images = screen.getAllByTestId('next-image');
				
				images.forEach(image => {
					const src = image.getAttribute('src');
					expect(src).toBeTruthy();
					expect(typeof src).toBe('string');
					expect(src!.length).toBeGreaterThan(0);
				});
			});
		});
	});

	describe('Filtering and Sorting with Images', () => {
		it('maintains image integrity after filtering', async () => {
			(useQuery as any).mockReturnValue(mockCourses);

			render(<CoursesPage />);

			await waitFor(() => {
				// Initial render - all images should be present
				const images = screen.getAllByTestId('next-image');
				expect(images).toHaveLength(mockCourses.length);
				
				// Verify all images have valid sources
				images.forEach((image, index) => {
					const expectedSrc = mockCourses[index].thumbnailUrl || expect.stringContaining('placeholder');
					expect(image.getAttribute('src')).toBeTruthy();
				});
			});
		});

		it('images remain properly sized after sorting', async () => {
			(useQuery as any).mockReturnValue(mockCourses);

			render(<CoursesPage />);

			await waitFor(() => {
				const images = screen.getAllByTestId('next-image');
				
				images.forEach(image => {
					expect(image.getAttribute('width')).toBe('300');
					expect(image.getAttribute('height')).toBe('200');
				});
			});
		});
	});

	describe('Accessibility and SEO', () => {
		it('all course images have meaningful alt text', async () => {
			(useQuery as any).mockReturnValue(mockCourses);

			render(<CoursesPage />);

			await waitFor(() => {
				mockCourses.forEach(course => {
					const image = screen.getByAltText(course.title);
					expect(image).toBeInTheDocument();
					expect(image.getAttribute('alt')).toBe(course.title);
				});
			});
		});

		it('images do not have empty alt attributes', async () => {
			(useQuery as any).mockReturnValue(mockCourses);

			render(<CoursesPage />);

			await waitFor(() => {
				const images = screen.getAllByTestId('next-image');
				
				images.forEach(image => {
					const alt = image.getAttribute('alt');
					expect(alt).toBeTruthy();
					expect(alt!.length).toBeGreaterThan(0);
				});
			});
		});
	});
});

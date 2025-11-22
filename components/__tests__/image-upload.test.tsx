import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ImageUpload } from '@/components/image-upload';
import { Id } from '@/convex/_generated/dataModel';

// Mock Convex hooks
vi.mock('convex/react', () => ({
	useMutation: vi.fn(),
	useQuery: vi.fn(),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
	default: ({ src, alt, className, onError, ...props }: any) => (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={src} alt={alt} className={className} onError={onError} {...props} data-testid="next-image" />
	),
}));

// Mock react-toastify
vi.mock('react-toastify', () => ({
	toast: {
		error: vi.fn(),
		success: vi.fn(),
	},
}));

// Mock convex client
vi.mock('@/lib/convexClient', () => ({
	convex: {
		query: vi.fn(),
	},
}));

import { useMutation } from 'convex/react';
import { toast } from 'react-toastify';

import { convex } from '@/lib/convexClient';

// Test wrapper component with FormProvider
function TestWrapper({ children, defaultValues = {} }: any) {
	const methods = useForm({
		defaultValues: {
			images: [],
			...defaultValues,
		},
	});

	return <FormProvider {...methods}>{children}</FormProvider>;
}

// Helper function to create mock files
const createMockFile = (name: string, type: string, size: number, content = 'mock image content'): File => {
	const file = new File([content], name, { type });
	Object.defineProperty(file, 'size', { value: size });
	return file;
};

describe('ImageUpload Component - With Image Optimization', () => {
	let mockGenerateUploadUrl: ReturnType<typeof vi.fn>;
	let mockGetImageUrl: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		// Reset all mocks
		vi.clearAllMocks();

		// Setup mock mutation
		mockGenerateUploadUrl = vi.fn().mockResolvedValue('https://mock-upload.url');
		(useMutation as any).mockReturnValue(mockGenerateUploadUrl);

		// Setup mock query for image URL retrieval
		mockGetImageUrl = vi.fn().mockResolvedValue('https://mock-image.url/test.jpg');
		(convex.query as any).mockImplementation(mockGetImageUrl);

		// Mock fetch for file uploads
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ storageId: 'kg2abc123' as Id<'_storage'> }),
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('Rendering Tests', () => {
		it('renders upload area with drag & drop text', () => {
			render(
				<TestWrapper>
					<ImageUpload />
				</TestWrapper>,
			);

			expect(screen.getByText(/Drag & drop images here, or click to browse/i)).toBeInTheDocument();
		});

		it('displays file count indicator (X/5)', () => {
			render(
				<TestWrapper>
					<ImageUpload label="Course Images" />
				</TestWrapper>,
			);

			expect(screen.getByText(/Course Images \(0\/5\)/i)).toBeInTheDocument();
		});

		it('shows upload button in enabled state', () => {
			render(
				<TestWrapper>
					<ImageUpload />
				</TestWrapper>,
			);

			const uploadButton = screen.getByRole('button', { name: /Choose Files/i });
			expect(uploadButton).toBeInTheDocument();
			expect(uploadButton).not.toBeDisabled();
		});

		it('disables upload when max images reached', () => {
			const maxImages = 3;
			const existingImages = [
				'kg2abc123' as Id<'_storage'>,
				'kg2abc124' as Id<'_storage'>,
				'kg2abc125' as Id<'_storage'>,
			];

			render(
				<TestWrapper defaultValues={{ images: existingImages }}>
					<ImageUpload maxImages={maxImages} />
				</TestWrapper>,
			);

			const uploadButton = screen.getByRole('button', { name: /Choose Files/i });
			expect(uploadButton).toBeDisabled();
		});

		it('displays custom label when provided', () => {
			render(
				<TestWrapper>
					<ImageUpload label="Product Photos" />
				</TestWrapper>,
			);

			expect(screen.getByText(/Product Photos \(0\/5\)/i)).toBeInTheDocument();
		});

		it('displays accepted file types in upload area', () => {
			render(
				<TestWrapper>
					<ImageUpload />
				</TestWrapper>,
			);

			expect(screen.getByText(/image\/jpeg, image\/png, image\/webp, image\/gif/i)).toBeInTheDocument();
		});

		it('displays max file size in upload area', () => {
			render(
				<TestWrapper>
					<ImageUpload maxFileSize={10} />
				</TestWrapper>,
			);

			expect(screen.getByText(/Max 10MB each/i)).toBeInTheDocument();
		});
	});

	describe('Upload Flow Tests', () => {
		it('accepts valid image types (JPEG, PNG, WebP, GIF)', async () => {
			render(
				<TestWrapper>
					<ImageUpload />
				</TestWrapper>,
			);

			const fileInput = screen.getByLabelText(/Select images/i) as HTMLInputElement;

			const validFiles = [
				createMockFile('image1.jpg', 'image/jpeg', 1024 * 1024), // 1MB
				createMockFile('image2.png', 'image/png', 1024 * 1024),
				createMockFile('image3.webp', 'image/webp', 1024 * 1024),
				createMockFile('image4.gif', 'image/gif', 1024 * 1024),
			];

			fireEvent.change(fileInput, { target: { files: validFiles } });

			await waitFor(() => {
				expect(mockGenerateUploadUrl).toHaveBeenCalledTimes(4);
			});

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalledWith('4 image(s) uploaded successfully');
			});
		});

		it('rejects invalid file types (SVG, PDF, etc.)', async () => {
			render(
				<TestWrapper>
					<ImageUpload />
				</TestWrapper>,
			);

			const fileInput = screen.getByLabelText(/Select images/i) as HTMLInputElement;

			const invalidFile = createMockFile('document.pdf', 'application/pdf', 1024 * 1024);

			fireEvent.change(fileInput, { target: { files: [invalidFile] } });

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Invalid file type'));
			});
		});

		it('enforces max file size (5MB)', async () => {
			render(
				<TestWrapper>
					<ImageUpload maxFileSize={5} />
				</TestWrapper>,
			);

			const fileInput = screen.getByLabelText(/Select images/i) as HTMLInputElement;

			// Create file larger than 5MB
			const largeFile = createMockFile('large-image.jpg', 'image/jpeg', 6 * 1024 * 1024);

			fireEvent.change(fileInput, { target: { files: [largeFile] } });

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Too large'));
			});
		});

		it('handles multiple file uploads', async () => {
			render(
				<TestWrapper>
					<ImageUpload />
				</TestWrapper>,
			);

			const fileInput = screen.getByLabelText(/Select images/i) as HTMLInputElement;

			const files = [
				createMockFile('image1.jpg', 'image/jpeg', 1024 * 1024),
				createMockFile('image2.png', 'image/png', 1024 * 1024),
				createMockFile('image3.webp', 'image/webp', 1024 * 1024),
			];

			fireEvent.change(fileInput, { target: { files } });

			await waitFor(() => {
				expect(mockGenerateUploadUrl).toHaveBeenCalledTimes(3);
			});

			await waitFor(() => {
				expect(toast.success).toHaveBeenCalledWith('3 image(s) uploaded successfully');
			});
		});

		it('updates form value with storage IDs', async () => {
			const mockStorageIds = ['kg2abc123', 'kg2abc124', 'kg2abc125'];
			let callCount = 0;

			global.fetch = vi.fn().mockImplementation(async () => ({
				ok: true,
				json: async () => ({ storageId: mockStorageIds[callCount++] as Id<'_storage'> }),
			}));

			const TestComponent = () => {
				const methods = useForm({
					defaultValues: { images: [] },
				});
				// eslint-disable-next-line react-hooks/incompatible-library
				const images = methods.watch('images');

				return (
					<FormProvider {...methods}>
						<ImageUpload />
						<div data-testid="form-value">{JSON.stringify(images)}</div>
					</FormProvider>
				);
			};

			render(<TestComponent />);

			const fileInput = screen.getByLabelText(/Select images/i) as HTMLInputElement;

			const files = [
				createMockFile('image1.jpg', 'image/jpeg', 1024 * 1024),
				createMockFile('image2.png', 'image/png', 1024 * 1024),
				createMockFile('image3.webp', 'image/webp', 1024 * 1024),
			];

			fireEvent.change(fileInput, { target: { files } });

			await waitFor(() => {
				const formValue = screen.getByTestId('form-value');
				const parsedValue = JSON.parse(formValue.textContent || '[]');
				expect(parsedValue).toHaveLength(3);
				expect(parsedValue).toContain('kg2abc123');
				expect(parsedValue).toContain('kg2abc124');
				expect(parsedValue).toContain('kg2abc125');
			});
		});

		it('limits uploads to maxImages', async () => {
			render(
				<TestWrapper>
					<ImageUpload maxImages={3} />
				</TestWrapper>,
			);

			const fileInput = screen.getByLabelText(/Select images/i) as HTMLInputElement;

			const files = [
				createMockFile('image1.jpg', 'image/jpeg', 1024 * 1024),
				createMockFile('image2.png', 'image/png', 1024 * 1024),
				createMockFile('image3.webp', 'image/webp', 1024 * 1024),
				createMockFile('image4.gif', 'image/gif', 1024 * 1024),
				createMockFile('image5.jpg', 'image/jpeg', 1024 * 1024),
			];

			fireEvent.change(fileInput, { target: { files } });

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Maximum 3 images allowed'));
			});

			await waitFor(() => {
				// Should only upload 3 files
				expect(mockGenerateUploadUrl).toHaveBeenCalledTimes(3);
			});
		});
	});

	describe('Image Preview Tests', () => {
		it('displays preview after successful upload', async () => {
			mockGetImageUrl.mockResolvedValue('https://mock-image.url/preview.jpg');

			render(
				<TestWrapper defaultValues={{ images: ['kg2abc123' as Id<'_storage'>] }}>
					<ImageUpload />
				</TestWrapper>,
			);

			await waitFor(() => {
				expect(screen.getByAltText('Uploaded image')).toBeInTheDocument();
			});
		});

		it('shows loading state during image fetch', () => {
			// Mock delayed response
			mockGetImageUrl.mockImplementation(
				() => new Promise(resolve => setTimeout(() => resolve('https://mock.url'), 1000)),
			);

			render(
				<TestWrapper defaultValues={{ images: ['kg2abc123' as Id<'_storage'>] }}>
					<ImageUpload />
				</TestWrapper>,
			);

			// Check for loading spinner (Loader2 component)
			const loadingSpinner = document.querySelector('.animate-spin');
			expect(loadingSpinner).toBeInTheDocument();
		});

		it('handles image load errors gracefully', async () => {
			mockGetImageUrl.mockRejectedValue(new Error('Failed to load'));

			render(
				<TestWrapper defaultValues={{ images: ['kg2abc123' as Id<'_storage'>] }}>
					<ImageUpload />
				</TestWrapper>,
			);

			await waitFor(() => {
				expect(screen.getByText('Failed to load')).toBeInTheDocument();
			});
		});

		it('renders remove button on hover', async () => {
			mockGetImageUrl.mockResolvedValue('https://mock-image.url/preview.jpg');

			render(
				<TestWrapper defaultValues={{ images: ['kg2abc123' as Id<'_storage'>] }}>
					<ImageUpload />
				</TestWrapper>,
			);

			await waitFor(() => {
				const removeButton = document.querySelector('button.rounded-full');
				expect(removeButton).toBeInTheDocument();
			});
		});

		it('removes image when remove button is clicked', async () => {
			mockGetImageUrl.mockResolvedValue('https://mock-image.url/preview.jpg');

			const TestComponent = () => {
				const methods = useForm({
					defaultValues: { images: ['kg2abc123' as Id<'_storage'>] },
				});
				// eslint-disable-next-line react-hooks/incompatible-library
				const images = methods.watch('images');

				return (
					<FormProvider {...methods}>
						<ImageUpload />
						<div data-testid="image-count">{images.length}</div>
					</FormProvider>
				);
			};

			render(<TestComponent />);

			await waitFor(() => {
				expect(screen.getByAltText('Uploaded image')).toBeInTheDocument();
			});

			const removeButton = document.querySelector('button.rounded-full');
			fireEvent.click(removeButton as Element);

			await waitFor(() => {
				const count = screen.getByTestId('image-count');
				expect(count.textContent).toBe('0');
			});
		});

		it('displays multiple image previews', async () => {
			mockGetImageUrl.mockResolvedValue('https://mock-image.url/preview.jpg');

			const images = ['kg2abc123' as Id<'_storage'>, 'kg2abc124' as Id<'_storage'>, 'kg2abc125' as Id<'_storage'>];

			render(
				<TestWrapper defaultValues={{ images }}>
					<ImageUpload />
				</TestWrapper>,
			);

			await waitFor(() => {
				const imageElements = screen.getAllByAltText('Uploaded image');
				expect(imageElements).toHaveLength(3);
			});
		});
	});

	describe('Error Handling Tests', () => {
		it('shows error toast for invalid file type', async () => {
			render(
				<TestWrapper>
					<ImageUpload />
				</TestWrapper>,
			);

			const fileInput = screen.getByLabelText(/Select images/i) as HTMLInputElement;
			const svgFile = createMockFile('icon.svg', 'image/svg+xml', 1024);

			fireEvent.change(fileInput, { target: { files: [svgFile] } });

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Invalid file type'));
			});
		});

		it('shows error toast for oversized files', async () => {
			render(
				<TestWrapper>
					<ImageUpload maxFileSize={2} />
				</TestWrapper>,
			);

			const fileInput = screen.getByLabelText(/Select images/i) as HTMLInputElement;
			const largeFile = createMockFile('huge.jpg', 'image/jpeg', 3 * 1024 * 1024);

			fireEvent.change(fileInput, { target: { files: [largeFile] } });

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Too large'));
			});
		});

		it('shows error toast for upload failures', async () => {
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				statusText: 'Internal Server Error',
			});

			render(
				<TestWrapper>
					<ImageUpload />
				</TestWrapper>,
			);

			const fileInput = screen.getByLabelText(/Select images/i) as HTMLInputElement;
			const file = createMockFile('image.jpg', 'image/jpeg', 1024 * 1024);

			fireEvent.change(fileInput, { target: { files: [file] } });

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Failed to upload'));
			});
		});

		it('displays error state in preview when image fails to load', async () => {
			mockGetImageUrl.mockRejectedValue(new Error('Network error'));

			render(
				<TestWrapper defaultValues={{ images: ['kg2abc123' as Id<'_storage'>] }}>
					<ImageUpload />
				</TestWrapper>,
			);

			await waitFor(() => {
				expect(screen.getByText('Failed to load')).toBeInTheDocument();
			});
		});

		it('handles network errors during upload gracefully', async () => {
			global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

			render(
				<TestWrapper>
					<ImageUpload />
				</TestWrapper>,
			);

			const fileInput = screen.getByLabelText(/Select images/i) as HTMLInputElement;
			const file = createMockFile('image.jpg', 'image/jpeg', 1024 * 1024);

			fireEvent.change(fileInput, { target: { files: [file] } });

			await waitFor(() => {
				expect(toast.error).toHaveBeenCalled();
			});
		});
	});

	describe('Integration with Convex', () => {
		it('calls generateUploadUrl mutation', async () => {
			render(
				<TestWrapper>
					<ImageUpload />
				</TestWrapper>,
			);

			const fileInput = screen.getByLabelText(/Select images/i) as HTMLInputElement;
			const file = createMockFile('image.jpg', 'image/jpeg', 1024 * 1024);

			fireEvent.change(fileInput, { target: { files: [file] } });

			await waitFor(() => {
				expect(mockGenerateUploadUrl).toHaveBeenCalled();
			});
		});

		it('fetches image URL via getImageUrl query', async () => {
			mockGetImageUrl.mockResolvedValue('https://convex-storage.url/image.jpg');

			render(
				<TestWrapper defaultValues={{ images: ['kg2abc123' as Id<'_storage'>] }}>
					<ImageUpload />
				</TestWrapper>,
			);

			await waitFor(() => {
				expect(mockGetImageUrl).toHaveBeenCalled();
			});
		});

		it('handles Convex storage IDs correctly', async () => {
			const storageId = 'kg2abc123' as Id<'_storage'>;

			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ storageId }),
			});

			const TestComponent = () => {
				const methods = useForm({
					defaultValues: { images: [] },
				});
				// eslint-disable-next-line react-hooks/incompatible-library
				const images = methods.watch('images');

				return (
					<FormProvider {...methods}>
						<ImageUpload />
						<div data-testid="storage-ids">{JSON.stringify(images)}</div>
					</FormProvider>
				);
			};

			render(<TestComponent />);

			const fileInput = screen.getByLabelText(/Select images/i) as HTMLInputElement;
			const file = createMockFile('image.jpg', 'image/jpeg', 1024 * 1024);

			fireEvent.change(fileInput, { target: { files: [file] } });

			await waitFor(() => {
				const storageIds = screen.getByTestId('storage-ids');
				expect(storageIds.textContent).toContain('kg2abc123');
			});
		});

		it('uploads files to generated URL with correct headers', async () => {
			const uploadUrl = 'https://upload.convex.dev/test';
			mockGenerateUploadUrl.mockResolvedValue(uploadUrl);

			render(
				<TestWrapper>
					<ImageUpload />
				</TestWrapper>,
			);

			const fileInput = screen.getByLabelText(/Select images/i) as HTMLInputElement;
			const file = createMockFile('image.jpg', 'image/jpeg', 1024 * 1024);

			fireEvent.change(fileInput, { target: { files: [file] } });

			await waitFor(() => {
				expect(global.fetch).toHaveBeenCalledWith(
					uploadUrl,
					expect.objectContaining({
						method: 'POST',
						headers: { 'Content-Type': 'image/jpeg' },
						body: file,
					}),
				);
			});
		});
	});

	describe('Drag and Drop Tests', () => {
		it('handles drag over event', () => {
			render(
				<TestWrapper>
					<ImageUpload />
				</TestWrapper>,
			);

			const uploadArea = screen.getByText(/Drag & drop images here/i).closest('div');

			fireEvent.dragOver(uploadArea as Element);

			expect(screen.getByText('Drop images here')).toBeInTheDocument();
		});

		it('handles drag leave event', () => {
			render(
				<TestWrapper>
					<ImageUpload />
				</TestWrapper>,
			);

			const uploadArea = screen.getByText(/Drag & drop images here/i).closest('div');

			fireEvent.dragOver(uploadArea as Element);
			fireEvent.dragLeave(uploadArea as Element);

			expect(screen.getByText(/Drag & drop images here, or click to browse/i)).toBeInTheDocument();
		});

		it('handles file drop', async () => {
			render(
				<TestWrapper>
					<ImageUpload />
				</TestWrapper>,
			);

			const uploadArea = screen.getByText(/Drag & drop images here/i).closest('div');
			const file = createMockFile('dropped.jpg', 'image/jpeg', 1024 * 1024);

			const dataTransfer = {
				files: [file],
			};

			fireEvent.drop(uploadArea as Element, { dataTransfer });

			await waitFor(() => {
				expect(mockGenerateUploadUrl).toHaveBeenCalled();
			});
		});

		it('filters non-image files during drop', async () => {
			render(
				<TestWrapper>
					<ImageUpload />
				</TestWrapper>,
			);

			const uploadArea = screen.getByText(/Drag & drop images here/i).closest('div');
			const imageFile = createMockFile('image.jpg', 'image/jpeg', 1024 * 1024);
			const docFile = createMockFile('doc.pdf', 'application/pdf', 1024 * 1024);

			const dataTransfer = {
				files: [imageFile, docFile],
			};

			fireEvent.drop(uploadArea as Element, { dataTransfer });

			await waitFor(() => {
				// Should only process the image file
				expect(mockGenerateUploadUrl).toHaveBeenCalledTimes(1);
			});
		});
	});

	describe('Upload Progress Tests', () => {
		it('shows upload progress during upload', async () => {
			// Mock slow upload
			global.fetch = vi.fn().mockImplementation(
				() =>
					new Promise(resolve =>
						setTimeout(
							() =>
								resolve({
									ok: true,
									json: async () => ({ storageId: 'kg2abc123' as Id<'_storage'> }),
								}),
							100,
						),
					),
			);

			render(
				<TestWrapper>
					<ImageUpload />
				</TestWrapper>,
			);

			const fileInput = screen.getByLabelText(/Select images/i) as HTMLInputElement;
			const file = createMockFile('image.jpg', 'image/jpeg', 1024 * 1024);

			fireEvent.change(fileInput, { target: { files: [file] } });

			// Check for progress UI
			await waitFor(() => {
				expect(screen.getByText('Upload Progress')).toBeInTheDocument();
			});
		});

		it('shows uploading state on button during upload', async () => {
			global.fetch = vi.fn().mockImplementation(
				() =>
					new Promise(resolve =>
						setTimeout(
							() =>
								resolve({
									ok: true,
									json: async () => ({ storageId: 'kg2abc123' as Id<'_storage'> }),
								}),
							100,
						),
					),
			);

			render(
				<TestWrapper>
					<ImageUpload />
				</TestWrapper>,
			);

			const fileInput = screen.getByLabelText(/Select images/i) as HTMLInputElement;
			const file = createMockFile('image.jpg', 'image/jpeg', 1024 * 1024);

			fireEvent.change(fileInput, { target: { files: [file] } });

			await waitFor(() => {
				expect(screen.getByText('Uploading...')).toBeInTheDocument();
			});
		});
	});

	describe('Controlled Component Tests', () => {
		it('works as controlled component with value prop', async () => {
			const onChange = vi.fn();
			const value = ['kg2abc123' as Id<'_storage'>];

			mockGetImageUrl.mockResolvedValue('https://mock-image.url/preview.jpg');

			render(
				<TestWrapper>
					<ImageUpload value={value} onChange={onChange} />
				</TestWrapper>,
			);

			await waitFor(() => {
				expect(screen.getByAltText('Uploaded image')).toBeInTheDocument();
			});
		});

		it('calls onChange when images are uploaded (controlled mode)', async () => {
			const onChange = vi.fn();

			render(
				<TestWrapper>
					<ImageUpload value={[]} onChange={onChange} />
				</TestWrapper>,
			);

			const fileInput = screen.getByLabelText(/Select images/i) as HTMLInputElement;
			const file = createMockFile('image.jpg', 'image/jpeg', 1024 * 1024);

			fireEvent.change(fileInput, { target: { files: [file] } });

			await waitFor(() => {
				expect(onChange).toHaveBeenCalled();
			});
		});

		it('calls onBlur when provided', () => {
			const onBlur = vi.fn();

			render(
				<TestWrapper>
					<ImageUpload onBlur={onBlur} />
				</TestWrapper>,
			);

			const fileInput = screen.getByLabelText(/Select images/i) as HTMLInputElement;
			fireEvent.blur(fileInput);

			expect(onBlur).toHaveBeenCalled();
		});
	});

	describe('Accessibility Tests', () => {
		it('has proper aria-label on file input', () => {
			render(
				<TestWrapper>
					<ImageUpload />
				</TestWrapper>,
			);

			const fileInput = screen.getByLabelText('Select images');
			expect(fileInput).toHaveAttribute('type', 'file');
		});

		it('accepts multiple files via input', () => {
			render(
				<TestWrapper>
					<ImageUpload />
				</TestWrapper>,
			);

			const fileInput = screen.getByLabelText('Select images') as HTMLInputElement;
			expect(fileInput).toHaveAttribute('multiple');
		});

		it('has correct accept attribute for file types', () => {
			render(
				<TestWrapper>
					<ImageUpload acceptedTypes={['image/jpeg', 'image/png']} />
				</TestWrapper>,
			);

			const fileInput = screen.getByLabelText('Select images') as HTMLInputElement;
			expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/png');
		});
	});
});

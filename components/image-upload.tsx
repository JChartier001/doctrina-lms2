import { useMutation } from 'convex/react';
import { Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { convex } from '@/lib/convexClient';

interface UploadProgress {
	id: string;
	progress: number;
	status: 'uploading' | 'complete' | 'error';
}

interface ImagePreviewProps {
	imageId: Id<'_storage'>;
	onRemove: () => void;
}

const ImagePreview = ({ imageId, onRemove }: ImagePreviewProps) => {
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		const loadImage = async () => {
			try {
				const url = await convex.query(api.image.getImageUrl, {
					storageId: imageId,
				});
				setImageUrl(url);
			} catch (err) {
				console.error('Failed to load image:', err);
				setError(true);
			} finally {
				setLoading(false);
			}
		};
		loadImage();
	}, [imageId]);

	return (
		<div className="relative group">
			<div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
				{loading ? (
					<div className="w-full h-full flex items-center justify-center">
						<Loader2 className="w-6 h-6 animate-spin text-gray-400" />
					</div>
				) : error ? (
					<div className="w-full h-full flex items-center justify-center bg-gray-100">
						<div className="text-center">
							<div className="text-2xl text-gray-400 mb-1">⚠️</div>
							<div className="text-xs text-gray-500">Failed to load</div>
						</div>
					</div>
				) : (
					<Image
						src={imageUrl!}
						alt="Uploaded image"
						className="w-full h-full object-cover"
						onError={() => setError(true)}
					/>
				)}
			</div>
			<Button
				onClick={onRemove}
				variant="destructive"
				size="sm"
				className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
			>
				<X className="w-3 h-3" />
			</Button>
		</div>
	);
};

interface ImageUploadProps {
	name?: string; // form field name, defaults to "images"
	maxImages?: number;
	disabled?: boolean;
	// Optional callback for backward-compat; invoked after form value updates
	onImagesUploaded?: (imageIds: string[]) => void;
	// Controller support (controlled mode)
	value?: Id<'_storage'>[];
	onChange?: (value: Id<'_storage'>[]) => void;
	onBlur?: () => void;
	label?: string;
	acceptedTypes?: string[];
	maxFileSize?: number; // in MB
}

const ImageUpload = forwardRef<HTMLInputElement, ImageUploadProps>(
	(
		{
			name = 'images',
			maxImages = 5,
			disabled,
			onImagesUploaded,
			value,
			onChange,
			onBlur,
			label,
			acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
			maxFileSize = 5,
		},
		ref,
	) => {
		const [uploading, setUploading] = useState(false);
		const [dragOver, setDragOver] = useState(false);
		const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
		const fileInputRef = useRef<HTMLInputElement>(null);
		const generateUploadUrl = useMutation(api.image.generateUploadUrl);
		const { watch, setValue } = useFormContext();

		// Determine current images from controlled prop or form state
		const watchedValue = watch(name);
		const uploadedImages: Id<'_storage'>[] = Array.isArray(value)
			? value
			: Array.isArray(watchedValue)
				? watchedValue
				: [];

		const validateFile = (file: File): string | null => {
			if (!acceptedTypes.includes(file.type)) {
				return `${file.name}: Invalid file type. Allowed: ${acceptedTypes.join(', ')}`;
			}
			if (file.size > maxFileSize * 1024 * 1024) {
				return `${file.name}: Too large (max ${maxFileSize}MB)`;
			}
			return null;
		};

		const uploadFile = async (file: File, progressId: string): Promise<Id<'_storage'> | null> => {
			try {
				const validationError = validateFile(file);
				if (validationError) {
					setUploadProgress(prev => prev.map(p => (p.id === progressId ? { ...p, status: 'error' as const } : p)));
					toast.error(validationError);
					return null;
				}

				// Get upload URL
				const postUrl = await generateUploadUrl();

				// Upload with progress tracking
				const result = await fetch(postUrl, {
					method: 'POST',
					headers: { 'Content-Type': file.type },
					body: file,
				});

				if (!result.ok) {
					throw new Error(`Upload failed: ${result.statusText}`);
				}

				const { storageId } = await result.json();

				setUploadProgress(prev =>
					prev.map(p => (p.id === progressId ? { ...p, status: 'complete' as const, progress: 100 } : p)),
				);

				return storageId;
			} catch (error) {
				console.error(`Upload failed for ${file.name}:`, error);
				setUploadProgress(prev => prev.map(p => (p.id === progressId ? { ...p, status: 'error' as const } : p)));
				toast.error(`Failed to upload ${file.name}`);
				return null;
			}
		};

		const handleFiles = useCallback(
			async (files: File[]) => {
				if (files.length === 0) return;

				const availableSlots = maxImages - uploadedImages.length;
				if (files.length > availableSlots) {
					toast.error(`Maximum ${maxImages} images allowed. You can upload ${availableSlots} more.`);
					files = files.slice(0, availableSlots);
				}

				setUploading(true);

				// Initialize progress tracking
				const progressItems: UploadProgress[] = files.map((_file, index) => ({
					id: `${Date.now()}-${index}`,
					progress: 0,
					status: 'uploading' as const,
				}));
				setUploadProgress(progressItems);

				try {
					// Upload files concurrently
					const uploadPromises = files.map((file, index) => uploadFile(file, progressItems[index].id));

					const results = await Promise.all(uploadPromises);
					const successfulUploads = results.filter((id): id is Id<'_storage'> => id !== null);

					if (successfulUploads.length > 0) {
						const allImageIds = [...uploadedImages, ...successfulUploads];
						if (onChange) {
							onChange(allImageIds);
						} else {
							setValue(name, allImageIds, {
								shouldDirty: true,
								shouldValidate: true,
							});
						}
						onImagesUploaded?.(allImageIds);
						toast.success(`${successfulUploads.length} image(s) uploaded successfully`);
					}
				} finally {
					setUploading(false);
					setUploadProgress([]);
					if (fileInputRef.current) {
						fileInputRef.current.value = '';
					}
				}
			},
			[
				uploadedImages,
				maxImages,
				onChange,
				setValue,
				name,
				onImagesUploaded,
				generateUploadUrl,
				acceptedTypes,
				maxFileSize,
			],
		);

		const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(event.target.files || []);
			handleFiles(files);
		};

		const removeImage = (index: number) => {
			const newImages = uploadedImages.filter((_, i) => i !== index);
			if (onChange) {
				onChange(newImages);
			} else {
				setValue(name, newImages, {
					shouldDirty: true,
					shouldValidate: true,
				});
			}
			onImagesUploaded?.(newImages);
		};

		// Drag and drop handlers
		const handleDragOver = useCallback((e: React.DragEvent) => {
			e.preventDefault();
			setDragOver(true);
		}, []);

		const handleDragLeave = useCallback((e: React.DragEvent) => {
			e.preventDefault();
			setDragOver(false);
		}, []);

		const handleDrop = useCallback(
			(e: React.DragEvent) => {
				e.preventDefault();
				setDragOver(false);

				const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
				handleFiles(files);
			},
			[handleFiles],
		);

		const triggerFileSelect = () => {
			fileInputRef.current?.click();
		};

		return (
			<div className="space-y-4">
				{label && (
					<FormLabel className="block text-sm font-medium mb-2">
						{label} ({uploadedImages.length}/{maxImages})
					</FormLabel>
				)}

				{/* Upload Area */}
				<div
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className={`
						border-2 border-dashed rounded-lg p-6 text-center transition-colors
						${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
						${disabled || uploadedImages.length >= maxImages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
					`}
					onClick={triggerFileSelect}
				>
					<input
						ref={el => {
							fileInputRef.current = el;
							if (typeof ref === 'function') ref(el);
							else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
						}}
						type="file"
						accept={acceptedTypes.join(',')}
						multiple
						onChange={handleFileSelect}
						onBlur={onBlur}
						disabled={disabled || uploading || uploadedImages.length >= maxImages}
						className="hidden"
						aria-label="Select images"
					/>

					<div className="flex flex-col items-center space-y-2">
						<Upload className={`w-8 h-8 ${dragOver ? 'text-blue-500' : 'text-gray-400'}`} />
						<div>
							<p className="text-sm font-medium text-gray-900">
								{dragOver ? 'Drop images here' : 'Drag & drop images here, or click to browse'}
							</p>
							<p className="text-xs text-gray-500">
								{acceptedTypes.join(', ')} • Max {maxFileSize}MB each • Up to {maxImages} images
							</p>
						</div>
						<Button
							type="button"
							variant="outline"
							size="sm"
							disabled={disabled || uploading || uploadedImages.length >= maxImages}
						>
							{uploading ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Uploading...
								</>
							) : (
								<>
									<Upload className="w-4 h-4 mr-2" />
									Choose Files
								</>
							)}
						</Button>
					</div>
				</div>

				{/* Upload Progress */}
				{uploadProgress.length > 0 && (
					<div className="space-y-2">
						<h4 className="text-sm font-medium text-gray-900">Upload Progress</h4>
						<div className="space-y-1">
							{uploadProgress.map(progress => (
								<div key={progress.id} className="flex items-center space-x-2">
									<div className="flex-1 bg-gray-200 rounded-full h-2">
										<div
											className={`h-2 rounded-full transition-all duration-300 ${
												progress.status === 'error'
													? 'bg-red-500'
													: progress.status === 'complete'
														? 'bg-green-500'
														: 'bg-blue-500'
											}`}
											style={{ width: `${progress.progress}%` }}
										/>
									</div>
									{progress.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
									{progress.status === 'complete' && <div className="w-4 h-4 text-green-500">✓</div>}
									{progress.status === 'error' && <div className="w-4 h-4 text-red-500">✕</div>}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Uploaded Images */}
				{uploadedImages.length > 0 && (
					<div>
						<h4 className="text-sm font-medium text-gray-900 mb-2">Uploaded Images</h4>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{uploadedImages.map((imageId, index) => (
								<ImagePreview key={imageId} imageId={imageId} onRemove={() => removeImage(index)} />
							))}
						</div>
					</div>
				)}
			</div>
		);
	},
);

ImageUpload.displayName = 'ImageUpload';

export default ImageUpload;

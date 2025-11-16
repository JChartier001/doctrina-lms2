'use client';

import { Controller, useFormContext } from 'react-hook-form';

import { ImageUpload } from '@/components/image-upload';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CreateCourseWizardType } from '@/schema/CourseWizardSchema';

// Mock categories for medical aesthetics
const categories = [
	{ id: 'botox', name: 'Botox & Neurotoxins' },
	{ id: 'fillers', name: 'Dermal Fillers' },
	{ id: 'laser', name: 'Laser Treatments' },
	{ id: 'skincare', name: 'Medical Skincare' },
	{ id: 'anatomy', name: 'Facial Anatomy' },
	{ id: 'business', name: 'Practice Management' },
	{ id: 'complications', name: 'Complications Management' },
	{ id: 'combination', name: 'Combination Therapies' },
];

const prerequisiteOptions = [
	{ value: 'none', label: 'No prerequisites' },
	{ value: 'basic', label: 'Basic knowledge of medical aesthetics' },
	{
		value: 'intermediate',
		label: 'Intermediate knowledge of medical aesthetics',
	},
	{ value: 'advanced', label: 'Advanced knowledge of medical aesthetics' },
	{ value: 'professional', label: 'Medical professional license required' },
];

export function BasicInfoStep() {
	const { control } = useFormContext<CreateCourseWizardType>();

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold mb-4">Basic Information</h2>
				<p className="text-muted-foreground mb-6">
					Provide the basic details about your course. This information will be displayed on the course listing page.
				</p>
			</div>

			<div className="space-y-5">
				<Controller
					control={control}
					name="title"
					render={({ field, fieldState: { error } }) => (
						<FormItem>
							<FormLabel>Course Title</FormLabel>
							<FormControl>
								<Input id="title" placeholder="e.g., Advanced Botox Techniques for Medical Professionals" {...field} />
							</FormControl>
							{error && <FormMessage>{error?.message}</FormMessage>}
						</FormItem>
					)}
				/>
				<Controller
					control={control}
					name="description"
					render={({ field, fieldState: { error } }) => (
						<FormItem>
							<FormLabel>Course Description</FormLabel>
							<FormControl>
								<Textarea
									id="description"
									placeholder="Describe what students will learn in your course..."
									{...field}
									rows={6}
								/>
							</FormControl>
							<FormDescription>
								Write a compelling description that explains what your course covers and its benefits (1000 characters
								max).
							</FormDescription>
							{error && <FormMessage>{error?.message}</FormMessage>}
						</FormItem>
					)}
				/>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Controller
						control={control}
						name="description"
						render={({ field, fieldState: { error } }) => (
							<FormItem className="space-y-2">
								<FormLabel>Category</FormLabel>
								<FormControl>
									<Select {...field}>
										<SelectTrigger id="category" className="w-full">
											<SelectValue placeholder="Select a category" />
										</SelectTrigger>
										<SelectContent>
											{categories.map(category => (
												<SelectItem key={category.id} value={category.id}>
													{category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormControl>
								<FormDescription>Choose the category that best fits your course content.</FormDescription>

								{error && <FormMessage>{error?.message}</FormMessage>}
							</FormItem>
						)}
					/>
					<Controller
						control={control}
						name="prerequisites"
						render={({ field, fieldState: { error } }) => (
							<FormItem className="space-y-2">
								<FormLabel>Prerequisites</FormLabel>
								<FormControl>
									<MultiSelect
										value={field.value || []}
										onChange={field.onChange}
										options={prerequisiteOptions}
										placeholder="Select prerequisites"
									/>
								</FormControl>
								<FormDescription>Specify any prerequisites or requirements for taking this course.</FormDescription>
								{error && <FormMessage>{error?.message}</FormMessage>}
							</FormItem>
						)}
					/>
				</div>
				<div className="space-y-5">
					<Label className="text-lg font-medium">Course Settings</Label>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Controller
							control={control}
							name="certificateOption"
							render={({ field, fieldState: { error } }) => (
								<FormItem className="space-y-2">
									<FormLabel>Certificate</FormLabel>
									<FormControl>
										<Select {...field}>
											<SelectTrigger id="certificateOption" className="w-full">
												<SelectValue placeholder="Certificate options" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="auto">Auto-generate upon completion</SelectItem>
												<SelectItem value="quiz">Require final quiz completion</SelectItem>
												<SelectItem value="manual">Manual approval by instructor</SelectItem>
												<SelectItem value="none">No certificate</SelectItem>
											</SelectContent>
										</Select>
									</FormControl>
									{error && <FormMessage>{error?.message}</FormMessage>}
								</FormItem>
							)}
						/>

						<Controller
							control={control}
							name="discussionOption"
							render={({ field, fieldState: { error } }) => (
								<FormItem className="space-y-2">
									<FormLabel>Discussion Forum</FormLabel>
									<FormControl>
										<Select {...field}>
											<SelectTrigger id="discussionOption" className="w-full">
												<SelectValue placeholder="Discussion options" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="enabled">Enabled</SelectItem>
												<SelectItem value="moderated">Moderated</SelectItem>
												<SelectItem value="disabled">Disabled</SelectItem>
											</SelectContent>
										</Select>
									</FormControl>
									{error && <FormMessage>{error?.message}</FormMessage>}
								</FormItem>
							)}
						/>
					</div>
					<Controller
						control={control}
						name="thumbnail"
						render={({ field, fieldState: { error } }) => (
							<FormItem>
								<FormControl>
									<ImageUpload
										value={field.value ? [field.value] : []}
										onChange={value => field.onChange(value?.[0] || null)}
										maxImages={1}
										label="Course Thumbnail"
									/>
								</FormControl>
								{error && <FormMessage>{error?.message}</FormMessage>}
							</FormItem>
						)}
					/>

					{/* 
				<div className='space-y-2'>
					<Label htmlFor='thumbnail' className='required'>
						Course Thumbnail
					</Label>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center'>
							<div className='mb-4 rounded-full bg-primary/10 p-3'>
								<Upload className='h-6 w-6 text-primary' />
							</div>
							<p className='text-sm font-medium mb-1'>
								Drag and drop your thumbnail image, or click to browse
							</p>
							<p className='text-xs text-muted-foreground mb-4'>
								JPG, PNG or GIF. 16:9 aspect ratio recommended (1280×720
								pixels).
							</p>
							<Button
								variant='outline'
								size='sm'
								onClick={() => document.getElementById('thumbnail')?.click()}
							>
								Choose Image
							</Button>
							<input
								id='thumbnail'
								type='file'
								accept='image/*'
								className='hidden'
								onChange={handleThumbnailChange}
							/>
						</div>
						<div className='flex items-center justify-center'>
							<div className='relative'>
								<Image
									src={thumbnailPreview || '/placeholder.svg'}
									alt='Course thumbnail preview'
									className='rounded-lg object-cover w-full max-h-[200px]'
								/>
								<p className='text-xs text-muted-foreground mt-2 text-center'>
									Preview
								</p>
							</div>
						</div>
					</div>
				</div> */}
				</div>
			</div>
		</div>
	);
}

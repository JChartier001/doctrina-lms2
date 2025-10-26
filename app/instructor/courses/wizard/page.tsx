'use client';

// import { useMutation } from 'convex/react';
import { CheckCircle2, ChevronLeft, ChevronRight, Eye, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

// Import wizard steps
import { BasicInfoStep } from '@/components/course-wizard/basic-info-step';
import { ContentStep } from '@/components/course-wizard/content-step';
import { PricingStep } from '@/components/course-wizard/pricing-step';
import { ReviewStep } from '@/components/course-wizard/review-step';
import { StructureStep } from '@/components/course-wizard/structure-step';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
// import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/lib/auth';
import { CreateCourseDefaultValues, CreateCourseWizardType } from '@/schema/CourseWizardSchema';

// Define the course data structure
export interface CourseData {
	id?: Id<'courses'>;
	title: string;
	description: string;
	category: string;
	thumbnail: string;
	price: string;
	sections: CourseSection[];
	visibility: string;
	prerequisites: string;
	certificateOption: string;
	discussionOption: string;
}

export interface CourseSection {
	id: string;
	title: string;
	lessons: CourseLesson[];
}

export interface CourseLesson {
	id: string;
	title: string;
	type: 'video' | 'document' | 'quiz';
	content: string;
	duration?: number;
	questions?: QuizQuestion[];
}

export interface QuizQuestion {
	id: string;
	question: string;
	options: string[];
	correctOption: number;
}

export default function CourseWizard() {
	const form = useForm<CreateCourseWizardType>({
		mode: 'onChange',
		reValidateMode: 'onBlur',
		defaultValues: CreateCourseDefaultValues,
	});
	const [currentStep, setCurrentStep] = useState(0);

	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const { user } = useAuth();
	const router = useRouter();

	// Convex mutations
	// const createCourse = useMutation(api.courses.create);
	// const updateCourse = useMutation(api.courses.update);

	// Define the steps
	const steps = [
		{ name: 'Basic Info', component: BasicInfoStep },
		{ name: 'Structure', component: StructureStep },
		{ name: 'Content', component: ContentStep },
		{ name: 'Pricing', component: PricingStep },
		{ name: 'Review', component: ReviewStep },
	];

	// Calculate progress percentage
	const progressPercentage = ((currentStep + 1) / steps.length) * 100;

	// Handle next step
	const handleNext = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1);
			window.scrollTo(0, 0);
		}
	};

	// Handle previous step
	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
			window.scrollTo(0, 0);
		}
	};

	// Handle save draft
	const handleSaveDraft = async (data: CreateCourseWizardType) => {
		setIsSaving(true);

		try {
			console.log(data);
			// Use Convex to save/update course
			//TODO: create course or update course
			toast.success('Draft saved, Your course draft has been saved successfully.');

			// if (data.id) {
			// 	// Update existing course
			// 	await updateCourse({
			// 		id: data.id as Id<'courses'>,
			// 		...data,
			// 	});
		} catch (error) {
			console.error('Failed to save draft:', error);
			toast.error('Failed to save draft, Please try again.');
		}
		setIsSaving(false);
	};

	// Handle preview
	const handlePreview = () => {
		// Open preview in new tab or modal
		toast.info('Preview mode, Course preview functionality will be available soon.');
	};

	// Handle publish
	const handlePublish = async () => {
		setIsLoading(true);

		try {
			// Use Convex to publish course
			// const courseParams = {
			// 	title: courseData.title,
			// 	description: courseData.description,
			// 	instructorId: user!.id as Id<'users'>,
			// 	level: 'beginner' as const,
			// 	duration: '8 weeks', // Default duration
			// 	price: parseFloat(courseData.price) || 0,
			// 	thumbnailUrl: courseData.thumbnail || undefined,
			// };

			// if (courseData.id) {
			// 	// Update existing course
			// 	await updateCourse({
			// 		id: courseData.id as Id<'courses'>,
			// 		...courseParams,
			// 	});
			// } else {
			// 	// Create new course
			// 	const courseId = await createCourse(courseParams);
			// 	setCourseData(prev => ({ ...prev, id: courseId }));
			// }

			toast.success('Course published, Your course has been published successfully.');
			router.push('/instructor/dashboard');
		} catch (error) {
			console.error('Failed to publish course:', error);
			toast.error('Failed to publish course, Please try again.');
		}
		setIsLoading(false);
	};

	// Render current step component
	const CurrentStepComponent = steps[currentStep].component;

	// Redirect if not instructor
	if (!user || !Boolean(user.isInstructor)) {
		return null;
	}
	return (
		<div className="container py-10">
			<div className="flex flex-col space-y-8">
				<div className="flex justify-between">
					{steps.map((step, index) => (
						<button
							key={index}
							className={`flex flex-col items-center space-y-2 ${
								index <= currentStep ? 'text-primary' : 'text-muted-foreground'
							}`}
							onClick={() => {
								// Only allow navigation to completed steps or the current step
								if (index <= currentStep) {
									setCurrentStep(index);
								}
							}}
						>
							<div
								className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
									index < currentStep
										? 'border-primary bg-primary text-primary-foreground'
										: index === currentStep
											? 'border-primary text-primary'
											: 'border-muted-foreground text-muted-foreground'
								}`}
							>
								{index < currentStep ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
							</div>
							<span className="text-xs font-medium">{step.name}</span>
						</button>
					))}
				</div>
				<Progress value={progressPercentage} className="h-2" />
			</div>

			{/* Current step content */}
			<Card className="p-6">
				<FormProvider {...form}>
					<CurrentStepComponent courseData={{} as CourseData} updateCourseData={() => {}} />
				</FormProvider>
			</Card>

			{/* Navigation buttons */}
			<div className="flex justify-between">
				<div>
					{currentStep > 0 && (
						<Button variant="outline" onClick={handlePrevious} className="flex items-center gap-2">
							<ChevronLeft className="h-4 w-4" />
							Previous
						</Button>
					)}
				</div>
				<div className="flex space-x-2">
					<Button
						variant="outline"
						onClick={() => handleSaveDraft(form.getValues())}
						disabled={isSaving}
						className="flex items-center gap-2"
					>
						<Save className="h-4 w-4" />
						{isSaving ? 'Saving...' : 'Save Draft'}
					</Button>
					<Button variant="outline" onClick={() => handlePreview()} className="flex items-center gap-2">
						<Eye className="h-4 w-4" />
						Preview
					</Button>
					{currentStep < steps.length - 1 ? (
						<Button onClick={handleNext} className="flex items-center gap-2">
							Next
							<ChevronRight className="h-4 w-4" />
						</Button>
					) : (
						<Button onClick={handlePublish} disabled={isLoading} className="flex items-center gap-2">
							{isLoading ? 'Publishing...' : 'Publish Course'}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

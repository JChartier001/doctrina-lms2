'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type {
	CourseData,
	CourseLesson,
	QuizQuestion,
} from '@/app/instructor/courses/wizard/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Video,
	FileText,
	ListChecks,
	Upload,
	Plus,
	Trash2,
	Sparkles,
} from 'lucide-react';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIQuizGenerator } from './ai-quiz-generator';
import { useForm } from 'react-hook-form';
import {
	CreateCourseDefaultValues,
	CreateCourseLessonType,
} from '@/schema/CourseWizardSchema';
import { BasicInfoStep } from './basic-info-step';
import { StructureStep } from './structure-step';
import { PricingStep } from './pricing-step';
import { ReviewStep } from './review-step';
import {
	Stepper,
	StepperTitle,
	StepperTrigger,
	StepperItem,
	StepperIndicator,
	StepperSeparator,
	StepperDescription,
} from '../ui/stepper';

interface ContentStepProps {
	courseData: CourseData;
	updateCourseData: (data: Partial<CourseData>) => void;
}

export function ContentStep({
	courseData,
	updateCourseData,
}: ContentStepProps) {
	const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(
		null
	);
	const [videoUrl, setVideoUrl] = useState('');
	const [documentContent, setDocumentContent] = useState('');
	const [newQuestion, setNewQuestion] = useState('');
	const [newOptions, setNewOptions] = useState(['', '', '', '']);
	const [correctOption, setCorrectOption] = useState(0);
	const [activeTab, setActiveTab] = useState<string>('manual');

	// Find all lessons
	const allLessons = courseData.sections.flatMap(section =>
		section.lessons.map(lesson => ({
			...lesson,
			sectionTitle: section.title,
			sectionId: section.id,
		}))
	);

	// Handle lesson selection
	const handleLessonSelect = (lesson: CourseLesson & { sectionId: string }) => {
		setSelectedLesson(lesson);

		// Set form values based on lesson content
		if (lesson.type === 'video') {
			setVideoUrl(lesson.content || '');
		} else if (lesson.type === 'document') {
			setDocumentContent(lesson.content || '');
		}

		// Reset the active tab to manual when switching lessons
		setActiveTab('manual');
	};

	// Update lesson content
	const updateLessonContent = (content: string) => {
		if (!selectedLesson) return;

		const updatedSections = courseData.sections.map(section => {
			if (section.id === (selectedLesson as any).sectionId) {
				return {
					...section,
					lessons: section.lessons.map(lesson => {
						if (lesson.id === selectedLesson.id) {
							return {
								...lesson,
								content,
							};
						}
						return lesson;
					}),
				};
			}
			return section;
		});

		updateCourseData({ sections: updatedSections });
	};

	// Add quiz question
	const addQuizQuestion = () => {
		if (
			!selectedLesson ||
			!newQuestion.trim() ||
			newOptions.some(opt => !opt.trim())
		)
			return;

		const newQuizQuestion: QuizQuestion = {
			id: `question-${Date.now()}`,
			question: newQuestion,
			options: [...newOptions],
			correctOption,
		};

		addQuizQuestions([newQuizQuestion]);

		// Reset form
		setNewQuestion('');
		setNewOptions(['', '', '', '']);
		setCorrectOption(0);
	};

	// Add multiple quiz questions (used by AI generator)
	const addQuizQuestions = (questions: QuizQuestion[]) => {
		if (!selectedLesson) return;

		const updatedSections = courseData.sections.map(section => {
			if (section.id === (selectedLesson as any).sectionId) {
				return {
					...section,
					lessons: section.lessons.map(lesson => {
						if (lesson.id === selectedLesson.id) {
							return {
								...lesson,
								questions: [...(lesson.questions || []), ...questions],
							};
						}
						return lesson;
					}),
				};
			}
			return section;
		});

		updateCourseData({ sections: updatedSections });
	};

	// Delete quiz question
	const deleteQuizQuestion = (questionId: string) => {
		if (!selectedLesson) return;

		const updatedSections = courseData.sections.map(section => {
			if (section.id === (selectedLesson as any).sectionId) {
				return {
					...section,
					lessons: section.lessons.map(lesson => {
						if (lesson.id === selectedLesson.id && lesson.questions) {
							return {
								...lesson,
								questions: lesson.questions.filter(q => q.id !== questionId),
							};
						}
						return lesson;
					}),
				};
			}
			return section;
		});

		updateCourseData({ sections: updatedSections });
	};

	// Update option
	const updateOption = (index: number, value: string) => {
		const updatedOptions = [...newOptions];
		updatedOptions[index] = value;
		setNewOptions(updatedOptions);
	};

	// Get lesson type icon
	const getLessonTypeIcon = (type: string) => {
		switch (type) {
			case 'video':
				return <Video className='h-4 w-4' />;
			case 'document':
				return <FileText className='h-4 w-4' />;
			case 'quiz':
				return <ListChecks className='h-4 w-4' />;
			default:
				return <Video className='h-4 w-4' />;
		}
	};

	return (
		<div className='space-y-6'>
			<div>
				<h2 className='text-2xl font-bold mb-4'>Course Content</h2>
				<p className='text-muted-foreground mb-6'>
					Add content to your lessons. You can upload videos, create documents,
					or create quizzes.
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				<div className='md:col-span-1 space-y-4'>
					<Card>
						<CardHeader>
							<CardTitle>Lessons</CardTitle>
						</CardHeader>
						<CardContent className='p-0'>
							<Accordion
								type='single'
								collapsible
								className='w-full'
								defaultValue={courseData.sections[0]?.id}
							>
								{courseData.sections.map(section => (
									<AccordionItem key={section.id} value={section.id}>
										<AccordionTrigger className='px-4 py-2'>
											{section.title}
										</AccordionTrigger>
										<AccordionContent className='pt-0'>
											<div className='space-y-1'>
												{section.lessons.map(lesson => (
													<Button
														key={lesson.id}
														variant={
															selectedLesson?.id === lesson.id
																? 'secondary'
																: 'ghost'
														}
														className='w-full justify-start px-6 py-2 h-auto'
														onClick={() =>
															handleLessonSelect({
																...lesson,
																sectionId: section.id,
																sectionTitle: section.title,
															})
														}
													>
														<div className='flex items-center gap-2'>
															{getLessonTypeIcon(lesson.type)}
															<span className='truncate'>{lesson.title}</span>
														</div>
													</Button>
												))}
											</div>
										</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						</CardContent>
					</Card>
				</div>

				<div className='md:col-span-2'>
					{selectedLesson ? (
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									{getLessonTypeIcon(selectedLesson.type)}
									<span>{selectedLesson.title}</span>
								</CardTitle>
								<p className='text-sm text-muted-foreground'>
									Section: {(selectedLesson as any).sectionTitle}
								</p>
							</CardHeader>
							<CardContent>
								{selectedLesson.type === 'video' && (
									<div className='space-y-4'>
										<div className='space-y-2'>
											<Label htmlFor='videoUrl'>Video URL</Label>
											<Input
												id='videoUrl'
												placeholder='Enter YouTube or Vimeo URL'
												value={videoUrl}
												onChange={e => setVideoUrl(e.target.value)}
											/>
											<p className='text-xs text-muted-foreground'>
												Paste a YouTube or Vimeo URL, or upload your own video.
											</p>
										</div>

										<div className='space-y-2'>
											<Label>Or Upload Video File</Label>
											<div className='border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center'>
												<div className='mb-4 rounded-full bg-primary/10 p-3'>
													<Upload className='h-6 w-6 text-primary' />
												</div>
												<p className='text-sm font-medium mb-1'>
													Drag and drop your video file, or click to browse
												</p>
												<p className='text-xs text-muted-foreground mb-4'>
													MP4, MOV, or WebM format. Maximum size: 2GB
												</p>
												<Button variant='outline' size='sm'>
													Choose File
												</Button>
											</div>
										</div>

										<Button
											onClick={() => updateLessonContent(videoUrl)}
											disabled={!videoUrl.trim()}
										>
											Save Video
										</Button>
									</div>
								)}

								{selectedLesson.type === 'document' && (
									<div className='space-y-4'>
										<div className='space-y-2'>
											<Label htmlFor='documentContent'>Document Content</Label>
											<Textarea
												id='documentContent'
												placeholder='Enter document content...'
												value={documentContent}
												onChange={e => setDocumentContent(e.target.value)}
												rows={12}
											/>
											<p className='text-xs text-muted-foreground'>
												You can use Markdown formatting for rich text.
											</p>
										</div>

										<Button
											onClick={() => updateLessonContent(documentContent)}
											disabled={!documentContent.trim()}
										>
											Save Document
										</Button>
									</div>
								)}

								{selectedLesson.type === 'quiz' && (
									<div className='space-y-6'>
										<Tabs value={activeTab} onValueChange={setActiveTab}>
											<TabsList className='grid w-full grid-cols-2'>
												<TabsTrigger value='manual'>
													Manual Creation
												</TabsTrigger>
												<TabsTrigger
													value='ai'
													className='flex items-center gap-1'
												>
													<Sparkles className='h-3.5 w-3.5' />
													AI Generation
												</TabsTrigger>
											</TabsList>

											<TabsContent value='manual' className='space-y-6 pt-4'>
												<div className='space-y-4'>
													{selectedLesson.questions &&
													selectedLesson.questions.length > 0 ? (
														<div className='space-y-4'>
															{selectedLesson.questions.map(
																(question, qIndex) => (
																	<Card key={question.id} className='border'>
																		<CardContent className='p-4'>
																			<div className='flex justify-between items-start mb-2'>
																				<h4 className='font-medium'>
																					Question {qIndex + 1}
																				</h4>
																				<Button
																					variant='ghost'
																					size='icon'
																					className='h-8 w-8 text-destructive'
																					onClick={() =>
																						deleteQuizQuestion(question.id)
																					}
																				>
																					<Trash2 className='h-4 w-4' />
																				</Button>
																			</div>
																			<p className='mb-2'>
																				{question.question}
																			</p>
																			<div className='space-y-1 pl-4'>
																				{question.options.map(
																					(option, oIndex) => (
																						<div
																							key={oIndex}
																							className={`p-2 rounded-md ${
																								oIndex ===
																								question.correctOption
																									? 'bg-green-100 dark:bg-green-900/20'
																									: ''
																							}`}
																						>
																							{oIndex ===
																								question.correctOption && (
																								<span className='text-green-600 dark:text-green-400 mr-2'>
																									✓
																								</span>
																							)}
																							{option}
																						</div>
																					)
																				)}
																			</div>
																		</CardContent>
																	</Card>
																)
															)}
														</div>
													) : (
														<div className='text-center py-4 text-muted-foreground'>
															No questions added yet. Add your first question
															below.
														</div>
													)}
												</div>

												<div className='border-t pt-4'>
													<h4 className='font-medium mb-4'>Add New Question</h4>
													<div className='space-y-4'>
														<div className='space-y-2'>
															<Label htmlFor='question'>Question</Label>
															<Input
																id='question'
																placeholder='Enter your question'
																value={newQuestion}
																onChange={e => setNewQuestion(e.target.value)}
															/>
														</div>

														<div className='space-y-2'>
															<Label>Options</Label>
															<div className='space-y-2'>
																{newOptions.map((option, index) => (
																	<div
																		key={index}
																		className='flex items-center gap-2'
																	>
																		<Input
																			placeholder={`Option ${index + 1}`}
																			value={option}
																			onChange={e =>
																				updateOption(index, e.target.value)
																			}
																		/>
																		<Button
																			type='button'
																			variant='ghost'
																			size='icon'
																			className={`h-8 w-8 ${
																				correctOption === index
																					? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
																					: ''
																			}`}
																			onClick={() => setCorrectOption(index)}
																		>
																			{correctOption === index ? (
																				<svg
																					xmlns='http://www.w3.org/2000/svg'
																					width='24'
																					height='24'
																					viewBox='0 0 24 24'
																					fill='none'
																					stroke='currentColor'
																					strokeWidth='2'
																					strokeLinecap='round'
																					strokeLinejoin='round'
																					className='h-4 w-4'
																				>
																					<path d='M20 6 9 17l-5-5' />
																				</svg>
																			) : (
																				<svg
																					xmlns='http://www.w3.org/2000/svg'
																					width='24'
																					height='24'
																					viewBox='0 0 24 24'
																					fill='none'
																					stroke='currentColor'
																					strokeWidth='2'
																					strokeLinecap='round'
																					strokeLinejoin='round'
																					className='h-4 w-4'
																				>
																					<circle cx='12' cy='12' r='10' />
																				</svg>
																			)}
																		</Button>
																	</div>
																))}
															</div>
															<p className='text-xs text-muted-foreground'>
																Click the circle button to mark the correct
																answer.
															</p>
														</div>

														<Button
															onClick={addQuizQuestion}
															disabled={
																!newQuestion.trim() ||
																newOptions.some(opt => !opt.trim())
															}
															className='w-full'
														>
															<Plus className='h-4 w-4 mr-2' />
															Add Question
														</Button>
													</div>
												</div>
											</TabsContent>

											<TabsContent value='ai' className='pt-4'>
												<AIQuizGenerator
													onAddQuestions={addQuizQuestions}
													existingContent={documentContent || ''}
												/>
											</TabsContent>
										</Tabs>
									</div>
								)}
							</CardContent>
						</Card>
					) : (
						<Card className='flex flex-col items-center justify-center p-6 h-full'>
							<div className='text-center space-y-2'>
								<h3 className='text-lg font-medium'>No Lesson Selected</h3>
								<p className='text-sm text-muted-foreground'>
									Select a lesson from the sidebar to add content.
								</p>
							</div>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}

const ContentStepForm = () => {
	const form = useForm<CreateCourseLessonType>({
		mode: 'onChange',
		reValidateMode: 'onBlur',
		defaultValues: CreateCourseDefaultValues,
	});

	const steps = [
		{
			title: 'Basic Info',
			description: 'Add basic information about your course',
			component: BasicInfoStep,
		},
		{
			title: 'Structure',
			description: 'Add the structure of your course',
			component: StructureStep,
		},
		{
			title: 'Content',
			description: 'Add the content of your course',
			component: ContentStep,
		},
		{
			title: 'Pricing',
			description: 'Add the pricing of your course',
			component: PricingStep,
		},
		{
			title: 'Review',
			description: 'Review the course and make any final adjustments',
			component: ReviewStep,
		},
	];

	return (
		<Stepper defaultValue={2}>
			{steps.map(({ title, component }, index) => (
				<StepperItem
					key={index}
					step={index + 1}
					className='not-last:flex-1 max-md:items-start'
				>
					<StepperTrigger className='rounded max-md:flex-col'>
						<StepperIndicator />
						<div className='text-center md:text-left'>
							<StepperTitle>{title}</StepperTitle>
							<StepperDescription className='max-sm:hidden'>
								{description}
							</StepperDescription>
						</div>
					</StepperTrigger>
					{index < steps.length && (
						<StepperSeparator className='max-md:mt-3.5 md:mx-4' />
					)}
				</StepperItem>
			))}
		</Stepper>
	);
};

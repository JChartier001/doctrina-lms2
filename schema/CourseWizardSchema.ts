import { Id } from '@/convex/_generated/dataModel';
import { z } from 'zod';

export const CreateCourseQuestionSchema = z.object({
	question: z.string(),
	options: z.array(z.string()),
	correctOption: z.number(),
});

export const CreateCourseLessonSchema = z.object({
	title: z.string(),
	type: z.enum(['video', 'document', 'quiz']),
	content: z.string(),
	duration: z.number(),
	questions: z.array(CreateCourseQuestionSchema).optional(),
});

export const CreateCourseSectionSchema = z.object({
	title: z.string(),
	lessons: z.array(CreateCourseLessonSchema),
});

export const CreateCourseWizardSchema = z.object({
	title: z.string(),
	description: z.string(),
	category: z.string(),
	thumbnail: z.custom<Id<'_storage'>>(),
	price: z.number(),
	sections: z.array(CreateCourseSectionSchema),
	visibility: z.enum(['public', 'private']),
	prerequisites: z.array(z.string()),
	certificateOption: z.enum(['auto', 'manual']),
	discussionOption: z.enum(['enabled', 'disabled']),
});

export type CreateCourseWizardType = z.infer<typeof CreateCourseWizardSchema>;
export type CreateCourseSectionType = z.infer<typeof CreateCourseSectionSchema>;
export type CreateCourseLessonType = z.infer<typeof CreateCourseLessonSchema>;
export type CreateCourseQuestionType = z.infer<
	typeof CreateCourseQuestionSchema
>;

export const CreateCourseDefaultValues: CreateCourseWizardType = {
	title: '',
	description: '',
	category: '',
	thumbnail: '' as Id<'_storage'>,
	price: 0,
	sections: [],
	visibility: 'public',
	prerequisites: [],
	certificateOption: 'auto',
	discussionOption: 'enabled',
};

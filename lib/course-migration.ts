import { useMutation } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

// Mock course data for migration
const mockCourseData = {
	id: 'course-1',
	title: 'Introduction to Medical Aesthetics',
	description: 'Learn the fundamentals of medical aesthetics in this comprehensive course.',
	longDescription: `This comprehensive course is designed for medical professionals who want to build a strong foundation in medical aesthetics.

Over the course of 8 weeks, you'll learn from industry experts through a combination of video lessons, live demonstrations, interactive workshops, and hands-on training opportunities.

The curriculum is structured to provide a systematic progression from basic principles to specialized applications, ensuring that you develop the knowledge, skills, and confidence needed to excel in the field of medical aesthetics.`,
	image: '/placeholder.svg?height=400&width=800',
	duration: '8 weeks',
	lessons: 24,
	students: 156,
	level: 'Beginner',
	pricing: {
		oneTime: 99.99,
	},
	tags: ['Fundamentals', 'Botox', 'Fillers'],
	whatYouWillLearn: [
		'Comprehensive facial anatomy with focus on aesthetic implications',
		'Basic injection techniques for FDA-approved neurotoxins and dermal fillers',
		'Patient assessment and treatment planning',
		'Medical aesthetic practice fundamentals',
		'Legal and regulatory considerations in aesthetic medicine',
	],
	requirements: [
		'Must be a licensed medical professional (MD, DO, NP, PA, RN, or equivalent)',
		'Basic understanding of facial anatomy',
		'Computer with internet access for online components',
	],
	instructor: {
		id: 'instructor-1',
		name: 'Dr. Sarah Johnson',
		image: '/placeholder.svg?height=100&width=100',
		title: 'Board-Certified Dermatologist',
		bio: 'With over 15 years of experience in medical aesthetics, Dr. Johnson specializes in advanced injection techniques and has trained over 500 medical professionals.',
	},
	curriculum: [
		{
			title: 'Foundations of Medical Aesthetics',
			lessons: [
				{
					title: 'Introduction to Medical Aesthetics',
					duration: '45 min',
					type: 'video',
				},
				{ title: 'Applied Facial Anatomy', duration: '1.5 hrs', type: 'video' },
				{
					title: 'Patient Assessment and Photography',
					duration: '1 hr',
					type: 'video',
				},
				{ title: 'Foundations Quiz', duration: '30 min', type: 'quiz' },
			],
		},
		{
			title: 'Neurotoxins Basics',
			lessons: [
				{ title: 'Neurotoxin Pharmacology', duration: '1 hr', type: 'video' },
				{
					title: 'Basic Injection Techniques',
					duration: '2 hrs',
					type: 'video',
				},
				{ title: 'Common Applications', duration: '1.5 hrs', type: 'video' },
				{
					title: 'Neurotoxin Assessment',
					duration: '45 min',
					type: 'assignment',
				},
			],
		},
	],
	reviews: [
		{
			id: 'review-1',
			user: {
				name: 'Dr. James Wilson',
				image: '/placeholder.svg?height=40&width=40',
			},
			rating: 5,
			date: '2023-04-15',
			content:
				'This course has transformed my practice. The comprehensive approach covers everything from basic principles to practical applications. The instructor is excellent and the content is well-structured.',
		},
		{
			id: 'review-2',
			user: {
				name: 'Dr. Lisa Martinez',
				image: '/placeholder.svg?height=40&width=40',
			},
			rating: 4,
			date: '2023-03-22',
			content:
				'Great introduction to medical aesthetics with good attention to detail, especially in facial anatomy and injection techniques.',
		},
	],
};

// Migration function to populate Convex with course data
export function useCourseMigration() {
	const createCourse = useMutation(api.courses.create);

	const migrateCourseData = async () => {
		try {
			// Create a mock instructor ID (in real migration, this would come from users table)
			const instructorId = 'user-instructor-1' as Id<'users'>;

			const courseId = await createCourse({
				title: mockCourseData.title,
				description: mockCourseData.description,
				instructorId,
				level: mockCourseData.level as 'beginner' | 'intermediate' | 'advanced',
				duration: mockCourseData.duration,
				price: mockCourseData.pricing.oneTime,
				thumbnailUrl: mockCourseData.image,
			});

			console.log('Course migrated successfully:', courseId);
			return courseId;
		} catch (error) {
			console.error('Failed to migrate course data:', error);
			throw error;
		}
	};

	return { migrateCourseData };
}

// Hook to get course data
export function useCourseData(_courseId: string) {
	// TODO: Implement Convex query
	return {
		data: mockCourseData,
		isLoading: false,
		error: null,
	};
}

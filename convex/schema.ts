import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const userSchema = {
	firstName: v.string(),
	lastName: v.string(),
	email: v.string(),
	image: v.optional(v.string()),
	profilePhotoUrl: v.optional(v.string()),
	bio: v.optional(v.string()),
	title: v.optional(v.string()), // Professional title (e.g., "MD, Board Certified Dermatologist")
	isInstructor: v.boolean(), // Can create and teach courses
	isAdmin: v.boolean(), // Platform administration access
	phone: v.optional(v.string()),
	externalId: v.string(), // Clerk user ID
	lastLogin: v.optional(v.string()),
	createdAt: v.optional(v.string()),
	updatedAt: v.optional(v.string()),
};

export default defineSchema({
	users: defineTable(userSchema).index('by_email', ['email']).index('by_externalId', ['externalId']),

	courses: defineTable({
		title: v.string(),
		description: v.string(),
		instructorId: v.id('users'),
		level: v.optional(v.union(v.literal('beginner'), v.literal('intermediate'), v.literal('advanced'))),
		duration: v.optional(v.string()),
		price: v.optional(v.number()),
		thumbnailUrl: v.optional(v.string()),
		rating: v.optional(v.number()),
		reviewCount: v.optional(v.number()),
		tags: v.optional(v.array(v.string())),
		whatYouWillLearn: v.optional(v.array(v.string())),
		requirements: v.optional(v.array(v.string())),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index('by_instructor', ['instructorId']),

	resources: defineTable({
		title: v.string(),
		description: v.string(),
		type: v.string(),
		categories: v.array(v.string()),
		tags: v.array(v.string()),
		url: v.string(),
		thumbnailUrl: v.optional(v.string()),
		author: v.string(),
		dateAdded: v.string(),
		featured: v.boolean(),
		downloadCount: v.number(),
		favoriteCount: v.number(),
		rating: v.number(),
		reviewCount: v.number(),
		difficulty: v.union(v.literal('beginner'), v.literal('intermediate'), v.literal('advanced')),
		duration: v.optional(v.string()),
		fileSize: v.optional(v.string()),
		courseId: v.optional(v.id('courses')),
		restricted: v.boolean(),
	}).index('by_course', ['courseId']),

	favorites: defineTable({
		userId: v.id('users'),
		resourceId: v.id('resources'),
		createdAt: v.number(),
	}).index('by_user_resource', ['userId', 'resourceId']),

	notifications: defineTable({
		userId: v.id('users'),
		title: v.string(),
		description: v.string(),
		type: v.union(
			v.literal('course_update'),
			v.literal('message'),
			v.literal('announcement'),
			v.literal('community'),
			v.literal('live_session'),
			v.literal('certificate'),
			v.literal('milestone'),
		),
		read: v.boolean(),
		createdAt: v.number(),
		link: v.optional(v.string()),
		metadata: v.optional(v.any()),
	}).index('by_user_created', ['userId', 'createdAt']),

	liveSessions: defineTable({
		title: v.string(),
		description: v.string(),
		instructorId: v.id('users'),
		scheduledFor: v.number(),
		duration: v.number(),
		isRecorded: v.boolean(),
		maxParticipants: v.number(),
		status: v.union(v.literal('scheduled'), v.literal('live'), v.literal('completed'), v.literal('cancelled')),
		recordingUrl: v.optional(v.string()),
	})
		.index('by_status', ['status'])
		.index('by_instructor', ['instructorId']),

	sessionParticipants: defineTable({
		sessionId: v.id('liveSessions'),
		userId: v.id('users'),
		joinedAt: v.number(),
	})
		.index('by_session', ['sessionId'])
		.index('by_user', ['userId']),

	certificates: defineTable({
		userId: v.id('users'),
		userName: v.string(),
		courseId: v.id('courses'),
		courseName: v.string(),
		instructorId: v.id('users'),
		instructorName: v.string(),
		issueDate: v.string(),
		expiryDate: v.optional(v.string()),
		verificationCode: v.string(),
		templateId: v.string(),
	})
		.index('by_user', ['userId'])
		.index('by_verification', ['verificationCode']),

	purchases: defineTable({
		userId: v.string(), // Clerk external ID
		courseId: v.id('courses'),
		amount: v.number(),
		stripeSessionId: v.optional(v.string()),
		currency: v.optional(v.string()),
		status: v.union(v.literal('open'), v.literal('complete'), v.literal('expired')),
		createdAt: v.number(),
	})
		.index('by_user', ['userId'])
		.index('by_course', ['courseId']),

	// Sprint 1: Course Structure
	courseModules: defineTable({
		courseId: v.id('courses'),
		title: v.string(),
		description: v.optional(v.string()),
		order: v.number(),
		createdAt: v.number(),
	})
		.index('by_course', ['courseId'])
		.index('by_course_order', ['courseId', 'order']),

	lessons: defineTable({
		moduleId: v.id('courseModules'),
		title: v.string(),
		description: v.optional(v.string()),
		type: v.union(v.literal('video'), v.literal('quiz'), v.literal('assignment')),
		duration: v.optional(v.string()), // e.g., "15:30"
		videoUrl: v.optional(v.string()),
		videoId: v.optional(v.string()), // Vimeo/Cloudflare video ID
		content: v.optional(v.string()), // Rich text for non-video lessons
		isPreview: v.boolean(),
		order: v.number(),
		createdAt: v.number(),
	})
		.index('by_module', ['moduleId'])
		.index('by_module_order', ['moduleId', 'order']),

	enrollments: defineTable({
		userId: v.string(), // Clerk external ID
		courseId: v.id('courses'),
		purchaseId: v.id('purchases'),
		enrolledAt: v.number(),
		completedAt: v.optional(v.number()),
		progressPercent: v.number(), // 0-100
	})
		.index('by_user', ['userId'])
		.index('by_course', ['courseId'])
		.index('by_user_course', ['userId', 'courseId']),

	// Sprint 2: Progress Tracking
	lessonProgress: defineTable({
		userId: v.string(),
		lessonId: v.id('lessons'),
		completedAt: v.number(),
	})
		.index('by_user', ['userId'])
		.index('by_lesson', ['lessonId'])
		.index('by_user_lesson', ['userId', 'lessonId']),

	// Sprint 2: Quiz System
	quizzes: defineTable({
		courseId: v.id('courses'),
		moduleId: v.optional(v.id('courseModules')),
		title: v.string(),
		passingScore: v.number(), // 0-100
		createdAt: v.number(),
	})
		.index('by_course', ['courseId'])
		.index('by_module', ['moduleId']),

	quizQuestions: defineTable({
		quizId: v.id('quizzes'),
		question: v.string(),
		options: v.array(v.string()), // 4 options
		correctAnswer: v.number(), // 0-3 (index of correct option)
		explanation: v.optional(v.string()),
		order: v.number(),
	})
		.index('by_quiz', ['quizId'])
		.index('by_quiz_order', ['quizId', 'order']),

	quizAttempts: defineTable({
		userId: v.string(),
		quizId: v.id('quizzes'),
		answers: v.array(v.number()),
		score: v.number(),
		passed: v.boolean(),
		submittedAt: v.number(),
	})
		.index('by_user', ['userId'])
		.index('by_quiz', ['quizId'])
		.index('by_user_quiz', ['userId', 'quizId']),

	// Sprint 3: Reviews
	courseReviews: defineTable({
		userId: v.string(),
		courseId: v.id('courses'),
		rating: v.number(), // 1-5
		content: v.string(),
		createdAt: v.number(),
		hidden: v.boolean(),
	})
		.index('by_course', ['courseId'])
		.index('by_user', ['userId'])
		.index('by_user_course', ['userId', 'courseId']),
});

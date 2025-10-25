import { v } from 'convex/values';

import { api } from './_generated/api';
import { action } from './_generated/server';

/**
 * Create a Stripe Checkout session for course purchase
 *
 * @requires STRIPE_SECRET_KEY environment variable
 */
export const createCheckoutSession = action({
	args: { courseId: v.id('courses') },
	handler: async (ctx, { courseId }): Promise<string> => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) {
			throw new Error('Must be logged in to purchase a course');
		}

		// Get course details
		const course = await ctx.runQuery(api.courses.get, { id: courseId });
		if (!course) {
			throw new Error('Course not found');
		}

		// Check if already enrolled
		const enrolled = await ctx.runQuery(api.enrollments.isEnrolled, {
			userId: identity.subject,
			courseId,
		});

		if (enrolled) {
			throw new Error('Already enrolled in this course');
		}

		// Dynamically import Stripe (only needed in action context)
		const Stripe = (await import('stripe')).default;
		const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
			apiVersion: '2025-09-30.clover',
		});

		// Create checkout session
		const session = await stripe.checkout.sessions.create({
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: course.title,
							description: course.description || '',
							images: course.thumbnailUrl ? [course.thumbnailUrl] : [],
						},
						unit_amount: Math.round((course.price || 0) * 100), // Convert to cents
					},
					quantity: 1,
				},
			],
			mode: 'payment',
			success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}?canceled=true`,
			metadata: {
				courseId: courseId,
				userId: identity.subject,
			},
			customer_email: identity.email,
		});

		if (!session.url) {
			throw new Error('Failed to create checkout session');
		}

		return session.url;
	},
});

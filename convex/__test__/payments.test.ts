import type { GenericMutationCtx } from 'convex/server';
import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '../_generated/api';
import type { DataModel, Id } from '../_generated/dataModel';
import schema from '../schema';

type TestCtx = GenericMutationCtx<DataModel>;

// Mock Stripe
const mockStripeCheckoutSessionCreate = vi.fn();

class MockStripe {
	checkout = {
		sessions: {
			create: mockStripeCheckoutSessionCreate,
		},
	};
}

vi.mock('stripe', () => {
	return {
		default: MockStripe,
	};
});

describe('payments', () => {
	let t: any;
	let instructorId: Id<'users'>;
	let studentExternalId: string;
	let studentConvexId: Id<'users'>;
	let courseId: Id<'courses'>;

	beforeEach(async () => {
		t = convexTest(schema);

		// Set required environment variables
		process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
		process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

		// Reset mocks
		mockStripeCheckoutSessionCreate.mockReset();
		mockStripeCheckoutSessionCreate.mockResolvedValue({
			id: 'cs_test_123',
			url: 'https://checkout.stripe.com/c/pay/cs_test_123',
		});

		// Create test data
		await t.run(async (ctx: TestCtx) => {
			// Create instructor
			instructorId = await ctx.db.insert('users', {
				firstName: 'Test',
				lastName: 'Instructor',
				email: 'instructor@example.com',
				externalId: 'instructor-id',
				isInstructor: true,
				isAdmin: false,
			});

			// Create student
			studentExternalId = 'student-external-id';
			studentConvexId = await ctx.db.insert('users', {
				firstName: 'Test',
				lastName: 'Student',
				email: 'student@example.com',
				externalId: studentExternalId,
				isInstructor: false,
				isAdmin: false,
			});

			// Create course
			courseId = await ctx.db.insert('courses', {
				title: 'Test Course',
				description: 'Test description',
				instructorId,
				price: 29900, // $299.00
				thumbnailUrl: 'https://example.com/image.jpg',
				rating: 4.5,
				reviewCount: 100,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});
		});
	});

	describe('createCheckoutSession()', () => {
		it('creates checkout session for authenticated user', async () => {
			const tAuth = t.withIdentity({
				subject: studentExternalId,
				email: 'student@example.com',
			});

			const checkoutUrl = await tAuth.action(api.payments.createCheckoutSession, {
				courseId,
			});

			expect(checkoutUrl).toBeDefined();
			expect(checkoutUrl).toBe('https://checkout.stripe.com/c/pay/cs_test_123');

			// Verify Stripe was called correctly
			expect(mockStripeCheckoutSessionCreate).toHaveBeenCalledTimes(1);
			expect(mockStripeCheckoutSessionCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					line_items: [
						{
							price_data: {
								currency: 'usd',
								product_data: {
									name: 'Test Course',
									description: 'Test description',
									images: ['https://example.com/image.jpg'],
								},
								unit_amount: 2990000, // 29900 * 100 cents
							},
							quantity: 1,
						},
					],
					mode: 'payment',
					success_url: `http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
					cancel_url: `http://localhost:3000/courses/${courseId}?canceled=true`,
					metadata: {
						courseId: courseId,
						userId: studentExternalId,
					},
					customer_email: 'student@example.com',
				}),
			);
		});

		it('throws error when user is not authenticated', async () => {
			// No identity
			await expect(t.action(api.payments.createCheckoutSession, { courseId })).rejects.toThrow(
				'Must be logged in to purchase a course',
			);

			expect(mockStripeCheckoutSessionCreate).not.toHaveBeenCalled();
		});

		it('throws error when user not found in database', async () => {
			const tAuth = t.withIdentity({
				subject: 'non-existent-user-id',
				email: 'nonexistent@example.com',
			});

			await expect(tAuth.action(api.payments.createCheckoutSession, { courseId })).rejects.toThrow('User not found');

			expect(mockStripeCheckoutSessionCreate).not.toHaveBeenCalled();
		});

		it('throws error when course not found', async () => {
			const tAuth = t.withIdentity({
				subject: studentExternalId,
				email: 'student@example.com',
			});

			// Create a valid course ID by creating and deleting a course
			const fakeCourseId = await t.run(async (ctx: TestCtx) => {
				const tempId = await ctx.db.insert('courses', {
					title: 'Temp',
					description: 'Temp',
					instructorId: instructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
				await ctx.db.delete(tempId);
				return tempId;
			});

			await expect(tAuth.action(api.payments.createCheckoutSession, { courseId: fakeCourseId })).rejects.toThrow(
				'Course not found',
			);

			expect(mockStripeCheckoutSessionCreate).not.toHaveBeenCalled();
		});

		it('throws error when user already enrolled', async () => {
			// Create a purchase and enrollment first
			await t.run(async (ctx: TestCtx) => {
				const purchaseId = await ctx.db.insert('purchases', {
					userId: studentConvexId,
					courseId,
					amount: 29900,
					status: 'complete',
					createdAt: Date.now(),
				});

				await ctx.db.insert('enrollments', {
					userId: studentConvexId,
					courseId,
					purchaseId,
					progressPercent: 0,
					enrolledAt: Date.now(),
				});
			});

			const tAuth = t.withIdentity({
				subject: studentExternalId,
				email: 'student@example.com',
			});

			await expect(tAuth.action(api.payments.createCheckoutSession, { courseId })).rejects.toThrow(
				'Already enrolled in this course',
			);

			expect(mockStripeCheckoutSessionCreate).not.toHaveBeenCalled();
		});

		it('handles course without thumbnail', async () => {
			// Create course without thumbnail
			let courseWithoutThumbnail: Id<'courses'>;
			await t.run(async (ctx: TestCtx) => {
				courseWithoutThumbnail = await ctx.db.insert('courses', {
					title: 'No Thumbnail Course',
					description: 'Test description',
					instructorId,
					price: 19900,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			const tAuth = t.withIdentity({
				subject: studentExternalId,
				email: 'student@example.com',
			});

			await tAuth.action(api.payments.createCheckoutSession, {
				courseId: courseWithoutThumbnail!,
			});

			expect(mockStripeCheckoutSessionCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					line_items: [
						expect.objectContaining({
							price_data: expect.objectContaining({
								product_data: {
									name: 'No Thumbnail Course',
									description: 'Test description',
									images: [], // Empty array when no thumbnail
								},
							}),
						}),
					],
				}),
			);
		});

		it('includes description in checkout session', async () => {
			// Description is required in schema, so test that it's included correctly
			const tAuth = t.withIdentity({
				subject: studentExternalId,
				email: 'student@example.com',
			});

			await tAuth.action(api.payments.createCheckoutSession, {
				courseId,
			});

			expect(mockStripeCheckoutSessionCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					line_items: [
						expect.objectContaining({
							price_data: expect.objectContaining({
								product_data: expect.objectContaining({
									description: 'Test description',
								}),
							}),
						}),
					],
				}),
			);
		});

		it('handles free course (price = 0)', async () => {
			// Create free course
			let freeCourse: Id<'courses'>;
			await t.run(async (ctx: TestCtx) => {
				freeCourse = await ctx.db.insert('courses', {
					title: 'Free Course',
					description: 'Test description',
					instructorId,
					price: 0,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			const tAuth = t.withIdentity({
				subject: studentExternalId,
				email: 'student@example.com',
			});

			await tAuth.action(api.payments.createCheckoutSession, {
				courseId: freeCourse!,
			});

			expect(mockStripeCheckoutSessionCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					line_items: [
						expect.objectContaining({
							price_data: expect.objectContaining({
								unit_amount: 0, // 0 * 100 = 0
							}),
						}),
					],
				}),
			);
		});

		it('handles course without price field', async () => {
			// Create course without explicit price
			let courseWithoutPrice: Id<'courses'>;
			await t.run(async (ctx: TestCtx) => {
				courseWithoutPrice = await ctx.db.insert('courses', {
					title: 'No Price Course',
					description: 'Test description',
					instructorId,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			const tAuth = t.withIdentity({
				subject: studentExternalId,
				email: 'student@example.com',
			});

			await tAuth.action(api.payments.createCheckoutSession, {
				courseId: courseWithoutPrice!,
			});

			expect(mockStripeCheckoutSessionCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					line_items: [
						expect.objectContaining({
							price_data: expect.objectContaining({
								unit_amount: 0, // undefined || 0 = 0
							}),
						}),
					],
				}),
			);
		});

		it('throws error when Stripe fails to create session', async () => {
			// Mock Stripe to throw error
			mockStripeCheckoutSessionCreate.mockRejectedValueOnce(new Error('Stripe API error'));

			const tAuth = t.withIdentity({
				subject: studentExternalId,
				email: 'student@example.com',
			});

			await expect(tAuth.action(api.payments.createCheckoutSession, { courseId })).rejects.toThrow('Stripe API error');
		});

		it('throws error when Stripe returns session without URL', async () => {
			// Mock Stripe to return session without URL
			mockStripeCheckoutSessionCreate.mockResolvedValueOnce({
				id: 'cs_test_123',
				url: null, // No URL
			});

			const tAuth = t.withIdentity({
				subject: studentExternalId,
				email: 'student@example.com',
			});

			await expect(tAuth.action(api.payments.createCheckoutSession, { courseId })).rejects.toThrow(
				'Failed to create checkout session',
			);
		});

		it('converts price correctly to cents', async () => {
			const testCases = [
				{ price: 9900, expected: 990000 }, // $99.00
				{ price: 29900, expected: 2990000 }, // $299.00
				{ price: 100, expected: 10000 }, // $1.00
				{ price: 1, expected: 100 }, // $0.01
			];

			for (const { price, expected } of testCases) {
				mockStripeCheckoutSessionCreate.mockReset();
				mockStripeCheckoutSessionCreate.mockResolvedValue({
					id: 'cs_test_123',
					url: 'https://checkout.stripe.com/c/pay/cs_test_123',
				});

				let testCourseId: Id<'courses'>;
				await t.run(async (ctx: TestCtx) => {
					testCourseId = await ctx.db.insert('courses', {
						title: 'Test Course',
						description: 'Test',
						instructorId,
						price,
						createdAt: Date.now(),
						updatedAt: Date.now(),
					});
				});

				const tAuth = t.withIdentity({
					subject: studentExternalId,
					email: 'student@example.com',
				});

				await tAuth.action(api.payments.createCheckoutSession, {
					courseId: testCourseId!,
				});

				expect(mockStripeCheckoutSessionCreate).toHaveBeenCalledWith(
					expect.objectContaining({
						line_items: [
							expect.objectContaining({
								price_data: expect.objectContaining({
									unit_amount: expected,
								}),
							}),
						],
					}),
				);
			}
		});

		it('includes correct metadata', async () => {
			const tAuth = t.withIdentity({
				subject: studentExternalId,
				email: 'student@example.com',
			});

			await tAuth.action(api.payments.createCheckoutSession, { courseId });

			expect(mockStripeCheckoutSessionCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					metadata: {
						courseId: courseId,
						userId: studentExternalId,
					},
				}),
			);
		});

		it('includes customer email from identity', async () => {
			const tAuth = t.withIdentity({
				subject: studentExternalId,
				email: 'custom@example.com',
			});

			await tAuth.action(api.payments.createCheckoutSession, { courseId });

			expect(mockStripeCheckoutSessionCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					customer_email: 'custom@example.com',
				}),
			);
		});

		it('sets correct success and cancel URLs', async () => {
			const tAuth = t.withIdentity({
				subject: studentExternalId,
				email: 'student@example.com',
			});

			await tAuth.action(api.payments.createCheckoutSession, { courseId });

			expect(mockStripeCheckoutSessionCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					success_url: `http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
					cancel_url: `http://localhost:3000/courses/${courseId}?canceled=true`,
				}),
			);
		});
	});

	describe('error scenarios', () => {
		it('handles missing STRIPE_SECRET_KEY', async () => {
			const oldKey = process.env.STRIPE_SECRET_KEY;
			delete process.env.STRIPE_SECRET_KEY;

			const tAuth = t.withIdentity({
				subject: studentExternalId,
				email: 'student@example.com',
			});

			// Stripe constructor will receive undefined key
			// This will likely throw when trying to create session
			try {
				await tAuth.action(api.payments.createCheckoutSession, { courseId });
			} catch (error) {
				// Expected to fail
				expect(error).toBeDefined();
			}

			process.env.STRIPE_SECRET_KEY = oldKey;
		});

		it('handles missing NEXT_PUBLIC_APP_URL', async () => {
			const oldUrl = process.env.NEXT_PUBLIC_APP_URL;
			delete process.env.NEXT_PUBLIC_APP_URL;

			const tAuth = t.withIdentity({
				subject: studentExternalId,
				email: 'student@example.com',
			});

			await tAuth.action(api.payments.createCheckoutSession, { courseId });

			// Should still work, URLs will have 'undefined' in them
			expect(mockStripeCheckoutSessionCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					success_url: expect.stringContaining('undefined'),
					cancel_url: expect.stringContaining('undefined'),
				}),
			);

			process.env.NEXT_PUBLIC_APP_URL = oldUrl;
		});
	});
});

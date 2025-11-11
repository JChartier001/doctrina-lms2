import type { GenericMutationCtx } from 'convex/server';
import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '../_generated/api';
import type { DataModel, Id } from '../_generated/dataModel';
import schema from '../schema';
import { handleStripeWebhook } from '../stripe';

// Mock the webhook validation
vi.mock('../http', () => ({
	validateRequest: vi.fn(),
}));

// Import the mocked function
import { validateRequest } from '../http';

type TestCtx = GenericMutationCtx<DataModel>;

describe('stripe', () => {
	let t: any;
	let instructorId: Id<'users'>;
	let studentId: Id<'users'>;
	let studentExternalId: string;
	let courseId: Id<'courses'>;

	beforeEach(async () => {
		t = convexTest(schema);

		// Reset mocks
		vi.clearAllMocks();

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
			studentId = await ctx.db.insert('users', {
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
				price: 29900,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});
		});
	});

	describe('handleStripeWebhook()', () => {
		it('handles checkout.session.completed event successfully', async () => {
			// Mock successful webhook validation
			const mockEvent = {
				type: 'checkout.session.completed',
				data: {
					object: {
						id: 'cs_test_123',
						amount_total: 2990000, // $299.00 in cents
						metadata: {
							courseId: courseId,
							userId: studentExternalId, // Stripe sends external ID
						},
					},
				},
			};

			(validateRequest as any).mockResolvedValueOnce(mockEvent);

			const request = new Request('http://localhost/webhook', {
				method: 'POST',
				body: JSON.stringify(mockEvent),
				headers: {
					'stripe-signature': 't=1234567890,v1=signature',
				},
			});

			const status = await t.run(async (ctx: TestCtx) => {
				const response = await handleStripeWebhook(ctx, request);
				return response.status;
			});

			expect(status).toBe(200);

			// Verify purchase was created
			const purchases = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('purchases').collect();
			});

			expect(purchases).toHaveLength(1);
			expect(purchases[0]).toMatchObject({
				userId: studentId, // But DB stores Convex ID
				courseId: courseId,
				amount: 29900, // Converted from cents
				stripeSessionId: 'cs_test_123',
				status: 'complete',
			});

			// Verify enrollment was created
			const enrollments = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('enrollments').collect();
			});

			expect(enrollments).toHaveLength(1);
			expect(enrollments[0]).toMatchObject({
				userId: studentId, // DB stores Convex ID
				courseId: courseId,
				purchaseId: purchases[0]._id,
				progressPercent: 0,
			});
		});

		it('returns 400 when validation fails', async () => {
			// Mock failed validation
			(validateRequest as any).mockResolvedValueOnce(null);

			const request = new Request('http://localhost/webhook', {
				method: 'POST',
				body: 'invalid',
				headers: {},
			});

			const status = await t.run(async (ctx: TestCtx) => {
				const response = await handleStripeWebhook(ctx, request);
				return response.status;
			});

			expect(status).toBe(400);

			// Verify no purchase or enrollment was created
			const purchases = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('purchases').collect();
			});
			expect(purchases).toHaveLength(0);
		});

		it('handles missing metadata gracefully', async () => {
			const mockEvent = {
				type: 'checkout.session.completed',
				data: {
					object: {
						id: 'cs_test_123',
						amount_total: 2990000,
						metadata: {}, // Missing courseId and userId
					},
				},
			};

			(validateRequest as any).mockResolvedValueOnce(mockEvent);

			const request = new Request('http://localhost/webhook', {
				method: 'POST',
				body: JSON.stringify(mockEvent),
				headers: {
					'stripe-signature': 't=1234567890,v1=signature',
				},
			});

			const status = await t.run(async (ctx: TestCtx) => {
				const response = await handleStripeWebhook(ctx, request);
				return response.status;
			});

			// Should return 500 due to error
			expect(status).toBe(500);

			// Verify no purchase was created
			const purchases = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('purchases').collect();
			});
			expect(purchases).toHaveLength(0);
		});

		it('handles undefined metadata', async () => {
			const mockEvent = {
				type: 'checkout.session.completed',
				data: {
					object: {
						id: 'cs_test_no_metadata',
						amount_total: 2990000,
						// metadata is undefined
					},
				},
			};

			(validateRequest as any).mockResolvedValueOnce(mockEvent);

			const request = new Request('http://localhost/webhook', {
				method: 'POST',
				body: JSON.stringify(mockEvent),
				headers: {
					'stripe-signature': 't=1234567890,v1=signature',
				},
			});

			const status = await t.run(async (ctx: TestCtx) => {
				const response = await handleStripeWebhook(ctx, request);
				return response.status;
			});

			// Should return 500 due to missing metadata
			expect(status).toBe(500);

			// Verify no purchase was created
			const purchases = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('purchases').collect();
			});
			expect(purchases).toHaveLength(0);
		});

		it('handles user not found in database', async () => {
			const mockEvent = {
				type: 'checkout.session.completed',
				data: {
					object: {
						id: 'cs_test_no_user',
						amount_total: 2990000,
						metadata: {
							courseId: courseId,
							userId: 'non-existent-user-external-id',
						},
					},
				},
			};

			(validateRequest as any).mockResolvedValueOnce(mockEvent);

			const request = new Request('http://localhost/webhook', {
				method: 'POST',
				body: JSON.stringify(mockEvent),
				headers: {
					'stripe-signature': 't=1234567890,v1=signature',
				},
			});

			const status = await t.run(async (ctx: TestCtx) => {
				const response = await handleStripeWebhook(ctx, request);
				return response.status;
			});

			// Should return 500 due to user not found
			expect(status).toBe(500);
		});

		it('handles missing courseId in metadata', async () => {
			const mockEvent = {
				type: 'checkout.session.completed',
				data: {
					object: {
						id: 'cs_test_123',
						amount_total: 2990000,
						metadata: {
							userId: studentExternalId,
							// Missing courseId
						},
					},
				},
			};

			(validateRequest as any).mockResolvedValueOnce(mockEvent);

			const request = new Request('http://localhost/webhook', {
				method: 'POST',
				body: JSON.stringify(mockEvent),
				headers: {
					'stripe-signature': 't=1234567890,v1=signature',
				},
			});

			const status = await t.run(async (ctx: TestCtx) => {
				const response = await handleStripeWebhook(ctx, request);
				return response.status;
			});

			expect(status).toBe(500);

			const purchases = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('purchases').collect();
			});
			expect(purchases).toHaveLength(0);
		});

		it('handles missing userId in metadata', async () => {
			const mockEvent = {
				type: 'checkout.session.completed',
				data: {
					object: {
						id: 'cs_test_123',
						amount_total: 2990000,
						metadata: {
							courseId: courseId,
							// Missing userId
						},
					},
				},
			};

			(validateRequest as any).mockResolvedValueOnce(mockEvent);

			const request = new Request('http://localhost/webhook', {
				method: 'POST',
				body: JSON.stringify(mockEvent),
				headers: {
					'stripe-signature': 't=1234567890,v1=signature',
				},
			});

			const status = await t.run(async (ctx: TestCtx) => {
				const response = await handleStripeWebhook(ctx, request);
				return response.status;
			});

			expect(status).toBe(500);
		});

		it('handles charge.refunded event', async () => {
			const mockEvent = {
				type: 'charge.refunded',
				data: {
					object: {
						id: 'ch_test_123',
						amount: 2990000,
					},
				},
			};

			(validateRequest as any).mockResolvedValueOnce(mockEvent);

			const request = new Request('http://localhost/webhook', {
				method: 'POST',
				body: JSON.stringify(mockEvent),
				headers: {
					'stripe-signature': 't=1234567890,v1=signature',
				},
			});

			const status = await t.run(async (ctx: TestCtx) => {
				const response = await handleStripeWebhook(ctx, request);
				return response.status;
			});

			// Should return 200 (event logged but not yet implemented)
			expect(status).toBe(200);

			// TODO: When refund handling is implemented, verify behavior
		});

		it('handles unknown event types gracefully', async () => {
			const mockEvent = {
				type: 'payment_intent.created',
				data: {
					object: {
						id: 'pi_test_123',
					},
				},
			};

			(validateRequest as any).mockResolvedValueOnce(mockEvent);

			const request = new Request('http://localhost/webhook', {
				method: 'POST',
				body: JSON.stringify(mockEvent),
				headers: {
					'stripe-signature': 't=1234567890,v1=signature',
				},
			});

			const status = await t.run(async (ctx: TestCtx) => {
				const response = await handleStripeWebhook(ctx, request);
				return response.status;
			});

			// Should return 200 (event logged and ignored)
			expect(status).toBe(200);
		});

		it('handles zero amount correctly', async () => {
			const mockEvent = {
				type: 'checkout.session.completed',
				data: {
					object: {
						id: 'cs_test_free',
						amount_total: 0, // Free course
						metadata: {
							courseId: courseId,
							userId: studentExternalId,
						},
					},
				},
			};

			(validateRequest as any).mockResolvedValueOnce(mockEvent);

			const request = new Request('http://localhost/webhook', {
				method: 'POST',
				body: JSON.stringify(mockEvent),
				headers: {
					'stripe-signature': 't=1234567890,v1=signature',
				},
			});

			const status = await t.run(async (ctx: TestCtx) => {
				const response = await handleStripeWebhook(ctx, request);
				return response.status;
			});

			expect(status).toBe(200);

			const purchases = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('purchases').collect();
			});

			expect(purchases).toHaveLength(1);
			expect(purchases[0].amount).toBe(0);
		});

		it('handles null amount_total', async () => {
			const mockEvent = {
				type: 'checkout.session.completed',
				data: {
					object: {
						id: 'cs_test_null',
						amount_total: null, // Null amount
						metadata: {
							courseId: courseId,
							userId: studentExternalId,
						},
					},
				},
			};

			(validateRequest as any).mockResolvedValueOnce(mockEvent);

			const request = new Request('http://localhost/webhook', {
				method: 'POST',
				body: JSON.stringify(mockEvent),
				headers: {
					'stripe-signature': 't=1234567890,v1=signature',
				},
			});

			const status = await t.run(async (ctx: TestCtx) => {
				const response = await handleStripeWebhook(ctx, request);
				return response.status;
			});

			expect(status).toBe(200);

			const purchases = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('purchases').collect();
			});

			expect(purchases).toHaveLength(1);
			expect(purchases[0].amount).toBe(0); // null || 0 = 0
		});

		it('converts amount from cents to dollars correctly', async () => {
			const testCases = [
				{ cents: 990000, expected: 9900 }, // $99.00
				{ cents: 2990000, expected: 29900 }, // $299.00
				{ cents: 10000, expected: 100 }, // $1.00
				{ cents: 100, expected: 1 }, // $0.01
			];

			for (const { cents, expected } of testCases) {
				// Clear previous test data
				await t.run(async (ctx: TestCtx) => {
					const purchases = await ctx.db.query('purchases').collect();
					for (const purchase of purchases) {
						await ctx.db.delete(purchase._id);
					}
					const enrollments = await ctx.db.query('enrollments').collect();
					for (const enrollment of enrollments) {
						await ctx.db.delete(enrollment._id);
					}
				});

				const mockEvent = {
					type: 'checkout.session.completed',
					data: {
						object: {
							id: `cs_test_${cents}`,
							amount_total: cents,
							metadata: {
								courseId: courseId,
								userId: studentExternalId,
							},
						},
					},
				};

				(validateRequest as any).mockResolvedValueOnce(mockEvent);

				const request = new Request('http://localhost/webhook', {
					method: 'POST',
					body: JSON.stringify(mockEvent),
					headers: {
						'stripe-signature': 't=1234567890,v1=signature',
					},
				});

				const status = await t.run(async (ctx: TestCtx) => {
					const response = await handleStripeWebhook(ctx, request);
					return response.status;
				});

				expect(status).toBe(200);

				const purchases = await t.run(async (ctx: TestCtx) => {
					return await ctx.db.query('purchases').collect();
				});

				expect(purchases).toHaveLength(1);
				expect(purchases[0].amount).toBe(expected);
			}
		});

		it('creates enrollment with correct initial progress', async () => {
			const mockEvent = {
				type: 'checkout.session.completed',
				data: {
					object: {
						id: 'cs_test_progress',
						amount_total: 2990000,
						metadata: {
							courseId: courseId,
							userId: studentExternalId,
						},
					},
				},
			};

			(validateRequest as any).mockResolvedValueOnce(mockEvent);

			const request = new Request('http://localhost/webhook', {
				method: 'POST',
				body: JSON.stringify(mockEvent),
				headers: {
					'stripe-signature': 't=1234567890,v1=signature',
				},
			});

			await t.run(async (ctx: TestCtx) => {
				await handleStripeWebhook(ctx, request);
			});

			const enrollments = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('enrollments').collect();
			});

			expect(enrollments).toHaveLength(1);
			expect(enrollments[0].progressPercent).toBe(0);
		});

		it('links purchase and enrollment correctly', async () => {
			const mockEvent = {
				type: 'checkout.session.completed',
				data: {
					object: {
						id: 'cs_test_link',
						amount_total: 2990000,
						metadata: {
							courseId: courseId,
							userId: studentExternalId,
						},
					},
				},
			};

			(validateRequest as any).mockResolvedValueOnce(mockEvent);

			const request = new Request('http://localhost/webhook', {
				method: 'POST',
				body: JSON.stringify(mockEvent),
				headers: {
					'stripe-signature': 't=1234567890,v1=signature',
				},
			});

			await t.run(async (ctx: TestCtx) => {
				await handleStripeWebhook(ctx, request);
			});

			const purchases = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('purchases').collect();
			});

			const enrollments = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('enrollments').collect();
			});

			expect(enrollments[0].purchaseId).toBe(purchases[0]._id);
			expect(enrollments[0].userId).toBe(purchases[0].userId);
			expect(enrollments[0].courseId).toBe(purchases[0].courseId);
		});
	});

	describe('error handling', () => {
		it('returns 500 on database errors', async () => {
			const mockEvent = {
				type: 'checkout.session.completed',
				data: {
					object: {
						id: 'cs_test_error',
						amount_total: 2990000,
						metadata: {
							courseId: 'invalid-course-id', // Will cause DB error
							userId: studentExternalId,
						},
					},
				},
			};

			(validateRequest as any).mockResolvedValueOnce(mockEvent);

			const request = new Request('http://localhost/webhook', {
				method: 'POST',
				body: JSON.stringify(mockEvent),
				headers: {
					'stripe-signature': 't=1234567890,v1=signature',
				},
			});

			const status = await t.run(async (ctx: TestCtx) => {
				const response = await handleStripeWebhook(ctx, request);
				return response.status;
			});

			expect(status).toBe(500);
		});

		it('handles database insert failures gracefully', async () => {
			const mockEvent = {
				type: 'checkout.session.completed',
				data: {
					object: {
						id: 'cs_test_fail',
						amount_total: 2990000,
						metadata: {
							courseId: courseId,
							userId: studentExternalId,
						},
					},
				},
			};

			(validateRequest as any).mockResolvedValueOnce(mockEvent);

			const request = new Request('http://localhost/webhook', {
				method: 'POST',
				body: JSON.stringify(mockEvent),
				headers: {
					'stripe-signature': 't=1234567890,v1=signature',
				},
			});

			// Create a mock context that throws on insert
			const status = await t.run(async (ctx: TestCtx) => {
				// Mock the insert to throw an error
				const originalInsert = ctx.db.insert;
				ctx.db.insert = vi.fn().mockRejectedValue(new Error('Database error'));

				try {
					const response = await handleStripeWebhook(ctx, request);
					return response.status;
				} finally {
					// Restore original insert
					ctx.db.insert = originalInsert;
				}
			});

			expect(status).toBe(500);
		});
	});

	describe('integration with isEnrolled query', () => {
		it('user is enrolled after successful checkout', async () => {
			const mockEvent = {
				type: 'checkout.session.completed',
				data: {
					object: {
						id: 'cs_test_enrolled',
						amount_total: 2990000,
						metadata: {
							courseId: courseId,
							userId: studentExternalId, // Stripe sends external ID
						},
					},
				},
			};

			(validateRequest as any).mockResolvedValueOnce(mockEvent);

			const request = new Request('http://localhost/webhook', {
				method: 'POST',
				body: JSON.stringify(mockEvent),
				headers: {
					'stripe-signature': 't=1234567890,v1=signature',
				},
			});

			await t.run(async (ctx: TestCtx) => {
				await handleStripeWebhook(ctx, request);
			});

			// Verify user is enrolled using the isEnrolled query
			const isEnrolled = await t.query(api.enrollments.isEnrolled, {
				userId: studentId, // Query uses Convex ID
				courseId: courseId,
			});

			expect(isEnrolled).toBe(true);
		});
	});
});

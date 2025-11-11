import type { GenericMutationCtx } from 'convex/server';
import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '../_generated/api';
import type { DataModel, Id } from '../_generated/dataModel';
import schema from '../schema';

type TestCtx = GenericMutationCtx<DataModel>;

describe('Purchases', () => {
	let t: any;
	let testUserId: Id<'users'>;
	let testCourseId: Id<'courses'>;
	let testInstructorId: Id<'users'>;

	beforeEach(async () => {
		const baseT = convexTest(schema);

		// Set up test data
		await baseT.run(async (ctx: TestCtx) => {
			// Create test user
			const userId = await ctx.db.insert('users', {
				firstName: 'Test',
				lastName: 'User',
				email: 'user@test.com',
				externalId: 'test-user-clerk-id',
				isInstructor: false,
				isAdmin: false,
			});

			// Create test instructor
			const instructorId = await ctx.db.insert('users', {
				firstName: 'Test',
				lastName: 'Instructor',
				email: 'instructor@test.com',
				externalId: 'test-instructor-id',
				isInstructor: true,
				isAdmin: false,
			});

			// Create test course
			const courseId = await ctx.db.insert('courses', {
				title: 'Test Course',
				description: 'Test description',
				instructorId,
				price: 29900,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});

			testUserId = userId;
			testCourseId = courseId;
			testInstructorId = instructorId;
		});

		t = baseT;
	});

	describe('create()', () => {
		it('creates purchase with valid data', async () => {
			const purchaseId = await t.mutation(api.purchases.create, {
				userId: testUserId,
				courseId: testCourseId,
				amount: 29900,
				status: 'complete',
			});

			expect(purchaseId).toBeDefined();

			const purchase = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(purchaseId);
			});

			expect(purchase).toBeDefined();
			expect(purchase?.userId).toBe(testUserId);
			expect(purchase?.courseId).toBe(testCourseId);
			expect(purchase?.amount).toBe(29900);
			expect(purchase?.status).toBe('complete');
			expect(purchase?.createdAt).toBeGreaterThan(Date.now() - 1000);
		});

		it('creates purchase with open status', async () => {
			const purchaseId = await t.mutation(api.purchases.create, {
				userId: testUserId,
				courseId: testCourseId,
				amount: 29900,
				status: 'open',
			});

			const purchase = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(purchaseId);
			});

			expect(purchase?.status).toBe('open');
		});

		it('creates purchase with stripe session ID', async () => {
			const purchaseId = await t.mutation(api.purchases.create, {
				userId: testUserId,
				courseId: testCourseId,
				amount: 29900,
				status: 'complete',
				stripeSessionId: 'cs_test_123',
			});

			const purchase = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(purchaseId);
			});

			expect(purchase?.stripeSessionId).toBe('cs_test_123');
		});

		it('creates purchase with zero amount (free course)', async () => {
			const purchaseId = await t.mutation(api.purchases.create, {
				userId: testUserId,
				courseId: testCourseId,
				amount: 0,
				status: 'complete',
			});

			const purchase = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(purchaseId);
			});

			expect(purchase?.amount).toBe(0);
		});

		it('allows multiple purchases for same course by different users', async () => {
			const [user1Id, user2Id] = await t.run(async (ctx: TestCtx) => {
				const u1 = await ctx.db.insert('users', {
					firstName: 'User',
					lastName: 'One',
					email: 'user1@test.com',
					externalId: 'user-1',
					isInstructor: false,
					isAdmin: false,
				});

				const u2 = await ctx.db.insert('users', {
					firstName: 'User',
					lastName: 'Two',
					email: 'user2@test.com',
					externalId: 'user-2',
					isInstructor: false,
					isAdmin: false,
				});

				return [u1, u2];
			});

			const purchase1 = await t.mutation(api.purchases.create, {
				userId: user1Id,
				courseId: testCourseId,
				amount: 29900,
				status: 'complete',
			});

			const purchase2 = await t.mutation(api.purchases.create, {
				userId: user2Id,
				courseId: testCourseId,
				amount: 29900,
				status: 'complete',
			});

			expect(purchase1).toBeDefined();
			expect(purchase2).toBeDefined();
			expect(purchase1).not.toBe(purchase2);
		});
	});

	describe('listForUser()', () => {
		it('returns purchases for specific user', async () => {
			// Create purchases for test user
			await t.mutation(api.purchases.create, {
				userId: testUserId,
				courseId: testCourseId,
				amount: 29900,
				status: 'complete',
			});

			// Create another course
			const course2Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courses', {
					title: 'Course 2',
					description: 'Test',
					instructorId: testInstructorId,
					price: 19900,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			await t.mutation(api.purchases.create, {
				userId: testUserId,
				courseId: course2Id,
				amount: 19900,
				status: 'complete',
			});

			// Query purchases
			const purchases = await t.query(api.purchases.listForUser, {
				userId: testUserId,
			});

			expect(purchases).toHaveLength(2);
			expect(purchases[0].userId).toBe(testUserId);
			expect(purchases[1].userId).toBe(testUserId);
		});

		it('returns empty array when user has no purchases', async () => {
			const userWithNoPurchases = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('users', {
					firstName: 'User',
					lastName: 'NoPurchases',
					email: 'nopurchases@test.com',
					externalId: 'user-with-no-purchases',
					isInstructor: false,
					isAdmin: false,
				});
			});

			const purchases = await t.query(api.purchases.listForUser, {
				userId: userWithNoPurchases,
			});

			expect(purchases).toHaveLength(0);
		});

		it('filters purchases by user correctly', async () => {
			const [user1Id, user2Id] = await t.run(async (ctx: TestCtx) => {
				const u1 = await ctx.db.insert('users', {
					firstName: 'User',
					lastName: 'One',
					email: 'user1@test.com',
					externalId: 'user-1',
					isInstructor: false,
					isAdmin: false,
				});

				const u2 = await ctx.db.insert('users', {
					firstName: 'User',
					lastName: 'Two',
					email: 'user2@test.com',
					externalId: 'user-2',
					isInstructor: false,
					isAdmin: false,
				});

				return [u1, u2];
			});

			// Create purchase for user 1
			await t.mutation(api.purchases.create, {
				userId: user1Id,
				courseId: testCourseId,
				amount: 29900,
				status: 'complete',
			});

			// Create purchase for user 2
			await t.mutation(api.purchases.create, {
				userId: user2Id,
				courseId: testCourseId,
				amount: 29900,
				status: 'complete',
			});

			// Query user 1's purchases
			const user1Purchases = await t.query(api.purchases.listForUser, {
				userId: user1Id,
			});

			// Should only see user 1's purchase
			expect(user1Purchases).toHaveLength(1);
			expect(user1Purchases[0].userId).toBe(user1Id);
		});
	});

	describe('complete()', () => {
		it('updates purchase status to complete', async () => {
			// Create open purchase
			const purchaseId = await t.mutation(api.purchases.create, {
				userId: testUserId,
				courseId: testCourseId,
				amount: 29900,
				status: 'open',
			});

			// Complete it
			const completedId = await t.mutation(api.purchases.complete, {
				id: purchaseId,
			});

			expect(completedId).toBe(purchaseId);

			// Verify status updated
			const purchase = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(purchaseId);
			});

			expect(purchase?.status).toBe('complete');
		});

		it('can complete already complete purchase (idempotent)', async () => {
			const purchaseId = await t.mutation(api.purchases.create, {
				userId: testUserId,
				courseId: testCourseId,
				amount: 29900,
				status: 'complete',
			});

			// Complete again
			const completedId = await t.mutation(api.purchases.complete, {
				id: purchaseId,
			});

			expect(completedId).toBe(purchaseId);

			const purchase = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(purchaseId);
			});

			expect(purchase?.status).toBe('complete');
		});
	});

	describe('expire()', () => {
		it('updates purchase status to expired', async () => {
			// Create open purchase
			const purchaseId = await t.mutation(api.purchases.create, {
				userId: testUserId,
				courseId: testCourseId,
				amount: 29900,
				status: 'open',
			});

			// Expire it
			const expiredId = await t.mutation(api.purchases.expire, {
				id: purchaseId,
			});

			expect(expiredId).toBe(purchaseId);

			// Verify status updated
			const purchase = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(purchaseId);
			});

			expect(purchase?.status).toBe('expired');
		});

		it('can expire complete purchase', async () => {
			const purchaseId = await t.mutation(api.purchases.create, {
				userId: testUserId,
				courseId: testCourseId,
				amount: 29900,
				status: 'complete',
			});

			await t.mutation(api.purchases.expire, {
				id: purchaseId,
			});

			const purchase = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(purchaseId);
			});

			expect(purchase?.status).toBe('expired');
		});
	});

	describe('Purchase status transitions', () => {
		it('supports full purchase lifecycle: open → complete', async () => {
			const purchaseId = await t.mutation(api.purchases.create, {
				userId: testUserId,
				courseId: testCourseId,
				amount: 29900,
				status: 'open',
			});

			let purchase = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(purchaseId);
			});
			expect(purchase?.status).toBe('open');

			await t.mutation(api.purchases.complete, { id: purchaseId });

			purchase = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(purchaseId);
			});
			expect(purchase?.status).toBe('complete');
		});

		it('supports expiration flow: open → expired', async () => {
			const purchaseId = await t.mutation(api.purchases.create, {
				userId: testUserId,
				courseId: testCourseId,
				amount: 29900,
				status: 'open',
			});

			await t.mutation(api.purchases.expire, { id: purchaseId });

			const purchase = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(purchaseId);
			});
			expect(purchase?.status).toBe('expired');
		});
	});

	describe('Edge cases and error scenarios', () => {
		it('handles large purchase amounts', async () => {
			const purchaseId = await t.mutation(api.purchases.create, {
				userId: testUserId,
				courseId: testCourseId,
				amount: 999900, // $9,999.00
				status: 'complete',
			});

			const purchase = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(purchaseId);
			});

			expect(purchase?.amount).toBe(999900);
		});

		it('handles purchases with no stripe session (direct enrollment)', async () => {
			const purchaseId = await t.mutation(api.purchases.create, {
				userId: testUserId,
				courseId: testCourseId,
				amount: 0,
				status: 'complete',
				// No stripeSessionId
			});

			const purchase = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(purchaseId);
			});

			expect(purchase?.stripeSessionId).toBeUndefined();
		});
	});
});

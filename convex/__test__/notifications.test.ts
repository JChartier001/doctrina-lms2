import type { GenericMutationCtx } from 'convex/server';
import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '../_generated/api';
import type { DataModel, Id } from '../_generated/dataModel';
import schema from '../schema';

type TestCtx = GenericMutationCtx<DataModel>;

describe('Notifications', () => {
	let t: any;
	let testUserId: Id<'users'>;
	let otherUserId: Id<'users'>;

	beforeEach(async () => {
		t = convexTest(schema);

		// Create test users
		await t.run(async (ctx: TestCtx) => {
			testUserId = await ctx.db.insert('users', {
				firstName: 'Test',
				lastName: 'User',
				email: 'test@example.com',
				externalId: 'test-user-id',
				isInstructor: false,
				isAdmin: false,
			});

			otherUserId = await ctx.db.insert('users', {
				firstName: 'Other',
				lastName: 'User',
				email: 'other@example.com',
				externalId: 'other-user-id',
				isInstructor: false,
				isAdmin: false,
			});
		});
	});

	describe('create()', () => {
		it('creates notification with all required fields', async () => {
			const notificationId = await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Test Notification',
				description: 'This is a test',
				type: 'course_update',
			});

			expect(notificationId).toBeDefined();

			const notification = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(notificationId);
			});

			expect(notification).toBeDefined();
			expect(notification?.userId).toBe(testUserId);
			expect(notification?.title).toBe('Test Notification');
			expect(notification?.description).toBe('This is a test');
			expect(notification?.type).toBe('course_update');
			expect(notification?.read).toBe(false);
			expect(notification?.createdAt).toBeGreaterThan(0);
		});

		it('creates notification with optional link', async () => {
			const notificationId = await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'With Link',
				description: 'Test',
				type: 'message',
				link: '/courses/123',
			});

			const notification = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(notificationId);
			});

			expect(notification?.link).toBe('/courses/123');
		});

		it('creates notification with optional metadata', async () => {
			const metadata = { courseId: '123', instructorName: 'John Doe' };

			const notificationId = await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'With Metadata',
				description: 'Test',
				type: 'announcement',
				metadata,
			});

			const notification = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(notificationId);
			});

			expect(notification?.metadata).toEqual(metadata);
		});

		it('creates notification with all notification types', async () => {
			const types = [
				'course_update',
				'message',
				'announcement',
				'community',
				'live_session',
				'certificate',
				'milestone',
			] as const;

			for (const type of types) {
				const notificationId = await t.mutation(api.notifications.create, {
					userId: testUserId,
					title: `${type} notification`,
					description: `Test ${type}`,
					type,
				});

				const notification = await t.run(async (ctx: TestCtx) => {
					return await ctx.db.get(notificationId);
				});

				expect(notification?.type).toBe(type);
			}
		});

		it('initializes notification as unread', async () => {
			const notificationId = await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Test',
				description: 'Test',
				type: 'message',
			});

			const notification = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(notificationId);
			});

			expect(notification?.read).toBe(false);
		});
	});

	describe('listForUser()', () => {
		it('returns notifications for user', async () => {
			// Create notifications for test user
			await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Notification 1',
				description: 'Test 1',
				type: 'course_update',
			});

			await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Notification 2',
				description: 'Test 2',
				type: 'message',
			});

			const notifications = await t.query(api.notifications.listForUser, {
				userId: testUserId,
			});

			expect(notifications).toHaveLength(2);
			expect(notifications.some(n => n.title === 'Notification 1')).toBe(true);
			expect(notifications.some(n => n.title === 'Notification 2')).toBe(true);
		});

		it('returns empty array when user has no notifications', async () => {
			const notifications = await t.query(api.notifications.listForUser, {
				userId: testUserId,
			});

			expect(notifications).toHaveLength(0);
		});

		it('does not return notifications for other users', async () => {
			// Create notification for other user
			await t.mutation(api.notifications.create, {
				userId: otherUserId,
				title: 'Other User Notification',
				description: 'Test',
				type: 'message',
			});

			// Create notification for test user
			await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Test User Notification',
				description: 'Test',
				type: 'message',
			});

			const notifications = await t.query(api.notifications.listForUser, {
				userId: testUserId,
			});

			expect(notifications).toHaveLength(1);
			expect(notifications[0].title).toBe('Test User Notification');
		});

		it('returns notifications in descending order (newest first)', async () => {
			// Create notifications with delays to ensure different timestamps
			await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'First',
				description: 'Test',
				type: 'message',
			});

			await new Promise(resolve => setTimeout(resolve, 5));

			await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Second',
				description: 'Test',
				type: 'message',
			});

			await new Promise(resolve => setTimeout(resolve, 5));

			await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Third',
				description: 'Test',
				type: 'message',
			});

			const notifications = await t.query(api.notifications.listForUser, {
				userId: testUserId,
			});

			expect(notifications).toHaveLength(3);
			expect(notifications[0].title).toBe('Third');
			expect(notifications[1].title).toBe('Second');
			expect(notifications[2].title).toBe('First');
		});

		it('returns both read and unread notifications', async () => {
			const _unreadId = await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Unread',
				description: 'Test',
				type: 'message',
			});

			const readId = await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Read',
				description: 'Test',
				type: 'message',
			});

			// Mark one as read
			await t.mutation(api.notifications.markRead, { id: readId });

			const notifications = await t.query(api.notifications.listForUser, {
				userId: testUserId,
			});

			expect(notifications).toHaveLength(2);
			expect(notifications.some(n => n.read === false)).toBe(true);
			expect(notifications.some(n => n.read === true)).toBe(true);
		});
	});

	describe('markRead()', () => {
		it('marks notification as read', async () => {
			const notificationId = await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Test',
				description: 'Test',
				type: 'message',
			});

			// Verify initially unread
			let notification = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(notificationId);
			});
			expect(notification?.read).toBe(false);

			// Mark as read
			const returnedId = await t.mutation(api.notifications.markRead, {
				id: notificationId,
			});

			expect(returnedId).toBe(notificationId);

			// Verify now read
			notification = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(notificationId);
			});
			expect(notification?.read).toBe(true);
		});

		it('returns the notification ID', async () => {
			const notificationId = await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Test',
				description: 'Test',
				type: 'message',
			});

			const returnedId = await t.mutation(api.notifications.markRead, {
				id: notificationId,
			});

			expect(returnedId).toBe(notificationId);
		});

		it('marking already-read notification remains read', async () => {
			const notificationId = await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Test',
				description: 'Test',
				type: 'message',
			});

			// Mark as read twice
			await t.mutation(api.notifications.markRead, { id: notificationId });
			await t.mutation(api.notifications.markRead, { id: notificationId });

			const notification = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(notificationId);
			});

			expect(notification?.read).toBe(true);
		});
	});

	describe('markAllRead()', () => {
		it('marks all notifications as read for user', async () => {
			// Create multiple unread notifications
			const id1 = await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Notification 1',
				description: 'Test',
				type: 'message',
			});

			const id2 = await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Notification 2',
				description: 'Test',
				type: 'announcement',
			});

			const id3 = await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Notification 3',
				description: 'Test',
				type: 'course_update',
			});

			// Mark all as read
			const count = await t.mutation(api.notifications.markAllRead, {
				userId: testUserId,
			});

			expect(count).toBe(3);

			// Verify all are read
			const n1 = await t.run(async (ctx: TestCtx) => await ctx.db.get(id1));
			const n2 = await t.run(async (ctx: TestCtx) => await ctx.db.get(id2));
			const n3 = await t.run(async (ctx: TestCtx) => await ctx.db.get(id3));

			expect(n1?.read).toBe(true);
			expect(n2?.read).toBe(true);
			expect(n3?.read).toBe(true);
		});

		it('returns count of notifications marked', async () => {
			await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Test 1',
				description: 'Test',
				type: 'message',
			});

			await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Test 2',
				description: 'Test',
				type: 'message',
			});

			const count = await t.mutation(api.notifications.markAllRead, {
				userId: testUserId,
			});

			expect(count).toBe(2);
		});

		it('returns 0 when user has no notifications', async () => {
			const count = await t.mutation(api.notifications.markAllRead, {
				userId: testUserId,
			});

			expect(count).toBe(0);
		});

		it('does not affect notifications for other users', async () => {
			// Create notification for other user
			const otherNotificationId = await t.mutation(api.notifications.create, {
				userId: otherUserId,
				title: 'Other User',
				description: 'Test',
				type: 'message',
			});

			// Create notification for test user
			await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Test User',
				description: 'Test',
				type: 'message',
			});

			// Mark all as read for test user
			await t.mutation(api.notifications.markAllRead, { userId: testUserId });

			// Verify other user's notification is still unread
			const otherNotification = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(otherNotificationId);
			});

			expect(otherNotification?.read).toBe(false);
		});

		it('marks already-read notifications correctly', async () => {
			const id1 = await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Notification 1',
				description: 'Test',
				type: 'message',
			});

			const id2 = await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Notification 2',
				description: 'Test',
				type: 'message',
			});

			// Mark one as read already
			await t.mutation(api.notifications.markRead, { id: id1 });

			// Mark all as read
			const count = await t.mutation(api.notifications.markAllRead, {
				userId: testUserId,
			});

			// Returns count of ALL notifications, not just newly-marked ones
			expect(count).toBe(2);

			// Both should be read
			const n1 = await t.run(async (ctx: TestCtx) => await ctx.db.get(id1));
			const n2 = await t.run(async (ctx: TestCtx) => await ctx.db.get(id2));

			expect(n1?.read).toBe(true);
			expect(n2?.read).toBe(true);
		});
	});

	describe('remove()', () => {
		it('deletes notification', async () => {
			const notificationId = await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Test',
				description: 'Test',
				type: 'message',
			});

			// Verify exists
			let notification = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(notificationId);
			});
			expect(notification).toBeDefined();

			// Delete
			const returnedId = await t.mutation(api.notifications.remove, {
				id: notificationId,
			});

			expect(returnedId).toBe(notificationId);

			// Verify deleted
			notification = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(notificationId);
			});
			expect(notification).toBeNull();
		});

		it('returns the notification ID', async () => {
			const notificationId = await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Test',
				description: 'Test',
				type: 'message',
			});

			const returnedId = await t.mutation(api.notifications.remove, {
				id: notificationId,
			});

			expect(returnedId).toBe(notificationId);
		});

		it('does not affect other notifications', async () => {
			const id1 = await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Keep',
				description: 'Test',
				type: 'message',
			});

			const id2 = await t.mutation(api.notifications.create, {
				userId: testUserId,
				title: 'Delete',
				description: 'Test',
				type: 'message',
			});

			// Delete one
			await t.mutation(api.notifications.remove, { id: id2 });

			// Verify other still exists
			const remaining = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(id1);
			});

			expect(remaining).toBeDefined();
			expect(remaining?.title).toBe('Keep');
		});
	});
});

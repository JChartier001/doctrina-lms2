import type { GenericMutationCtx } from 'convex/server';
import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '../_generated/api';
import type { DataModel, Id } from '../_generated/dataModel';
import schema from '../schema';

type TestCtx = GenericMutationCtx<DataModel>;

describe('Live Sessions', () => {
	let t: any;
	let testInstructorId: Id<'users'>;
	let testUserId: Id<'users'>;
	let otherUserId: Id<'users'>;

	beforeEach(async () => {
		t = convexTest(schema);

		// Create test users
		await t.run(async (ctx: TestCtx) => {
			testInstructorId = await ctx.db.insert('users', {
				firstName: 'Test',
				lastName: 'Instructor',
				email: 'instructor@example.com',
				externalId: 'test-instructor-id',
				isInstructor: true,
				isAdmin: false,
			});

			testUserId = await ctx.db.insert('users', {
				firstName: 'Test',
				lastName: 'User',
				email: 'user@example.com',
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
		it('creates live session with all fields', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'Test Session',
				description: 'Test description',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000, // Tomorrow
				duration: 3600, // 1 hour in seconds
				isRecorded: true,
				maxParticipants: 50,
			});

			expect(sessionId).toBeDefined();

			const session = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(sessionId);
			});

			expect(session).toBeDefined();
			expect(session?.title).toBe('Test Session');
			expect(session?.description).toBe('Test description');
			expect(session?.instructorId).toBe(testInstructorId);
			expect(session?.duration).toBe(3600);
			expect(session?.isRecorded).toBe(true);
			expect(session?.maxParticipants).toBe(50);
			expect(session?.status).toBe('scheduled');
		});

		it('initializes status as scheduled', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'New Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			const session = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(sessionId);
			});

			expect(session?.status).toBe('scheduled');
		});

		it('creates session with recording disabled', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'Non-Recorded Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 1800,
				isRecorded: false,
				maxParticipants: 20,
			});

			const session = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(sessionId);
			});

			expect(session?.isRecorded).toBe(false);
		});
	});

	describe('get()', () => {
		it('returns session by ID', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'Test Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: true,
				maxParticipants: 50,
			});

			const session = await t.query(api.liveSessions.get, { id: sessionId });

			expect(session).toBeDefined();
			expect(session?._id).toBe(sessionId);
			expect(session?.title).toBe('Test Session');
		});

		it('returns null for non-existent session', async () => {
			const tempId = await t.run(async (ctx: TestCtx) => {
				const id = await ctx.db.insert('liveSessions', {
					title: 'Temp',
					description: 'Temp',
					instructorId: testInstructorId,
					scheduledFor: Date.now(),
					duration: 3600,
					isRecorded: false,
					maxParticipants: 10,
					status: 'scheduled',
				});
				await ctx.db.delete(id);
				return id;
			});

			const session = await t.query(api.liveSessions.get, { id: tempId });

			expect(session).toBeNull();
		});
	});

	describe('list()', () => {
		beforeEach(async () => {
			// Create sessions with different statuses
			await t.mutation(api.liveSessions.create, {
				title: 'Scheduled Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			const liveId = await t.mutation(api.liveSessions.create, {
				title: 'Live Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now(),
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			await t.mutation(api.liveSessions.start, { id: liveId });

			const completedId = await t.mutation(api.liveSessions.create, {
				title: 'Completed Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() - 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			await t.mutation(api.liveSessions.end, { id: completedId });
		});

		it('returns all sessions when status not provided', async () => {
			const sessions = await t.query(api.liveSessions.list, {});

			expect(sessions.length).toBeGreaterThanOrEqual(3);
		});

		it('filters by scheduled status', async () => {
			const sessions = await t.query(api.liveSessions.list, {
				status: 'scheduled',
			});

			expect(sessions.length).toBeGreaterThanOrEqual(1);
			expect(sessions.every(s => s.status === 'scheduled')).toBe(true);
		});

		it('filters by live status', async () => {
			const sessions = await t.query(api.liveSessions.list, { status: 'live' });

			expect(sessions.length).toBeGreaterThanOrEqual(1);
			expect(sessions.every(s => s.status === 'live')).toBe(true);
		});

		it('filters by completed status', async () => {
			const sessions = await t.query(api.liveSessions.list, {
				status: 'completed',
			});

			expect(sessions.length).toBeGreaterThanOrEqual(1);
			expect(sessions.every(s => s.status === 'completed')).toBe(true);
		});

		it('filters by cancelled status', async () => {
			const cancelledId = await t.mutation(api.liveSessions.create, {
				title: 'Cancelled Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			await t.mutation(api.liveSessions.cancel, { id: cancelledId });

			const sessions = await t.query(api.liveSessions.list, {
				status: 'cancelled',
			});

			expect(sessions.length).toBeGreaterThanOrEqual(1);
			expect(sessions.every(s => s.status === 'cancelled')).toBe(true);
		});
	});

	describe('upcoming()', () => {
		it('returns only scheduled sessions', async () => {
			const scheduledId = await t.mutation(api.liveSessions.create, {
				title: 'Upcoming Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			const liveId = await t.mutation(api.liveSessions.create, {
				title: 'Currently Live',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now(),
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			await t.mutation(api.liveSessions.start, { id: liveId });

			const sessions = await t.query(api.liveSessions.upcoming);

			expect(sessions.length).toBeGreaterThanOrEqual(1);
			expect(sessions.every(s => s.status === 'scheduled')).toBe(true);
			expect(sessions.some(s => s._id === scheduledId)).toBe(true);
			expect(sessions.some(s => s._id === liveId)).toBe(false);
		});

		it('returns empty array when no upcoming sessions', async () => {
			// Create and complete a session
			const id = await t.mutation(api.liveSessions.create, {
				title: 'Past Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() - 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			await t.mutation(api.liveSessions.end, { id });

			// Clear any scheduled sessions
			const allSessions = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('liveSessions').collect();
			});

			for (const session of allSessions) {
				if (session.status === 'scheduled') {
					await t.run(async (ctx: TestCtx) => {
						await ctx.db.patch(session._id, { status: 'completed' });
					});
				}
			}

			const sessions = await t.query(api.liveSessions.upcoming);

			expect(sessions).toHaveLength(0);
		});
	});

	describe('past()', () => {
		it('returns only completed sessions', async () => {
			const completedId = await t.mutation(api.liveSessions.create, {
				title: 'Past Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() - 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			await t.mutation(api.liveSessions.end, { id: completedId });

			const scheduledId = await t.mutation(api.liveSessions.create, {
				title: 'Future Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			const sessions = await t.query(api.liveSessions.past);

			expect(sessions.length).toBeGreaterThanOrEqual(1);
			expect(sessions.every(s => s.status === 'completed')).toBe(true);
			expect(sessions.some(s => s._id === completedId)).toBe(true);
			expect(sessions.some(s => s._id === scheduledId)).toBe(false);
		});

		it('returns empty array when no past sessions', async () => {
			// Create only scheduled sessions
			await t.mutation(api.liveSessions.create, {
				title: 'Future Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			// Clear any completed sessions
			const allSessions = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('liveSessions').collect();
			});

			for (const session of allSessions) {
				if (session.status === 'completed') {
					await t.run(async (ctx: TestCtx) => {
						await ctx.db.delete(session._id);
					});
				}
			}

			const sessions = await t.query(api.liveSessions.past);

			expect(sessions).toHaveLength(0);
		});
	});

	describe('update()', () => {
		it('updates session fields', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'Original Title',
				description: 'Original description',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			const returnedId = await t.mutation(api.liveSessions.update, {
				id: sessionId,
				title: 'Updated Title',
				description: 'Updated description',
				duration: 7200,
				maxParticipants: 50,
			});

			expect(returnedId).toBe(sessionId);

			const session = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(sessionId);
			});

			expect(session?.title).toBe('Updated Title');
			expect(session?.description).toBe('Updated description');
			expect(session?.duration).toBe(7200);
			expect(session?.maxParticipants).toBe(50);
			expect(session?.instructorId).toBe(testInstructorId); // Unchanged
		});

		it('allows partial updates', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'Test Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			await t.mutation(api.liveSessions.update, {
				id: sessionId,
				maxParticipants: 100,
			});

			const session = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(sessionId);
			});

			expect(session?.maxParticipants).toBe(100);
			expect(session?.title).toBe('Test Session'); // Unchanged
		});

		it('updates status', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'Test Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			await t.mutation(api.liveSessions.update, {
				id: sessionId,
				status: 'live',
			});

			const session = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(sessionId);
			});

			expect(session?.status).toBe('live');
		});

		it('sets recording URL', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'Test Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: true,
				maxParticipants: 30,
			});

			await t.mutation(api.liveSessions.update, {
				id: sessionId,
				recordingUrl: 'https://example.com/recording.mp4',
			});

			const session = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(sessionId);
			});

			expect(session?.recordingUrl).toBe('https://example.com/recording.mp4');
		});
	});

	describe('remove()', () => {
		it('deletes session', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'To Delete',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			const returnedId = await t.mutation(api.liveSessions.remove, {
				id: sessionId,
			});

			expect(returnedId).toBe(sessionId);

			const session = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(sessionId);
			});

			expect(session).toBeNull();
		});
	});

	describe('join()', () => {
		it('adds user to session', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'Test Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			const result = await t.mutation(api.liveSessions.join, {
				sessionId,
				userId: testUserId,
			});

			expect(result).toBe(true);

			const participants = await t.run(async (ctx: TestCtx) => {
				return await ctx.db
					.query('sessionParticipants')
					.withIndex('by_session', q => q.eq('sessionId', sessionId))
					.collect();
			});

			expect(participants).toHaveLength(1);
			expect(participants[0].userId).toBe(testUserId);
			expect(participants[0].sessionId).toBe(sessionId);
			expect(participants[0].joinedAt).toBeGreaterThan(0);
		});

		it('is idempotent - does not add duplicate participants', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'Test Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			await t.mutation(api.liveSessions.join, {
				sessionId,
				userId: testUserId,
			});

			await t.mutation(api.liveSessions.join, {
				sessionId,
				userId: testUserId,
			});

			const participants = await t.run(async (ctx: TestCtx) => {
				return await ctx.db
					.query('sessionParticipants')
					.withIndex('by_session', q => q.eq('sessionId', sessionId))
					.collect();
			});

			expect(participants).toHaveLength(1);
		});

		it('allows multiple users to join', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'Test Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			await t.mutation(api.liveSessions.join, {
				sessionId,
				userId: testUserId,
			});

			await t.mutation(api.liveSessions.join, {
				sessionId,
				userId: otherUserId,
			});

			const participants = await t.run(async (ctx: TestCtx) => {
				return await ctx.db
					.query('sessionParticipants')
					.withIndex('by_session', q => q.eq('sessionId', sessionId))
					.collect();
			});

			expect(participants).toHaveLength(2);
		});

		it('throws error when session is full', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'Small Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 1,
			});

			// First user joins
			await t.mutation(api.liveSessions.join, {
				sessionId,
				userId: testUserId,
			});

			// Second user tries to join
			await expect(
				t.mutation(api.liveSessions.join, {
					sessionId,
					userId: otherUserId,
				}),
			).rejects.toThrow('Session is full');
		});

		it('throws error when session not found', async () => {
			const nonExistentId = await t.run(async (ctx: TestCtx) => {
				const id = await ctx.db.insert('liveSessions', {
					title: 'Temp',
					description: 'Temp',
					instructorId: testInstructorId,
					scheduledFor: Date.now(),
					duration: 3600,
					isRecorded: false,
					maxParticipants: 10,
					status: 'scheduled',
				});
				await ctx.db.delete(id);
				return id;
			});

			await expect(
				t.mutation(api.liveSessions.join, {
					sessionId: nonExistentId,
					userId: testUserId,
				}),
			).rejects.toThrow('Session not found');
		});
	});

	describe('leave()', () => {
		it('removes user from session', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'Test Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			await t.mutation(api.liveSessions.join, {
				sessionId,
				userId: testUserId,
			});

			const result = await t.mutation(api.liveSessions.leave, {
				sessionId,
				userId: testUserId,
			});

			expect(result).toBe(true);

			const participants = await t.run(async (ctx: TestCtx) => {
				return await ctx.db
					.query('sessionParticipants')
					.withIndex('by_session', q => q.eq('sessionId', sessionId))
					.collect();
			});

			expect(participants).toHaveLength(0);
		});

		it('is idempotent - does not error if user not in session', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'Test Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			const result = await t.mutation(api.liveSessions.leave, {
				sessionId,
				userId: testUserId,
			});

			expect(result).toBe(true);
		});

		it('does not affect other participants', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'Test Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			await t.mutation(api.liveSessions.join, {
				sessionId,
				userId: testUserId,
			});

			await t.mutation(api.liveSessions.join, {
				sessionId,
				userId: otherUserId,
			});

			await t.mutation(api.liveSessions.leave, {
				sessionId,
				userId: testUserId,
			});

			const participants = await t.run(async (ctx: TestCtx) => {
				return await ctx.db
					.query('sessionParticipants')
					.withIndex('by_session', q => q.eq('sessionId', sessionId))
					.collect();
			});

			expect(participants).toHaveLength(1);
			expect(participants[0].userId).toBe(otherUserId);
		});
	});

	describe('start()', () => {
		it('changes session status to live', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'Test Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now(),
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			const returnedId = await t.mutation(api.liveSessions.start, {
				id: sessionId,
			});

			expect(returnedId).toBe(sessionId);

			const session = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(sessionId);
			});

			expect(session?.status).toBe('live');
		});
	});

	describe('end()', () => {
		it('changes session status to completed', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'Test Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now(),
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			await t.mutation(api.liveSessions.start, { id: sessionId });

			const returnedId = await t.mutation(api.liveSessions.end, {
				id: sessionId,
			});

			expect(returnedId).toBe(sessionId);

			const session = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(sessionId);
			});

			expect(session?.status).toBe('completed');
		});

		it('sets recording URL when session is recorded', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'Recorded Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now(),
				duration: 3600,
				isRecorded: true,
				maxParticipants: 30,
			});

			await t.mutation(api.liveSessions.end, { id: sessionId });

			const session = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(sessionId);
			});

			expect(session?.recordingUrl).toBeDefined();
			expect(session?.recordingUrl).toContain('recordings/session');
		});

		it('does not set recording URL when session is not recorded', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'Not Recorded Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now(),
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			await t.mutation(api.liveSessions.end, { id: sessionId });

			const session = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(sessionId);
			});

			expect(session?.recordingUrl).toBeUndefined();
		});

		it('throws error when session not found', async () => {
			const nonExistentId = await t.run(async (ctx: TestCtx) => {
				const id = await ctx.db.insert('liveSessions', {
					title: 'Temp',
					description: 'Temp',
					instructorId: testInstructorId,
					scheduledFor: Date.now(),
					duration: 3600,
					isRecorded: false,
					maxParticipants: 10,
					status: 'scheduled',
				});
				await ctx.db.delete(id);
				return id;
			});

			await expect(t.mutation(api.liveSessions.end, { id: nonExistentId })).rejects.toThrow('Session not found');
		});
	});

	describe('cancel()', () => {
		it('changes session status to cancelled', async () => {
			const sessionId = await t.mutation(api.liveSessions.create, {
				title: 'Test Session',
				description: 'Test',
				instructorId: testInstructorId,
				scheduledFor: Date.now() + 86400000,
				duration: 3600,
				isRecorded: false,
				maxParticipants: 30,
			});

			const returnedId = await t.mutation(api.liveSessions.cancel, {
				id: sessionId,
			});

			expect(returnedId).toBe(sessionId);

			const session = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(sessionId);
			});

			expect(session?.status).toBe('cancelled');
		});
	});
});

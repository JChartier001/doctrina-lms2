import type { GenericMutationCtx } from 'convex/server';
import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it } from 'vitest';

import { api } from '../_generated/api';
import type { DataModel, Id } from '../_generated/dataModel';
import schema from '../schema';

type TestCtx = GenericMutationCtx<DataModel>;

describe('Certificates', () => {
	let t: any;
	let testUserId: Id<'users'>;
	let testInstructorId: Id<'users'>;
	let testCourseId: Id<'courses'>;
	let testCertificateId: Id<'certificates'>;
	let testVerificationCode: string;

	beforeEach(async () => {
		const baseT = convexTest(schema);

		// Set up test data
		await baseT.run(async (ctx: TestCtx) => {
			// Create test student user
			const userId = await ctx.db.insert('users', {
				firstName: 'Test',
				lastName: 'Student',
				email: 'student@test.com',
				externalId: 'test-student-clerk-id',
				isInstructor: false,
				isAdmin: false,
			});

			// Create test instructor user
			const instructorId = await ctx.db.insert('users', {
				firstName: 'Dr.',
				lastName: 'Instructor',
				email: 'instructor@test.com',
				externalId: 'instructor-clerk-id',
				isInstructor: true,
				isAdmin: false,
			});

			// Create test course
			const courseId = await ctx.db.insert('courses', {
				title: 'Test Course',
				description: 'Test description',
				instructorId: instructorId,
				price: 29900,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});

			// Create test certificate
			testVerificationCode = 'DOCTRINA-TEST123';
			const certificateId = await ctx.db.insert('certificates', {
				userId,
				userName: 'Test Student',
				courseId,
				courseName: 'Test Course',
				instructorId,
				instructorName: 'Dr. Instructor',
				templateId: 'default',
				issueDate: '2025-01-15',
				verificationCode: testVerificationCode,
			});

			// Store IDs for tests
			testUserId = userId;
			testInstructorId = instructorId;
			testCourseId = courseId;
			testCertificateId = certificateId;
		});

		t = baseT;
	});

	describe('listForUser()', () => {
		it('returns all certificates for a user', async () => {
			const certificates = await t.query(api.certificates.listForUser, {
				userId: testUserId,
			});

			expect(certificates).toHaveLength(1);
			expect(certificates[0]._id).toBe(testCertificateId);
			expect(certificates[0].userName).toBe('Test Student');
			expect(certificates[0].courseName).toBe('Test Course');
		});

		it('returns empty array when user has no certificates', async () => {
			// Create a user with no certificates
			const newUserId = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('users', {
					firstName: 'No',
					lastName: 'Certs',
					email: 'nocerts@test.com',
					externalId: 'no-certs-user',
					isInstructor: false,
					isAdmin: false,
				});
			});

			const certificates = await t.query(api.certificates.listForUser, {
				userId: newUserId,
			});

			expect(certificates).toHaveLength(0);
		});

		it('returns multiple certificates for user with multiple completions', async () => {
			// Create another course
			const course2Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courses', {
					title: 'Test Course 2',
					description: 'Second course',
					instructorId: testInstructorId,
					price: 39900,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			// Create another certificate for same user
			await t.run(async (ctx: TestCtx) => {
				await ctx.db.insert('certificates', {
					userId: testUserId,
					userName: 'Test Student',
					courseId: course2Id,
					courseName: 'Test Course 2',
					instructorId: testInstructorId,
					instructorName: 'Dr. Instructor',
					templateId: 'default',
					issueDate: '2025-01-16',
					verificationCode: 'DOCTRINA-TEST456',
				});
			});

			const certificates = await t.query(api.certificates.listForUser, {
				userId: testUserId,
			});

			expect(certificates).toHaveLength(2);
		});
	});

	describe('get()', () => {
		it('returns certificate by ID', async () => {
			const certificate = await t.query(api.certificates.get, {
				id: testCertificateId,
			});

			expect(certificate).toBeDefined();
			expect(certificate?._id).toBe(testCertificateId);
			expect(certificate?.userName).toBe('Test Student');
			expect(certificate?.verificationCode).toBe(testVerificationCode);
		});

		it('returns null for non-existent certificate ID', async () => {
			// Create and delete a certificate to get a valid ID format
			const nonExistentId = await t.run(async (ctx: TestCtx) => {
				const tempId = await ctx.db.insert('certificates', {
					userId: testUserId,
					userName: 'Temp',
					courseId: testCourseId,
					courseName: 'Temp',
					instructorId: testInstructorId,
					instructorName: 'Temp',
					templateId: 'default',
					issueDate: '2025-01-01',
					verificationCode: 'TEMP',
				});
				await ctx.db.delete(tempId);
				return tempId;
			});

			const certificate = await t.query(api.certificates.get, {
				id: nonExistentId,
			});

			expect(certificate).toBeNull();
		});
	});

	describe('verify()', () => {
		it('returns certificate when verification code matches', async () => {
			const certificate = await t.query(api.certificates.verify, {
				code: testVerificationCode,
			});

			expect(certificate).toBeDefined();
			expect(certificate?._id).toBe(testCertificateId);
			expect(certificate?.verificationCode).toBe(testVerificationCode);
			expect(certificate?.userName).toBe('Test Student');
		});

		it('returns null when verification code does not exist', async () => {
			const certificate = await t.query(api.certificates.verify, {
				code: 'DOCTRINA-INVALID',
			});

			expect(certificate).toBeNull();
		});

		it('verification codes are case-sensitive', async () => {
			const certificate = await t.query(api.certificates.verify, {
				code: testVerificationCode.toLowerCase(),
			});

			expect(certificate).toBeNull();
		});
	});

	describe('generate()', () => {
		it('generates new certificate with all required fields', async () => {
			// Create a second course for new certificate
			const course2Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courses', {
					title: 'New Course',
					description: 'New course description',
					instructorId: testInstructorId,
					price: 49900,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			const certificateId = await t.mutation(api.certificates.generate, {
				userId: testUserId,
				userName: 'Test Student',
				courseId: course2Id,
				courseName: 'New Course',
				instructorId: testInstructorId,
				instructorName: 'Dr. Instructor',
				templateId: 'default',
			});

			expect(certificateId).toBeDefined();

			// Verify certificate was created with correct data
			const certificate = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(certificateId);
			});

			expect(certificate).toBeDefined();
			expect(certificate?.userName).toBe('Test Student');
			expect(certificate?.courseName).toBe('New Course');
			expect(certificate?.verificationCode).toMatch(/^DOCTRINA-[A-Z0-9]{6}$/);
			expect(certificate?.issueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});

		it('returns existing certificate ID when duplicate (idempotent)', async () => {
			// Try to generate certificate for same user + course
			const certificateId = await t.mutation(api.certificates.generate, {
				userId: testUserId,
				userName: 'Test Student',
				courseId: testCourseId,
				courseName: 'Test Course',
				instructorId: testInstructorId,
				instructorName: 'Dr. Instructor',
				templateId: 'default',
			});

			// Should return existing certificate ID
			expect(certificateId).toBe(testCertificateId);

			// Verify no duplicate was created
			const allCertificates = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.query('certificates').collect();
			});

			const courseCerts = allCertificates.filter(
				(c: { userId: Id<'users'>; courseId: Id<'courses'> }) => c.userId === testUserId && c.courseId === testCourseId,
			);
			expect(courseCerts).toHaveLength(1);
		});

		it('generates unique verification codes', async () => {
			// Create multiple certificates and verify codes are unique
			const course2Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courses', {
					title: 'Course 2',
					description: 'Test',
					instructorId: testInstructorId,
					price: 100,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			const course3Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courses', {
					title: 'Course 3',
					description: 'Test',
					instructorId: testInstructorId,
					price: 100,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			const cert1Id = await t.mutation(api.certificates.generate, {
				userId: testUserId,
				userName: 'Test Student',
				courseId: course2Id,
				courseName: 'Course 2',
				instructorId: testInstructorId,
				instructorName: 'Dr. Instructor',
				templateId: 'default',
			});

			const cert2Id = await t.mutation(api.certificates.generate, {
				userId: testUserId,
				userName: 'Test Student',
				courseId: course3Id,
				courseName: 'Course 3',
				instructorId: testInstructorId,
				instructorName: 'Dr. Instructor',
				templateId: 'default',
			});

			const cert1 = await t.run(async (ctx: TestCtx) => ctx.db.get(cert1Id));
			const cert2 = await t.run(async (ctx: TestCtx) => ctx.db.get(cert2Id));

			expect(cert1?.verificationCode).not.toBe(cert2?.verificationCode);
		});
	});

	describe('remove()', () => {
		it('deletes certificate and returns its ID', async () => {
			const deletedId = await t.mutation(api.certificates.remove, {
				id: testCertificateId,
			});

			expect(deletedId).toBe(testCertificateId);

			// Verify certificate was deleted
			const certificate = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.get(testCertificateId);
			});

			expect(certificate).toBeNull();
		});

		it('handles deletion of already deleted certificate', async () => {
			// Delete the certificate
			await t.mutation(api.certificates.remove, {
				id: testCertificateId,
			});

			// Try to delete again - should not throw error
			const deletedId = await t.mutation(api.certificates.remove, {
				id: testCertificateId,
			});

			expect(deletedId).toBe(testCertificateId);
		});
	});

	describe('listAll() - Admin Query', () => {
		it('returns all certificates in the system', async () => {
			const allCertificates = await t.query(api.certificates.listAll);

			expect(allCertificates).toHaveLength(1);
			expect(allCertificates[0]._id).toBe(testCertificateId);
		});

		it('returns multiple certificates when multiple users have certificates', async () => {
			// Create another user
			const user2Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('users', {
					firstName: 'Student',
					lastName: 'Two',
					email: 'student2@test.com',
					externalId: 'student2-clerk-id',
					isInstructor: false,
					isAdmin: false,
				});
			});

			// Create another course
			const course2Id = await t.run(async (ctx: TestCtx) => {
				return await ctx.db.insert('courses', {
					title: 'Course 2',
					description: 'Second course',
					instructorId: testInstructorId,
					price: 19900,
					createdAt: Date.now(),
					updatedAt: Date.now(),
				});
			});

			// Generate certificate for second user
			await t.mutation(api.certificates.generate, {
				userId: user2Id,
				userName: 'Student Two',
				courseId: course2Id,
				courseName: 'Course 2',
				instructorId: testInstructorId,
				instructorName: 'Dr. Instructor',
				templateId: 'modern-blue',
			});

			const allCertificates = await t.query(api.certificates.listAll);

			expect(allCertificates).toHaveLength(2);
		});

		it('returns empty array when no certificates exist', async () => {
			// Delete the existing certificate
			await t.mutation(api.certificates.remove, {
				id: testCertificateId,
			});

			const allCertificates = await t.query(api.certificates.listAll);

			expect(allCertificates).toHaveLength(0);
		});
	});

	describe('listTemplates()', () => {
		it('returns all available certificate templates', async () => {
			const templates = await t.query(api.certificates.listTemplates);

			expect(templates).toBeDefined();
			expect(templates.length).toBeGreaterThan(0);
		});

		it('returns templates with required fields', async () => {
			const templates = await t.query(api.certificates.listTemplates);

			templates.forEach((template: any) => {
				expect(template).toHaveProperty('id');
				expect(template).toHaveProperty('name');
				expect(template).toHaveProperty('description');
				expect(template).toHaveProperty('previewUrl');
				expect(typeof template.id).toBe('string');
				expect(typeof template.name).toBe('string');
				expect(typeof template.description).toBe('string');
				expect(typeof template.previewUrl).toBe('string');
			});
		});

		it('returns expected template IDs', async () => {
			const templates = await t.query(api.certificates.listTemplates);

			const templateIds = templates.map((t: any) => t.id);
			expect(templateIds).toContain('modern-blue');
			expect(templateIds).toContain('classic-gold');
			expect(templateIds).toContain('minimalist');
		});
	});
});

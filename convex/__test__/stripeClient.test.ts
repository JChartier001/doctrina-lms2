import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

describe('stripeClient', () => {
	let originalKey: string | undefined;

	beforeAll(() => {
		// Save and ensure STRIPE_SECRET_KEY is set for tests
		originalKey = process.env.STRIPE_SECRET_KEY;
		if (!process.env.STRIPE_SECRET_KEY) {
			process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key_for_testing';
		}
	});

	afterAll(() => {
		// Restore original value
		if (originalKey) {
			process.env.STRIPE_SECRET_KEY = originalKey;
		} else {
			delete process.env.STRIPE_SECRET_KEY;
		}
		vi.unstubAllEnvs();
	});

	it('exports stripe client when STRIPE_SECRET_KEY is set', async () => {
		// Dynamic import to ensure env var is set before module loads
		const { stripe } = await import('../lib/stripeClient');

		expect(stripe).toBeDefined();
		expect(typeof stripe).toBe('object');
	});

	it('stripe client has expected properties', async () => {
		const { stripe } = await import('../lib/stripeClient');

		expect(stripe).toBeDefined();
		expect(stripe.checkout).toBeDefined();
		expect(stripe.checkout.sessions).toBeDefined();
	});

	it('stripe client can create checkout sessions', async () => {
		const { stripe } = await import('../lib/stripeClient');

		// Verify the client has the expected API methods
		expect(typeof stripe.checkout.sessions.create).toBe('function');
	});

	// Run this test last to avoid affecting other tests
	it('throws error when STRIPE_SECRET_KEY is not set', async () => {
		// Reset module cache
		vi.resetModules();

		// Mock process.env to simulate missing key during module import
		vi.stubEnv('STRIPE_SECRET_KEY', '');
		delete process.env.STRIPE_SECRET_KEY;

		// Dynamic import will now load a fresh module
		await expect(async () => {
			await import('../lib/stripeClient');
		}).rejects.toThrow('STRIPE_SECRET_KEY environment variable is not set');

		// Restore immediately
		process.env.STRIPE_SECRET_KEY = originalKey || 'sk_test_mock_key_for_testing';
		vi.unstubAllEnvs();
		vi.resetModules(); // Reset again to clear the errored module
	});
});

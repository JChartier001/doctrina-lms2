import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'edge-runtime',
		pool: 'threads',
		maxConcurrency: 5,
		server: {
			deps: {
				inline: ['convex-test'],
			},
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['convex/**/*.ts'],
			exclude: [
				'node_modules/',
				'test/',
				'**/*.config.*',
				'**/types/**',
				'convex/_generated/**',
				'convex/seedData.ts',
				'convex/seedCurrentUser.ts',
				'convex/seed.ts',
				'convex/http.ts',
			],
			// Priority-based thresholds per TESTING-STRATEGY.md
			thresholds: {
				// Core features: 85%
				'./convex/lessonProgress.ts': {
					lines: 85,
					functions: 85,
					branches: 80,
					statements: 85,
				},
				global: {
					lines: 80,
					functions: 80,
					branches: 75,
					statements: 80,
				},
			},
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './'),
		},
	},
});

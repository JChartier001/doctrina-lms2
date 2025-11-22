import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'happy-dom',
		pool: 'threads',
		maxConcurrency: 5,
		setupFiles: ['./vitest.setup.ts'],
		server: {
			deps: {
				inline: ['convex-test'],
			},
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['convex/**/*.ts', 'components/**/*.tsx'],
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
				'**/__tests__/**',
				'**/*.test.tsx',
				'**/*.test.ts',
				'app/layout.tsx',
				'app/**/layout.tsx',
			],

			thresholds: {
				lines: 47,
				functions: 36,
				branches: 37,
				statements: 48,
			},
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './'),
		},
	},
});

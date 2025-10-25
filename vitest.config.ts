import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'edge-runtime',
		server: {
			deps: {
				inline: ['convex-test'],
			},
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: ['node_modules/', 'test/', '**/*.config.*', '**/types/**', 'convex/_generated/**'],
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

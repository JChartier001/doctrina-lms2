import convexPlugin from '@convex-dev/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import noOnlyTests from 'eslint-plugin-no-only-tests';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const eslintConfig = defineConfig([
	// Extend Next.js Core Web Vitals and TypeScript configs
	...nextVitals,
	...nextTs,
	prettier,
	// Main configuration
	{
		plugins: {
			'simple-import-sort': simpleImportSort,
			'no-only-tests': noOnlyTests,
			convex: convexPlugin,
		},

		rules: {
			// TypeScript rules
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^(?:_|ref$)',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/ban-ts-comment': 'error',

			// Import sorting rules
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',

			// React rules
			'react/no-unescaped-entities': 'off',
			'react-hooks/exhaustive-deps': 'off',

			// Test rules
			'no-only-tests/no-only-tests': 'error',

			// Formatting handled by Prettier CLI; ESLint only handles code-quality rules
		},
	},

	// Test file specific overrides
	{
		files: [
			'**/*.test.ts',
			'**/*.test.tsx',
			'**/__test__/*.test.ts',
			'**/__test__/*.test.tsx',
			'convex/__test__/**',
			'convex/seedData.ts',
			'convex/seedCurrentUser.ts',
		],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'no-only-tests/no-only-tests': 'warn',
			'@typescript-eslint/no-unused-vars': 'off',
		},
	},

	// Override default ignores of eslint-config-next
	globalIgnores([
		// Default ignores of eslint-config-next
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts',
		'bmad/**',
		'.claude/**',
		'.github/**',
		'.factory/**',
		'.droidz/**',

		// Additional ignores
		'node_modules/**',
		'*.config.js',
		'convex/_generated/**',
	]),
]);

export default eslintConfig;

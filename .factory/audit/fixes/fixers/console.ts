/**
 * Auto-fixer: Remove console.log statements
 */

import type { AutoFixer, Violation, FixResult } from '../types';

export const consoleFixer: AutoFixer = {
	name: 'Remove console.log',
	ruleId: 'no-console',
	description: 'Removes or comments out console.log statements',

	canFix(violation: Violation, sourceCode: string): boolean {
		// Check if violation is about console statements
		if (!violation.ruleId.includes('console') && !violation.message.toLowerCase().includes('console')) {
			return false;
		}

		return /console\.(log|warn|error|debug|info)/.test(sourceCode);
	},

	fix(violation: Violation, sourceCode: string): FixResult {
		try {
			let fixed = sourceCode;

			// Comment out console statements (safer than removing)
			// This preserves them for potential debugging needs
			fixed = fixed.replace(
				/^(\s*)(console\.(log|warn|error|debug|info)\([^)]*\);?)$/gm,
				'$1// $2 // Removed by audit'
			);

			// Also handle inline console statements
			fixed = fixed.replace(
				/(\s+)(console\.(log|warn|error|debug|info)\([^)]*\);?)/g,
				'$1// $2 // Removed by audit\n'
			);

			return {
				fixed,
				applied: fixed !== sourceCode,
			};
		} catch (error) {
			return {
				fixed: sourceCode,
				applied: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	},
};

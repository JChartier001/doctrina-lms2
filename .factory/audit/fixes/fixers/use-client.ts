/**
 * Auto-fixer: Add "use client" directive to components using React hooks
 */

import type { AutoFixer, Violation, FixResult } from '../types';

export const useClientFixer: AutoFixer = {
	name: 'Add "use client" directive',
	ruleId: 'nextjs-001',
	description: 'Adds "use client" directive to components that use React hooks',

	canFix(violation: Violation, sourceCode: string): boolean {
		// Check if violation is about missing "use client"
		if (!violation.ruleId.includes('use-client') && !violation.ruleId.includes('nextjs-001')) {
			return false;
		}

		// Check if "use client" is already present
		if (sourceCode.trim().startsWith('"use client"') || sourceCode.trim().startsWith("'use client'")) {
			return false;
		}

		// Check if file uses hooks (useState, useEffect, etc.)
		const hasHooks = /\buse[A-Z]\w+\s*\(/.test(sourceCode);
		return hasHooks;
	},

	fix(violation: Violation, sourceCode: string): FixResult {
		try {
			// Find the first non-comment, non-whitespace line
			const lines = sourceCode.split('\n');
			let insertIndex = 0;

			// Skip initial comments and empty lines
			for (let i = 0; i < lines.length; i++) {
				const trimmed = lines[i].trim();
				if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*')) {
					insertIndex = i;
					break;
				}
			}

			// Insert "use client" directive
			lines.splice(insertIndex, 0, '"use client";', '');

			const fixed = lines.join('\n');

			return {
				fixed,
				applied: true,
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

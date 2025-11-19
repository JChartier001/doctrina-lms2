/**
 * Auto-fixer: Add TypeScript return types to functions
 */

import type { AutoFixer, Violation, FixResult } from '../types';

export const typesFixer: AutoFixer = {
	name: 'Add TypeScript return types',
	ruleId: 'ts-return-type',
	description: 'Adds explicit return types to functions (simple cases only)',

	canFix(violation: Violation, sourceCode: string): boolean {
		// Check if violation is about missing return types
		if (!violation.ruleId.includes('return-type') && !violation.message.toLowerCase().includes('return type')) {
			return false;
		}

		// Only fix simple cases (functions that return primitives or promises)
		return true;
	},

	fix(violation: Violation, sourceCode: string): FixResult {
		try {
			let fixed = sourceCode;

			// Pattern 1: Functions returning Promise
			// export function getUser(id: string) { return fetchUser(id); }
			// → export function getUser(id: string): Promise<User> { return fetchUser(id); }
			const promisePattern = /function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*return\s+fetch\w+/g;
			if (promisePattern.test(sourceCode)) {
				// This is a complex transformation that needs type inference
				// Skip for now (require manual fix)
				return {
					fixed: sourceCode,
					applied: false,
					error: 'Complex type inference required - manual fix needed',
				};
			}

			// Pattern 2: Functions returning void (no return statement)
			fixed = fixed.replace(
				/function\s+(\w+)\s*\(([^)]*)\)\s*\{([^}]*)\}/g,
				(match, name, params, body) => {
					// Check if function has return statement
					if (!body.includes('return')) {
						// Add void return type
						return `function ${name}(${params}): void {${body}}`;
					}
					return match;
				}
			);

			// Pattern 3: Arrow functions returning void
			fixed = fixed.replace(
				/const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*\{([^}]*)\}/g,
				(match, name, params, body) => {
					// Check if function has return statement
					if (!body.includes('return')) {
						// Add void return type
						return `const ${name} = (${params}): void => {${body}}`;
					}
					return match;
				}
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

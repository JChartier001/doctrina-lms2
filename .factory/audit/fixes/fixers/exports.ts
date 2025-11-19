/**
 * Auto-fixer: Convert default exports to named exports
 */

import type { AutoFixer, Violation, FixResult } from '../types';

export const exportsFixer: AutoFixer = {
	name: 'Convert default to named exports',
	ruleId: 'ts-export',
	description: 'Converts default exports to named exports',

	canFix(violation: Violation, sourceCode: string): boolean {
		// Check if violation is about default exports
		if (!violation.ruleId.includes('export') && !violation.message.toLowerCase().includes('export')) {
			return false;
		}

		// Check if file has default export
		return /export\s+default\s+(function|class|const|let)/.test(sourceCode);
	},

	fix(violation: Violation, sourceCode: string): FixResult {
		try {
			let fixed = sourceCode;

			// Pattern 1: export default function MyComponent() {}
			fixed = fixed.replace(
				/export\s+default\s+function\s+(\w+)/g,
				'export function $1'
			);

			// Pattern 2: export default class MyClass {}
			fixed = fixed.replace(
				/export\s+default\s+class\s+(\w+)/g,
				'export class $1'
			);

			// Pattern 3: const MyComponent = () => {}; export default MyComponent;
			const defaultExportMatch = fixed.match(/export\s+default\s+(\w+)\s*;?\s*$/m);
			if (defaultExportMatch) {
				const componentName = defaultExportMatch[1];
				
				// Find the declaration
				const declarationRegex = new RegExp(`(const|let|var)\\s+${componentName}\\s*=`, 'g');
				if (declarationRegex.test(fixed)) {
					// Add export to declaration
					fixed = fixed.replace(
						new RegExp(`(const|let|var)\\s+(${componentName}\\s*=)`, 'g'),
						'export const $2'
					);
					// Remove default export line
					fixed = fixed.replace(/export\s+default\s+\w+\s*;?\s*$/m, '');
				}
			}

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

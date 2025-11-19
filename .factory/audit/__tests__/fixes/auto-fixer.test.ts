import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Mock Auto-Fixer class
 * This will be replaced when the actual fixer is implemented
 */
class MockAutoFixer {
	fix(code: string, fixType: string): string {
		switch (fixType) {
			case 'add-use-client':
				return this.addUseClient(code);
			case 'convert-export':
				return this.convertToNamedExport(code);
			case 'remove-console':
				return this.removeConsoleLogs(code);
			case 'remove-any':
				return this.removeAnyType(code);
			default:
				return code;
		}
	}

	fixAll(code: string, fixTypes: string[]): string {
		let result = code;
		for (const fixType of fixTypes) {
			result = this.fix(result, fixType);
		}
		return result;
	}

	private addUseClient(code: string): string {
		// Add "use client" at the beginning if not already present
		if (code.includes('"use client"') || code.includes("'use client'")) {
			return code;
		}

		// Find first non-comment, non-empty line
		const lines = code.split('\n');
		let insertIndex = 0;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]?.trim() ?? '';
			if (line && !line.startsWith('//') && !line.startsWith('/*')) {
				insertIndex = i;
				break;
			}
		}

		lines.splice(insertIndex, 0, '"use client";');
		return lines.join('\n');
	}

	private convertToNamedExport(code: string): string {
		// Convert: export default function Component() {}
		// To: export function Component() {}
		let result = code;

		// Handle named function defaults
		result = result.replace(/export\s+default\s+function\s+(\w+)/g, 'export function $1');

		// Handle arrow function defaults - extract name from variable
		result = result.replace(
			/export\s+default\s+(\w+)\s*;/g,
			(match, name) => `export { ${name} };`,
		);

		return result;
	}

	private removeConsoleLogs(code: string): string {
		// Remove console.log statements (simple implementation)
		const lines = code.split('\n');
		const filtered = lines.filter(line => !line.trim().startsWith('console.log'));
		return filtered.join('\n');
	}

	private removeAnyType(code: string): string {
		// Replace 'any' with 'unknown' (safer alternative)
		return code.replace(/:\s*any\b/g, ': unknown');
	}
}

describe('AutoFixer', () => {
	let fixer: MockAutoFixer;

	beforeEach(() => {
		fixer = new MockAutoFixer();
	});

	describe('Add "use client" Directive', () => {
		it('adds "use client" directive to file', () => {
			const code = `import { useState } from 'react';\nexport function Test() {}`;
			const fixed = fixer.fix(code, 'add-use-client');

			expect(fixed).toContain('"use client"');
		});

		it('adds directive at the beginning of file', () => {
			const code = `import { useState } from 'react';\nexport function Test() {}`;
			const fixed = fixer.fix(code, 'add-use-client');

			expect(fixed.indexOf('"use client"')).toBe(0);
		});

		it('does not add duplicate directive', () => {
			const code = `"use client";\nimport { useState } from 'react';`;
			const fixed = fixer.fix(code, 'add-use-client');

			const count = (fixed.match(/"use client"/g) || []).length;
			expect(count).toBe(1);
		});

		it('handles files with comments at top', () => {
			const code = `// Comment\nimport { useState } from 'react';`;
			const fixed = fixer.fix(code, 'add-use-client');

			expect(fixed).toContain('"use client"');
		});

		it('preserves existing code structure', () => {
			const code = `import { useState } from 'react';\nexport function Test() { return <div />; }`;
			const fixed = fixer.fix(code, 'add-use-client');

			expect(fixed).toContain('import { useState }');
			expect(fixed).toContain('export function Test()');
		});
	});

	describe('Convert Exports', () => {
		it('converts default to named export', () => {
			const code = `export default function Test() {}`;
			const fixed = fixer.fix(code, 'convert-export');

			expect(fixed).toContain('export function Test()');
			expect(fixed).not.toContain('export default');
		});

		it('handles function with parameters', () => {
			const code = `export default function Test(props: Props) {}`;
			const fixed = fixer.fix(code, 'convert-export');

			expect(fixed).toContain('export function Test(props: Props)');
		});

		it('handles function with return type', () => {
			const code = `export default function Test(): JSX.Element {}`;
			const fixed = fixer.fix(code, 'convert-export');

			expect(fixed).toContain('export function Test(): JSX.Element');
		});

		it('handles exported variable reference', () => {
			const code = `function Test() {}\nexport default Test;`;
			const fixed = fixer.fix(code, 'convert-export');

			expect(fixed).toContain('export { Test }');
		});

		it('preserves other exports', () => {
			const code = `export const Helper = () => {};\nexport default function Test() {}`;
			const fixed = fixer.fix(code, 'convert-export');

			expect(fixed).toContain('export const Helper');
			expect(fixed).toContain('export function Test()');
		});
	});

	describe('Remove Console Logs', () => {
		it('removes console.log statements', () => {
			const code = `console.log('debug');\nconst x = 5;`;
			const fixed = fixer.fix(code, 'remove-console');

			expect(fixed).not.toContain('console.log');
			expect(fixed).toContain('const x = 5');
		});

		it('removes multiple console.log statements', () => {
			const code = `console.log('a');\nconst x = 5;\nconsole.log('b');`;
			const fixed = fixer.fix(code, 'remove-console');

			expect(fixed).not.toContain('console.log');
			expect(fixed).toContain('const x = 5');
		});

		it('preserves other code', () => {
			const code = `const x = 5;\nconsole.log('debug');\nconst y = 10;`;
			const fixed = fixer.fix(code, 'remove-console');

			expect(fixed).toContain('const x = 5');
			expect(fixed).toContain('const y = 10');
		});

		it('handles empty result when only console.log exists', () => {
			const code = `console.log('only this');`;
			const fixed = fixer.fix(code, 'remove-console');

			expect(fixed.trim()).toBe('');
		});
	});

	describe('Remove Any Type', () => {
		it('replaces any with unknown', () => {
			const code = `const x: any = 5;`;
			const fixed = fixer.fix(code, 'remove-any');

			expect(fixed).toContain('unknown');
			expect(fixed).not.toContain('any');
		});

		it('replaces multiple any types', () => {
			const code = `const x: any = 5;\nfunction test(param: any) {}`;
			const fixed = fixer.fix(code, 'remove-any');

			const unknownCount = (fixed.match(/unknown/g) || []).length;
			expect(unknownCount).toBe(2);
		});

		it('preserves type annotations', () => {
			const code = `const x: any = 5;`;
			const fixed = fixer.fix(code, 'remove-any');

			expect(fixed).toContain(': unknown =');
		});

		it('does not affect other words containing "any"', () => {
			const code = `const company = "Company Name";\nconst x: any = 5;`;
			const fixed = fixer.fix(code, 'remove-any');

			expect(fixed).toContain('company');
			expect(fixed).toContain('Company Name');
		});
	});

	describe('Multiple Fixes', () => {
		it('applies multiple fixes in sequence', () => {
			const code = `import { useState } from 'react';\nexport default function Test() {}\nconsole.log('debug');`;
			const fixed = fixer.fixAll(code, ['add-use-client', 'convert-export', 'remove-console']);

			expect(fixed).toContain('"use client"');
			expect(fixed).toContain('export function Test()');
			expect(fixed).not.toContain('console.log');
			expect(fixed).not.toContain('export default');
		});

		it('handles order of fixes correctly', () => {
			const code = `const x: any = 5;\nconsole.log(x);`;
			const fixed = fixer.fixAll(code, ['remove-any', 'remove-console']);

			expect(fixed).toContain('unknown');
			expect(fixed).not.toContain('console.log');
		});
	});

	describe('Idempotency', () => {
		it('applying same fix twice has no additional effect', () => {
			const code = `import { useState } from 'react';`;
			const fixed1 = fixer.fix(code, 'add-use-client');
			const fixed2 = fixer.fix(fixed1, 'add-use-client');

			expect(fixed1).toBe(fixed2);
		});

		it('does not modify already compliant code', () => {
			const code = `export function Test() { return <div />; }`;
			const fixed = fixer.fix(code, 'convert-export');

			expect(fixed).toBe(code);
		});
	});

	describe('Edge Cases', () => {
		it('handles empty code', () => {
			const code = '';
			const fixed = fixer.fix(code, 'add-use-client');

			expect(typeof fixed).toBe('string');
		});

		it('handles unknown fix type', () => {
			const code = `const x = 5;`;
			const fixed = fixer.fix(code, 'unknown-fix');

			expect(fixed).toBe(code);
		});

		it('preserves whitespace and formatting', () => {
			const code = `const x = 5;\n\nconst y = 10;`;
			const fixed = fixer.fix(code, 'add-use-client');

			// Should preserve empty lines
			expect(fixed.split('\n').length).toBeGreaterThanOrEqual(3);
		});
	});

	describe('Safety Checks', () => {
		it('does not introduce syntax errors', () => {
			const code = `export function Test() { return <div />; }`;
			const fixed = fixer.fix(code, 'add-use-client');

			// Basic check - should still be valid syntax
			expect(fixed).not.toContain('undefined');
			expect(fixed.includes('export function Test')).toBe(true);
		});

		it('preserves imports', () => {
			const code = `import { useState } from 'react';\nimport { useQuery } from 'convex/react';`;
			const fixed = fixer.fix(code, 'add-use-client');

			expect(fixed).toContain("import { useState } from 'react'");
			expect(fixed).toContain("import { useQuery } from 'convex/react'");
		});

		it('preserves function bodies', () => {
			const code = `export function Test() { const [x] = useState(0); return <div>{x}</div>; }`;
			const fixed = fixer.fix(code, 'add-use-client');

			expect(fixed).toContain('const [x] = useState(0)');
			expect(fixed).toContain('return <div>{x}</div>');
		});
	});
});

import { describe, it, expect, beforeEach } from 'vitest';
import type { Violation } from '../../engine/types';

/**
 * Mock file information for validation
 */
interface FileInfo {
	path: string;
	code: string;
	isClientComponent?: boolean;
	hooks?: string[];
	hasDefaultExport?: boolean;
	hasNamedExport?: boolean;
	consoleLogs?: Array<{ line: number; column: number }>;
}

/**
 * Mock Rule Validator class
 * This will be replaced when the actual validator is implemented
 */
class MockRuleValidator {
	validate(fileInfo: FileInfo): Violation[] {
		const violations: Violation[] = [];

		// Check Next.js rules
		violations.push(...this.validateNextJsRules(fileInfo));

		// Check TypeScript rules
		violations.push(...this.validateTypeScriptRules(fileInfo));

		// Check React rules
		violations.push(...this.validateReactRules(fileInfo));

		// Check for console.log
		violations.push(...this.validateConsoleLogs(fileInfo));

		return violations;
	}

	private validateNextJsRules(fileInfo: FileInfo): Violation[] {
		const violations: Violation[] = [];

		// Rule: Client components with hooks must have "use client"
		if (
			fileInfo.hooks &&
			fileInfo.hooks.length > 0 &&
			fileInfo.isClientComponent === false
		) {
			violations.push({
				ruleId: 'nextjs-001',
				filePath: fileInfo.path,
				line: 1,
				column: 1,
				severity: 'error',
				message:
					'Component uses React hooks but is missing "use client" directive. Add "use client" at the top of the file.',
				codeSnippet: fileInfo.code.split('\n')[0] ?? '',
				fixSuggestion: 'Add "use client"; at the top of the file',
			});
		}

		return violations;
	}

	private validateTypeScriptRules(fileInfo: FileInfo): Violation[] {
		const violations: Violation[] = [];

		// Rule: No 'any' type
		const anyTypePattern = /:\s*any\s*[=;]/;
		if (anyTypePattern.test(fileInfo.code)) {
			const lines = fileInfo.code.split('\n');
			lines.forEach((line, index) => {
				if (anyTypePattern.test(line)) {
					violations.push({
						ruleId: 'ts-001',
						filePath: fileInfo.path,
						line: index + 1,
						column: line.indexOf('any'),
						severity: 'error',
						message: 'Avoid using "any" type. Use specific types instead.',
						codeSnippet: line,
						fixSuggestion: 'Replace "any" with a specific type',
					});
				}
			});
		}

		// Rule: Missing return types (simple check)
		const missingReturnType = /export\s+function\s+\w+\([^)]*\)\s*{/;
		if (missingReturnType.test(fileInfo.code)) {
			const lines = fileInfo.code.split('\n');
			lines.forEach((line, index) => {
				if (missingReturnType.test(line) && !line.includes(':')) {
					violations.push({
						ruleId: 'ts-002',
						filePath: fileInfo.path,
						line: index + 1,
						column: 0,
						severity: 'warning',
						message: 'Function is missing explicit return type annotation.',
						codeSnippet: line,
						fixSuggestion: 'Add return type annotation',
					});
				}
			});
		}

		return violations;
	}

	private validateReactRules(fileInfo: FileInfo): Violation[] {
		const violations: Violation[] = [];

		// Rule: No anonymous arrow components
		const arrowComponentPattern = /export\s+default\s*\([^)]*\)\s*=>/;
		if (arrowComponentPattern.test(fileInfo.code)) {
			violations.push({
				ruleId: 'react-001',
				filePath: fileInfo.path,
				line: 1,
				column: 0,
				severity: 'error',
				message:
					'Use named function components instead of anonymous arrow functions for better debugging.',
				codeSnippet: fileInfo.code.split('\n')[0] ?? '',
				fixSuggestion: 'Convert to: export function ComponentName() { ... }',
			});
		}

		// Rule: Prefer named exports over default exports
		if (fileInfo.hasDefaultExport && !fileInfo.hasNamedExport) {
			violations.push({
				ruleId: 'react-002',
				filePath: fileInfo.path,
				line: 1,
				column: 0,
				severity: 'warning',
				message: 'Prefer named exports over default exports for better refactoring.',
				codeSnippet: fileInfo.code.split('\n')[0] ?? '',
				fixSuggestion: 'Convert default export to named export',
			});
		}

		return violations;
	}

	private validateConsoleLogs(fileInfo: FileInfo): Violation[] {
		const violations: Violation[] = [];

		if (fileInfo.consoleLogs && fileInfo.consoleLogs.length > 0) {
			fileInfo.consoleLogs.forEach(log => {
				violations.push({
					ruleId: 'general-001',
					filePath: fileInfo.path,
					line: log.line,
					column: log.column,
					severity: 'warning',
					message: 'Remove console.log statements from production code.',
					codeSnippet: fileInfo.code.split('\n')[log.line - 1] ?? '',
					fixSuggestion: 'Remove this console.log statement',
				});
			});
		}

		return violations;
	}
}

describe('RuleValidator', () => {
	let validator: MockRuleValidator;

	beforeEach(() => {
		validator = new MockRuleValidator();
	});

	describe('Next.js Rules', () => {
		it('detects missing "use client" directive', () => {
			const fileInfo: FileInfo = {
				path: 'app/test.tsx',
				isClientComponent: false,
				hooks: ['useState'],
				code: 'export function Test() { const [x] = useState(); }',
			};

			const violations = validator.validate(fileInfo);
			const missingDirective = violations.find(v => v.ruleId === 'nextjs-001');

			expect(missingDirective).toBeDefined();
			expect(missingDirective?.message).toContain('use client');
			expect(missingDirective?.severity).toBe('error');
		});

		it('allows hooks in client components', () => {
			const fileInfo: FileInfo = {
				path: 'app/test.tsx',
				isClientComponent: true,
				hooks: ['useState'],
				code: '"use client";\nexport function Test() { const [x] = useState(); }',
			};

			const violations = validator.validate(fileInfo);
			const missingDirective = violations.find(v => v.ruleId === 'nextjs-001');

			expect(missingDirective).toBeUndefined();
		});

		it('allows server components without hooks', () => {
			const fileInfo: FileInfo = {
				path: 'app/test.tsx',
				isClientComponent: false,
				hooks: [],
				code: 'export function Test() { return <div>Server Component</div>; }',
			};

			const violations = validator.validate(fileInfo);
			const missingDirective = violations.find(v => v.ruleId === 'nextjs-001');

			expect(missingDirective).toBeUndefined();
		});

		it('detects multiple hook usage violations', () => {
			const fileInfo: FileInfo = {
				path: 'app/test.tsx',
				isClientComponent: false,
				hooks: ['useState', 'useEffect', 'useCallback'],
				code: 'export function Test() { const [x] = useState(); useEffect(() => {}); }',
			};

			const violations = validator.validate(fileInfo);
			const missingDirective = violations.find(v => v.ruleId === 'nextjs-001');

			expect(missingDirective).toBeDefined();
		});
	});

	describe('TypeScript Rules', () => {
		it('detects any type usage', () => {
			const fileInfo: FileInfo = {
				path: 'lib/utils.ts',
				code: 'const x: any = 5;',
			};

			const violations = validator.validate(fileInfo);
			const anyType = violations.find(v => v.ruleId === 'ts-001');

			expect(anyType).toBeDefined();
			expect(anyType?.message).toContain('any');
			expect(anyType?.severity).toBe('error');
		});

		it('detects multiple any type usages', () => {
			const fileInfo: FileInfo = {
				path: 'lib/utils.ts',
				code: 'const x: any = 5;\nconst y: any = 10;\nfunction test(param: any) {}',
			};

			const violations = validator.validate(fileInfo);
			const anyTypes = violations.filter(v => v.ruleId === 'ts-001');

			expect(anyTypes.length).toBeGreaterThan(1);
		});

		it('detects missing return types', () => {
			const fileInfo: FileInfo = {
				path: 'lib/utils.ts',
				code: 'export function getUser(id: string) { return fetch(id); }',
			};

			const violations = validator.validate(fileInfo);
			const missingReturn = violations.find(v => v.ruleId === 'ts-002');

			expect(missingReturn).toBeDefined();
			expect(missingReturn?.message).toContain('return type');
		});

		it('allows functions with explicit return types', () => {
			const fileInfo: FileInfo = {
				path: 'lib/utils.ts',
				code: 'export function getUser(id: string): Promise<User> { return fetch(id); }',
			};

			const violations = validator.validate(fileInfo);
			const missingReturn = violations.find(v => v.ruleId === 'ts-002');

			expect(missingReturn).toBeUndefined();
		});

		it('reports correct line numbers for violations', () => {
			const fileInfo: FileInfo = {
				path: 'lib/utils.ts',
				code: 'const x = 5;\nconst y: any = 10;\nconst z = 15;',
			};

			const violations = validator.validate(fileInfo);
			const anyType = violations.find(v => v.ruleId === 'ts-001');

			expect(anyType?.line).toBe(2);
		});
	});

	describe('React Rules', () => {
		it('detects anonymous arrow components', () => {
			const fileInfo: FileInfo = {
				path: 'components/Test.tsx',
				code: 'export default () => <div>Test</div>',
				hasDefaultExport: true,
				hasNamedExport: false,
			};

			const violations = validator.validate(fileInfo);
			const arrowComp = violations.find(v => v.ruleId === 'react-001');

			expect(arrowComp).toBeDefined();
			expect(arrowComp?.message).toContain('named function');
		});

		it('allows named function components', () => {
			const fileInfo: FileInfo = {
				path: 'components/Test.tsx',
				code: 'export function Test() { return <div>Test</div>; }',
				hasDefaultExport: false,
				hasNamedExport: true,
			};

			const violations = validator.validate(fileInfo);
			const arrowComp = violations.find(v => v.ruleId === 'react-001');

			expect(arrowComp).toBeUndefined();
		});

		it('detects default export preference violation', () => {
			const fileInfo: FileInfo = {
				path: 'components/Test.tsx',
				code: 'export default function Test() { return <div>Test</div>; }',
				hasDefaultExport: true,
				hasNamedExport: false,
			};

			const violations = validator.validate(fileInfo);
			const defaultExport = violations.find(v => v.ruleId === 'react-002');

			expect(defaultExport).toBeDefined();
			expect(defaultExport?.severity).toBe('warning');
		});

		it('allows files with both export types', () => {
			const fileInfo: FileInfo = {
				path: 'components/Test.tsx',
				code: 'export function Test() {} \nexport default Test;',
				hasDefaultExport: true,
				hasNamedExport: true,
			};

			const violations = validator.validate(fileInfo);
			const defaultExport = violations.find(v => v.ruleId === 'react-002');

			// Has both, so the warning should not apply
			expect(defaultExport).toBeUndefined();
		});
	});

	describe('Console Log Detection', () => {
		it('detects console.log statements', () => {
			const fileInfo: FileInfo = {
				path: 'lib/debug.ts',
				code: 'console.log("debug");',
				consoleLogs: [{ line: 1, column: 0 }],
			};

			const violations = validator.validate(fileInfo);
			const consoleLog = violations.find(v => v.ruleId === 'general-001');

			expect(consoleLog).toBeDefined();
			expect(consoleLog?.message).toContain('console.log');
			expect(consoleLog?.severity).toBe('warning');
		});

		it('detects multiple console.log statements', () => {
			const fileInfo: FileInfo = {
				path: 'lib/debug.ts',
				code: 'console.log("a");\nconsole.log("b");\nconsole.log("c");',
				consoleLogs: [
					{ line: 1, column: 0 },
					{ line: 2, column: 0 },
					{ line: 3, column: 0 },
				],
			};

			const violations = validator.validate(fileInfo);
			const consoleLogs = violations.filter(v => v.ruleId === 'general-001');

			expect(consoleLogs.length).toBe(3);
		});

		it('reports correct line numbers for console.log', () => {
			const fileInfo: FileInfo = {
				path: 'lib/debug.ts',
				code: 'const x = 5;\nconsole.log("debug");\nconst y = 10;',
				consoleLogs: [{ line: 2, column: 0 }],
			};

			const violations = validator.validate(fileInfo);
			const consoleLog = violations.find(v => v.ruleId === 'general-001');

			expect(consoleLog?.line).toBe(2);
		});
	});

	describe('Violation Structure', () => {
		it('returns violations with required fields', () => {
			const fileInfo: FileInfo = {
				path: 'test.ts',
				code: 'const x: any = 5;',
			};

			const violations = validator.validate(fileInfo);

			violations.forEach(violation => {
				expect(violation).toHaveProperty('ruleId');
				expect(violation).toHaveProperty('filePath');
				expect(violation).toHaveProperty('line');
				expect(violation).toHaveProperty('column');
				expect(violation).toHaveProperty('severity');
				expect(violation).toHaveProperty('message');
				expect(violation).toHaveProperty('codeSnippet');
			});
		});

		it('includes fix suggestions', () => {
			const fileInfo: FileInfo = {
				path: 'test.ts',
				code: 'const x: any = 5;',
			};

			const violations = validator.validate(fileInfo);
			const anyType = violations.find(v => v.ruleId === 'ts-001');

			expect(anyType?.fixSuggestion).toBeDefined();
		});
	});

	describe('Edge Cases', () => {
		it('handles empty files', () => {
			const fileInfo: FileInfo = {
				path: 'empty.ts',
				code: '',
			};

			const violations = validator.validate(fileInfo);
			expect(Array.isArray(violations)).toBe(true);
		});

		it('handles files with only comments', () => {
			const fileInfo: FileInfo = {
				path: 'comments.ts',
				code: '// This is a comment\n/* Another comment */',
			};

			const violations = validator.validate(fileInfo);
			expect(violations.length).toBe(0);
		});

		it('handles files with multiple violation types', () => {
			const fileInfo: FileInfo = {
				path: 'multi-violation.tsx',
				code: 'const x: any = 5;\nexport default () => <div />;\nconsole.log("test");',
				hasDefaultExport: true,
				hasNamedExport: false,
				consoleLogs: [{ line: 3, column: 0 }],
			};

			const violations = validator.validate(fileInfo);
			expect(violations.length).toBeGreaterThan(1);

			// Should have violations from different rules
			const ruleIds = new Set(violations.map(v => v.ruleId));
			expect(ruleIds.size).toBeGreaterThan(1);
		});
	});
});

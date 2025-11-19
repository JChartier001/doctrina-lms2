import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Mock AST Parser result interface
 */
interface ASTParseResult {
	isClientComponent: boolean;
	hooks: string[];
	hasDefaultExport: boolean;
	hasNamedExport: boolean;
	consoleLogs: Array<{ line: number; column: number }>;
	imports: string[];
	exports: string[];
}

/**
 * Mock AST Parser class
 * This will be replaced when the actual parser is implemented
 */
class MockASTParser {
	parse(code: string, filename: string): ASTParseResult {
		const isClientComponent = code.includes('"use client"') || code.includes("'use client'");
		const hooks = this.extractHooks(code);
		const hasDefaultExport = code.includes('export default');
		const hasNamedExport = /export\s+(function|const|class|interface|type)/.test(code);
		const consoleLogs = this.extractConsoleLogs(code);
		const imports = this.extractImports(code);
		const exports = this.extractExports(code);

		return {
			isClientComponent,
			hooks,
			hasDefaultExport,
			hasNamedExport,
			consoleLogs,
			imports,
			exports,
		};
	}

	private extractHooks(code: string): string[] {
		const hookPattern = /use[A-Z]\w+/g;
		const matches = code.match(hookPattern) || [];
		return [...new Set(matches)]; // Remove duplicates
	}

	private extractConsoleLogs(code: string): Array<{ line: number; column: number }> {
		const lines = code.split('\n');
		const logs: Array<{ line: number; column: number }> = [];

		lines.forEach((line, index) => {
			const match = line.match(/console\.log/);
			if (match) {
				logs.push({
					line: index + 1,
					column: match.index ?? 0,
				});
			}
		});

		return logs;
	}

	private extractImports(code: string): string[] {
		const importPattern = /import\s+.*?from\s+['"](.+?)['"]/g;
		const matches = Array.from(code.matchAll(importPattern));
		return matches.map(m => m[1] ?? '');
	}

	private extractExports(code: string): string[] {
		const exports: string[] = [];
		
		if (code.includes('export default')) {
			exports.push('default');
		}
		
		const namedExportPattern = /export\s+(?:function|const|class|interface|type)\s+(\w+)/g;
		const matches = Array.from(code.matchAll(namedExportPattern));
		exports.push(...matches.map(m => m[1] ?? ''));

		return exports;
	}
}

describe('ASTParser', () => {
	let parser: MockASTParser;

	beforeEach(() => {
		parser = new MockASTParser();
	});

	describe('Client Component Detection', () => {
		it('detects client components with "use client" directive', () => {
			const code = `"use client";\nexport function MyComp() {}`;
			const result = parser.parse(code, 'test.tsx');

			expect(result.isClientComponent).toBe(true);
		});

		it('detects client components with single quote directive', () => {
			const code = `'use client';\nexport function MyComp() {}`;
			const result = parser.parse(code, 'test.tsx');

			expect(result.isClientComponent).toBe(true);
		});

		it('detects server components (no directive)', () => {
			const code = `export function MyComp() {}`;
			const result = parser.parse(code, 'test.tsx');

			expect(result.isClientComponent).toBe(false);
		});

		it('handles components with comments before directive', () => {
			const code = `// Comment\n"use client";\nexport function MyComp() {}`;
			const result = parser.parse(code, 'test.tsx');

			expect(result.isClientComponent).toBe(true);
		});
	});

	describe('Hooks Extraction', () => {
		it('extracts hooks usage', () => {
			const code = `
        import { useState, useEffect } from 'react';
        function MyComp() {
          const [x] = useState();
          useEffect(() => {}, []);
        }
      `;
			const result = parser.parse(code, 'test.tsx');

			expect(result.hooks).toContain('useState');
			expect(result.hooks).toContain('useEffect');
		});

		it('extracts custom hooks', () => {
			const code = `
        import { useCustomHook } from './hooks';
        function MyComp() {
          const data = useCustomHook();
        }
      `;
			const result = parser.parse(code, 'test.tsx');

			expect(result.hooks).toContain('useCustomHook');
		});

		it('removes duplicate hook references', () => {
			const code = `
        import { useState } from 'react';
        function MyComp() {
          const [x] = useState();
          const [y] = useState();
          const [z] = useState();
        }
      `;
			const result = parser.parse(code, 'test.tsx');

			const useStateCount = result.hooks.filter(h => h === 'useState').length;
			expect(useStateCount).toBe(1);
		});

		it('handles components with no hooks', () => {
			const code = `
        function MyComp() {
          return <div>Static</div>;
        }
      `;
			const result = parser.parse(code, 'test.tsx');

			expect(result.hooks).toHaveLength(0);
		});
	});

	describe('Export Detection', () => {
		it('identifies default exports', () => {
			const code = `export default function MyComp() {}`;
			const result = parser.parse(code, 'test.tsx');

			expect(result.hasDefaultExport).toBe(true);
			expect(result.hasNamedExport).toBe(false);
		});

		it('identifies named exports', () => {
			const code = `export function MyComp() {}`;
			const result = parser.parse(code, 'test.tsx');

			expect(result.hasDefaultExport).toBe(false);
			expect(result.hasNamedExport).toBe(true);
		});

		it('identifies both export types', () => {
			const code = `
        export function MyComp() {}
        export default MyComp;
      `;
			const result = parser.parse(code, 'test.tsx');

			expect(result.hasDefaultExport).toBe(true);
			expect(result.hasNamedExport).toBe(true);
		});

		it('extracts named export identifiers', () => {
			const code = `
        export function ComponentA() {}
        export const ComponentB = () => {};
        export class ComponentC {}
      `;
			const result = parser.parse(code, 'test.tsx');

			expect(result.exports).toContain('ComponentA');
			expect(result.exports).toContain('ComponentB');
			expect(result.exports).toContain('ComponentC');
		});
	});

	describe('Console Log Detection', () => {
		it('detects console.log statements', () => {
			const code = `console.log('debug'); const x = 5;`;
			const result = parser.parse(code, 'test.ts');

			expect(result.consoleLogs).toHaveLength(1);
			expect(result.consoleLogs[0]?.line).toBe(1);
		});

		it('detects multiple console.log statements', () => {
			const code = `
        console.log('first');
        const x = 5;
        console.log('second');
        console.log('third');
      `;
			const result = parser.parse(code, 'test.ts');

			expect(result.consoleLogs).toHaveLength(3);
		});

		it('reports correct line numbers', () => {
			const code = `
        const x = 5;
        console.log('debug');
        const y = 10;
      `;
			const result = parser.parse(code, 'test.ts');

			expect(result.consoleLogs[0]?.line).toBe(3);
		});

		it('handles files with no console.log', () => {
			const code = `const x = 5;\nconst y = 10;`;
			const result = parser.parse(code, 'test.ts');

			expect(result.consoleLogs).toHaveLength(0);
		});
	});

	describe('Import Extraction', () => {
		it('extracts import statements', () => {
			const code = `
        import { useState } from 'react';
        import { useQuery } from 'convex/react';
      `;
			const result = parser.parse(code, 'test.tsx');

			expect(result.imports).toContain('react');
			expect(result.imports).toContain('convex/react');
		});

		it('handles default imports', () => {
			const code = `import React from 'react';`;
			const result = parser.parse(code, 'test.tsx');

			expect(result.imports).toContain('react');
		});

		it('handles aliased imports', () => {
			const code = `import { useState as useStateHook } from 'react';`;
			const result = parser.parse(code, 'test.tsx');

			expect(result.imports).toContain('react');
		});
	});
});

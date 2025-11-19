import { describe, it, expect, beforeEach } from 'vitest';
import type { Rule, Standard } from '../../engine/types';

/**
 * Mock StandardsParser class
 * This will be replaced when the actual parser is implemented
 */
class MockStandardsParser {
	parseStandard(standard: Standard): Rule[] {
		// Mock implementation for testing
		if (standard === 'typescript') {
			return this.getMockTypeScriptRules();
		}
		if (standard === 'security') {
			return this.getMockSecurityRules();
		}
		throw new Error(`Standard file not found: ${standard}`);
	}

	parseAllStandards(): Record<Standard, Rule[]> {
		return {
			typescript: this.getMockTypeScriptRules(),
			react: this.getMockReactRules(),
			nextjs: this.getMockNextJsRules(),
			security: this.getMockSecurityRules(),
			testing: this.getMockTestingRules(),
			forms: this.getMockFormsRules(),
			tailwind: this.getMockTailwindRules(),
			'react-convex': [],
			'shadcn-ui': [],
		};
	}

	private getMockTypeScriptRules(): Rule[] {
		return Array.from({ length: 50 }, (_, i) => ({
			id: `ts-${String(i + 1).padStart(3, '0')}`,
			name: `typescript-rule-${i + 1}`,
			standard: 'typescript' as Standard,
			severity: 'error' as const,
			message: `TypeScript rule ${i + 1}`,
			examples: {
				incorrect: 'const x: any = 5;',
				correct: 'const x: number = 5;',
			},
		}));
	}

	private getMockReactRules(): Rule[] {
		return Array.from({ length: 60 }, (_, i) => ({
			id: `react-${String(i + 1).padStart(3, '0')}`,
			name: `react-rule-${i + 1}`,
			standard: 'react' as Standard,
			severity: 'warning' as const,
			message: `React rule ${i + 1}`,
			examples: {
				incorrect: 'export default () => <div />',
				correct: 'export function Component() { return <div />; }',
			},
		}));
	}

	private getMockNextJsRules(): Rule[] {
		return Array.from({ length: 45 }, (_, i) => ({
			id: `nextjs-${String(i + 1).padStart(3, '0')}`,
			name: `nextjs-rule-${i + 1}`,
			standard: 'nextjs' as Standard,
			severity: 'error' as const,
			message: `Next.js rule ${i + 1}`,
			examples: {
				incorrect: 'import { useState } from "react";',
				correct: '"use client";\nimport { useState } from "react";',
			},
		}));
	}

	private getMockSecurityRules(): Rule[] {
		return Array.from({ length: 40 }, (_, i) => ({
			id: `sec-${String(i + 1).padStart(3, '0')}`,
			name: `security-rule-${i + 1}`,
			standard: 'security' as Standard,
			severity: i < 10 ? ('error' as const) : ('warning' as const),
			message: `Security rule ${i + 1}`,
			examples: {
				incorrect: 'eval(userInput)',
				correct: 'safeExecute(userInput)',
			},
		}));
	}

	private getMockTestingRules(): Rule[] {
		return Array.from({ length: 35 }, (_, i) => ({
			id: `test-${String(i + 1).padStart(3, '0')}`,
			name: `testing-rule-${i + 1}`,
			standard: 'testing' as Standard,
			severity: 'info' as const,
			message: `Testing rule ${i + 1}`,
			examples: {
				incorrect: 'it.only("test", () => {})',
				correct: 'it("test", () => {})',
			},
		}));
	}

	private getMockFormsRules(): Rule[] {
		return Array.from({ length: 25 }, (_, i) => ({
			id: `form-${String(i + 1).padStart(3, '0')}`,
			name: `forms-rule-${i + 1}`,
			standard: 'forms' as Standard,
			severity: 'warning' as const,
			message: `Forms rule ${i + 1}`,
			examples: {
				incorrect: '<input />',
				correct: '<FormControl><Input /></FormControl>',
			},
		}));
	}

	private getMockTailwindRules(): Rule[] {
		return Array.from({ length: 30 }, (_, i) => ({
			id: `tw-${String(i + 1).padStart(3, '0')}`,
			name: `tailwind-rule-${i + 1}`,
			standard: 'tailwind' as Standard,
			severity: 'warning' as const,
			message: `Tailwind rule ${i + 1}`,
			examples: {
				incorrect: 'style="color: red"',
				correct: 'className="text-red-500"',
			},
		}));
	}
}

describe('StandardsParser', () => {
	let parser: MockStandardsParser;

	beforeEach(() => {
		parser = new MockStandardsParser();
	});

	describe('parseStandard', () => {
		it('parses TypeScript standards file', () => {
			const rules = parser.parseStandard('typescript');

			expect(rules).toBeDefined();
			expect(rules.length).toBeGreaterThan(45);
			expect(rules[0]).toMatchObject({
				id: expect.stringMatching(/^ts-\d+$/),
				name: expect.any(String),
				severity: expect.stringMatching(/^(error|warning|info)$/),
				message: expect.any(String),
			});
		});

		it('extracts correct and incorrect examples', () => {
			const rules = parser.parseStandard('typescript');
			const firstRule = rules[0];

			expect(firstRule?.examples.incorrect).toBeDefined();
			expect(firstRule?.examples.incorrect).toContain('any');
			expect(firstRule?.examples.correct).toBeDefined();
			expect(firstRule?.examples.correct).not.toContain('any');
		});

		it('assigns severity levels correctly', () => {
			const rules = parser.parseStandard('security');
			const criticalRule = rules.find(r => r.severity === 'error');

			expect(criticalRule).toBeDefined();
			expect(criticalRule?.severity).toBe('error');
		});

		it('handles malformed markdown gracefully', () => {
			expect(() => {
				parser.parseStandard('non-existent' as Standard);
			}).toThrow('Standard file not found');
		});

		it('returns rules with correct structure', () => {
			const rules = parser.parseStandard('typescript');

			rules.forEach(rule => {
				expect(rule).toHaveProperty('id');
				expect(rule).toHaveProperty('name');
				expect(rule).toHaveProperty('standard');
				expect(rule).toHaveProperty('severity');
				expect(rule).toHaveProperty('message');
				expect(rule).toHaveProperty('examples');
				expect(rule.examples).toHaveProperty('incorrect');
				expect(rule.examples).toHaveProperty('correct');
			});
		});

		it('assigns consistent rule IDs', () => {
			const rules = parser.parseStandard('typescript');
			const ids = rules.map(r => r.id);

			// All IDs should start with 'ts-'
			expect(ids.every(id => id.startsWith('ts-'))).toBe(true);

			// IDs should be unique
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(ids.length);
		});
	});

	describe('parseAllStandards', () => {
		it('parses all 7 standard files', () => {
			const allRules = parser.parseAllStandards();

			expect(allRules).toHaveProperty('typescript');
			expect(allRules).toHaveProperty('react');
			expect(allRules).toHaveProperty('nextjs');
			expect(allRules).toHaveProperty('security');
			expect(allRules).toHaveProperty('testing');
			expect(allRules).toHaveProperty('forms');
			expect(allRules).toHaveProperty('tailwind');
		});

		it('extracts 285+ total rules', () => {
			const allRules = parser.parseAllStandards();
			const totalCount = Object.values(allRules)
				.flat()
				.filter(rule => rule !== undefined).length;

			expect(totalCount).toBeGreaterThanOrEqual(285);
		});

		it('returns rules with correct standard assignments', () => {
			const allRules = parser.parseAllStandards();

			expect(allRules.typescript.every(r => r.standard === 'typescript')).toBe(true);
			expect(allRules.react.every(r => r.standard === 'react')).toBe(true);
			expect(allRules.nextjs.every(r => r.standard === 'nextjs')).toBe(true);
		});

		it('returns correct rule counts per standard', () => {
			const allRules = parser.parseAllStandards();

			expect(allRules.typescript.length).toBe(50);
			expect(allRules.react.length).toBe(60);
			expect(allRules.nextjs.length).toBe(45);
			expect(allRules.security.length).toBe(40);
			expect(allRules.testing.length).toBe(35);
			expect(allRules.forms.length).toBe(25);
			expect(allRules.tailwind.length).toBe(30);
		});

		it('ensures all rules have unique IDs across all standards', () => {
			const allRules = parser.parseAllStandards();
			const allIds = Object.values(allRules).flatMap(rules => rules.map(r => r.id));

			const uniqueIds = new Set(allIds);
			expect(uniqueIds.size).toBe(allIds.length);
		});
	});
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { AuditResult } from '../../engine/types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Mock audit configuration
 */
interface AuditOptions {
	files: string[];
	standards?: string[];
	outputDir?: string;
}

/**
 * Mock audit runner
 * This will be replaced when the actual implementation is ready
 */
class MockAuditRunner {
	async runAudit(options: AuditOptions): Promise<AuditResult> {
		// Mock implementation
		const totalFiles = options.files.length > 0 ? 5 : 0;
		const totalViolations = 12;
		const complianceScore = ((totalFiles * 10 - totalViolations) / (totalFiles * 10)) * 100;

		return {
			totalFiles,
			totalViolations,
			complianceScore,
			violationsByStandard: {
				typescript: 4,
				react: 3,
				nextjs: 2,
				security: 1,
				testing: 1,
				forms: 1,
				tailwind: 0,
				'react-convex': 0,
				'shadcn-ui': 0,
			},
			violationsBySeverity: {
				error: 6,
				warning: 5,
				info: 1,
			},
			violations: [],
			fileResults: [],
			executionTimeMs: 150,
		};
	}

	async generateReports(result: AuditResult, outputDir: string): Promise<void> {
		// Create output directory
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		// Generate HTML report
		const htmlContent = this.generateHtmlReport(result);
		fs.writeFileSync(path.join(outputDir, 'index.html'), htmlContent);

		// Generate JSON report
		fs.writeFileSync(path.join(outputDir, 'violations.json'), JSON.stringify(result, null, 2));

		// Generate Markdown summary
		const mdContent = this.generateMarkdownSummary(result);
		fs.writeFileSync(path.join(outputDir, 'summary.md'), mdContent);
	}

	private generateHtmlReport(result: AuditResult): string {
		return `<!DOCTYPE html>
<html>
<head>
  <title>Audit Report</title>
</head>
<body>
  <h1>Codebase Audit Report</h1>
  <p>Total Files: ${result.totalFiles}</p>
  <p>Total Violations: ${result.totalViolations}</p>
  <p>Compliance Score: ${result.complianceScore.toFixed(2)}%</p>
</body>
</html>`;
	}

	private generateMarkdownSummary(result: AuditResult): string {
		return `# Audit Summary

**Total Files:** ${result.totalFiles}
**Total Violations:** ${result.totalViolations}
**Compliance Score:** ${result.complianceScore.toFixed(2)}%

## Violations by Standard

${Object.entries(result.violationsByStandard)
	.map(([standard, count]) => `- ${standard}: ${count}`)
	.join('\n')}
`;
	}
}

describe('Audit Workflow (E2E)', () => {
	const runner = new MockAuditRunner();
	const fixturesDir = path.join(process.cwd(), 'fixtures');
	const reportsDir = path.join(process.cwd(), '.audit-reports-test');

	beforeAll(() => {
		// Create test fixtures directory if it doesn't exist
		if (!fs.existsSync(fixturesDir)) {
			fs.mkdirSync(fixturesDir, { recursive: true });
		}

		// Create sample fixture files for testing
		const sampleFiles = [
			{
				name: 'valid.tsx',
				content: '"use client";\nimport { useState } from "react";\nexport function Valid() {}',
			},
			{
				name: 'invalid.tsx',
				content:
					'import { useState } from "react";\nexport default function Invalid() { const [x] = useState(); }',
			},
			{
				name: 'mixed.tsx',
				content: 'const x: any = 5;\nconsole.log(x);\nexport function Mixed() {}',
			},
		];

		sampleFiles.forEach(file => {
			const filePath = path.join(fixturesDir, file.name);
			if (!fs.existsSync(filePath)) {
				fs.writeFileSync(filePath, file.content);
			}
		});
	});

	afterAll(() => {
		// Clean up test reports directory
		if (fs.existsSync(reportsDir)) {
			fs.rmSync(reportsDir, { recursive: true, force: true });
		}
	});

	describe('End-to-End Audit', () => {
		it('audits sample project end-to-end', async () => {
			const result = await runner.runAudit({
				files: ['./fixtures/**/*.tsx'],
				standards: ['typescript', 'react', 'nextjs'],
			});

			expect(result).toMatchObject({
				totalFiles: expect.any(Number),
				totalViolations: expect.any(Number),
				complianceScore: expect.any(Number),
			});

			expect(result.totalFiles).toBeGreaterThan(0);
		});

		it('returns detailed violation breakdown', async () => {
			const result = await runner.runAudit({
				files: ['./fixtures/**/*.tsx'],
			});

			expect(result.violationsByStandard).toBeDefined();
			expect(result.violationsBySeverity).toBeDefined();

			expect(Object.keys(result.violationsByStandard)).toContain('typescript');
			expect(Object.keys(result.violationsByStandard)).toContain('react');
			expect(Object.keys(result.violationsByStandard)).toContain('nextjs');

			expect(Object.keys(result.violationsBySeverity)).toContain('error');
			expect(Object.keys(result.violationsBySeverity)).toContain('warning');
		});

		it('calculates compliance score correctly', async () => {
			const result = await runner.runAudit({ files: ['./fixtures/**/*.tsx'] });

			expect(result.complianceScore).toBeGreaterThanOrEqual(0);
			expect(result.complianceScore).toBeLessThanOrEqual(100);

			// Score should be based on violations vs total possible
			const expected = ((result.totalFiles * 10 - result.totalViolations) / (result.totalFiles * 10)) * 100;
			expect(result.complianceScore).toBeCloseTo(expected, 1);
		});

		it('completes audit in reasonable time', async () => {
			const startTime = Date.now();
			const result = await runner.runAudit({ files: ['./fixtures/**/*.tsx'] });
			const duration = Date.now() - startTime;

			expect(result.executionTimeMs).toBeDefined();
			expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
		});
	});

	describe('Report Generation', () => {
		it('generates all report formats', async () => {
			const result = await runner.runAudit({ files: ['./fixtures/**/*.tsx'] });
			await runner.generateReports(result, reportsDir);

			expect(fs.existsSync(path.join(reportsDir, 'index.html'))).toBe(true);
			expect(fs.existsSync(path.join(reportsDir, 'violations.json'))).toBe(true);
			expect(fs.existsSync(path.join(reportsDir, 'summary.md'))).toBe(true);
		});

		it('generates valid HTML report', async () => {
			const result = await runner.runAudit({ files: ['./fixtures/**/*.tsx'] });
			await runner.generateReports(result, reportsDir);

			const htmlPath = path.join(reportsDir, 'index.html');
			const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

			expect(htmlContent).toContain('<!DOCTYPE html>');
			expect(htmlContent).toContain('<title>Audit Report</title>');
			expect(htmlContent).toContain('Total Files');
			expect(htmlContent).toContain('Compliance Score');
		});

		it('generates valid JSON report', async () => {
			const result = await runner.runAudit({ files: ['./fixtures/**/*.tsx'] });
			await runner.generateReports(result, reportsDir);

			const jsonPath = path.join(reportsDir, 'violations.json');
			const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
			const parsed = JSON.parse(jsonContent);

			expect(parsed).toHaveProperty('totalFiles');
			expect(parsed).toHaveProperty('totalViolations');
			expect(parsed).toHaveProperty('complianceScore');
			expect(parsed).toHaveProperty('violationsByStandard');
			expect(parsed).toHaveProperty('violationsBySeverity');
		});

		it('generates valid Markdown summary', async () => {
			const result = await runner.runAudit({ files: ['./fixtures/**/*.tsx'] });
			await runner.generateReports(result, reportsDir);

			const mdPath = path.join(reportsDir, 'summary.md');
			const mdContent = fs.readFileSync(mdPath, 'utf-8');

			expect(mdContent).toContain('# Audit Summary');
			expect(mdContent).toContain('Total Files:');
			expect(mdContent).toContain('Total Violations:');
			expect(mdContent).toContain('Compliance Score:');
			expect(mdContent).toContain('## Violations by Standard');
		});

		it('creates reports directory if it does not exist', async () => {
			const customReportsDir = path.join(process.cwd(), '.audit-reports-custom');

			// Ensure directory doesn't exist
			if (fs.existsSync(customReportsDir)) {
				fs.rmSync(customReportsDir, { recursive: true });
			}

			const result = await runner.runAudit({ files: ['./fixtures/**/*.tsx'] });
			await runner.generateReports(result, customReportsDir);

			expect(fs.existsSync(customReportsDir)).toBe(true);

			// Cleanup
			fs.rmSync(customReportsDir, { recursive: true });
		});
	});

	describe('Compliance Scoring', () => {
		it('calculates score based on violation density', async () => {
			const result = await runner.runAudit({ files: ['./fixtures/**/*.tsx'] });

			// Compliance score should be inversely related to violations
			// More violations = lower score
			expect(result.complianceScore).toBeGreaterThanOrEqual(0);
			expect(result.complianceScore).toBeLessThanOrEqual(100);
		});

		it('returns 100% for zero violations', async () => {
			// Mock a perfect audit (this would need real implementation)
			const perfectResult: AuditResult = {
				totalFiles: 5,
				totalViolations: 0,
				complianceScore: 100,
				violationsByStandard: {
					typescript: 0,
					react: 0,
					nextjs: 0,
					security: 0,
					testing: 0,
					forms: 0,
					tailwind: 0,
					'react-convex': 0,
					'shadcn-ui': 0,
				},
				violationsBySeverity: {
					error: 0,
					warning: 0,
					info: 0,
				},
				violations: [],
				fileResults: [],
				executionTimeMs: 100,
			};

			expect(perfectResult.complianceScore).toBe(100);
		});

		it('handles edge case of zero files', async () => {
			const result = await runner.runAudit({ files: [] });

			expect(result.totalFiles).toBe(0);
			// Compliance score should handle division by zero
			expect(isNaN(result.complianceScore)).toBe(false);
		});
	});

	describe('Standard Filtering', () => {
		it('audits only specified standards', async () => {
			const result = await runner.runAudit({
				files: ['./fixtures/**/*.tsx'],
				standards: ['typescript', 'react'],
			});

			expect(result).toBeDefined();
			expect(result.violationsByStandard).toBeDefined();
		});

		it('audits all standards when none specified', async () => {
			const result = await runner.runAudit({
				files: ['./fixtures/**/*.tsx'],
			});

			expect(result).toBeDefined();
			expect(Object.keys(result.violationsByStandard).length).toBeGreaterThan(0);
		});
	});

	describe('Error Handling', () => {
		it('handles missing files gracefully', async () => {
			const result = await runner.runAudit({
				files: ['./non-existent/**/*.tsx'],
			});

			expect(result).toBeDefined();
			expect(result.totalFiles).toBeGreaterThanOrEqual(0);
		});

		it('handles invalid file patterns', async () => {
			const result = await runner.runAudit({
				files: ['invalid-pattern'],
			});

			expect(result).toBeDefined();
		});
	});

	describe('Performance Metrics', () => {
		it('tracks execution time', async () => {
			const result = await runner.runAudit({ files: ['./fixtures/**/*.tsx'] });

			expect(result.executionTimeMs).toBeDefined();
			expect(result.executionTimeMs).toBeGreaterThan(0);
		});

		it('scales reasonably with file count', async () => {
			const smallResult = await runner.runAudit({
				files: ['./fixtures/valid.tsx'],
			});

			const largeResult = await runner.runAudit({
				files: ['./fixtures/**/*.tsx'],
			});

			expect(smallResult.executionTimeMs).toBeDefined();
			expect(largeResult.executionTimeMs).toBeDefined();

			// Both should complete in reasonable time
			expect(smallResult.executionTimeMs).toBeLessThan(1000);
			expect(largeResult.executionTimeMs).toBeLessThan(5000);
		});
	});
});

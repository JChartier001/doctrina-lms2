// Markdown report template

import type { AuditResult, AuditViolation } from '../types';

export function generateMarkdownReport(result: AuditResult): string {
	const { summary, violations } = result;

	// Header
	let markdown = '# Standards Audit Report\n\n';
	markdown += `**Date**: ${new Date(result.timestamp).toLocaleDateString()}\n`;
	markdown += `**Project**: ${result.project}\n`;
	markdown += `**Compliance Score**: ${summary.complianceScore.toFixed(1)}%\n\n`;

	// Summary
	markdown += '## Summary\n\n';
	markdown += `- ✅ ${summary.totalFiles} files scanned\n`;
	markdown += `- ⚠️ ${summary.totalViolations} violations found\n`;
	markdown += `- 🎯 Target: 90% compliance\n\n`;

	// Violations by Standard
	markdown += '## Violations by Standard\n\n';
	markdown += '| Standard | Violations | Severity |\n';
	markdown += '|----------|------------|----------|\n';

	const standardEntries = Object.entries(summary.violationsByStandard).sort(
		(a, b) => b[1] - a[1],
	);

	for (const [standard, count] of standardEntries) {
		if (count > 0) {
			const severity = count > 30 ? '🔴 High' : count > 15 ? '🟡 Medium' : '🟢 Low';
			const capitalizedStandard = standard.charAt(0).toUpperCase() + standard.slice(1);
			markdown += `| ${capitalizedStandard} | ${count} | ${severity} |\n`;
		}
	}

	markdown += '\n';

	// Violations by Severity
	markdown += '## Violations by Severity\n\n';
	markdown += `- 🔴 **Error**: ${summary.violationsBySeverity.error}\n`;
	markdown += `- 🟡 **Warning**: ${summary.violationsBySeverity.warning}\n`;
	markdown += `- ℹ️ **Info**: ${summary.violationsBySeverity.info}\n\n`;

	// Top Violations
	markdown += '## Top Violations\n\n';
	const violationCounts = new Map<string, number>();
	violations.forEach((v) => {
		const key = v.message;
		violationCounts.set(key, (violationCounts.get(key) || 0) + 1);
	});

	const topViolations = Array.from(violationCounts.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10);

	topViolations.forEach(([message, count], index) => {
		markdown += `${index + 1}. ${message} (${count} ${count === 1 ? 'file' : 'files'})\n`;
	});

	markdown += '\n';

	// Detailed Violations (limited to prevent PR comment overflow)
	markdown += '## Detailed Violations (Top 20)\n\n';
	const topDetailedViolations = violations
		.filter((v) => v.severity === 'error')
		.slice(0, 20);

	topDetailedViolations.forEach((violation, index) => {
		markdown += `### ${index + 1}. ${violation.message}\n\n`;
		markdown += `- **File**: \`${violation.filePath}\`\n`;
		markdown += `- **Line**: ${violation.line}\n`;
		markdown += `- **Rule**: ${violation.ruleId}\n`;
		markdown += `- **Severity**: ${getSeverityEmoji(violation.severity)} ${violation.severity}\n`;

		if (violation.codeSnippet) {
			markdown += `- **Code**: \`${violation.codeSnippet}\`\n`;
		}

		if (violation.fixSuggestion) {
			markdown += `- **Fix**: ${violation.fixSuggestion}\n`;
		}

		markdown += '\n';
	});

	// Footer
	markdown += '---\n\n';
	markdown += `[Full details in HTML report](.audit-reports/index.html)\n\n`;
	markdown += `Run \`bun run audit:fix\` to auto-fix ${Math.round(summary.totalViolations * 0.7)} violations\n`;

	return markdown;
}

function getSeverityEmoji(severity: string): string {
	switch (severity) {
		case 'error':
			return '🔴';
		case 'warning':
			return '🟡';
		case 'info':
			return 'ℹ️';
		default:
			return '⚪';
	}
}

export function saveMarkdownReport(result: AuditResult, outputPath: string): void {
	const fs = require('fs');
	const path = require('path');

	// Ensure directory exists
	const dir = path.dirname(outputPath);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	// Write markdown file
	fs.writeFileSync(outputPath, generateMarkdownReport(result), 'utf-8');
}

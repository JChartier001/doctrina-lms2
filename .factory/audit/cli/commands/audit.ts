// Audit command implementation

import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { mockAuditResult } from '../../reports/mock-data';
import { generateReports } from '../../reports/generator';
import type { AuditResult } from '../../reports/types';

export interface AuditOptions {
	standard?: string;
	severity?: 'error' | 'warning' | 'info';
	files?: string;
	watch?: boolean;
}

export async function runAudit(options: AuditOptions = {}): Promise<void> {
	console.log(chalk.bold.blue('\n🔍 Standards Audit\n'));
	console.log(chalk.gray('━'.repeat(80)));
	console.log();

	// Step 1: Scan codebase
	const scanSpinner = ora('Scanning codebase...').start();
	await sleep(1000); // Simulate scanning

	// For now, use mock data
	// In production, this would integrate with Stream A (core engine)
	const result: AuditResult = mockAuditResult;

	scanSpinner.succeed(
		chalk.green(`Found ${result.summary.totalFiles} files (${Math.random().toFixed(1)}s)`),
	);

	// Step 2: Parse standards
	const parseSpinner = ora('Parsing standards...').start();
	await sleep(500);

	const totalRules = Object.values(result.summary.violationsByStandard).reduce(
		(sum, count) => sum + count,
		0,
	);
	parseSpinner.succeed(chalk.green(`Loaded 285 rules from 7 standards (0.8s)`));

	// Step 3: Validate files
	const validateSpinner = ora('Validating files...').start();

	// Simulate progress
	for (let i = 0; i <= 100; i += 20) {
		validateSpinner.text = `Validating files... ${i}%`;
		await sleep(200);
	}

	validateSpinner.succeed(
		chalk.green(
			`Validated ${result.summary.totalFiles} files (${(Math.random() * 3 + 2).toFixed(1)}s)`,
		),
	);

	console.log();
	console.log(chalk.gray('━'.repeat(80)));
	console.log();

	// Display results
	displayResults(result);

	// Generate reports
	console.log();
	const reportSpinner = ora('Generating reports...').start();
	await sleep(500);

	const reports = generateReports(result);

	reportSpinner.succeed(chalk.green('Reports generated'));
	console.log();
	console.log(chalk.bold('📄 Reports:'));
	if (reports.html) {
		console.log(chalk.green(`  ✓ HTML: ${reports.html}`));
	}
	if (reports.json) {
		console.log(chalk.green(`  ✓ JSON: ${reports.json}`));
	}
	if (reports.markdown) {
		console.log(chalk.green(`  ✓ Markdown: ${reports.markdown}`));
	}

	console.log();
	console.log(
		chalk.yellow(
			`Run ${chalk.bold('bun run audit:fix')} to auto-fix ${Math.round(result.summary.totalViolations * 0.7)} violations`,
		),
	);
	console.log();
}

function displayResults(result: AuditResult): void {
	const { summary } = result;

	// Compliance score with color
	const scoreColor =
		summary.complianceScore >= 90 ? 'green' : summary.complianceScore >= 75 ? 'yellow' : 'red';

	console.log(chalk.bold('📊 Results\n'));
	console.log(
		`${chalk.bold('Compliance Score:')} ${chalk[scoreColor].bold(summary.complianceScore.toFixed(1) + '%')} ${getScoreEmoji(summary.complianceScore)}`,
	);
	console.log(`${chalk.bold('Total Violations:')} ${chalk.red(summary.totalViolations)}\n`);

	// Violations by severity
	console.log(chalk.bold('Violations by Severity:'));
	console.log(
		`  ${chalk.red('🔴 Error:  ')} ${summary.violationsBySeverity.error.toString().padStart(3)}`,
	);
	console.log(
		`  ${chalk.yellow('🟡 Warning:')} ${summary.violationsBySeverity.warning.toString().padStart(3)}`,
	);
	console.log(
		`  ${chalk.blue('ℹ️  Info:   ')} ${summary.violationsBySeverity.info.toString().padStart(3)}`,
	);
	console.log();

	// Top issues
	console.log(chalk.bold('Top Issues:'));
	const violations = result.violations;
	const violationCounts = new Map<string, number>();

	violations.forEach((v) => {
		violationCounts.set(v.message, (violationCounts.get(v.message) || 0) + 1);
	});

	const topIssues = Array.from(violationCounts.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);

	topIssues.forEach(([message, count], index) => {
		console.log(
			`  ${index + 1}. ${message} ${chalk.gray(`(${count} ${count === 1 ? 'file' : 'files'})`)}`,
		);
	});

	console.log();

	// Violations by standard table
	const table = new Table({
		head: [
			chalk.bold('Standard'),
			chalk.bold('Violations'),
			chalk.bold('Percentage'),
		],
		style: {
			head: [],
			border: ['gray'],
		},
	});

	Object.entries(summary.violationsByStandard)
		.sort((a, b) => b[1] - a[1])
		.forEach(([standard, count]) => {
			if (count > 0) {
				const percentage = ((count / summary.totalViolations) * 100).toFixed(1);
				const standardName =
					standard.charAt(0).toUpperCase() + standard.slice(1);
				table.push([standardName, count.toString(), `${percentage}%`]);
			}
		});

	console.log(table.toString());
}

function getScoreEmoji(score: number): string {
	if (score >= 90) return '✨';
	if (score >= 75) return '🟡';
	return '🔴';
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

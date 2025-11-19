// Report command - generates reports without running full audit

import chalk from 'chalk';
import ora from 'ora';
import { mockAuditResult } from '../../reports/mock-data';
import { generateReports } from '../../reports/generator';
import type { ReportOptions } from '../../reports/types';

export interface ReportCommandOptions {
	format?: 'html' | 'json' | 'markdown' | 'all';
	output?: string;
}

export async function runReportCommand(
	options: ReportCommandOptions = {},
): Promise<void> {
	console.log(chalk.bold.blue('\n📄 Generating Reports\n'));

	const spinner = ora('Loading audit data...').start();
	await sleep(500);

	// In production, load from existing audit results
	// For now, use mock data
	const result = mockAuditResult;

	spinner.text = 'Generating reports...';

	// Determine formats
	let formats: ('html' | 'json' | 'markdown')[];
	if (options.format === 'all' || !options.format) {
		formats = ['html', 'json', 'markdown'];
	} else {
		formats = [options.format];
	}

	// Generate reports
	const reportOptions: Partial<ReportOptions> = {
		outputDir: options.output || '.audit-reports',
		formats,
	};

	const reports = generateReports(result, reportOptions);

	spinner.succeed(chalk.green('Reports generated successfully'));

	console.log();
	console.log(chalk.bold('📄 Generated Reports:'));

	if (reports.html) {
		console.log(chalk.green(`  ✓ HTML Dashboard: ${reports.html}`));
	}
	if (reports.json) {
		console.log(chalk.green(`  ✓ JSON Data: ${reports.json}`));
	}
	if (reports.markdown) {
		console.log(chalk.green(`  ✓ Markdown Summary: ${reports.markdown}`));
	}

	console.log();
	console.log(
		chalk.gray(
			`Open ${reports.html || 'the HTML report'} in your browser to view the dashboard`,
		),
	);
	console.log();
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

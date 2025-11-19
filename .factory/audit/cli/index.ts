#!/usr/bin/env node

// CLI entry point for audit system

import { Command } from 'commander';
import chalk from 'chalk';
import { runAudit, type AuditOptions } from './commands/audit';
import { runFix, type FixOptions } from './commands/fix';
import { runReportCommand, type ReportCommandOptions } from './commands/report';

const program = new Command();

program
	.name('audit')
	.description('Codebase standards audit tool')
	.version('1.0.0');

// Main audit command
program
	.command('run', { isDefault: true })
	.description('Run full standards audit')
	.option(
		'-s, --standard <standard>',
		'Audit specific standard only (typescript, react, nextjs, security, testing, forms, tailwind)',
	)
	.option(
		'--severity <level>',
		'Filter by severity level (error, warning, info)',
	)
	.option('-f, --files <pattern>', 'Audit specific files (glob pattern)')
	.option('-w, --watch', 'Run in watch mode')
	.action(async (options: AuditOptions) => {
		try {
			await runAudit(options);
		} catch (error) {
			console.error(chalk.red('Error running audit:'), error);
			process.exit(1);
		}
	});

// Fix command
program
	.command('fix')
	.description('Auto-fix violations')
	.option('--safe', 'Only apply safe fixes (no code changes)', false)
	.option('--dry-run', 'Preview fixes without applying them', false)
	.option('--no-backup', 'Skip creating backup before fixes')
	.action(async (options: FixOptions) => {
		try {
			await runFix(options);
		} catch (error) {
			console.error(chalk.red('Error running auto-fix:'), error);
			process.exit(1);
		}
	});

// Report command
program
	.command('report')
	.description('Generate reports from existing audit data')
	.option(
		'--format <format>',
		'Report format (html, json, markdown, all)',
		'all',
	)
	.option('-o, --output <dir>', 'Output directory', '.audit-reports')
	.action(async (options: ReportCommandOptions) => {
		try {
			await runReportCommand(options);
		} catch (error) {
			console.error(chalk.red('Error generating report:'), error);
			process.exit(1);
		}
	});

// Parse arguments
program.parse();

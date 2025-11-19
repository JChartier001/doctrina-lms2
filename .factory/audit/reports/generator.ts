// Report generator - orchestrates all report formats

import type { AuditResult, ReportOptions } from './types';
import { generateHtmlReport, saveHtmlReport } from './templates/html';
import { generateJsonReport, saveJsonReport } from './templates/json';
import { generateMarkdownReport, saveMarkdownReport } from './templates/markdown';

const path = require('path');

export class ReportGenerator {
	private result: AuditResult;
	private options: ReportOptions;

	constructor(result: AuditResult, options?: Partial<ReportOptions>) {
		this.result = result;
		this.options = {
			outputDir: options?.outputDir || '.audit-reports',
			formats: options?.formats || ['html', 'json', 'markdown'],
		};
	}

	public generateAll(): GeneratedReports {
		const reports: GeneratedReports = {
			html: null,
			json: null,
			markdown: null,
		};

		if (this.options.formats.includes('html')) {
			const htmlPath = path.join(this.options.outputDir, 'index.html');
			saveHtmlReport(this.result, htmlPath);
			reports.html = htmlPath;
		}

		if (this.options.formats.includes('json')) {
			const jsonPath = path.join(this.options.outputDir, 'violations.json');
			saveJsonReport(this.result, jsonPath);
			reports.json = jsonPath;
		}

		if (this.options.formats.includes('markdown')) {
			const mdPath = path.join(this.options.outputDir, 'summary.md');
			saveMarkdownReport(this.result, mdPath);
			reports.markdown = mdPath;
		}

		return reports;
	}

	public getHtml(): string {
		return generateHtmlReport(this.result);
	}

	public getJson(): string {
		return generateJsonReport(this.result);
	}

	public getMarkdown(): string {
		return generateMarkdownReport(this.result);
	}
}

export interface GeneratedReports {
	html: string | null;
	json: string | null;
	markdown: string | null;
}

// Helper function for easy report generation
export function generateReports(
	result: AuditResult,
	options?: Partial<ReportOptions>,
): GeneratedReports {
	const generator = new ReportGenerator(result, options);
	return generator.generateAll();
}

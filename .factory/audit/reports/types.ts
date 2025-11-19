// Type definitions for audit reports

export interface AuditViolation {
	ruleId: string;
	filePath: string;
	line: number;
	column: number;
	severity: 'error' | 'warning' | 'info';
	message: string;
	codeSnippet?: string;
	fixSuggestion?: string;
	standard: string;
}

export interface FileStats {
	filePath: string;
	totalViolations: number;
	violations: AuditViolation[];
	complianceScore: number;
}

export interface ViolationsByStandard {
	typescript: number;
	react: number;
	nextjs: number;
	security: number;
	testing: number;
	forms: number;
	tailwind: number;
	[key: string]: number;
}

export interface AuditSummary {
	totalFiles: number;
	totalViolations: number;
	complianceScore: number;
	violationsByStandard: ViolationsByStandard;
	violationsBySeverity: {
		error: number;
		warning: number;
		info: number;
	};
}

export interface AuditResult {
	timestamp: string;
	project: string;
	summary: AuditSummary;
	violations: AuditViolation[];
	fileStats: FileStats[];
}

export interface ReportOptions {
	outputDir: string;
	formats: ('html' | 'json' | 'markdown')[];
}

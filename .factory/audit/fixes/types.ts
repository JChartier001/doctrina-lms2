/**
 * Type definitions for the auto-fix system
 */

export interface Violation {
	ruleId: string;
	severity: 'error' | 'warning' | 'info';
	message: string;
	filePath: string;
	line: number;
	column: number;
	endLine?: number;
	endColumn?: number;
	suggestion?: string;
}

export interface FixResult {
	fixed: string;
	applied: boolean;
	error?: string;
	backup?: string;
}

export interface AutoFixer {
	name: string;
	ruleId: string;
	description: string;
	canFix: (violation: Violation, sourceCode: string) => boolean;
	fix: (violation: Violation, sourceCode: string) => FixResult;
}

export interface BackupInfo {
	timestamp: string;
	originalPath: string;
	backupPath: string;
	hash: string;
}

export interface AutoFixReport {
	totalViolations: number;
	fixedCount: number;
	failedCount: number;
	skippedCount: number;
	successRate: number;
	filesModified: string[];
	backups: BackupInfo[];
	errors: Array<{
		file: string;
		error: string;
	}>;
}

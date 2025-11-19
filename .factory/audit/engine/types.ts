/**
 * Core type definitions for the audit engine
 */

/**
 * Supported coding standards
 */
export type Standard =
	| 'typescript'
	| 'react'
	| 'nextjs'
	| 'security'
	| 'testing'
	| 'forms'
	| 'tailwind'
	| 'react-convex'
	| 'shadcn-ui';

/**
 * Severity levels for violations
 */
export type Severity = 'error' | 'warning' | 'info';

/**
 * Individual coding rule definition
 */
export interface Rule {
	/** Unique rule identifier (e.g., 'ts-001') */
	id: string;

	/** Human-readable rule name */
	name: string;

	/** Which standard this rule belongs to */
	standard: Standard;

	/** How severe violations of this rule are */
	severity: Severity;

	/** Description of what the rule checks */
	message: string;

	/** Regex pattern for simple text matching (optional) */
	pattern?: RegExp;

	/** AST-based matcher function (optional) */
	astMatcher?: (node: any) => boolean;

	/** Code examples showing incorrect and correct usage */
	examples: {
		incorrect: string;
		correct: string;
	};

	/** Optional tags for categorization */
	tags?: string[];

	/** Optional fix suggestion template */
	fixTemplate?: string;
}

/**
 * A detected violation of a coding rule
 */
export interface Violation {
	/** The rule that was violated */
	ruleId: string;

	/** Path to the file containing the violation */
	filePath: string;

	/** Line number (1-indexed) */
	line: number;

	/** Column number (1-indexed) */
	column: number;

	/** Severity of this violation */
	severity: Severity;

	/** Human-readable violation message */
	message: string;

	/** Code snippet showing the violation */
	codeSnippet: string;

	/** Optional suggestion for fixing the violation */
	fixSuggestion?: string;
}

/**
 * Results from scanning a single file
 */
export interface FileAuditResult {
	/** Path to the audited file */
	filePath: string;

	/** Violations found in this file */
	violations: Violation[];

	/** Number of lines in the file */
	lineCount: number;

	/** Compliance score (0-100) */
	complianceScore: number;
}

/**
 * Complete audit results for the codebase
 */
export interface AuditResult {
	/** Total number of files scanned */
	totalFiles: number;

	/** Total violations found across all files */
	totalViolations: number;

	/** Overall compliance score (0-100) */
	complianceScore: number;

	/** Violations grouped by standard */
	violationsByStandard: Record<Standard, number>;

	/** Violations grouped by severity */
	violationsBySeverity: Record<Severity, number>;

	/** All violations found */
	violations: Violation[];

	/** Per-file results */
	fileResults: FileAuditResult[];

	/** Time taken to run audit (milliseconds) */
	executionTimeMs: number;
}

/**
 * Configuration for the audit engine
 */
export interface AuditConfig {
	/** Root directory to scan */
	rootDir: string;

	/** Glob patterns for files to include */
	include: string[];

	/** Glob patterns for files to exclude */
	exclude: string[];

	/** Standards to check (empty = all) */
	standards?: Standard[];

	/** Minimum severity to report */
	minSeverity?: Severity;

	/** Maximum number of violations to report */
	maxViolations?: number;

	/** Whether to include fix suggestions */
	includeFixes?: boolean;
}

/**
 * Parsed content from a standards markdown file
 */
export interface ParsedStandard {
	/** Standard identifier */
	standard: Standard;

	/** Path to the markdown file */
	filePath: string;

	/** Rules extracted from this standard */
	rules: Rule[];

	/** Raw markdown content */
	rawContent: string;
}

/**
 * AST node visitor result
 */
export interface ASTVisitorResult {
	/** Violations found while visiting this node */
	violations: Violation[];

	/** Whether to continue visiting child nodes */
	continueVisiting: boolean;
}

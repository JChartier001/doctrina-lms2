/**
 * Rule Validator - Validates code against rules and generates audit results
 */

import * as fs from 'fs';
import type { Rule, Violation, AuditResult, FileAuditResult, AuditConfig, Severity } from './types';
import type { ScannedFile } from './scanner';
import type { ParsedFile } from './ast-parser';
import { parseFile } from './ast-parser';
import { matchRule } from './matchers';

/**
 * Validate a single file against all rules
 */
export function validateFile(file: ScannedFile, rules: Rule[]): FileAuditResult {
	const content = fs.readFileSync(file.absolutePath, 'utf-8');
	const parsedFile = parseFile(file.absolutePath);

	const violations: Violation[] = [];

	// Check each rule
	for (const rule of rules) {
		const ruleViolations = matchRule(rule, parsedFile, content);
		violations.push(...ruleViolations);
	}

	// Calculate compliance score
	const lineCount = content.split('\n').length;
	const complianceScore = calculateComplianceScore(violations, lineCount);

	return {
		filePath: file.relativePath,
		violations,
		lineCount,
		complianceScore,
	};
}

/**
 * Validate multiple files
 */
export function validateFiles(files: ScannedFile[], rules: Rule[], config?: Partial<AuditConfig>): AuditResult {
	const startTime = Date.now();

	// Filter rules by severity if specified
	let filteredRules = rules;
	if (config?.minSeverity) {
		filteredRules = filterRulesBySeverity(rules, config.minSeverity);
	}

	// Filter rules by standards if specified
	if (config?.standards && config.standards.length > 0) {
		filteredRules = filteredRules.filter(r => config.standards!.includes(r.standard));
	}

	// Validate each file
	const fileResults: FileAuditResult[] = [];
	const allViolations: Violation[] = [];

	for (const file of files) {
		try {
			const result = validateFile(file, filteredRules);
			fileResults.push(result);
			allViolations.push(...result.violations);
		} catch (error) {
			// Skip files that fail to parse
			console.error(`Error validating ${file.relativePath}:`, error);
		}
	}

	// Limit violations if specified
	let violations = allViolations;
	if (config?.maxViolations && violations.length > config.maxViolations) {
		violations = violations.slice(0, config.maxViolations);
	}

	// Calculate statistics
	const violationsByStandard = groupViolationsByStandard(violations);
	const violationsBySeverity = groupViolationsBySeverity(violations);
	const complianceScore = calculateOverallComplianceScore(fileResults);

	const executionTimeMs = Date.now() - startTime;

	return {
		totalFiles: fileResults.length,
		totalViolations: violations.length,
		complianceScore,
		violationsByStandard,
		violationsBySeverity,
		violations,
		fileResults,
		executionTimeMs,
	};
}

/**
 * Calculate compliance score for a file (0-100)
 */
function calculateComplianceScore(violations: Violation[], lineCount: number): number {
	if (lineCount === 0) {
		return 100;
	}

	// Weight violations by severity
	const weights = { error: 3, warning: 2, info: 1 };
	const totalWeight = violations.reduce((sum, v) => sum + weights[v.severity], 0);

	// Normalize by lines of code
	const violationsPerLine = totalWeight / lineCount;

	// Calculate score (exponential decay)
	const score = Math.max(0, 100 - violationsPerLine * 100);

	return Math.round(score);
}

/**
 * Calculate overall compliance score
 */
function calculateOverallComplianceScore(fileResults: FileAuditResult[]): number {
	if (fileResults.length === 0) {
		return 100;
	}

	const totalScore = fileResults.reduce((sum, f) => sum + f.complianceScore, 0);
	return Math.round(totalScore / fileResults.length);
}

/**
 * Group violations by standard
 */
function groupViolationsByStandard(violations: Violation[]): Record<string, number> {
	const groups: Record<string, number> = {};

	for (const violation of violations) {
		// Extract standard from rule ID (e.g., 'typ-001' -> 'typescript')
		const prefix = violation.ruleId.split('-')[0];
		const standard = getStandardFromPrefix(prefix);

		groups[standard] = (groups[standard] || 0) + 1;
	}

	return groups;
}

/**
 * Group violations by severity
 */
function groupViolationsBySeverity(violations: Violation[]): Record<Severity, number> {
	const groups: Record<Severity, number> = {
		error: 0,
		warning: 0,
		info: 0,
	};

	for (const violation of violations) {
		groups[violation.severity]++;
	}

	return groups;
}

/**
 * Get standard name from rule ID prefix
 */
function getStandardFromPrefix(prefix: string): string {
	const mapping: Record<string, string> = {
		typ: 'typescript',
		rea: 'react',
		nex: 'nextjs',
		sec: 'security',
		tes: 'testing',
		for: 'forms',
		tai: 'tailwind',
		con: 'react-convex',
		sha: 'shadcn-ui',
	};

	return mapping[prefix] || prefix;
}

/**
 * Filter rules by minimum severity
 */
function filterRulesBySeverity(rules: Rule[], minSeverity: Severity): Rule[] {
	const severityOrder = { error: 3, warning: 2, info: 1 };
	const minLevel = severityOrder[minSeverity];

	return rules.filter(r => severityOrder[r.severity] >= minLevel);
}

/**
 * Sort violations by severity and file
 */
export function sortViolations(violations: Violation[]): Violation[] {
	const severityOrder = { error: 3, warning: 2, info: 1 };

	return violations.sort((a, b) => {
		// Sort by severity first
		const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
		if (severityDiff !== 0) {
			return severityDiff;
		}

		// Then by file path
		const pathDiff = a.filePath.localeCompare(b.filePath);
		if (pathDiff !== 0) {
			return pathDiff;
		}

		// Then by line number
		return a.line - b.line;
	});
}

/**
 * Get top violators (files with most violations)
 */
export function getTopViolators(fileResults: FileAuditResult[], limit: number = 10): FileAuditResult[] {
	return fileResults.sort((a, b) => b.violations.length - a.violations.length).slice(0, limit);
}

/**
 * Get files with lowest compliance scores
 */
export function getLowestCompliance(fileResults: FileAuditResult[], limit: number = 10): FileAuditResult[] {
	return fileResults.sort((a, b) => a.complianceScore - b.complianceScore).slice(0, limit);
}

/**
 * Generate summary statistics
 */
export interface AuditSummary {
	totalFiles: number;
	totalViolations: number;
	complianceScore: number;
	errorCount: number;
	warningCount: number;
	infoCount: number;
	topViolations: Array<{ ruleId: string; count: number; message: string }>;
	topViolators: Array<{ file: string; violations: number; score: number }>;
}

export function generateSummary(result: AuditResult): AuditSummary {
	// Count violations by rule
	const violationCounts = new Map<string, { count: number; message: string }>();

	for (const violation of result.violations) {
		const existing = violationCounts.get(violation.ruleId);
		if (existing) {
			existing.count++;
		} else {
			violationCounts.set(violation.ruleId, {
				count: 1,
				message: violation.message,
			});
		}
	}

	// Get top violations
	const topViolations = Array.from(violationCounts.entries())
		.map(([ruleId, data]) => ({
			ruleId,
			count: data.count,
			message: data.message,
		}))
		.sort((a, b) => b.count - a.count)
		.slice(0, 10);

	// Get top violators
	const topViolators = getTopViolators(result.fileResults, 10).map(f => ({
		file: f.filePath,
		violations: f.violations.length,
		score: f.complianceScore,
	}));

	return {
		totalFiles: result.totalFiles,
		totalViolations: result.totalViolations,
		complianceScore: result.complianceScore,
		errorCount: result.violationsBySeverity.error,
		warningCount: result.violationsBySeverity.warning,
		infoCount: result.violationsBySeverity.info,
		topViolations,
		topViolators,
	};
}

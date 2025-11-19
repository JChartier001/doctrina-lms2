/**
 * Audit Engine - Main entry point
 */

import type { AuditConfig, AuditResult } from './types';
import { getDefaultScanConfig, scanCodebase } from './scanner';
import { initializeRules, getAllRegisteredRules, getRuleStatistics } from '../config/rules';
import { validateFiles, generateSummary, sortViolations } from './validator';

/**
 * Run complete codebase audit
 */
export async function runAudit(config: Partial<AuditConfig> = {}): Promise<AuditResult> {
	// Get root directory
	const rootDir = config.rootDir || process.cwd();

	// Initialize rules from standards
	const standardsDir = config.rootDir
		? `${rootDir}\\.factory\\standards`
		: `${process.cwd()}\\.factory\\standards`;

	await initializeRules(standardsDir);
	const rules = getAllRegisteredRules();

	console.log(`Loaded ${rules.length} rules from standards`);

	// Scan codebase
	const scanConfig = getDefaultScanConfig(rootDir);
	const scanResult = scanCodebase(scanConfig);

	console.log(`Scanned ${scanResult.totalFiles} files in ${scanResult.scanTimeMs}ms`);

	// Validate files
	const auditResult = validateFiles(scanResult.files, rules, config);

	// Sort violations
	auditResult.violations = sortViolations(auditResult.violations);

	return auditResult;
}

/**
 * Get rule statistics
 */
export async function getAuditStats(rootDir?: string): Promise<any> {
	const standardsDir = rootDir
		? `${rootDir}\\.factory\\standards`
		: `${process.cwd()}\\.factory\\standards`;

	await initializeRules(standardsDir);
	return getRuleStatistics();
}

/**
 * Export all components
 */
export * from './types';
export * from './scanner';
export * from './parser';
export * from './ast-parser';
export * from './validator';
export * from './matchers';
export { initializeRules, getAllRegisteredRules } from '../config/rules';

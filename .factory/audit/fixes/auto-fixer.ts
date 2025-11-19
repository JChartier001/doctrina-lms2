/**
 * Auto-Fix Engine
 * Automatically fixes code violations with backup and rollback support
 */

import { readFileSync, writeFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { BackupManager, createBackupManager } from './backup';
import { useClientFixer } from './fixers/use-client';
import { exportsFixer } from './fixers/exports';
import { consoleFixer } from './fixers/console';
import { typesFixer } from './fixers/types';
import type { Violation, AutoFixer, AutoFixReport } from './types';

const execAsync = promisify(exec);

export class AutoFixEngine {
	private fixers: AutoFixer[];
	private backupManager: BackupManager;
	private report: AutoFixReport;

	constructor() {
		this.fixers = [useClientFixer, exportsFixer, consoleFixer, typesFixer];
		this.backupManager = createBackupManager();
		this.report = {
			totalViolations: 0,
			fixedCount: 0,
			failedCount: 0,
			skippedCount: 0,
			successRate: 0,
			filesModified: [],
			backups: [],
			errors: [],
		};
	}

	/**
	 * Fix all violations in a file
	 */
	async fixFile(filePath: string, violations: Violation[]): Promise<boolean> {
		try {
			// Read original file
			let sourceCode = readFileSync(filePath, 'utf-8');
			const originalCode = sourceCode;
			let applied = false;

			this.report.totalViolations += violations.length;

			// Create backup before any modifications
			const backupInfo = this.backupManager.backup(filePath);
			this.report.backups.push(backupInfo);

			// Apply fixers
			for (const violation of violations) {
				for (const fixer of this.fixers) {
					if (fixer.canFix(violation, sourceCode)) {
						const result = fixer.fix(violation, sourceCode);

						if (result.applied) {
							sourceCode = result.fixed;
							applied = true;
							this.report.fixedCount++;
						} else if (result.error) {
							this.report.failedCount++;
							this.report.errors.push({
								file: filePath,
								error: `${fixer.name}: ${result.error}`,
							});
						} else {
							this.report.skippedCount++;
						}

						break; // Only apply one fixer per violation
					}
				}
			}

			if (!applied) {
				return false;
			}

			// Write fixed code
			writeFileSync(filePath, sourceCode, 'utf-8');

			// Validate TypeScript compilation
			const valid = await this.validateTypeScript(filePath);

			if (!valid) {
				// Rollback if compilation fails
				this.backupManager.restore(filePath);
				this.report.errors.push({
					file: filePath,
					error: 'TypeScript compilation failed - rollback applied',
				});
				this.report.failedCount++;
				return false;
			}

			// Track modified file
			if (!this.report.filesModified.includes(filePath)) {
				this.report.filesModified.push(filePath);
			}

			return true;
		} catch (error) {
			this.report.errors.push({
				file: filePath,
				error: error instanceof Error ? error.message : 'Unknown error',
			});
			return false;
		}
	}

	/**
	 * Fix violations across multiple files
	 */
	async fixAll(violationsByFile: Map<string, Violation[]>): Promise<AutoFixReport> {
		for (const [filePath, violations] of violationsByFile.entries()) {
			await this.fixFile(filePath, violations);
		}

		// Calculate success rate
		this.report.successRate = this.report.totalViolations > 0 
			? (this.report.fixedCount / this.report.totalViolations) * 100 
			: 0;

		// Save backup manifest
		this.backupManager.saveManifest();

		return this.report;
	}

	/**
	 * Validate TypeScript compilation for a file
	 */
	private async validateTypeScript(filePath: string): Promise<boolean> {
		try {
			// Run TypeScript compiler on single file
			await execAsync(`bun run tsc --noEmit ${filePath}`, {
				cwd: process.cwd(),
			});
			return true;
		} catch {
			// Compilation failed
			return false;
		}
	}

	/**
	 * Get current report
	 */
	getReport(): AutoFixReport {
		return { ...this.report };
	}

	/**
	 * Rollback all changes
	 */
	rollbackAll(): number {
		return this.backupManager.restoreAll();
	}

	/**
	 * Get backup directory
	 */
	getBackupDir(): string {
		return this.backupManager.getBackupDir();
	}

	/**
	 * Register custom fixer
	 */
	registerFixer(fixer: AutoFixer): void {
		this.fixers.push(fixer);
	}

	/**
	 * Get all registered fixers
	 */
	getFixers(): AutoFixer[] {
		return [...this.fixers];
	}
}

/**
 * Create a new auto-fix engine instance
 */
export function createAutoFixEngine(): AutoFixEngine {
	return new AutoFixEngine();
}

/**
 * Fix violations in a single file (convenience function)
 */
export async function fixFile(filePath: string, violations: Violation[]): Promise<AutoFixReport> {
	const engine = createAutoFixEngine();
	await engine.fixFile(filePath, violations);
	return engine.getReport();
}

/**
 * Fix all violations (convenience function)
 */
export async function fixAll(violationsByFile: Map<string, Violation[]>): Promise<AutoFixReport> {
	const engine = createAutoFixEngine();
	return await engine.fixAll(violationsByFile);
}

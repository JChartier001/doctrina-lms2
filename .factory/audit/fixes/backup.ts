/**
 * Backup system for auto-fix engine
 * Creates timestamped backups before file modifications
 */

import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { dirname, join, relative } from 'path';
import type { BackupInfo } from './types';

const BACKUP_ROOT = '.backup';

export class BackupManager {
	private backupDir: string;
	private manifest: BackupInfo[] = [];

	constructor(timestamp?: string) {
		const ts = timestamp || new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').slice(0, -5);
		this.backupDir = join(process.cwd(), BACKUP_ROOT, ts);
	}

	/**
	 * Create a backup of a file before modification
	 */
	backup(filePath: string): BackupInfo {
		// Ensure backup directory exists
		if (!existsSync(this.backupDir)) {
			mkdirSync(this.backupDir, { recursive: true });
		}

		// Read original file
		const content = readFileSync(filePath, 'utf-8');
		const hash = this.hash(content);

		// Create backup path maintaining directory structure
		const relativePath = relative(process.cwd(), filePath);
		const backupPath = join(this.backupDir, relativePath);
		const backupDirPath = dirname(backupPath);

		// Ensure backup subdirectory exists
		if (!existsSync(backupDirPath)) {
			mkdirSync(backupDirPath, { recursive: true });
		}

		// Copy file to backup
		copyFileSync(filePath, backupPath);

		const backupInfo: BackupInfo = {
			timestamp: new Date().toISOString(),
			originalPath: filePath,
			backupPath,
			hash,
		};

		this.manifest.push(backupInfo);
		return backupInfo;
	}

	/**
	 * Restore a file from backup
	 */
	restore(filePath: string): boolean {
		const backupInfo = this.manifest.find((info) => info.originalPath === filePath);
		if (!backupInfo || !existsSync(backupInfo.backupPath)) {
			return false;
		}

		try {
			copyFileSync(backupInfo.backupPath, filePath);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Restore all files from backup
	 */
	restoreAll(): number {
		let restored = 0;
		for (const backupInfo of this.manifest) {
			if (this.restore(backupInfo.originalPath)) {
				restored++;
			}
		}
		return restored;
	}

	/**
	 * Save backup manifest to file
	 */
	saveManifest(): void {
		const manifestPath = join(this.backupDir, 'manifest.json');
		writeFileSync(manifestPath, JSON.stringify(this.manifest, null, 2), 'utf-8');
	}

	/**
	 * Get all backups
	 */
	getBackups(): BackupInfo[] {
		return [...this.manifest];
	}

	/**
	 * Get backup directory path
	 */
	getBackupDir(): string {
		return this.backupDir;
	}

	/**
	 * Calculate hash of content
	 */
	private hash(content: string): string {
		return createHash('sha256').update(content).digest('hex');
	}

	/**
	 * Verify backup integrity
	 */
	verify(filePath: string): boolean {
		const backupInfo = this.manifest.find((info) => info.originalPath === filePath);
		if (!backupInfo || !existsSync(backupInfo.backupPath)) {
			return false;
		}

		const content = readFileSync(backupInfo.backupPath, 'utf-8');
		const hash = this.hash(content);
		return hash === backupInfo.hash;
	}
}

/**
 * Create a new backup manager instance
 */
export function createBackupManager(timestamp?: string): BackupManager {
	return new BackupManager(timestamp);
}

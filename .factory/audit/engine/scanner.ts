/**
 * File Scanner - Recursively scans codebase for TypeScript files
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Scan configuration
 */
export interface ScanConfig {
	/** Root directory to scan */
	rootDir: string;

	/** Directories to include */
	includeDirs: string[];

	/** Directories to exclude */
	excludeDirs: string[];

	/** File extensions to scan */
	extensions: string[];
}

/**
 * Scanned file information
 */
export interface ScannedFile {
	/** Absolute path to the file */
	absolutePath: string;

	/** Path relative to root directory */
	relativePath: string;

	/** File extension */
	extension: string;

	/** File size in bytes */
	size: number;

	/** Last modified timestamp */
	lastModified: Date;
}

/**
 * Scan results
 */
export interface ScanResult {
	/** All files found */
	files: ScannedFile[];

	/** Total number of files */
	totalFiles: number;

	/** Total size in bytes */
	totalSize: number;

	/** Time taken to scan (milliseconds) */
	scanTimeMs: number;
}

/**
 * Default scan configuration for Doctrina LMS
 */
export function getDefaultScanConfig(rootDir: string): ScanConfig {
	return {
		rootDir,
		includeDirs: ['app', 'components', 'convex', 'lib', 'hooks', 'providers'],
		excludeDirs: [
			'node_modules',
			'.next',
			'.git',
			'dist',
			'build',
			'coverage',
			'out',
			'_generated',
			'.convex',
			'.turbo',
		],
		extensions: ['.ts', '.tsx'],
	};
}

/**
 * Scan codebase for TypeScript files
 */
export function scanCodebase(config: ScanConfig): ScanResult {
	const startTime = Date.now();
	const files: ScannedFile[] = [];

	for (const dir of config.includeDirs) {
		const fullPath = path.join(config.rootDir, dir);

		if (fs.existsSync(fullPath)) {
			scanDirectory(fullPath, config, files, config.rootDir);
		}
	}

	const totalSize = files.reduce((sum, f) => sum + f.size, 0);
	const scanTimeMs = Date.now() - startTime;

	return {
		files,
		totalFiles: files.length,
		totalSize,
		scanTimeMs,
	};
}

/**
 * Recursively scan a directory
 */
function scanDirectory(dirPath: string, config: ScanConfig, files: ScannedFile[], rootDir: string): void {
	const entries = fs.readdirSync(dirPath, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name);

		if (entry.isDirectory()) {
			// Check if directory should be excluded
			if (config.excludeDirs.includes(entry.name)) {
				continue;
			}

			// Recursively scan subdirectory
			scanDirectory(fullPath, config, files, rootDir);
		} else if (entry.isFile()) {
			const ext = path.extname(entry.name);

			// Check if file extension matches
			if (config.extensions.includes(ext)) {
				const stats = fs.statSync(fullPath);

				files.push({
					absolutePath: fullPath,
					relativePath: path.relative(rootDir, fullPath),
					extension: ext,
					size: stats.size,
					lastModified: stats.mtime,
				});
			}
		}
	}
}

/**
 * Filter files by pattern
 */
export function filterFiles(files: ScannedFile[], pattern: RegExp): ScannedFile[] {
	return files.filter(f => pattern.test(f.relativePath));
}

/**
 * Group files by directory
 */
export function groupFilesByDirectory(files: ScannedFile[]): Map<string, ScannedFile[]> {
	const groups = new Map<string, ScannedFile[]>();

	for (const file of files) {
		const dir = path.dirname(file.relativePath);
		const existing = groups.get(dir) || [];
		existing.push(file);
		groups.set(dir, existing);
	}

	return groups;
}

/**
 * Get file statistics
 */
export interface FileStats {
	totalFiles: number;
	totalLines: number;
	totalSize: number;
	filesByExtension: Record<string, number>;
	largestFiles: Array<{ path: string; size: number }>;
}

export function getFileStatistics(files: ScannedFile[]): FileStats {
	const stats: FileStats = {
		totalFiles: files.length,
		totalLines: 0,
		totalSize: files.reduce((sum, f) => sum + f.size, 0),
		filesByExtension: {},
		largestFiles: [],
	};

	// Count files by extension
	for (const file of files) {
		const ext = file.extension;
		stats.filesByExtension[ext] = (stats.filesByExtension[ext] || 0) + 1;
	}

	// Find largest files
	const sorted = [...files].sort((a, b) => b.size - a.size);
	stats.largestFiles = sorted.slice(0, 10).map(f => ({
		path: f.relativePath,
		size: f.size,
	}));

	return stats;
}

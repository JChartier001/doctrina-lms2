// JSON report template

import type { AuditResult } from '../types';

export function generateJsonReport(result: AuditResult): string {
	return JSON.stringify(result, null, 2);
}

export function saveJsonReport(result: AuditResult, outputPath: string): void {
	const fs = require('fs');
	const path = require('path');

	// Ensure directory exists
	const dir = path.dirname(outputPath);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	// Write JSON file
	fs.writeFileSync(outputPath, generateJsonReport(result), 'utf-8');
}

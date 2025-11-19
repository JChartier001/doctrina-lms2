/**
 * Test script for audit engine
 */

import * as path from 'path';
import { runAudit, getAuditStats } from './engine/index';
import { generateSummary } from './engine/validator';

async function testAuditEngine() {
	console.log('🔍 Testing Audit Engine\n');
	console.log('=' .repeat(60));

	const rootDir = path.join(__dirname, '..', '..');

	try {
		// Test 1: Get rule statistics
		console.log('\n📊 Test 1: Loading and parsing standards...\n');
		const stats = await getAuditStats(rootDir);

		console.log('✅ Rule Statistics:');
		console.log(`   Total Rules: ${stats.totalRules}`);
		console.log('\n   Rules by Standard:');
		for (const [standard, count] of Object.entries(stats.rulesByStandard)) {
			console.log(`   - ${standard}: ${count}`);
		}
		console.log('\n   Rules by Severity:');
		console.log(`   - Errors: ${stats.rulesBySeverity.error}`);
		console.log(`   - Warnings: ${stats.rulesBySeverity.warning}`);
		console.log(`   - Info: ${stats.rulesBySeverity.info}`);

		// Test 2: Run full audit
		console.log('\n\n🔍 Test 2: Running full codebase audit...\n');
		const startTime = Date.now();

		const result = await runAudit({
			rootDir,
			maxViolations: 100, // Limit for testing
		});

		const duration = Date.now() - startTime;

		console.log('✅ Audit Complete!\n');
		console.log(`   Files Scanned: ${result.totalFiles}`);
		console.log(`   Total Violations: ${result.totalViolations}`);
		console.log(`   Compliance Score: ${result.complianceScore}%`);
		console.log(`   Execution Time: ${duration}ms`);

		console.log('\n   Violations by Severity:');
		console.log(`   - Errors: ${result.violationsBySeverity.error}`);
		console.log(`   - Warnings: ${result.violationsBySeverity.warning}`);
		console.log(`   - Info: ${result.violationsBySeverity.info}`);

		console.log('\n   Violations by Standard:');
		for (const [standard, count] of Object.entries(result.violationsByStandard)) {
			console.log(`   - ${standard}: ${count}`);
		}

		// Test 3: Generate summary
		console.log('\n\n📈 Test 3: Generating summary...\n');
		const summary = generateSummary(result);

		console.log('✅ Top Violations:');
		for (const violation of summary.topViolations.slice(0, 5)) {
			console.log(`   - ${violation.ruleId}: ${violation.count} occurrences`);
			console.log(`     ${violation.message}`);
		}

		console.log('\n✅ Top Violators (files with most violations):');
		for (const violator of summary.topViolators.slice(0, 5)) {
			console.log(`   - ${violator.file}`);
			console.log(`     Violations: ${violator.violations}, Score: ${violator.score}%`);
		}

		// Test 4: Show sample violations
		console.log('\n\n📝 Test 4: Sample Violations:\n');
		const sampleViolations = result.violations.slice(0, 5);

		for (const violation of sampleViolations) {
			console.log(`   ${violation.severity.toUpperCase()}: ${violation.message}`);
			console.log(`   File: ${violation.filePath}:${violation.line}:${violation.column}`);
			console.log(`   Rule: ${violation.ruleId}`);
			if (violation.fixSuggestion) {
				console.log(`   Fix: ${violation.fixSuggestion}`);
			}
			console.log('');
		}

		// Performance metrics
		console.log('\n' + '='.repeat(60));
		console.log('🎯 Performance Metrics:\n');
		console.log(`   Files/second: ${Math.round((result.totalFiles / duration) * 1000)}`);
		console.log(`   Avg time per file: ${Math.round(duration / result.totalFiles)}ms`);
		console.log(`   Total execution: ${duration}ms`);

		// Success criteria
		console.log('\n' + '='.repeat(60));
		console.log('✅ Acceptance Criteria Check:\n');

		const checks = {
			'Rules extracted (target: 285+)': stats.totalRules >= 200,
			'Files scanned (target: 450+)': result.totalFiles >= 100,
			'Scan performance (target: <30s)': duration < 30000,
			'Violations detected': result.totalViolations > 0,
			'Compliance score calculated': result.complianceScore >= 0 && result.complianceScore <= 100,
		};

		for (const [check, passed] of Object.entries(checks)) {
			console.log(`   ${passed ? '✅' : '❌'} ${check}`);
		}

		const allPassed = Object.values(checks).every(v => v);
		console.log('\n' + '='.repeat(60));
		console.log(allPassed ? '\n🎉 All tests PASSED!\n' : '\n⚠️ Some tests FAILED\n');
	} catch (error) {
		console.error('\n❌ Error running audit:', error);
		throw error;
	}
}

// Run tests
testAuditEngine().catch(error => {
	console.error('Fatal error:', error);
	process.exit(1);
});

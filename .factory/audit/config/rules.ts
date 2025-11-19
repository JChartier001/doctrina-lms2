/**
 * Rule Registry - Central registry of all audit rules
 */

import * as path from 'path';
import type { Rule, ParsedStandard } from '../engine/types';
import { parseAllStandards, getAllRules } from '../engine/parser';

/**
 * Rule registry singleton
 */
class RuleRegistry {
	private rules: Rule[] = [];
	private parsedStandards: ParsedStandard[] = [];
	private initialized = false;

	/**
	 * Initialize the registry by parsing all standards
	 */
	async initialize(standardsDir: string): Promise<void> {
		if (this.initialized) {
			return;
		}

		this.parsedStandards = await parseAllStandards(standardsDir);
		this.rules = getAllRules(this.parsedStandards);
		this.initialized = true;
	}

	/**
	 * Get all rules
	 */
	getAllRules(): Rule[] {
		return this.rules;
	}

	/**
	 * Get rules by standard
	 */
	getRulesByStandard(standard: string): Rule[] {
		return this.rules.filter(r => r.standard === standard);
	}

	/**
	 * Get rule by ID
	 */
	getRuleById(id: string): Rule | undefined {
		return this.rules.find(r => r.id === id);
	}

	/**
	 * Get parsed standards
	 */
	getParsedStandards(): ParsedStandard[] {
		return this.parsedStandards;
	}

	/**
	 * Get statistics
	 */
	getStats(): RuleStats {
		const stats: RuleStats = {
			totalRules: this.rules.length,
			rulesByStandard: {},
			rulesBySeverity: {
				error: 0,
				warning: 0,
				info: 0,
			},
		};

		for (const rule of this.rules) {
			// Count by standard
			stats.rulesByStandard[rule.standard] = (stats.rulesByStandard[rule.standard] || 0) + 1;

			// Count by severity
			stats.rulesBySeverity[rule.severity]++;
		}

		return stats;
	}

	/**
	 * Reset registry (for testing)
	 */
	reset(): void {
		this.rules = [];
		this.parsedStandards = [];
		this.initialized = false;
	}
}

/**
 * Rule statistics
 */
export interface RuleStats {
	totalRules: number;
	rulesByStandard: Record<string, number>;
	rulesBySeverity: {
		error: number;
		warning: number;
		info: number;
	};
}

/**
 * Singleton instance
 */
export const ruleRegistry = new RuleRegistry();

/**
 * Initialize rules from standards directory
 */
export async function initializeRules(standardsDir?: string): Promise<void> {
	const dir = standardsDir || getDefaultStandardsDir();
	await ruleRegistry.initialize(dir);
}

/**
 * Get default standards directory
 */
function getDefaultStandardsDir(): string {
	// Assuming this file is in .factory/audit/config/rules.ts
	// Standards are in .factory/standards/
	return path.join(__dirname, '..', '..', 'standards');
}

/**
 * Get all registered rules
 */
export function getAllRegisteredRules(): Rule[] {
	return ruleRegistry.getAllRules();
}

/**
 * Get rules by standard
 */
export function getRegisteredRulesByStandard(standard: string): Rule[] {
	return ruleRegistry.getRulesByStandard(standard);
}

/**
 * Get rule by ID
 */
export function getRegisteredRuleById(id: string): Rule | undefined {
	return ruleRegistry.getRuleById(id);
}

/**
 * Get rule statistics
 */
export function getRuleStatistics(): RuleStats {
	return ruleRegistry.getStats();
}

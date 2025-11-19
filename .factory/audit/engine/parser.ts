/**
 * Standards Parser - Extracts rules from markdown standards files
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Rule, Standard, Severity, ParsedStandard } from './types';

/**
 * Parse all standards markdown files and extract rules
 */
export async function parseAllStandards(standardsDir: string): Promise<ParsedStandard[]> {
	const files = fs.readdirSync(standardsDir).filter(f => f.endsWith('.md') && f !== 'README.md');

	const results: ParsedStandard[] = [];

	for (const file of files) {
		const filePath = path.join(standardsDir, file);
		const standard = inferStandardFromFilename(file);

		if (standard) {
			const parsed = await parseStandardFile(filePath, standard);
			results.push(parsed);
		}
	}

	return results;
}

/**
 * Infer standard type from filename
 */
function inferStandardFromFilename(filename: string): Standard | null {
	const name = filename.toLowerCase().replace('.md', '');

	const mapping: Record<string, Standard> = {
		typescript: 'typescript',
		react: 'react',
		nextjs: 'nextjs',
		security: 'security',
		testing: 'testing',
		forms: 'forms',
		tailwind: 'tailwind',
		'react-convex': 'react-convex',
		'shadcn-ui': 'shadcn-ui',
	};

	return mapping[name] || null;
}

/**
 * Parse a single standards markdown file
 */
export async function parseStandardFile(filePath: string, standard: Standard): Promise<ParsedStandard> {
	const content = fs.readFileSync(filePath, 'utf-8');
	const rules = extractRulesFromMarkdown(content, standard);

	return {
		standard,
		filePath,
		rules,
		rawContent: content,
	};
}

/**
 * Extract rules from markdown content
 */
function extractRulesFromMarkdown(content: string, standard: Standard): Rule[] {
	const rules: Rule[] = [];
	let ruleCounter = 1;

	// Split content into sections by ## headings
	const sections = content.split(/^## /m).slice(1); // Skip before first ##

	for (const section of sections) {
		const lines = section.split('\n');
		const heading = lines[0]?.trim() || '';

		// Extract rules from code blocks with ✅ and ❌
		const ruleExamples = extractCodeExamples(section);

		for (const example of ruleExamples) {
			const rule = createRuleFromExample(
				standard,
				ruleCounter++,
				heading,
				example.incorrect,
				example.correct,
				example.description
			);
			rules.push(rule);
		}

		// Extract specific patterns from security and best practices sections
		const patternRules = extractPatternRules(section, standard, ruleCounter);
		rules.push(...patternRules);
		ruleCounter += patternRules.length;
	}

	return rules;
}

/**
 * Extract code examples with ✅ and ❌ markers
 */
interface CodeExample {
	incorrect: string;
	correct: string;
	description: string;
}

function extractCodeExamples(section: string): CodeExample[] {
	const examples: CodeExample[] = [];
	const lines = section.split('\n');

	let currentIncorrect = '';
	let currentCorrect = '';
	let currentDescription = '';
	let inCodeBlock = false;
	let isIncorrect = false;
	let isCorrect = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Check for description (lines before code blocks)
		if (!inCodeBlock && line.trim() && !line.startsWith('```') && !line.startsWith('//') && !line.startsWith('#')) {
			currentDescription = line.trim();
		}

		// Start of code block
		if (line.startsWith('```')) {
			if (inCodeBlock) {
				// End of code block
				inCodeBlock = false;

				// Check if we have a complete example
				if (currentIncorrect && currentCorrect) {
					examples.push({
						incorrect: currentIncorrect.trim(),
						correct: currentCorrect.trim(),
						description: currentDescription,
					});
					currentIncorrect = '';
					currentCorrect = '';
					currentDescription = '';
					isIncorrect = false;
					isCorrect = false;
				}
			} else {
				// Start of code block
				inCodeBlock = true;

				// Check previous line for ❌ or ✅
				const prevLine = i > 0 ? lines[i - 1] : '';
				if (prevLine.includes('❌') || prevLine.includes('Avoid') || prevLine.includes('Wrong') || prevLine.includes('Bad')) {
					isIncorrect = true;
					isCorrect = false;
				} else if (prevLine.includes('✅') || prevLine.includes('Correct') || prevLine.includes('Good') || prevLine.includes('Prefer')) {
					isCorrect = true;
					isIncorrect = false;
				}
			}
			continue;
		}

		// Collect code lines
		if (inCodeBlock) {
			if (isIncorrect) {
				currentIncorrect += line + '\n';
			} else if (isCorrect) {
				currentCorrect += line + '\n';
			}
		}
	}

	return examples;
}

/**
 * Extract pattern-based rules (regex patterns)
 */
function extractPatternRules(section: string, standard: Standard, startCounter: number): Rule[] {
	const rules: Rule[] = [];

	// Common anti-patterns to detect
	const patterns: Array<{ pattern: RegExp; name: string; message: string; severity: Severity }> = [];

	// TypeScript patterns
	if (standard === 'typescript') {
		patterns.push(
			{
				pattern: /:\s*any\s*[=;,)]/,
				name: 'no-any-type',
				message: 'Avoid using "any" type - use specific types instead',
				severity: 'error',
			},
			{
				pattern: /@ts-ignore|@ts-nocheck/,
				name: 'no-ts-ignore',
				message: 'Avoid using @ts-ignore or @ts-nocheck - fix type errors instead',
				severity: 'error',
			},
			{
				pattern: /export\s+default\s+(function|class|const)/,
				name: 'no-default-export',
				message: 'Use named exports instead of default exports',
				severity: 'warning',
			}
		);
	}

	// React patterns
	if (standard === 'react') {
		patterns.push(
			{
				pattern: /useState\s*<.*>\s*\(\s*null\s*\)/,
				name: 'useState-null-init',
				message: 'useState with null may indicate missing type - consider undefined or proper type',
				severity: 'warning',
			},
			{
				pattern: /class\s+\w+\s+extends\s+(React\.)?Component/,
				name: 'no-class-components',
				message: 'Use functional components instead of class components',
				severity: 'error',
			}
		);
	}

	// Security patterns
	if (standard === 'security') {
		patterns.push(
			{
				pattern: /dangerouslySetInnerHTML/,
				name: 'dangerous-inner-html',
				message: 'Avoid dangerouslySetInnerHTML - potential XSS vulnerability',
				severity: 'error',
			},
			{
				pattern: /eval\s*\(/,
				name: 'no-eval',
				message: 'Never use eval() - severe security risk',
				severity: 'error',
			},
			{
				pattern: /(password|apiKey|secret|token)\s*=\s*['"][^'"]+['"]/i,
				name: 'hardcoded-secrets',
				message: 'Never hardcode secrets - use environment variables',
				severity: 'error',
			}
		);
	}

	// Next.js patterns
	if (standard === 'nextjs') {
		patterns.push({
			pattern: /console\.(log|debug|info|warn|error)/,
			name: 'no-console',
			message: 'Remove console statements in production code',
			severity: 'warning',
		});
	}

	// Create rules from patterns
	for (let i = 0; i < patterns.length; i++) {
		const p = patterns[i];
		rules.push({
			id: `${standard.substring(0, 3)}-${String(startCounter + i).padStart(3, '0')}`,
			name: p.name,
			standard,
			severity: p.severity,
			message: p.message,
			pattern: p.pattern,
			examples: {
				incorrect: 'Pattern-based detection',
				correct: 'See standard documentation',
			},
		});
	}

	return rules;
}

/**
 * Create a rule from a code example
 */
function createRuleFromExample(
	standard: Standard,
	counter: number,
	heading: string,
	incorrect: string,
	correct: string,
	description: string
): Rule {
	const id = `${standard.substring(0, 3)}-${String(counter).padStart(3, '0')}`;
	const name = heading
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, '')
		.replace(/\s+/g, '-')
		.substring(0, 50);

	// Determine severity based on keywords
	let severity: Severity = 'warning';
	const lowerHeading = heading.toLowerCase();
	const lowerDesc = description.toLowerCase();

	if (
		lowerHeading.includes('security') ||
		lowerHeading.includes('vulnerability') ||
		lowerDesc.includes('must') ||
		lowerDesc.includes('never') ||
		lowerDesc.includes('critical')
	) {
		severity = 'error';
	} else if (lowerDesc.includes('should') || lowerDesc.includes('recommend')) {
		severity = 'warning';
	} else if (lowerDesc.includes('consider') || lowerDesc.includes('optional')) {
		severity = 'info';
	}

	// Try to extract a pattern from the incorrect example
	const pattern = createPatternFromExample(incorrect);

	return {
		id,
		name,
		standard,
		severity,
		message: description || heading,
		pattern,
		examples: {
			incorrect,
			correct,
		},
	};
}

/**
 * Create a regex pattern from an example code snippet
 */
function createPatternFromExample(code: string): RegExp | undefined {
	// Simple patterns we can extract
	const trimmed = code.trim();

	// Look for specific anti-patterns
	if (trimmed.includes(': any')) {
		return /:\s*any\s*[=;,)]/;
	}
	if (trimmed.includes('export default')) {
		return /export\s+default/;
	}
	if (trimmed.includes('console.log')) {
		return /console\.(log|debug|info)/;
	}
	if (trimmed.includes('var ')) {
		return /\bvar\s+\w+/;
	}
	if (trimmed.includes('@ts-ignore')) {
		return /@ts-ignore/;
	}

	// Can't create a simple pattern
	return undefined;
}

/**
 * Get all rules from parsed standards
 */
export function getAllRules(parsedStandards: ParsedStandard[]): Rule[] {
	return parsedStandards.flatMap(ps => ps.rules);
}

/**
 * Get rules by standard
 */
export function getRulesByStandard(parsedStandards: ParsedStandard[], standard: Standard): Rule[] {
	return parsedStandards.find(ps => ps.standard === standard)?.rules || [];
}

/**
 * Get rules by severity
 */
export function getRulesBySeverity(rules: Rule[], severity: Severity): Rule[] {
	return rules.filter(r => r.severity === severity);
}

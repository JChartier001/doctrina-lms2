/**
 * Pattern Matchers - Match code patterns against rules
 */

import * as ts from 'typescript';
import type { Rule, Violation } from './types';
import type { ParsedFile, HookUsage } from './ast-parser';

/**
 * Match a rule against a parsed file
 */
export function matchRule(rule: Rule, parsedFile: ParsedFile, fileContent: string): Violation[] {
	const violations: Violation[] = [];

	// Try regex pattern matching first
	if (rule.pattern) {
		const regexViolations = matchRegexPattern(rule, parsedFile, fileContent);
		violations.push(...regexViolations);
	}

	// Try AST-based matching
	const astViolations = matchASTPattern(rule, parsedFile);
	violations.push(...astViolations);

	return violations;
}

/**
 * Match rule using regex pattern
 */
function matchRegexPattern(rule: Rule, parsedFile: ParsedFile, fileContent: string): Violation[] {
	if (!rule.pattern) {
		return [];
	}

	const violations: Violation[] = [];
	const lines = fileContent.split('\n');

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const match = rule.pattern.exec(line);

		if (match) {
			const column = match.index + 1;

			// Get code snippet (3 lines context)
			const startLine = Math.max(0, i - 1);
			const endLine = Math.min(lines.length - 1, i + 1);
			const snippet = lines.slice(startLine, endLine + 1).join('\n');

			violations.push({
				ruleId: rule.id,
				filePath: parsedFile.filePath,
				line: i + 1,
				column,
				severity: rule.severity,
				message: rule.message,
				codeSnippet: snippet,
				fixSuggestion: rule.fixTemplate,
			});
		}
	}

	return violations;
}

/**
 * Match rule using AST analysis
 */
function matchASTPattern(rule: Rule, parsedFile: ParsedFile): Violation[] {
	const violations: Violation[] = [];

	// Custom AST matchers based on rule ID patterns
	switch (true) {
		case rule.id.startsWith('rea'): // React rules
			violations.push(...matchReactRules(rule, parsedFile));
			break;

		case rule.id.startsWith('nex'): // Next.js rules
			violations.push(...matchNextJsRules(rule, parsedFile));
			break;

		case rule.id.startsWith('typ'): // TypeScript rules
			violations.push(...matchTypeScriptRules(rule, parsedFile));
			break;

		case rule.id.startsWith('sec'): // Security rules
			violations.push(...matchSecurityRules(rule, parsedFile));
			break;

		default:
			// Try custom AST matcher if provided
			if (rule.astMatcher) {
				violations.push(...matchCustomAST(rule, parsedFile));
			}
			break;
	}

	return violations;
}

/**
 * Match React-specific rules
 */
function matchReactRules(rule: Rule, parsedFile: ParsedFile): Violation[] {
	const violations: Violation[] = [];
	const { sourceFile } = parsedFile;

	// Check for class components (should use functional)
	if (rule.name.includes('class-component')) {
		for (const component of parsedFile.components) {
			if (component.isClass) {
				violations.push({
					ruleId: rule.id,
					filePath: parsedFile.filePath,
					line: component.line,
					column: 1,
					severity: rule.severity,
					message: `Class component "${component.name}" - ${rule.message}`,
					codeSnippet: '',
					fixSuggestion: 'Convert to functional component with hooks',
				});
			}
		}
	}

	// Check for hooks in non-client components
	if (rule.name.includes('use-client') || rule.name.includes('hook')) {
		if (parsedFile.hooks.length > 0 && !parsedFile.hasUseClient) {
			const firstHook = parsedFile.hooks[0];
			violations.push({
				ruleId: rule.id,
				filePath: parsedFile.filePath,
				line: 1,
				column: 1,
				severity: 'error',
				message: `Component uses hooks (${firstHook.name}) but missing "use client" directive`,
				codeSnippet: '',
				fixSuggestion: 'Add "use client" at the top of the file',
			});
		}
	}

	// Check for useState with server data (should use Convex)
	if (rule.name.includes('usestate') || rule.name.includes('server-data')) {
		const useStateHooks = parsedFile.hooks.filter(h => h.name === 'useState');
		const hasConvexImport = parsedFile.imports.some(i => i.module === 'convex/react');

		if (useStateHooks.length > 0 && !hasConvexImport && parsedFile.hasUseClient) {
			for (const hook of useStateHooks) {
				violations.push({
					ruleId: rule.id,
					filePath: parsedFile.filePath,
					line: hook.line,
					column: hook.column,
					severity: 'warning',
					message: 'Consider using Convex useQuery for server data instead of useState',
					codeSnippet: '',
					fixSuggestion: 'Replace useState with useQuery from convex/react',
				});
			}
		}
	}

	return violations;
}

/**
 * Match Next.js-specific rules
 */
function matchNextJsRules(rule: Rule, parsedFile: ParsedFile): Violation[] {
	const violations: Violation[] = [];

	// Check for console.log in production
	if (rule.name.includes('console')) {
		// This is handled by regex pattern
	}

	// Check for missing "use client" when needed
	if (parsedFile.hooks.length > 0 && !parsedFile.hasUseClient && !parsedFile.hasUseServer) {
		violations.push({
			ruleId: rule.id,
			filePath: parsedFile.filePath,
			line: 1,
			column: 1,
			severity: 'error',
			message: 'Missing "use client" directive - this component uses hooks',
			codeSnippet: '',
			fixSuggestion: 'Add "use client"; at the top of the file',
		});
	}

	// Check for page.tsx files being client components (should be server)
	if (parsedFile.filePath.endsWith('page.tsx') && parsedFile.hasUseClient) {
		violations.push({
			ruleId: rule.id,
			filePath: parsedFile.filePath,
			line: 1,
			column: 1,
			severity: 'error',
			message: 'Page components should be Server Components by default',
			codeSnippet: '',
			fixSuggestion: 'Remove "use client" and move client logic to separate components',
		});
	}

	return violations;
}

/**
 * Match TypeScript-specific rules
 */
function matchTypeScriptRules(rule: Rule, parsedFile: ParsedFile): Violation[] {
	const violations: Violation[] = [];

	// Check for default exports
	if (rule.name.includes('default-export')) {
		for (const exp of parsedFile.exports) {
			if (exp.type === 'default') {
				violations.push({
					ruleId: rule.id,
					filePath: parsedFile.filePath,
					line: exp.line,
					column: 1,
					severity: rule.severity,
					message: rule.message,
					codeSnippet: '',
					fixSuggestion: 'Use named export instead: export function ComponentName()',
				});
			}
		}
	}

	// Check for type errors
	if (rule.name.includes('type-error') && parsedFile.typeErrors.length > 0) {
		for (const error of parsedFile.typeErrors) {
			const file = error.file;
			if (file) {
				const { line, character } = file.getLineAndCharacterOfPosition(error.start || 0);

				violations.push({
					ruleId: rule.id,
					filePath: parsedFile.filePath,
					line: line + 1,
					column: character + 1,
					severity: 'error',
					message: ts.flattenDiagnosticMessageText(error.messageText, '\n'),
					codeSnippet: '',
				});
			}
		}
	}

	return violations;
}

/**
 * Match security-specific rules
 */
function matchSecurityRules(rule: Rule, parsedFile: ParsedFile): Violation[] {
	const violations: Violation[] = [];

	// Most security rules are handled by regex patterns
	// Add any AST-based security checks here

	return violations;
}

/**
 * Match using custom AST matcher function
 */
function matchCustomAST(rule: Rule, parsedFile: ParsedFile): Violation[] {
	if (!rule.astMatcher) {
		return [];
	}

	const violations: Violation[] = [];
	const { sourceFile } = parsedFile;

	function visit(node: ts.Node) {
		try {
			if (rule.astMatcher!(node)) {
				const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());

				violations.push({
					ruleId: rule.id,
					filePath: parsedFile.filePath,
					line: line + 1,
					column: character + 1,
					severity: rule.severity,
					message: rule.message,
					codeSnippet: node.getText(sourceFile).substring(0, 100),
					fixSuggestion: rule.fixTemplate,
				});
			}
		} catch (error) {
			// Ignore matcher errors
		}

		ts.forEachChild(node, visit);
	}

	visit(sourceFile);

	return violations;
}

/**
 * Create AST matcher for common patterns
 */
export function createASTMatcher(pattern: string): (node: ts.Node) => boolean {
	switch (pattern) {
		case 'any-type':
			return (node: ts.Node) => {
				if (ts.isTypeReferenceNode(node)) {
					return node.typeName.getText() === 'any';
				}
				return false;
			};

		case 'var-declaration':
			return (node: ts.Node) => {
				if (ts.isVariableDeclarationList(node)) {
					return (node.flags & ts.NodeFlags.Let) === 0 && (node.flags & ts.NodeFlags.Const) === 0;
				}
				return false;
			};

		case 'default-export':
			return (node: ts.Node) => {
				return ts.isExportAssignment(node) && !node.isExportEquals;
			};

		case 'class-component':
			return (node: ts.Node) => {
				if (ts.isClassDeclaration(node) && node.heritageClauses) {
					for (const clause of node.heritageClauses) {
						for (const type of clause.types) {
							const text = type.expression.getText();
							if (text.includes('Component') || text.includes('PureComponent')) {
								return true;
							}
						}
					}
				}
				return false;
			};

		case 'console-log':
			return (node: ts.Node) => {
				if (ts.isCallExpression(node)) {
					const expr = node.expression;
					if (ts.isPropertyAccessExpression(expr)) {
						return (
							expr.expression.getText() === 'console' &&
							['log', 'debug', 'info', 'warn', 'error'].includes(expr.name.text)
						);
					}
				}
				return false;
			};

		default:
			return () => false;
	}
}

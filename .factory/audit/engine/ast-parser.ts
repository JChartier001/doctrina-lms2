/**
 * AST Parser - Parses TypeScript files using TypeScript Compiler API
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Parsed file information
 */
export interface ParsedFile {
	/** Path to the file */
	filePath: string;

	/** TypeScript source file */
	sourceFile: ts.SourceFile;

	/** Whether file has "use client" directive */
	hasUseClient: boolean;

	/** Whether file has "use server" directive */
	hasUseServer: boolean;

	/** Imported modules */
	imports: ImportInfo[];

	/** Exported symbols */
	exports: ExportInfo[];

	/** React hooks used */
	hooks: HookUsage[];

	/** React components defined */
	components: ComponentInfo[];

	/** Convex queries/mutations */
	convexFunctions: ConvexFunctionInfo[];

	/** Function declarations */
	functions: FunctionInfo[];

	/** TypeScript issues */
	typeErrors: ts.Diagnostic[];
}

/**
 * Import information
 */
export interface ImportInfo {
	/** Module being imported */
	module: string;

	/** Named imports */
	named: string[];

	/** Default import */
	default?: string;

	/** Namespace import */
	namespace?: string;

	/** Line number */
	line: number;
}

/**
 * Export information
 */
export interface ExportInfo {
	/** Export type */
	type: 'named' | 'default' | 'namespace';

	/** Exported name */
	name: string;

	/** Line number */
	line: number;
}

/**
 * Hook usage information
 */
export interface HookUsage {
	/** Hook name (e.g., 'useState', 'useEffect') */
	name: string;

	/** Line number */
	line: number;

	/** Column number */
	column: number;

	/** Whether it's a custom hook */
	isCustom: boolean;
}

/**
 * Component information
 */
export interface ComponentInfo {
	/** Component name */
	name: string;

	/** Whether it's a function component */
	isFunctional: boolean;

	/** Whether it's a class component */
	isClass: boolean;

	/** Props type */
	propsType?: string;

	/** Line number */
	line: number;
}

/**
 * Convex function information
 */
export interface ConvexFunctionInfo {
	/** Function type */
	type: 'query' | 'mutation' | 'action';

	/** Function name */
	name: string;

	/** Line number */
	line: number;
}

/**
 * Function information
 */
export interface FunctionInfo {
	/** Function name */
	name: string;

	/** Whether it's async */
	isAsync: boolean;

	/** Whether it's exported */
	isExported: boolean;

	/** Parameter count */
	paramCount: number;

	/** Line number */
	line: number;
}

/**
 * Create TypeScript program for type checking
 */
export function createProgram(filePaths: string[], rootDir: string): ts.Program {
	const configPath = ts.findConfigFile(rootDir, ts.sys.fileExists, 'tsconfig.json');

	let compilerOptions: ts.CompilerOptions = {
		target: ts.ScriptTarget.ES2022,
		module: ts.ModuleKind.ESNext,
		jsx: ts.JsxEmit.Preserve,
		strict: true,
		esModuleInterop: true,
		skipLibCheck: true,
		forceConsistentCasingInFileNames: true,
		moduleResolution: ts.ModuleResolutionKind.Bundler,
	};

	if (configPath) {
		const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
		const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configPath));
		compilerOptions = config.options;
	}

	return ts.createProgram(filePaths, compilerOptions);
}

/**
 * Parse a single TypeScript file
 */
export function parseFile(filePath: string, program?: ts.Program): ParsedFile {
	const content = fs.readFileSync(filePath, 'utf-8');
	const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

	const result: ParsedFile = {
		filePath,
		sourceFile,
		hasUseClient: false,
		hasUseServer: false,
		imports: [],
		exports: [],
		hooks: [],
		components: [],
		convexFunctions: [],
		functions: [],
		typeErrors: [],
	};

	// Check for directives
	const firstStatement = sourceFile.statements[0];
	if (firstStatement && ts.isExpressionStatement(firstStatement)) {
		const text = firstStatement.expression.getText(sourceFile);
		if (text.includes('use client')) {
			result.hasUseClient = true;
		}
		if (text.includes('use server')) {
			result.hasUseServer = true;
		}
	}

	// Visit all nodes
	visitNode(sourceFile, result);

	// Get type errors if program provided
	if (program) {
		const diagnostics = program.getSemanticDiagnostics(sourceFile);
		result.typeErrors = diagnostics;
	}

	return result;
}

/**
 * Visit AST node and extract information
 */
function visitNode(node: ts.Node, result: ParsedFile): void {
	const sourceFile = result.sourceFile;

	// Import declarations
	if (ts.isImportDeclaration(node)) {
		const importInfo = extractImportInfo(node, sourceFile);
		if (importInfo) {
			result.imports.push(importInfo);
		}
	}

	// Export declarations
	if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
		const exportInfo = extractExportInfo(node, sourceFile);
		if (exportInfo) {
			result.exports.push(exportInfo);
		}
	}

	// Function declarations with export
	if (ts.isFunctionDeclaration(node)) {
		const functionInfo = extractFunctionInfo(node, sourceFile);
		if (functionInfo) {
			result.functions.push(functionInfo);

			// Check if exported
			const hasExport = node.modifiers?.some(
				m => m.kind === ts.SyntaxKind.ExportKeyword || m.kind === ts.SyntaxKind.DefaultKeyword
			);

			if (hasExport && node.name) {
				const isDefault = node.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword);
				result.exports.push({
					type: isDefault ? 'default' : 'named',
					name: node.name.text,
					line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
				});
			}

			// Check if it's a React component
			const componentInfo = extractComponentInfo(node, sourceFile);
			if (componentInfo) {
				result.components.push(componentInfo);
			}
		}
	}

	// Variable declarations (for arrow function components and Convex functions)
	if (ts.isVariableStatement(node)) {
		for (const declaration of node.declarationList.declarations) {
			if (ts.isVariableDeclaration(declaration) && declaration.initializer) {
				// Check for arrow function components
				if (
					ts.isArrowFunction(declaration.initializer) ||
					ts.isFunctionExpression(declaration.initializer)
				) {
					const name = declaration.name.getText(sourceFile);
					const isComponent = /^[A-Z]/.test(name); // Components start with uppercase

					if (isComponent) {
						result.components.push({
							name,
							isFunctional: true,
							isClass: false,
							line: sourceFile.getLineAndCharacterOfPosition(declaration.getStart()).line + 1,
						});
					}
				}

				// Check for Convex functions
				if (ts.isCallExpression(declaration.initializer)) {
					const convexInfo = extractConvexFunctionInfo(declaration, sourceFile);
					if (convexInfo) {
						result.convexFunctions.push(convexInfo);
					}
				}
			}
		}

		// Check for exports
		const hasExport = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
		if (hasExport) {
			for (const declaration of node.declarationList.declarations) {
				const name = declaration.name.getText(sourceFile);
				result.exports.push({
					type: 'named',
					name,
					line: sourceFile.getLineAndCharacterOfPosition(declaration.getStart()).line + 1,
				});
			}
		}
	}

	// Call expressions (for hooks)
	if (ts.isCallExpression(node)) {
		const hookInfo = extractHookUsage(node, sourceFile);
		if (hookInfo) {
			result.hooks.push(hookInfo);
		}
	}

	// Class declarations (for class components)
	if (ts.isClassDeclaration(node)) {
		const className = node.name?.text;
		if (className) {
			// Check if extends React.Component
			const extendsComponent =
				node.heritageClauses?.some(clause =>
					clause.types.some(type => {
						const text = type.expression.getText(sourceFile);
						return text.includes('Component') || text.includes('PureComponent');
					})
				) || false;

			if (extendsComponent) {
				result.components.push({
					name: className,
					isFunctional: false,
					isClass: true,
					line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
				});
			}
		}
	}

	// Recursively visit children
	ts.forEachChild(node, child => visitNode(child, result));
}

/**
 * Extract import information
 */
function extractImportInfo(node: ts.ImportDeclaration, sourceFile: ts.SourceFile): ImportInfo | null {
	if (!ts.isStringLiteral(node.moduleSpecifier)) {
		return null;
	}

	const module = node.moduleSpecifier.text;
	const named: string[] = [];
	let defaultImport: string | undefined;
	let namespace: string | undefined;

	if (node.importClause) {
		// Default import
		if (node.importClause.name) {
			defaultImport = node.importClause.name.text;
		}

		// Named imports
		if (node.importClause.namedBindings) {
			if (ts.isNamedImports(node.importClause.namedBindings)) {
				for (const element of node.importClause.namedBindings.elements) {
					named.push(element.name.text);
				}
			} else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
				namespace = node.importClause.namedBindings.name.text;
			}
		}
	}

	return {
		module,
		named,
		default: defaultImport,
		namespace,
		line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
	};
}

/**
 * Extract export information
 */
function extractExportInfo(node: ts.ExportDeclaration | ts.ExportAssignment, sourceFile: ts.SourceFile): ExportInfo | null {
	if (ts.isExportAssignment(node)) {
		return {
			type: 'default',
			name: 'default',
			line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
		};
	}

	if (node.exportClause && ts.isNamedExports(node.exportClause)) {
		// Return first named export (we'll handle multiple in caller)
		const first = node.exportClause.elements[0];
		if (first) {
			return {
				type: 'named',
				name: first.name.text,
				line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
			};
		}
	}

	return null;
}

/**
 * Extract function information
 */
function extractFunctionInfo(node: ts.FunctionDeclaration, sourceFile: ts.SourceFile): FunctionInfo | null {
	if (!node.name) {
		return null;
	}

	const hasExport = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) || false;
	const isAsync = node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) || false;

	return {
		name: node.name.text,
		isAsync,
		isExported: hasExport,
		paramCount: node.parameters.length,
		line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
	};
}

/**
 * Extract component information
 */
function extractComponentInfo(node: ts.FunctionDeclaration, sourceFile: ts.SourceFile): ComponentInfo | null {
	if (!node.name) {
		return null;
	}

	const name = node.name.text;

	// Components typically start with uppercase
	if (!/^[A-Z]/.test(name)) {
		return null;
	}

	// Check if function returns JSX
	const hasJSXReturn = hasJSXInBody(node.body);

	if (!hasJSXReturn) {
		return null;
	}

	return {
		name,
		isFunctional: true,
		isClass: false,
		line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
	};
}

/**
 * Check if function body contains JSX
 */
function hasJSXInBody(body: ts.Node | undefined): boolean {
	if (!body) {
		return false;
	}

	let hasJSX = false;

	function visit(node: ts.Node) {
		if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) {
			hasJSX = true;
			return;
		}
		ts.forEachChild(node, visit);
	}

	visit(body);
	return hasJSX;
}

/**
 * Extract hook usage
 */
function extractHookUsage(node: ts.CallExpression, sourceFile: ts.SourceFile): HookUsage | null {
	const expression = node.expression;

	if (ts.isIdentifier(expression)) {
		const name = expression.text;

		// Check if it's a React hook
		if (name.startsWith('use')) {
			const pos = sourceFile.getLineAndCharacterOfPosition(node.getStart());
			const isCustom = !REACT_HOOKS.includes(name) && !CONVEX_HOOKS.includes(name);

			return {
				name,
				line: pos.line + 1,
				column: pos.character + 1,
				isCustom,
			};
		}
	}

	return null;
}

/**
 * Extract Convex function information
 */
function extractConvexFunctionInfo(
	declaration: ts.VariableDeclaration,
	sourceFile: ts.SourceFile
): ConvexFunctionInfo | null {
	if (!declaration.initializer || !ts.isCallExpression(declaration.initializer)) {
		return null;
	}

	const callExpr = declaration.initializer;
	const expr = callExpr.expression;

	if (!ts.isIdentifier(expr)) {
		return null;
	}

	const functionType = expr.text;

	if (functionType === 'query' || functionType === 'mutation' || functionType === 'action') {
		const name = declaration.name.getText(sourceFile);

		return {
			type: functionType,
			name,
			line: sourceFile.getLineAndCharacterOfPosition(declaration.getStart()).line + 1,
		};
	}

	return null;
}

/**
 * Known React hooks
 */
const REACT_HOOKS = [
	'useState',
	'useEffect',
	'useContext',
	'useReducer',
	'useCallback',
	'useMemo',
	'useRef',
	'useImperativeHandle',
	'useLayoutEffect',
	'useDebugValue',
	'useDeferredValue',
	'useTransition',
	'useId',
	'useSyncExternalStore',
	'useInsertionEffect',
];

/**
 * Known Convex hooks
 */
const CONVEX_HOOKS = ['useQuery', 'useMutation', 'useAction', 'useConvex', 'useConvexAuth'];

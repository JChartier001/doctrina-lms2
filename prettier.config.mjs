/** @type {import('prettier').Config} */
const config = {
	// Match repo style: use tabs, width inferred by editor
	useTabs: true,
	tabWidth: 2,
	printWidth: 120,
	singleQuote: true,
	trailingComma: 'all',
	semi: true,
	bracketSpacing: true,
	bracketSameLine: false,
	jsxSingleQuote: false,
	arrowParens: 'avoid',
	htmlWhitespaceSensitivity: 'ignore',
	endOfLine: 'lf',
};

export default config;

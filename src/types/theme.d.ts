// theme.d.ts
import '@mui/material/styles';
import { PaletteColorOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
	interface TypeBackground {
		primary: string;
		muted: string;
		accent: string;
		input: string;
	}
	interface TypeText {
		main: string;
		secondary: string;
		default: string;
		muted: string;
		accent: string;
		error: string;
	}
	interface TypeBorder {
		primary: string;
	}
	interface TypeError {
		main: string;
	}
	interface Palette {
		lightBlue: PaletteColorOptions;
		blue: PaletteColorOptions;
	}

	interface BreakpointOverrides {
		xs: true; // enables the usage of the default breakpoint
		sm: true;
		md: true;
		lg: true;
		xl: true;
		xxl: true; // adds a new breakpoint 'xxl'
		xxxl: true; // adds another new breakpoint 'xxxl'
	}
}

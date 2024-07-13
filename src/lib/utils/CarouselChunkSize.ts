import { useTheme, useMediaQuery } from '@mui/material';

export const useChunkSize = () => {
	const theme = useTheme();

	
	const isSmall = useMediaQuery(theme.breakpoints.between('xs', 'md'));//0-1188
	const isMedium = useMediaQuery(theme.breakpoints.between('md', 'lg'));//1188-1560
	const isLarge = useMediaQuery(theme.breakpoints.between('lg', 'xl'));//1560-1920
	const isXLarge = useMediaQuery(theme.breakpoints.between('xl', 'xxl'));//1920-2300
	const isXXLarge = useMediaQuery(theme.breakpoints.between('xxl', 'xxxl'));//2300-2620
	const isXXXLarge = useMediaQuery(theme.breakpoints.between('xxxl', 'xxxxl'));//2620-3000
	const isXXXXLarge = useMediaQuery(theme.breakpoints.up('xxxxl'));

	// Calculate chunk size based on the active breakpoint
	if (isXXXXLarge) return 7;
	if (isXXXLarge) return 6;
	if (isXXLarge) return 5;
	if (isXLarge) return 4;
	if (isLarge) return 3;
	if (isMedium) return 2;
	if (isSmall) return 1;
	

    console.log( isSmall, isMedium, isLarge, isXLarge, isXXLarge, isXXXLarge, isXXXXLarge)
	return 1; // Default to 1 if no other conditions are met
};

export default useChunkSize;

'use client';
import { Logo as LogoComponent } from '@devshop24/component-library';
import { useContext } from 'react';
import { ThemeContext } from '../providers/ThemeContext';

const Logo = () => {
	const { mode } = useContext(ThemeContext);
	return (
		<LogoComponent
			title='Doctrina'
			subtitle={'A New Era For Medical Aesthetics Education'}
			imageSrc={mode ? '/logo.png' : '/logo_light.png'}
			imageAlt='Doctrina'
			avatarSx={{ width: 50, height: 50 }}
			titleSx={{ color: 'primary.dark' }}
			subtitleSx={{ color: 'primary.main' }}
			sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
		/>
	);
};

export default Logo;

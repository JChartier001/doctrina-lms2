'use client';
import React from 'react';
import Link from '@mui/material/Link';
import Logo from '@/components/Logo';

import { Button, Input } from '@devshop24/component-library';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import { useContext, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { ThemeContext } from '../providers/ThemeContext';

import { Container, InputProps, SxProps } from '@mui/material';

interface IconTypes {
	props?: React.SVGProps<SVGSVGElement>;
	className?: string;
}

interface FooterProps {
	navigation: {
		social: { name: string; href: string; icon?: string }[];
		company: { name: string; href: string }[];
		legal: { name: string; href: string }[];
		support?: { name: string; href: string }[];
	};

	color?: string;
	error?: boolean;

	description: string;
	copyright: string;
	overlay?: boolean;

	iconColor: string;
	InputProps?: InputProps;
	opacity?: number;
	bgcolor?: string;
}
type IconKey = 'FACEBOOK' | 'YOUTUBE' | 'TWITTER' | 'INSTAGRAM';

const Footer = ({
	navigation,

	error = false,

	description,
	copyright,
	iconColor = 'text.primary',
}: FooterProps) => {
	const { mode, setMode } = useContext(ThemeContext);
	const ICONMAPPING: {
		[key in IconKey]: ({ props, className }: IconTypes) => JSX.Element;
	} = {
		FACEBOOK: ({ props, className }: IconTypes) => (
			<svg
				fill={'#7b39ed'}
				className={className}
				viewBox='0 0 24 24'
				{...props}
			>
				<path
					fillRule='evenodd'
					d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z'
					clipRule='evenodd'
				/>
			</svg>
		),
		YOUTUBE: ({ props, className }: IconTypes) => (
			<svg
				fill={'#7b39ed'}
				className={className}
				viewBox='0 0 24 24'
				{...props}
			>
				<path
					fillRule='evenodd'
					d='M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z'
					clipRule='evenodd'
				/>
			</svg>
		),
		TWITTER: ({ props, className }: IconTypes) => (
			<svg
				fill={'#7b39ed'}
				className={className}
				viewBox='0 0 24 24'
				{...props}
			>
				<path d='M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' />
			</svg>
		),
		INSTAGRAM: ({ props, className }: IconTypes) => (
			<svg
				fill={'#7b39ed'}
				className={className}
				viewBox='0 0 24 24'
				{...props}
			>
				<path
					fillRule='evenodd'
					d='M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z'
					clipRule='evenodd'
				/>
			</svg>
		),
	};

	return (
		<Container
			maxWidth='xxl'
			sx={{
				height: 500,
				bgcolor: 'background.default',
				borderTop: 1,
				borderColor: 'divider',
				py: 8,
				px: { xs: 5, lg: 10 },
				display: 'flex',
				alignItems: 'center',
				justifyItems: 'center',
				position: 'relative',
			}}
		>
			<Stack sx={{ flexDirection: { md: 'row' }, gap: 5 }}>
				<Stack sx={{ gap: 3, maxWidth: { sm: '50%', lg: '40%' } }}>
					<Logo mode={mode ? 'dark' : 'light'} />

					<Typography variant='body2' color={'text.secondary'}>
						{description && description}
					</Typography>
					<Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
						{navigation?.social.map(item => (
							<Button
								key={item.name}
								sx={{ borderRadius: '50%' }}
								variant='text'
								href={item.href}
							>
								{ICONMAPPING[item?.name?.toUpperCase() as IconKey]({
									props: { color: iconColor },
									className: '',
								})}
							</Button>
						))}
					</Box>
				</Stack>
				<Stack sx={{ flexDirection: 'row', gap: 4, mb: 3 }}>
					<Stack sx={{ gap: 3 }}>
						<Typography sx={{ color: 'text.primary', fontSize: 16 }}>
							Support
						</Typography>

						{navigation?.support?.map(item => (
							<Link
								href={item.href}
								key={item.name}
								underline='none'
								sx={{
									color: 'text.primary',
									opacity: 0.5,
									fontSize: 14,
									p: 0,
								}}
							>
								{item.name}
							</Link>
						))}
					</Stack>
					<Stack sx={{ gap: 3 }}>
						<Typography sx={{ color: 'text.primary', fontSize: 16 }}>
							Company
						</Typography>

						{navigation?.company.map(item => (
							<Link
								href={item.href}
								key={item.name}
								underline='none'
								sx={{
									color: 'text.primary',
									opacity: 0.5,
									fontSize: 14,
									p: 0,
								}}
							>
								{item.name}
							</Link>
						))}
					</Stack>
					<Stack sx={{ gap: 2 }}>
						<Typography sx={{ color: 'text.primary', fontSize: 16 }}>
							Legal
						</Typography>

						{navigation?.legal.map(item => (
							<Link
								href={item.href}
								key={item.name}
								underline='none'
								sx={{
									color: 'text.primary',
									opacity: 0.5,
									fontSize: 14,
									p: 0,
								}}
							>
								{item.name}
							</Link>
						))}
					</Stack>
				</Stack>
			</Stack>
			<Stack sx={{ gap: 2, width: '100%' }}>
				<Typography variant='h4' color={'text.primary'}>
					Subscribe to our newsletter
				</Typography>
				<Typography
					variant='body2'
					sx={{
						color: 'text.primary',
					}}
				>
					The latest news, articles, and resources, sent to your inbox weekly.
				</Typography>
				<Stack sx={{ gap: 2 }}>
					<Input
						type='email'
						name='email-address'
						error={error}
						label='Email address'
						onChange={e => {}}
						value={''}
						variant='outlined'
						InputProps={{
							sx: { color: 'primary.main' },
						}}
						sx={{
							'& .MuiInputLabel-root': { color: 'primary.main' },
							'& .MuiOutlinedInput-notchedOutline': {
								borderColor: 'primary.main',
							},
							'&:hover .MuiOutlinedInput-notchedOutline': {
								borderColor: 'primary.dark',
								borderWidth: 2,
							},
						}}
					/>

					<Button type='submit'>Subscribe</Button>
				</Stack>
				<Typography
					variant='caption'
					sx={{ mt: 2, color: 'text.primary', opacity: 0.3 }}
				>
					{copyright}
				</Typography>
			</Stack>
			{/* <Stack sx={{ isolation: 'isolate', margin: 'auto' }}>
				<Box
					sx={{
						position: 'absolute',
						left: '50%',
						top: 0,
						transform: 'translateX(-50%)',
						width: '100%',
						height: '100%',
						bgcolor: 'transparent',
						// filter: "blur(12px)",
						zIndex: 0,
						'&:before': {
							content: '""',
							display: 'block',
							position: 'absolute',
							width: '100%',
							height: '100%',
							background: `linear-gradient(to top right, #1B7DA2, #c34cd7,#8350FF)`,
							opacity: 0.5,
						},
					}}
					aria-hidden='true'
				/>
			</Stack> */}
		</Container>
	);
};

export default Footer;

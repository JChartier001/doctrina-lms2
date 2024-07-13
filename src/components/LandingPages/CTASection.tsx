import { Button } from '@devshop24/component-library';
import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link, SxProps, Box } from '@mui/material';
import { grey } from '@mui/material/colors';

interface CTASectionProps {
	title: string | React.ReactNode;
	description: string | React.ReactNode;
	titleSx?: SxProps;
	descriptionSx?: SxProps;
	href: string;
	id?: string;
	learnMoreSx?: SxProps;
}

const CTASection = ({
	title,
	description,
	href,
	id,
	learnMoreSx,
	titleSx,
	descriptionSx,
}: CTASectionProps) => {
	return (
		<Stack sx={{ background: grey[900], p: 10, position: 'relative' }} id={id}>
			<Box
				sx={{
					position: 'absolute',
					left: '50%',
					top: 0,
					transform: 'translateX(-50%)',
					width: '100%',
					height: '100%',
					bgcolor: 'transparent',
					// filter: "blur(64px)",
					zIndex: 1,
					'&:before': {
						content: '""',
						display: 'block',
						position: 'absolute',
						width: '100%',
						height: '100%',
						background: `linear-gradient(to bottom left, #1B7DA2, #c34cd7,#8350FF)`,
						opacity: 0.5,
					},
				}}
				aria-hidden='true'
			/>
			<Stack sx={{ width: '80%', m: 'auto', gap: 3, zIndex: 10 }}>
				<Typography
					variant='h3'
					sx={{ color: 'text.onDark', textAlign: 'center', ...titleSx }}
				>
					{title}
				</Typography>
				<Typography
					paragraph
					sx={{
						color: 'text.onDark',
						textAlign: 'center',
						opacity: 0.8,
						...descriptionSx,
					}}
				>
					{description}
				</Typography>
				<Stack
					sx={{
						maxWidth: '500px',
						minWidth: '300px',
						flexDirection: 'row',
						gap: 2,
						m: 'auto',
						alignItems: 'center',
					}}
				>
					<Button href={href} variant={'outlined'}>
						Get started
					</Button>
					<Link
						href='#'
						underline='none'
						sx={{
							color: 'white',
							textAlign: 'center',
							width: 'fit-content',
							...learnMoreSx,
						}}
					>
						Learn more <span aria-hidden='true'>→</span>
					</Link>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default CTASection;

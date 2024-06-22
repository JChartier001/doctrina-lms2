import {Button} from '@devshop24/component-library';
import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from '@mui/material';

interface CTASectionProps {
	title: string | React.ReactNode;
	description: string | React.ReactNode;
	href: string;
	id?: string;
}

const CTASection = ({ title, description, href, id }: CTASectionProps) => {
	return (
		<Stack sx={{ p: 10 }} id={id}>
			<Stack sx={{ width: '80%', m: 'auto', gap: 3 }}>
				<Typography variant='h3' sx={{ color: 'white', textAlign: 'center' }}>
					{title}
				</Typography>
				<Typography paragraph sx={{ color: 'text.muted', textAlign: 'center' }}>
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
						sx={{ color: 'white', textAlign: 'center', width: 'fit-content' }}
					>
						Learn more <span aria-hidden='true'>→</span>
					</Link>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default CTASection;

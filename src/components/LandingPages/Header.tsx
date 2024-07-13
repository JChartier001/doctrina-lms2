import Stack from '@mui/material/Stack';

import { user } from '@/app/layout';
import { grey } from '@mui/material/colors';
import {
	UserButton,
	LoginButtons,
	Logo,
	MobileMenu,
} from '@devshop24/component-library';

import { Box, Link } from '@mui/material';

const navigation = [
	{ name: 'Home', href: '/' },
	{ name: 'Farmers', href: '/farmer' },
	{ name: 'Customers', href: '#' },
	{ name: 'Shop', href: '/store' },
	{ name: 'ContactUs', href: '#contact-us' },
];

interface HeaderProps {
	title: React.ReactNode;
	subtitle: React.ReactNode | string;
	action: JSX.Element;
	action2?: JSX.Element;
}

const Header = async ({ title, subtitle, action, action2 }: HeaderProps) => {


	const items =
		user?.role === 'INSTRUCTOR'
			? [
					{ label: 'Dashboard', href: `/u/${user?.username}` },
					{ label: 'Profile', href: `/u/${user?.username}/profile` },
					{ label: 'Farms', href: `/farm` },
					{ label: 'Logout', href: 'logout' },
				]
			: [
					{ label: 'Dashboard', href: `/u/${user?.username}` },
					{ label: 'Profile', href: `/u/${user?.username}/profile` },
					{ label: 'Logout', href: 'logout' },
				];

	return (
		<Stack
			sx={{ bgcolor: grey[900], height: 750, px: 1, position: 'relative' }}
		>
			<Stack
				sx={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					p: 2,
					zIndex: 10,
				}}
			>
				<Stack flexDirection='row' alignItems='center'>
					<Stack sx={{ display: { xs: 'flex', lg: 'none' } }}>
						<MobileMenu
							content={
								<Stack sx={{ p: 2, gap: 2 }}>
									{navigation.map(item => (
										<Link
											key={item.name}
											href={item.href}
											sx={{
												fontSize: '1rem',
												textDecoration: 'none',
											}}
										>
											{item.name}
										</Link>
									))}
								</Stack>
							}
							title='Menu'
						/>
					</Stack>
					<Logo
						title={'Doctrina'}
						subtitle={'A New Era For Medical Aesthetics Education'}
						imageSrc={'/logo1.png'}
						titleSx={{ color: 'text.onDark' }}
						subtitleSx={{ color: 'text.onDarkMuted' }}
						imageAlt={'Farm2Table'}
						sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
					/>
				</Stack>
				<Stack
					sx={{
						display: { xs: 'none', lg: 'flex' },
						flexDirection: 'row',
						gap: { xs: 3, lg: 10 },
					}}
				>
					{navigation.map(item => (
						<Link
							key={item.name}
							href={item.href}
							sx={{ color: 'white', fontSize: '1rem', textDecoration: 'none' }}
						>
							{item.name}
						</Link>
					))}
				</Stack>
				<Stack>
					{!user ? (
						<LoginButtons signUpButtonSx={{ color: 'text.onDark' }} />
					) : (
						<UserButton
							name={user.name}
							username={user.username}
							items={items}
							image={user.image}
						/>
					)}
				</Stack>
			</Stack>
			<Stack sx={{ isolation: 'isolate', margin: 'auto' }}>
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
						zIndex: 1,
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
				<Stack sx={{ zIndex: 50, gap: 2 }}>
					{title}
					{subtitle}

					<Box
						sx={{
							mt: 5,
							display: 'flex',
							flexDirection: {
								xs: 'column',
								sm: 'row',
							},
							alignItems: 'center',
							justifyContent: 'center',
							gap: 3,
							mx: '1.25rem',
						}}
					>
						{action}
						{action2}
					</Box>
				</Stack>
			</Stack>
		</Stack>
	);
};
export default Header;

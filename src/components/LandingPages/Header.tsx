import Stack from '@mui/material/Stack';

import { user } from '@/app/layout';
import { grey } from '@mui/material/colors';
import {
	UserButton,
	LoginButtons,
	MobileMenu,
} from '@devshop24/component-library';
import Logo from '@/components/Logo';

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
					{ label: 'Browse', href: `/browse` },
					{ label: 'Courses', href: '/instructor/courses' },
					{ label: 'Analytics', href: '/instructor/analytics' },
					{ label: 'Settings', href: '/instructor/account' },

					// <ListItemText
					// 	key='logout'
					// 	onClick={() => {
					// 		signOut();
					// 		router.push('/');
					// 	}}
					// >
					// 	Logout
					// </ListItemText>,
				]
			: [
					{ label: 'Dashboard', href: `/u/${user?.username}` },
					{ label: 'Profile', href: `/u/${user?.username}/profile` },
					{ label: 'Browse', href: `/browse` },
					{ label: 'Favorites', href: `/u/${user?.username}/favorites` },
					{ label: 'Messages', href: `/u/${user?.username}/messages` },
					{ label: 'Logout', href: 'logout' },
				];


	return (
		<Stack
			sx={{ bgcolor: grey[900], height: 750, position: 'relative' }}
		>
			<Stack
				sx={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					zIndex: 10,
				}}
			>
				<Stack flexDirection='row' alignItems='center'>
					<Logo
						
						color="white"
						sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', p:2 }}
					/>
					<Stack sx={{ display: { xs: 'flex', md: 'none' } }}>
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
				</Stack>
				<Stack
					sx={{
						display: { xs: 'none', md: 'flex' },
						flexDirection: 'row',
						gap: { xs: 3, md: 10 },
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
				<Stack sx={{ zIndex: 50, gap: 2, mt: { xs: -10, sm:-20 } }}>
					{title}
					{subtitle}

					<Box
						sx={{
							mt: {xs: 2, md: 4},
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

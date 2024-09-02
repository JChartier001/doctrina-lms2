// import React from 'react';
// import Logo from './Logo';
// import Stack from '@mui/material/Stack';
// import { LoginButtons, UserButton } from '@devshop24/component-library';
// import { Box, Link } from '@mui/material';
// import { SxProps } from '@mui/system';

// interface HeaderProps {
// 	title: React.ReactNode;
// 	subtitle: React.ReactNode | string;
// 	action: JSX.Element;
// 	action2?: JSX.Element;
// 	navigation: { name: string; href: string }[];
// 	logoTitle: string;
// 	logoSubtitle: string;
// 	logoImage: string;
// 	navigationSx: SxProps;
// 	logoTitleSx?: SxProps;
// 	logoSubtitleSx?: SxProps;
// 	secondary?: string;
// 	primary?: string;
// 	user?: {
// 		name: string | null;
// 		image: string | null;
// 		username: string | null;
// 		role: string | null;
// 		items: {
// 			label: string;
// 			href: string;
// 		}[];
// 	};
// }

// const MainHeader = ({
// 	title,
// 	subtitle,
// 	action,
// 	user,
// 	navigation,
// 	navigationSx,
// }: HeaderProps) => {
// 	return (
// 		// <Stack sx={{ height: 600, px: 1 }}>
// 		//   <Stack
// 		//     sx={{
// 		//       flexDirection: 'row',
// 		//       justifyContent: 'space-between',
// 		//       alignItems: 'center',
// 		//       p: 2,
// 		//       zIndex: 10,
// 		//       bgcolor: 'background.default'
// 		//     }}
// 		//   >
// 		//     <Logo
// 		//       title={logoTitle}
// 		//       subtitle={logoSubtitle}
// 		//       imageSrc={logoImage}
// 		//       titleSx={logoTitleSx}
// 		//       subtitleSx={logoSubtitleSx}
// 		//       imageAlt={logoTitle}
// 		//     />

// 		//     <Stack sx={{ flexDirection: 'row', gap: { xs: 3, lg: 10 }, zIndex: 10 }}>
// 		//       {navigation.map((item) => (
// 		//         <Link key={item.name} href={item.href} sx={{ ...navigationSx, fontSize: '1rem', textDecoration: 'none' }}>
// 		//           {item.name}
// 		//         </Link>
// 		//       ))}
// 		//     </Stack>
// 		//     <Stack>
// 		//       {!user ? (
// 		//         <>
// 		//           <LoginButtons textColor={loginTextColor ? loginTextColor : 'white'} />
// 		//         </>
// 		//       ) : (
// 		//         <UserButton name={user.name} username={user.username} items={user.items} image={user.image} />
// 		//       )}
// 		//     </Stack>
// 		//   </Stack>
// 		//   <Stack sx={{ margin: 'auto' }}>
// 		//     {title}
// 		//     {subtitle}
// 		//     <Box
// 		//       sx={{
// 		//         mt: '2.5rem',
// 		//         display: 'flex',
// 		//         flexDirection: {
// 		//           xs: 'column',
// 		//           sm: 'row',
// 		//         },
// 		//         alignItems: 'center',
// 		//         justifyContent: 'center',
// 		//         gap: 3,
// 		//         mx: '1.25rem',
// 		//       }}
// 		//     >
// 		//       {action}
// 		//     </Box>
// 		//   </Stack>
// 		// </Stack>

// 		// <Stack sx={{ height: 600, px: 1 }}>
// 		//   <Stack
// 		//     sx={{
// 		//       flexDirection: "row",
// 		//       justifyContent: "space-between",
// 		//       alignItems: "center",
// 		//       p: 2,
// 		//       zIndex: 10,
// 		//       bgcolor: "'#262626",
// 		//     }}
// 		//   >
// 		//     <Stack flexDirection="row" alignItems="center">
// 		//       <Logo
// 		//             title={logoTitle}
// 		//             subtitle={logoSubtitle}
// 		//             imageSrc={logoImage}
// 		//             titleSx={logoTitleSx}
// 		//             subtitleSx={logoSubtitleSx}
// 		//             imageAlt={logoTitle}
// 		//           />

// 		//       <Stack sx={{ flexDirection: 'row', gap: { xs: 3, lg: 10 }, zIndex: 10 }}>
// 		//       {navigation.map((item) => (
// 		//         <Link
// 		//           key={item.name}
// 		//           href={item.href}
// 		//           sx={{ color: "white", fontSize: "1rem", textDecoration: "none" }}
// 		//         >
// 		//           {item.name}
// 		//         </Link>
// 		//       ))}
// 		//     </Stack>
// 		//     <Stack>
// 		//       {!user ? (
// 		//           <LoginButtons textColor={loginTextColor ? loginTextColor : 'white'} />
// 		//       ) : (
// 		//             <UserButton name={user.name} username={user.username} items={user.items} image={user.image} />
// 		//       )}
// 		//     </Stack>
// 		//   </Stack>
// 		//   <Stack sx={{ isolation: "isolate", margin: "auto" }}>
// 		//     <Box
// 		//       sx={{
// 		//         position: "absolute",
// 		//         left: '50%',
// 		//         top: 0,
// 		//         transform: "translateX(-50%)",
// 		//         width: "100%",
// 		//         height: "100%",
// 		//         bgcolor: 'transparent',
// 		//         "&:before": {
// 		//           content: '""',
// 		//           display: "block",
// 		//           position: "absolute",
// 		//           width: "100%",
// 		//           height: "100%",
// 		//           background: `linear-gradient(to top right, #FF4040, #800080)`, // Coral to purple in hex
// 		//           opacity: 0.3,
// 		//           clipPath: "polygon(25.9% 44.1%, 0% 61.6%, 2.5% 26.9%, 14.5% 0.1%, 19.3% 2%, 27.5% 32.5%, 39.8% 62.4%, 47.6% 68.1%, 52.5% 58.3%, 54.8% 34.5%, 72.5% 76.7%, 99.9% 64.9%, 82.1% 100%, 72.4% 76.8%, 23.9% 97.7%, 25.9% 44.1%)",
// 		//           filter: 'blur(12px)', // Added blur effect
// 		//         }
// 		//       }}
// 		//       aria-hidden="true"
// 		//     />
// 		//     {title}
// 		//     {subtitle}
// 		//     <Box
// 		//       sx={{
// 		//         mt: "2.5rem",
// 		//         display: "flex",
// 		//         flexDirection: { xs: "column", sm: "row" },
// 		//         alignItems: "center",
// 		//         justifyContent: "center",
// 		//         gap: 3,
// 		//         mx: "1.25rem",
// 		//       }}
// 		//     >
// 		//       {action}

// 		//   </Box>
// 		// </Stack>
// 		//   <Box
// 		//     sx={{
// 		//       position: "absolute",
// 		//       insetX: 0,
// 		//       top: { xs: "calc(100%-13rem)", sm: "calc(100%-30rem)" },
// 		//       zIndex: -10,
// 		//       overflow: "hidden",
// 		//       transform: "translateZ(0)",
// 		//       filter: "blur(48px)",
// 		//     }}
// 		//   ></Box>
// 		//   </Stack>
// 		//   </Stack>
// 		<Stack sx={{ height: 600, px: 1, bgcolor: '#262626' }}>
// 			<Stack
// 				sx={{
// 					flexDirection: 'row',
// 					justifyContent: 'space-between',
// 					alignItems: 'center',
// 					p: 2,
// 					zIndex: 10,
// 				}}
// 			>
// 				<Logo color='primary.contrastText' />
// 				<Stack
// 					sx={{ flexDirection: 'row', gap: { xs: 3, lg: 10 }, zIndex: 10 }}
// 				>
// 					{navigation.map(item => (
// 						<Link
// 							key={item.name}
// 							href={item.href}
// 							sx={{ ...navigationSx, fontSize: '1rem', textDecoration: 'none' }}
// 						>
// 							{item.name}
// 						</Link>
// 					))}
// 				</Stack>
// 				<Stack>
// 					{!user ? (
// 						<>
// 							<LoginButtons />
// 						</>
// 					) : (
// 						<UserButton
// 							name={user.name}
// 							username={user.username}
// 							items={user.items}
// 							image={user.image}
// 						/>
// 					)}
// 				</Stack>
// 			</Stack>
// 			<Stack sx={{ isolation: 'isolate', margin: 'auto' }}>
// 				<Box
// 					sx={{
// 						position: 'absolute',
// 						left: '50%',
// 						top: 0,
// 						transform: 'translateX(-50%)',
// 						width: '100%',
// 						height: 600,
// 						bgcolor: 'transparent',
// 						// filter: "blur(12px)",
// 						zIndex: 1,
// 						'&:before': {
// 							content: '""',
// 							display: 'block',
// 							position: 'absolute',
// 							width: '100%',
// 							height: '100%',
// 							background: `linear-gradient(to top right, #1B7DA2, #c34cd7,#8350FF)`,
// 							opacity: 0.5,
// 							zIndex: 1,
// 						},
// 					}}
// 					aria-hidden='true'
// 				/>
// 				{title}
// 				{subtitle}
// 				<Box
// 					sx={{
// 						mt: '2.5rem',
// 						display: 'flex',
// 						flexDirection: { xs: 'column', sm: 'row' },
// 						alignItems: 'center',
// 						justifyContent: 'center',
// 						gap: 3,
// 						mx: '1.25rem',
// 					}}
// 				>
// 					{action}
// 				</Box>
// 			</Stack>
// 		</Stack>
// 	);
// };
// export default MainHeader;

import {
	LoginButtons,
	MobileMenu,
	UserButton,
} from '@devshop24/component-library';
import { Box, Link, MenuItem, Select, SxProps } from '@mui/material';
import { grey } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import { useColorScheme } from '@mui/material/styles';
import ThemeToggle from './ThemeToggle';
import Logo from '@/components/Logo';

// import { getCurrentUser } from '@/actions/user';
//
const navigation = [
	{ name: 'Home', href: '/' },
	{ name: 'Instructors', href: '/instructor' },
	{ name: 'Students', href: '#' },
	{ name: 'Browse Courses', href: '/browse' },
	{ name: 'Contact Us', href: '#contact-us' },
];

interface HeaderProps {
	title: React.ReactNode;
	subtitle: React.ReactNode | string;
	action: JSX.Element;
	navigation: { name: string; href: string }[];
	navigationSx: SxProps;
	user?: {
		name: string | null;
		image: string | null;
		username: string | null;
		role: string | null;
		items: {
			label: string;
			href: string;
		}[];
	};
}

const Header = ({ title, subtitle, action, navigation }: HeaderProps) => {
	// const user = await getCurrentUser();

	const user = {
		name: 'John Doe',
		image: 'https://randomuser.me/api/portraits',
		items: [
			{ label: 'Profile', href: '/profile' },
			{ label: 'Logout', href: '/logout' },
		],
		username: 'johndoe',
		role: 'Instructor',
	};

	const items =
		user?.role === 'INSTRUCTOR'
			? [
					{ label: 'Dashboard', href: `/u/${user?.username}` },
					{ label: 'Profile', href: `/u/${user?.username}/profile` },
					{ label: 'Instructors', href: `/instructor` },
					{ label: 'Logout', href: 'logout' },
				]
			: [
					{ label: 'Dashboard', href: `/u/${user?.username}` },
					{ label: 'Profile', href: `/u/${user?.username}/profile` },
					{ label: 'Logout', href: 'logout' },
				];

	return (
		<Stack sx={{ height: 750, px: 1, position: 'relative' }}>
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
					<Logo />
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
							sx={{
								color: 'white',
								fontSize: '1rem',
								textDecoration: 'none',
							}}
						>
							{item.name}
						</Link>
					))}
				</Stack>
				<Stack>
					<ThemeToggle />
					{!user ? (
						<LoginButtons signInButtonSx={{ color: 'primary.contrastText' }} />
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
					</Box>
				</Stack>
			</Stack>
		</Stack>
	);
};
export default Header;

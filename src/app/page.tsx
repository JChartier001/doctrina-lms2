import React from 'react';
import { Logo } from '@devshop24/component-library';
import Stack from '@mui/material/Stack';
import Features from '@/components/LandingPages/Features';
import { Box, Typography } from '@mui/material';
import ContactUs from '@/components/LandingPages/ContactUs';
import NewsletterModal from '@/components/NewsletterModal';
export default function Home() {
	return (
		<Stack>
			<Stack sx={{ height: 700, px: 1, bgcolor: '#262626' }}>
				<Stack
					sx={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						p: 2,
						zIndex: 10,
					}}
				>
					<Logo
						title={'Doctrina'}
						subtitle={'Revolutionizing Fresh. Reinventing Local'}
						imageSrc={'/logo1.png'}
						titleSx={{ color: 'white' }}
						subtitleSx={{ color: 'white' }}
						imageAlt={'Doctrina'}
						sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
					/>
				</Stack>
				<Stack sx={{ isolation: 'isolate', margin: 'auto' }}>
					<Box
						sx={{
							position: 'absolute',
							left: '50%',
							top: 0,
							transform: 'translateX(-50%)',
							width: '100%',
							height: 700,

							filter: 'blur(64px)',
							'&:before': {
								content: '""',
								display: 'block',
								position: 'absolute',
								width: '100%',
								height: 700,
								background: `linear-gradient(to top right, #1B7DA2, #c34cd7,#8350FF)`, // Coral to purple in hex
								opacity: 0.3,
							},
						}}
						aria-hidden='true'
					/>
					<Stack sx={{ px: { xs: 2, lg: 20 }, py: { xs: 2, lg: 10 } }}>
						<Stack
							key={0}
							sx={{
								justifyContent: 'center',
								alignItems: 'center',
								textAlign: 'center',
							}}
						>
							<Stack direction={'row'} gap={2}>
								<Typography
									key={0}
									variant='h1'
									sx={{
										color: 'primary.main',
										fontSize: { xs: '2rem', md: '3rem' },
									}}
								>
									Revolutionizing{' '}
								</Typography>
								<Typography
									variant='h1'
									component='span'
									sx={{ color: 'white', fontSize: { xs: '2rem', md: '3rem' } }}
								>
									Medical Aesthetics
								</Typography>

								<Typography
									variant='h1'
									component='span'
									sx={{
										color: 'primary.main',
										fontSize: { xs: '2rem', md: '3rem' },
									}}
								>
									Education
								</Typography>
							</Stack>
						</Stack>
						<Typography
							paragraph
							variant='h3'
							fontWeight={'normal'}
							color='white'
							textAlign='center'
							mt={2}
						>
							Join the Future of Learning with DoctrinaLMS
						</Typography>
						<Typography paragraph color={'text.disabled'}>
							DoctrinaLMS is launching soon! Our innovative platform offers
							comprehensive courses and resources to empower medical aesthetics
							professionals. Stay tuned for expert-led content, advanced course
							creation tools, and a vibrant community dedicated to excellence.
						</Typography>

						<Box
							sx={{
								mt: '2.5rem',
								display: 'flex',

								alignItems: 'center',
								justifyContent: 'center',
								gap: 5,
							}}
						>
							<Stack alignItems={'center'} gap={2}>
								<Typography variant='h5' color='white'>
									Be the First to Know!
								</Typography>
								<Typography paragraph color='white'>
									Sign up to receive updates and early access
								</Typography>
								<NewsletterModal />
							</Stack>
						</Box>
					</Stack>
				</Stack>
			</Stack>

			<Features
				features={[
					{
						name: 'Intuitive Course Creation',
						description:
							'Effortlessly design and publish your courses, quizzes, and tests. Our tools make it simple to create engaging and impactful learning experiences for your students.',
					},
					{
						name: 'Engaging Content Options',
						description:
							'Deliver your courses with flexibility through live streams, voice-over presentations, and private or public settings. Cater to diverse learning preferences and keep students engaged.',
					},
					{
						name: 'Direct Communication Channels',
						description:
							'Build a strong learning community with built-in messaging and email support. Foster direct and meaningful interactions between you and your students.',
					},
					{
						name: 'Advanced Analytics',
						description:
							'Monitor course performance and student engagement with our analytics. Use these insights to tailor your content and teaching strategies for optimal learning outcomes.',
					},
					{
						name: 'Powerful Marketing & SEO',
						description:
							"Attract more students with our integrated marketing tools and built-in SEO. Use email marketing and marketing funnels to increase your course's visibility and reach.",
					},
					{
						name: 'Customizable Teaching Experience',
						description:
							'Adapt the platform to your teaching style with features like live class scheduling, survey creation for feedback, and co-instructor collaboration. Create a unique and effective learning environment that meets the needs of your students.',
					},
				]}
				title={'Learn.Teach.Grow'}
				subtitle='Discover a platform that adapts to your evolving educational and teaching needs in the field of medical aesthetics'
			/>
			<ContactUs />
		</Stack>
	);
}

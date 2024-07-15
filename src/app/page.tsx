import React from 'react';
import Header from '@/components/LandingPages/Header';
import Features from '@/components/LandingPages/Features';
import FAQs from '@/components/LandingPages/FAQs';
import TrendingCourses from '@/components/LandingPages/TrendingCourses';
import ContactUs from '@/components/LandingPages/ContactUs';
import CTASection from '@/components/LandingPages/CTASection';
import Footer from '@/components/LandingPages/Footer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button } from '@devshop24/component-library';

const LandingPage = () => {
	return (
		<Stack
			sx={{ p: 0, m: 0, overflow: 'hidden', bgcolor: '#262626', width: '100%' }}
		>
			<Header
				title={
					<Stack
						sx={{
							justifyContent: 'center',
							alignItems: 'center',
							// textAlign: 'center',
						}}
					>
						<Typography
							variant='h1'
							sx={{
								color: 'text.onDark',
							}}
						>
							Doctrina
						</Typography>
					</Stack>
				}
				subtitle={
					<Stack alignItems={'center'} sx={{ gap: 2 }}>
						<Typography
							variant='h3'
							sx={{
								color: 'text.onDark',
								opacity: 0.9,
								textAlign: 'center',
							}}
						>
							A New Era For Medical Aesthetics Education
						</Typography>
						<Typography
							textAlign={'center'}
							paragraph
							sx={{ color: 'text.disabled', width: '80%' }}
						>
							Doctrina LMS is a next-generation education platform and
							management system for medical aesthetic professionals. Designed
							from the ground up to connect educators and students with all the
							tools needed to make the learning experience more efficient and
							effective.
						</Typography>{' '}
					</Stack>
				}
				action={
					<Button
						href='/register'
						color='primary'
						sx={{
							height: '40px',
							width: '250px',
						}}
					>
						Try Now
					</Button>
				}
				action2={
					<Button
						variant='outlined'
						color='primary'
						href='/membership'
						sx={{
							height: '40px',
							width: '250px',
							color: 'white',
						}}
					>
						Explore
					</Button>
				}
			/>

			<Features
				features={[
					{
						name: 'Versatile Course Creation',
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
						name: 'Insightful Analytics',
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
				title={<Typography variant='h1'>Learn.Teach.Grow</Typography>}
				subtitle='Discover a platform that adapts to your evolving educational and teaching needs in the field of medical aesthetics'
			/>
			<CTASection
				title={'Lead the Next Generation in Medical Aesthetics'}
				href='/membership'
				description={
					'Transform your knowledge into impact on Doctrina, the go-to platform for medical aesthetic professionals. Create, manage, and sell your courses to an engaged audience across the US eager to learn. With our intuitive tools and comprehensive support, turning your expertise into a thriving online course has never been easier. Join our community of esteemed instructors and shape the future of medical aesthetics.'
				}
			/>
			<FAQs
				faqs={[
					{
						question: 'Why you should use Doctrina',
						answer:
							'Doctrina is an online learning platform for medical aesthetic professionals. Our platform offers a wide range of courses and classes taught by experienced professionals in the field. Our goal is to help professionals like you stay current in the fast-paced world of medical aesthetics and advance your career.',
					},
					{
						question: 'Can I sell my own courses on Doctrina?',
						answer:
							'Doctrina offers industry leaders like you the opportunity to create and sell your own courses, reaching thousands of professionals and monetizing your expertise. Our platform is easy to use and includes dedicated support. Sign up now and start earning money by sharing your knowledge.',
					},
					{
						question: 'What types of courses are offered on Doctrina?',
						answer:
							'Our platform offers a wide range of courses and classes, including the latest techniques in injectables, laser technology, and much more. We pride ourselves on providing the most relevant and up-to-date content in the industry.',
					},
					{
						question: 'Can I take courses on my own schedule?',
						answer:
							'Yes! Our platform allows you to take classes online, at your own pace, and on your own schedule. This means you can fit learning into your busy schedule and not have to worry about traveling to a physical location for classes.',
					},
					{
						question:
							'How do I update or manage my course content on Doctrina?',
						answer:
							"Managing and updating your courses on Doctrina is straightforward. Our platform provides instructors with intuitive tools to edit course materials, upload new content, and adjust course settings at any time. This ensures your offerings remain up-to-date and relevant to your students' needs.",
					},
					{
						question:
							'What support does Doctrina offer if I encounter technical issues?',
						answer:
							'Doctrina is here to help you navigate any technical challenges you might face. Our dedicated support team is available via email to assist with any issues, ensuring a smooth teaching and learning experience. For more immediate concerns, upgraded plans offer additional support channels, including phone assistance.',
					},
				]}
			/>

			<CTASection
				title={'Learn From the Best, Shape Your Future'}
				href='/browse'
				description={
					"Elevate your skills in the medical aesthetics field with Doctrina's curated selection of courses. Learn from industry leaders, access cutting-edge techniques, and tailor your education to fit your schedule. Whether you're just starting or looking to advance, our platform provides the resources needed to succeed. Embark on your journey to excellence with us today."
				}
			/>
			<TrendingCourses />
			<ContactUs />
			<Footer />
		</Stack>
	);
};

export default LandingPage;

'use client';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import CourseCard from '@/components/CourseCard';
import { courses } from '../../../data';
import { useChunkSize } from '@/lib/utils/CarouselChunkSize';
import { useEffect } from 'react';

import { ComponentCarousel } from '@devshop24/component-library';

const TrendingCourses = () => {
	const chunkSize = useChunkSize();
	useEffect(() => {
		console.log(window.innerWidth, 'innerWidth');
	}, []);

	const slides = courses.map(course => (
		<CourseCard
			{...course}
			imageUrl={`${course.imageUrl}`}
			price={Number(course.price)}
			chaptersLength={course.chapters.length}
			category={`${course.category?.name}`}
			progress={null}
			key={course.id}
		/>
	));

	console.log(chunkSize);

	return (
		<Stack
			sx={{
				bgcolor: 'white',
				py: { xs: 5, sm: 10, md: 15, lg: 20 },
				px: { xs: 2, sm: 20 },
				overflow: 'hidden',
				gap: 2,
			}}
		>
			<Stack
				sx={{
					flexDirection: { xs: 'column', md: 'row' },
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<Typography variant='h3'>Trending Courses</Typography>
				<Box mt={2}>
					<Link href='/store' sx={{ textDecoration: 'none' }}>
						Browse all courses
						<Typography component='span' aria-hidden='true'>
							{' '}
							&rarr;
						</Typography>
					</Link>
				</Box>
			</Stack>

			<ComponentCarousel
				slides={slides}
				sx={{}}
				chunkSize={chunkSize}
				animation='fade'
			/>
		</Stack>
	);
};
export default TrendingCourses;

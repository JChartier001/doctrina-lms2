'use client';
import Progress from '@/components/Progress';
import { Rating, Card, Currency } from '@devshop24/component-library';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';

interface CourseCardProps {
  title: string;
  imageUrl: string;
  chaptersLength: number;
  price: number;
  progress: number | null;
  category: string;
  slug: string;
  rating?: number;
  ratingCount?: number;
}

export const CourseCard = ({
  title,
  imageUrl,
  chaptersLength,
  price,
  progress,
  category,
  slug,
  rating,
  ratingCount,
}: CourseCardProps) => {
  const router = useRouter();

  return (
		<Card
			sx={{
				minWidth: { xs: 300 },
				maxWidth: { xs: 300 },
				height: '100%',
				cursor: 'pointer',
			}}
			onClick={() => router.push(`/courses/${slug}`)}
			imgHeight={200}
			imgAlt={title}
			imgSrc={imageUrl}
			cardContent={
				<Stack sx={{ gap: 2 }}>
					<Typography
						variant='h5'
						sx={{
							height: { xs: 25 },
							overflow: { xs: 'hidden' },
							textWrap: { xs: 'nowrap' },
							textOverflow: 'ellipsis',
						}}
					>
						{title}
					</Typography>
					<Stack
						direction='row'
						justifyContent={'space-between'}
						alignItems={'center'}
					>
						<Typography
							variant='body2'
							sx={{
								maxWidth: '70%',
								overflow: { xs: 'hidden' },
								textWrap: { xs: 'nowrap' },
								textOverflow: 'ellipsis',
							}}
						>
							{' '}
							{category}
						</Typography>
						<Currency value={price} label={''} />
					</Stack>
					<Rating
						initialRating={rating}
						count={ratingCount}
						size={'medium'}
						readOnly
					/>
					{chaptersLength} {chaptersLength === 1 ? 'Chapter' : 'Chapters'}
					<Progress progress={progress} />
				</Stack>
			}
		/>

		// <Link href={`/courses/${slug}`}>
		//   <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-3 h-full">
		//     <div className="relative w-full aspect-video rounded-md overflow-hidden">
		//       <Image fill className="object-cover" alt={title} src={imageUrl} />
		//     </div>
		//     <div className="flex flex-col pt-2">
		//       <div className="text-lg md:text-base font-medium group-hover:text-sky-700 transition line-clamp-2">
		//         {title}
		//       </div>
		//       <div className="flex justify-between">
		//         <p className="text-xs text-muted-foreground">{category}</p>
		//         {rating !== undefined && ratingCount !== undefined && (
		//           <Rating initialRating={rating} count={ratingCount} color={'orange'}  />
		//         )}
		//       </div>
		//       <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
		//         <div className="flex items-center gap-x-1 text-slate-500">
		//           {/* <IconBadge size="sm" icon={BookOpen} /> */}
		//           <span>
		//             {chaptersLength} {chaptersLength === 1 ? 'Chapter' : 'Chapters'}
		//           </span>
		//         </div>
		//       </div>
		//       {progress !== null ? (
		//         <CourseProgress variant={progress === 100 ? 'success' : 'default'} size="sm" value={progress} />
		//       ) : (
		//         <p className="text-md md:text-sm font-medium text-slate-700">{formatPrice(price)}</p>
		//       )}
		//     </div>
		//   </div>
		// </Link>
	);
};
export default CourseCard;

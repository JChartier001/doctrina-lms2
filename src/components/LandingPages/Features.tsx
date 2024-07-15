import Box from "@mui/material/Box";
import Check from "@mui/icons-material/Check";
import Grid from "@mui/material/Grid";
import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface FeatureProps {
	features: Feature[];
	title: string | React.ReactNode;
	subtitle: string | React.ReactNode;
}

type Feature = {
  name: string;
  description: string;
};

const Features = ({ features, title, subtitle }: FeatureProps) => {
  return (
		<Box
			sx={{
				bgcolor: 'white',
				py: { xs: 5, sm: 10, md: 15, lg: 20 },
				px: { xs: 2, sm: 20 },
			}}
		>
			<Box
				sx={{
					display: { xs: 'column', md: 'flex' },
					flexDirection: 'row',
					mx: 'auto',
					gap: 5,
				}}
			>
				<Stack
					sx={{ width: { xs: '100%', lg: '70%' }, justifyContent: 'center' }}
				>
					<Typography
						variant='subtitle1'
						component='h2'
						sx={{
							fontSize: 'base',
							fontWeight: 'bold',
							lineHeight: 'snug',
							color: 'primary.main',
						}}
					>
						Everything you need
					</Typography>

					{title}

					<Typography
						sx={{
							mt: 6,
							fontSize: 'base',
							lineHeight: 'snug',
							color: 'neutral.600',
						}}
					>
						{subtitle}
					</Typography>
				</Stack>
				<Grid container spacing={3} sx={{ mt: { xs: 2, md: 0 } }}>
					{features &&
						features.map(feature => (
							<Grid
								item
								lg={6}
								key={feature.name}
								sx={{
									position: 'relative',
									display: 'flex',
									flexDirection: 'row',
								}}
							>
								<Check
									sx={{
										mr: 1,
										color: 'primary.main',
									}}
									aria-hidden='true'
								/>
								<Stack>
									<Typography
										variant='h5'
										sx={{
											fontWeight: 'bold',
											color: 'neutral.900',
											position: 'relative',
										}}
									>
										{feature.name}
									</Typography>
									<Typography variant='body2' sx={{ mt: 2 }}>
										{feature.description}
									</Typography>
								</Stack>
							</Grid>
						))}
				</Grid>
			</Box>
		</Box>
	);
};

export default Features;

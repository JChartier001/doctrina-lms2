import Box from '@mui/material/Box';
import Check from '@mui/icons-material/Check';

import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SxProps } from '@mui/material';

interface FeatureProps {
  features: Feature[];
  title: string;
  subtitle: string;
  sx?: SxProps;
}

type Feature = {
  name: string;
  description: string;
};

const Features = ({ features, title, subtitle, sx }: FeatureProps) => {
  return (
    <Box
      sx={{
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
        }}
      >
        <Stack sx={{ width: { xs: '100%' }, justifyContent: 'center', gap: 2 }}>
          <Typography
            variant="h3"
            component="p"
            sx={{
              height: 70,
            }}
          >
            {title}
          </Typography>
          <Typography
            paragraph
            sx={{
              height: 50,
            }}
          >
            {subtitle}
          </Typography>
        </Stack>
        <Stack gap={2}>
          {features &&
            features.map((feature, index) => (
              <Stack flexDirection={'row'} key={index}>
                <Check
                  sx={{
                    mr: 1,
                    mt: 0.5,
                    color: 'primary.main',
                  }}
                  aria-hidden="true"
                />
                <Stack>
                  <Typography
                    variant="h5"
                    sx={{
                      position: 'relative',
                    }}
                  >
                    {feature.name}
                  </Typography>
                  <Typography variant="body2">{feature.description}</Typography>
                </Stack>
              </Stack>
            ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default Features;

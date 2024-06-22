import Box from "@mui/material/Box";
import Check from "@mui/icons-material/Check";
import Grid from "@mui/material/Grid";
import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface FeatureProps {
  features: Feature[];
  title: string;
  subtitle: string;
}

type Feature = {
  name: string;
  description: string;
};

const Features = ({ features, title, subtitle }: FeatureProps) => {
  return (
    <Box
      sx={{
        bgcolor: "white",
        py: { xs: "6rem", sm: "8rem" },
        px: { xs: 8, sm: 20 },
      }}
    >
      <Box
        sx={{
          display: { xs: "column", lg: "flex" },
          flexDirection: "row",
          mx: "auto",
          gap: 5,
        }}
      >
        <Stack
          sx={{ width: { xs: "100%", lg: "70%" }, justifyContent: "center" }}
        >
          <Typography
            variant="subtitle1"
            component="h2"
            sx={{
              fontSize: "base",
              fontWeight: "bold",
              lineHeight: "snug",
              color: "primary.main",
            }}
          >
            Everything you need
          </Typography>
          <Typography
            variant="h2"
            component="p"
            sx={{
              mt: 2,
              fontSize: "3xl",
              fontWeight: "bold",
              tracking: "tight",
              color: "neutral.900",
              sm: { fontSize: "4xl" },
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              mt: 6,
              fontSize: "base",
              lineHeight: "snug",
              color: "neutral.600",
            }}
          >
            {subtitle}
          </Typography>
        </Stack>
        <Grid container spacing={3} sx={{ mt: { xs: 2, md: 0 } }}>
          {features &&
            features.map((feature) => (
              <Grid
                item
                lg={6}
                key={feature.name}
                sx={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <Check
                  sx={{
                    mr: 1,
                    color: "primary.main",
                  }}
                  aria-hidden="true"
                />
                <Stack>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      color: "neutral.900",
                      position: "relative",
                    }}
                  >
                    {feature.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 2 }}>
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

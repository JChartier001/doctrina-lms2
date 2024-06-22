import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Button } from "@devshop24/component-library";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import BusinessIcon from "@mui/icons-material/Business";

import { grey } from "@mui/material/colors";

const ContactUs = () => {
  return (
    <Stack
      id="contact-us"
      sx={{
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",

        width: "100%",
        px: { xs: 8, sm: 20 },
        py: { xs: 10, sm: 15 },
        margin: "auto",
        flexDirection: { xs: "column", lg: "row" },
        gap: 5,
      }}
    >
      <Stack>
        <Typography variant="h3" sx={{ color: "white" }}>
          Get in touch
        </Typography>
        <Typography paragraph sx={{ color: grey[400] }}>
          Questions, feedback, or just want to say hello? We&apos;re here to
          listen and help. Reach out to us for any inquiries or suggestions.
        </Typography>
        <Stack>
          <Stack direction="row" gap={2} width={"50%"}>
            <Box
              sx={{
                mb: 2,
                display: "flex",
                height: "30px",
                width: "30px",
              }}
            >
              <BusinessIcon
                className="h-6 w-6 text-neutral-400"
                aria-hidden="true"
              />
            </Box>
            <Typography paragraph color={grey[400]}>
              Kissimmee, FL 34746
            </Typography>
          </Stack>
          <Stack direction="row" gap={2}>
            <Box
              sx={{
                mb: 2,
                display: "flex",
                height: "30px",
                width: "30px",
              }}
            >
              <AlternateEmailIcon
                className="h-6 w-6 text-neutral-400"
                aria-hidden="true"
              />
            </Box>
            <Link
              href="mailto:customerservice@doctrinalms.com"
              sx={{ fontSize: "1.25rem", mt: -0.5 }}
            >
              customerservice@doctrinalms.com
            </Link>
          </Stack>
          <Stack>
            Form Goes HEre
            <Button sx={{ width: 200 }}>Send Message</Button>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ContactUs;

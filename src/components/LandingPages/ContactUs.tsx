'use client';
import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button, Input } from '@devshop24/component-library';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import BusinessIcon from '@mui/icons-material/Business';
import { ContactUsSchema } from '@/schemas/contact-us';
import { contactUs } from '@/actions/contactus';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { toast } from 'sonner';
import { useForm, FormProvider, Controller } from 'react-hook-form';

import { grey } from '@mui/material/colors';

const ContactUs = () => {
  const form = useForm<z.infer<typeof ContactUsSchema>>({
    resolver: zodResolver(ContactUsSchema),
    mode: 'onBlur',
  });

  const onSubmit = (data: z.infer<typeof ContactUsSchema>) => {
    try {
      toast.loading('Subscribing...');
      contactUs({ ...data }).then((res) => {
        if (res?.error) {
          toast.error(`${res?.error}`);
        } else {
          toast.success(res?.success);
        }
      });
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  return (
    <Stack
      sx={{
        position: 'relative',
        isolation: 'isolate',
        overflow: 'hidden',
        bgcolor: '#262626',
        py: { xs: '6rem', sm: '8rem' },
        px: { xs: 8, sm: 20 },
        flexDirection: { xs: 'column', lg: 'row' },

        gap: 5,
      }}
    >
      <Stack sx={{ gap: 2, width: { xs: '100%', lg: '50%' }, zIndex: 5 }}>
        <Typography variant="h3" sx={{ color: 'white' }}>
          Get in touch
        </Typography>
        <Typography paragraph sx={{ color: grey[400] }}>
          Questions, feedback, or just want to say hello? We&apos;re here to
          listen and help. Reach out to us for any inquiries or suggestions.
        </Typography>

        <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
          <BusinessIcon sx={{ color: 'text.onDark' }} />

          <Typography paragraph sx={{ color: 'text.onDarkMuted', m: 0 }}>
            Kissimmee, FL 34746
          </Typography>
        </Stack>
        <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
          <AlternateEmailIcon sx={{ color: 'text.onDark' }} />

          <Link
            href="mailto:customerservice@doctrinalms.com"
            sx={{ fontSize: '1.25rem', mt: -0.5 }}
          >
            customerservice@doctrinalms.com
          </Link>
        </Stack>
      </Stack>
      <Stack sx={{ gap: 2, width: { xs: '100%', lg: '50%' }, zIndex: 5 }}>
        <FormProvider {...form}>
          <form>
            <Stack
              sx={{
                flexDirection: {
                  xs: 'column',
                  md: 'row',
                },
                gap: 2,
                width: '100%',
              }}
            >
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    label="Name"
                    fullWidth
                    error={!!fieldState.error}
                    size="small"
                  />
                )}
              />
              <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Email"
                  fullWidth
                  size="small"
                  error={!!fieldState.error}
                />
              )}
            />
            <Controller
              control={form.control}
              name="phoneNumber"
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Phone Number"
                  fullWidth
                  size="small"
                  error={!!fieldState.error}
                />
              )}
            />
            <Controller
              control={form.control}
              name="message"
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  label="Message"
                  multiline
                  fullWidth
                  size="medium"
                  error={!!fieldState.error}
                  rows={3}
                />
              )}
            />
            <Button
              onClick={form.handleSubmit(onSubmit)}
              sx={{ width: 200, zIndex: 3, color: 'text.onDark' }}
            >
              Send Message
            </Button>
          </form>
        </FormProvider>
      </Stack>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: 0,
          transform: 'translateX(-50%)',
          width: '100%',
          height: '100%',
          bgcolor: 'transparent',
          filter: 'blur(64px)',
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: `linear-gradient(to bottom right,  #1B7DA2, #c34cd7,#8350FF)`, // Coral to purple in hex
            opacity: 0.3,
            // clipPath:
            //   "polygon(25.9% 44.1%, 0% 61.6%, 2.5% 26.9%, 14.5% 0.1%, 19.3% 2%, 27.5% 32.5%, 39.8% 62.4%, 47.6% 68.1%, 52.5% 58.3%, 54.8% 34.5%, 72.5% 76.7%, 99.9% 64.9%, 82.1% 100%, 72.4% 76.8%, 23.9% 97.7%, 25.9% 44.1%)",
            // Added blur effect
          },
        }}
        aria-hidden="true"
      />
    </Stack>
  );
};

export default ContactUs;

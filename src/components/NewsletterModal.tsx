'use client';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { Button, Input, Modal } from '@devshop24/component-library';
import { signUpForNewsletter } from '@/actions/newsletter';
import { NewsletterEmailSchema } from '@/schemas/newsletter';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

const NewsletterModal = () => {
  const [open, setOpen] = useState(false);
  const handleModal = () => {
    setOpen(!open);
  };

  const form = useForm<z.infer<typeof NewsletterEmailSchema>>({
    resolver: zodResolver(NewsletterEmailSchema),
    mode: 'onBlur',
  });

  const onSubmit = (data: z.infer<typeof NewsletterEmailSchema>) => {
    try {
      toast.loading('Subscribing...');
      signUpForNewsletter({ ...data }).then((res) => {
        if (res?.error) {
          toast.error(`${res?.error}`);
          handleModal();
        } else {
          toast.success(res?.success);
          handleModal();
        }
      });
    } catch (error) {
      toast.error(`${error}`);
    }
  };

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      trigger={
        <Button fullWidth onClick={handleModal}>
          Notify Me
        </Button>
      }
    >
      <Box>
        <Typography variant="h3" sx={{ mb: 2, color: 'text.onDark' }}>
          Subscribe to our newsletter
        </Typography>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Stack gap={2}>
              <Controller
                control={form.control}
                name="name"
                render={({ field: { ref, ...rest }, fieldState }) => (
                  <Input
                    {...rest}
                    label="Name"
                    fullWidth
                    size="small"
                    error={!!fieldState.error}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="email"
                render={({ field: { ref, ...rest }, fieldState }) => (
                  <Input
                    {...rest}
                    label="Email"
                    fullWidth
                    size="small"
                    error={!!fieldState.error}
                  />
                )}
              />
              <Button
                fullWidth
                onClick={() => {
                  onSubmit(form.getValues());
                }}
              >
                Submit
              </Button>
            </Stack>
          </form>
        </FormProvider>
      </Box>
    </Modal>
  );
};

export default NewsletterModal;

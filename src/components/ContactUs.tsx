'use client';
import { Button, Input } from '@devshop24/component-library';
import { zodResolver } from '@hookform/resolvers/zod';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import BusinessIcon from '@mui/icons-material/Business';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
// import { toast } from 'sonner';
import * as z from 'zod';

// import { contactUs } from '@/actions/contactus';
// import { ContactUsSchema } from '@/schemas/contact-us';
export const ContactUsSchema = z.object({
	email: z.string().email(),
	name: z.string(),
	message: z.string(),
	phoneNumber: z.string().min(9).max(9).optional(),
});

const ContactUs = () => {
	const form = useForm<z.infer<typeof ContactUsSchema>>({
		resolver: zodResolver(ContactUsSchema),
		mode: 'onBlur',
	});

	// const onSubmit = (data: z.infer<typeof ContactUsSchema>) => {
	// 	try {
	// 		toast.loading('Sending message...');
	// 		contactUs({ ...data }).then(res => {
	// 			if (res?.error) {
	// 				toast.error(`${res?.error}`);
	// 			} else {
	// 				toast.success(res?.success);
	// 			}
	// 		});
	// 	} catch (error) {
	// 		toast.error(`${error}`);
	// 	}
	// };

	return (
		<Stack
			sx={{
				position: 'relative',
				isolation: 'isolate',
				overflow: 'hidden',
				py: { xs: '6rem', sm: '8rem' },
				px: { xs: 8, sm: 20 },
				flexDirection: { xs: 'column', lg: 'row' },
				bgcolor: 'background.paper',

				gap: 5,
			}}
		>
			<Stack sx={{ gap: 2, width: { xs: '100%', lg: '50%' }, zIndex: 5 }}>
				<Typography variant='h3'>Get in touch</Typography>
				<Typography component='p'>
					Questions, feedback, or just want to say hello? We&apos;re here to
					listen and help. Reach out to us for any inquiries or suggestions.
				</Typography>

				<Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
					<BusinessIcon />

					<Typography component='p' sx={{ m: 0 }}>
						Kissimmee, FL 34746
					</Typography>
				</Stack>
				<Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
					<AlternateEmailIcon />

					<Link
						href='mailto:customerservice@doctrinalmms.com'
						sx={{ fontSize: '1.25rem', mt: -0.5 }}
					>
						customerservice@farm2table.app
					</Link>
				</Stack>
			</Stack>
			<Stack sx={{ gap: 2, width: { xs: '100%', lg: '50%' }, zIndex: 5 }}>
				<FormProvider {...form}>
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
							name='name'
							render={({ field, fieldState }) => (
								<Input
									{...field}
									label='Name'
									fullWidth
									error={!!fieldState.error}
									size='small'
									errorMessage={fieldState.error?.message}
									InputProps={{
										sx: { color: 'primary.main' },
									}}
									sx={{
										'& .MuiInputLabel-root': { color: 'primary.main' },
										'& .MuiOutlinedInput-notchedOutline': {
											borderColor: 'primary.main',
										},
										'&:hover .MuiOutlinedInput-notchedOutline': {
											borderColor: 'primary.dark',
											borderWidth: 2,
										},
									}}
								/>
							)}
						/>
					</Stack>
					<Controller
						control={form.control}
						name='email'
						render={({ field, fieldState }) => (
							<Input
								{...field}
								label='Email'
								fullWidth
								size='small'
								error={!!fieldState.error}
								InputProps={{
									sx: { color: 'primary.main' },
								}}
								sx={{
									'& .MuiInputLabel-root': { color: 'primary.main' },
									'& .MuiOutlinedInput-notchedOutline': {
										borderColor: 'primary.main',
									},
									'&:hover .MuiOutlinedInput-notchedOutline': {
										borderColor: 'primary.dark',
										borderWidth: 2,
									},
								}}
							/>
						)}
					/>
					<Controller
						control={form.control}
						name='phoneNumber'
						render={({ field, fieldState }) => (
							<Input
								{...field}
								label='Phone Number'
								fullWidth
								size='small'
								error={!!fieldState.error}
								InputProps={{
									sx: { color: 'primary.main' },
								}}
								sx={{
									'& .MuiInputLabel-root': { color: 'primary.main' },
									'& .MuiOutlinedInput-notchedOutline': {
										borderColor: 'primary.main',
									},
									'&:hover .MuiOutlinedInput-notchedOutline': {
										borderColor: 'primary.dark',
										borderWidth: 2,
									},
								}}
							/>
						)}
					/>
					<Controller
						control={form.control}
						name='message'
						render={({ field, fieldState }) => (
							<Input
								{...field}
								label='Message'
								multiline
								fullWidth
								size='medium'
								error={!!fieldState.error}
								rows={3}
								InputProps={{
									sx: { color: 'primary.main' },
								}}
								sx={{
									'& .MuiInputLabel-root': { color: 'primary.main' },
									'& .MuiOutlinedInput-notchedOutline': {
										borderColor: 'primary.main',
									},
									'&:hover .MuiOutlinedInput-notchedOutline': {
										borderColor: 'primary.dark',
										borderWidth: 2,
									},
								}}
							/>
						)}
					/>
					<Button
						// onClick={form.handleSubmit(onSubmit)}
						sx={{ width: 200, zIndex: 3, color: 'text.primary' }}
					>
						Send Message
					</Button>
				</FormProvider>
			</Stack>
			{/* <Box
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
						background: `linear-gradient(to bottom left, #1B7DA2, #c34cd7,#8350FF)`,
						opacity: 0.5,
					},
				}}
				aria-hidden='true'
			/> */}
		</Stack>
	);
};

export default ContactUs;

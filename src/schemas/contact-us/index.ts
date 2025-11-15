import * as z from 'zod';

export const ContactUsSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  message: z.string(),
  phoneNumber: z.string().min(9).max(9).optional(),
});

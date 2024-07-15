import * as z from 'zod';
export const NewsletterEmailSchema = z.object({
  email: z.string().email(),
  name: z.string(),
});

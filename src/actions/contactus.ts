'use server';
import { db } from '@/lib/connectors/prisma';
import { ContactUsSchema } from '@/schemas/contact-us';
import * as z from 'zod';

export const contactUs = async (values: z.infer<typeof ContactUsSchema>) => {
  try {
    await db.contactUs.create({
      data: {
        ...values,
      },
    });

    return {
      success: 'Thank you for your message. We will respond within 24 hours.',
    };
  } catch (error) {
    console.log(error, 'ERROR');
    if (error instanceof z.ZodError) {
      return { error: error.errors };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
};

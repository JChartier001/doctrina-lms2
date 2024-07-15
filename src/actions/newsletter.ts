'use server';
import { db } from '@/lib/connectors/prisma';
import { NewsletterEmailSchema } from '@/schemas/newsletter';
import * as z from 'zod';

export const signUpForNewsletter = async (
  values: z.infer<typeof NewsletterEmailSchema>
) => {
  try {
    const { email, name } = values;

    const exists = await getNewsletterEmailsByEmail(email);
    console.log(exists, 'EXISTS');
    if (exists.length > 0) {
      throw Error('Email already exists');
    }

    await db.newsletterEmails.create({
      data: {
        email,
        name,
      },
    });

    return { success: 'Successfully signed up for newsletter' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
  }
};

export const getNewsletterEmailsByEmail = async (email: string) => {
  return await db.newsletterEmails.findMany({
    where: {
      email: email,
    },
  });
};

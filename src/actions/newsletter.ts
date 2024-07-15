'use server';
import { db } from '@/lib/connectors/prisma';
import { NewsletterEmailSchema } from '@/components/NewsletterModal';
import * as z from 'zod';

export const signUpForNewsletter = async (
  values: z.infer<typeof NewsletterEmailSchema>
) => {
  try {
    // const validatedFields = NewsletterEmailSchema.safeParse(values);
    // if (!validatedFields.success) {
    // 	return 'Invalid input';
    // }

    const { email, name, type } = values;

    const exists = await getNewsletterEmailsByEmail(email);
    console.log(exists, 'EXISTS');
    if (exists.length > 0) {
      throw Error('Email already exists');
    }

    const signup = await db.newsletterEmails.create({
      data: {
        email,
        name,
        type,
      },
    });
    console.log(signup, 'SIGNUP');
    return { success: 'Successfully signed up for newsletter' };
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

export const getNewsletterEmailsByEmail = async (email: string) => {
  return await db.newsletterEmails.findMany({
    where: {
      email: email,
    },
  });
};

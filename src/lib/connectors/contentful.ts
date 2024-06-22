"use server";

import * as contentful from "contentful";

const client = contentful.createClient({
  space: `${process.env.CONTENTFUL_SPACE_ID}`,
  accessToken: `${process.env.CONTENTFUL_API_ACCESS_TOKEN}`,
});

export const getPrivacyPolicy = async () => {
  const entry = await client.getEntry("3Whkq5vIj7GjpUoSu6mMBg");
  return entry.fields;
};

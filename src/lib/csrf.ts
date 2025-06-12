import { nextCsrf } from 'next-csrf';

export const { csrf, setup } = nextCsrf({
  secret: process.env.CSRF_SECRET,
});
import { csrf } from '@/lib/csrf';
import type { NextApiRequest, NextApiResponse } from 'next';

declare module 'next' {
  interface NextApiRequest {
    csrfToken: () => string;
  }
}

export default csrf(async function csrfHandler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ csrfToken: req.csrfToken() });
});

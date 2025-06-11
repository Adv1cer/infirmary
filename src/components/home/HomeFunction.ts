'use client';

import { useSession } from 'next-auth/react';

export const useHomeSession = () => {
  const { data: session } = useSession();
  return session;
};
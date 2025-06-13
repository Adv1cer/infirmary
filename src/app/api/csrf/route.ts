import { NextResponse } from 'next/server';
import Tokens from 'csrf';

const tokens = new Tokens();
const secret = process.env.CSRF_SECRET || 'secret';

// Simple in-memory store for one-time-use tokens (for demo/dev only)
const usedTokens = new Set<string>();

export async function GET() {
  const token = tokens.create(secret);
  usedTokens.add(token); // Mark as valid/available
  return NextResponse.json({ csrfToken: token });
}

// Helper for other routes to check and invalidate a token
export function verifyAndInvalidateCsrfToken(token: string): boolean {
  if (usedTokens.has(token) && tokens.verify(secret, token)) {
    usedTokens.delete(token); // Invalidate after use
    return true;
  }
  return false;
}

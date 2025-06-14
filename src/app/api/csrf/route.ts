import { NextResponse } from 'next/server';
import Tokens from 'csrf';

const tokens = new Tokens();
const secret = process.env.CSRF_SECRET || 'secret';

// CSRF token expiration time: 30 minutes
const CSRF_TOKEN_EXPIRATION_MS = 30 * 60 * 1000;

// In-memory store for one-time-use tokens with creation time (for demo/dev only)
const usedTokens = new Map<string, number>(); // token -> createdAt (ms)

export async function GET() {
  const token = tokens.create(secret);
  usedTokens.set(token, Date.now()); // Store creation time
  return NextResponse.json({ csrfToken: token });
}

// Helper for other routes to check and invalidate a token
export function verifyAndInvalidateCsrfToken(token: string): boolean {
  const createdAt = usedTokens.get(token);
  if (
    createdAt &&
    Date.now() - createdAt <= CSRF_TOKEN_EXPIRATION_MS &&
    tokens.verify(secret, token)
  ) {
    usedTokens.delete(token); // Invalidate after use
    return true;
  }
  // Remove expired/invalid token if present
  if (createdAt) usedTokens.delete(token);
  return false;
}
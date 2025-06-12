import { NextResponse } from 'next/server';
import Tokens from 'csrf';

const tokens = new Tokens();
const secret = process.env.CSRF_SECRET || 'secret';

export async function GET() {
  const token = tokens.create(secret);
  return NextResponse.json({ csrfToken: token });
}

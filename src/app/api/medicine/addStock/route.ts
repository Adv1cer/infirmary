import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyAndInvalidateCsrfToken } from '@/lib/csrf';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export async function POST(req: NextRequest) {
  // CSRF protection
  const csrfToken = req.headers.get('csrf-token');
  if (!csrfToken || !verifyAndInvalidateCsrfToken(csrfToken)) {
    return NextResponse.json({ error: 'Invalid or used CSRF Token' }, { status: 403 });
  }
  let connection;
  try {
    const body = await req.json();
    console.log('Received body:', body);
    // Validate required fields
    if (!body.pill_id || !body.expire || !body.total) {
      console.log('Validation failed:', body);
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to DB');
    const [result] = await connection.execute(
      'INSERT INTO pillstock (pill_id, datetime, expire, total) VALUES (?, ?, ?, ?)',
      [body.pill_id, new Date().toISOString().slice(0, 19).replace('T', ' '), body.expire, body.total]
    );
    console.log('Insert result:', result);
    // Get the inserted id
    const insertId = (result as any).insertId;
    const [rows]: any = await connection.execute('SELECT * FROM pillstock WHERE pillstock_id = ?', [insertId]);
    console.log('Inserted row:', rows && rows.length ? rows[0] : null);
    return NextResponse.json(rows && rows.length ? rows[0] : null, { status: 201 });
  } catch (error) {
    let message = 'Database error';
    if (error instanceof Error) message = error.message;
    console.error('Error in addStock:', error);
    return NextResponse.json({ error: 'Database error', detail: message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

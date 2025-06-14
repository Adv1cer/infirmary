import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyAndInvalidateCsrfToken } from '../../../../lib/csrf';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export async function PUT(req: NextRequest) {
  // CSRF protection
  const csrfToken = req.headers.get('csrf-token');
  if (!csrfToken || !verifyAndInvalidateCsrfToken(csrfToken)) {
    return NextResponse.json({ error: 'Invalid or used CSRF Token' }, { status: 403 });
  }
  let connection;
  try {
    const body = await req.json();
    // Validate required fields
    if (!body.pillstock_id || !body.pill_id || !body.expire || !body.total) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'UPDATE pillstock SET pill_id = ?, expire = ?, total = ? WHERE pillstock_id = ?',
      [body.pill_id, body.expire, body.total, body.pillstock_id]
    );
    // Return the updated row
    const [rows]: any = await connection.execute('SELECT * FROM pillstock WHERE pillstock_id = ?', [body.pillstock_id]);
    return NextResponse.json(rows && rows.length ? rows[0] : null, { status: 200 });
  } catch (error) {
    let message = 'Database error';
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: 'Database error', detail: message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyAndInvalidateCsrfToken } from '../../../../lib/route';

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
    // Validate required fields
    if (!body.pill_name || !body.dose || !body.type_id || !body.unit_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO pill (pill_name, dose, type_id, unit_id, status) VALUES (?, ?, ?, ?, ?)',
      [body.pill_name, body.dose, body.type_id, body.unit_id, body.status ?? 1]
    );
    // Get the inserted id
    const insertId = (result as any).insertId;
    const [rows]: any = await connection.execute('SELECT * FROM pill WHERE pill_id = ?', [insertId]);
    return NextResponse.json(rows && rows.length ? rows[0] : null, { status: 201 });
  } catch (error) {
    let message = 'Database error';
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: 'Database error', detail: message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

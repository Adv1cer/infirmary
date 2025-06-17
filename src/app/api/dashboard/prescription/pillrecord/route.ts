import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyAndInvalidateCsrfToken } from '@/lib/csrf';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export async function POST(request: Request) {
  // CSRF protection
  const csrfToken = request.headers.get('csrf-token');
  if (!csrfToken || !verifyAndInvalidateCsrfToken(csrfToken)) {
    return NextResponse.json({ error: 'Invalid or used CSRF Token' }, { status: 403 });
  }
  try {
    const { patientrecord_id, pills } = await request.json();
    if (!patientrecord_id || !Array.isArray(pills) || pills.length === 0) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }
    const connection = await mysql.createConnection(dbConfig);
    // Insert each pill record
    for (const pill of pills) {
      if (!pill.pillstock_id || !pill.quantity) continue;
      await connection.execute(
        'INSERT INTO pillrecord (patientrecord_id, pillstock_id, user_id, quantity) VALUES (?, ?, ?, ?)',
        [patientrecord_id, pill.pillstock_id, pill.user_id, pill.quantity]
      );
      // Update pillstock total
      await connection.execute(
        'UPDATE pillstock SET total = total - ? WHERE pillstock_id = ?',
        [pill.quantity, pill.pillstock_id]
      );
    }    await connection.execute(
      'UPDATE patientrecord SET status = 0 WHERE patientrecord_id = ?',
      [patientrecord_id]
    );
    
    await connection.end();
    
    // Return JSON success with status update notification
    return NextResponse.json({ 
      success: true, 
      statusUpdated: true,
      patientrecord_id: patientrecord_id 
    });
  } catch (e) {
    return NextResponse.json({ error: 'Server error', details: String(e) }, { status: 500 });
  }
}

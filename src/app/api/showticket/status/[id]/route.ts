import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const patientrecord_id = id;
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Get the status from patientrecord table
    const [rows] = await connection.execute(
      'SELECT status FROM patientrecord WHERE patientrecord_id = ?',
      [patientrecord_id]
    );
    
    await connection.end();
    
    if (Array.isArray(rows) && rows.length > 0) {
      const record = rows[0] as { status: number };
      return NextResponse.json({ status: record.status });
    } else {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error checking status:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

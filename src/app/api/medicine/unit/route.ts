import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// You may want to move this config to a shared file or use env variables
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export async function GET(req: NextRequest) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT unit_id, unit_type FROM unit');
    return NextResponse.json(rows);
  } catch (error) {
    let message = 'Database error';
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: 'Database error', detail: message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

// GET /api/roles - Fetch all roles
export async function GET() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT role_id, role_name FROM role ORDER BY role_name ASC'
    );
    
    return NextResponse.json({
      success: true,
      data: rows
    });
    
  } catch (error) {
    console.error('Database error:', error);
    let message = 'Database error';
    if (error instanceof Error) message = error.message;
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database error', 
        detail: message 
      }, 
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

// GET /api/prescription/medicine/stock?pill_id=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url!);
  const pill_id = searchParams.get('pill_id');
  const connection = await mysql.createConnection(dbConfig);
  let rows;
  if (!pill_id || pill_id === 'all') {
    [rows] = await connection.execute(
      `SELECT pillstock_id, pill_id, expire, total FROM pillstock`
    );
  } else {
    [rows] = await connection.execute(
      `SELECT pillstock_id, pill_id, expire, total FROM pillstock WHERE pill_id = ?`,
      [pill_id]
    );
  }
  await connection.end();
  return NextResponse.json(rows);
}

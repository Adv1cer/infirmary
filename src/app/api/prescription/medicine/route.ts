import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export async function GET() {
  const connection = await mysql.createConnection(dbConfig);
  const [rows] = await connection.execute(
    `SELECT p.pill_id, p.pill_name, p.dose, p.status, 
            pt.type_name, ut.unit_type
     FROM pill p
     LEFT JOIN pill_type pt ON p.type_id = pt.type_id
     LEFT JOIN unit ut ON p.unit_id = ut.unit_id`
  );
  await connection.end();
  return NextResponse.json(rows);
}

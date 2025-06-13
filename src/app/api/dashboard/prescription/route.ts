import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

// GET /api/dashboard/prescription?patientrecord_id=xxx
export async function GET(req: NextRequest) {
  const url = new URL(req.url!);
  const patientrecord_id = url.searchParams.get('patientrecord_id');
  if (!patientrecord_id) {
    return NextResponse.json({ error: 'Missing patientrecord_id' }, { status: 400 });
  }
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    // Join pillrecord with pillstock, pill, and unit for display
    const [rows] = await connection.execute(
      `SELECT 
        pr.patientrecord_id,
        pr.pillstock_id,
        pr.quantity,
        p.pill_name,
        p.dose,
        pt.type_name AS pilltype_name,
        u.unit_type,
        us.name
      FROM pillrecord pr
      JOIN pillstock ps ON pr.pillstock_id = ps.pillstock_id
      JOIN pill p ON ps.pill_id = p.pill_id
      LEFT JOIN pill_type pt ON p.type_id = pt.type_id
      JOIN unit u ON p.unit_id = u.unit_id
      LEFT JOIN user us ON pr.user_id = us.user_id
      WHERE pr.patientrecord_id = ?`,
      [patientrecord_id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error); // Log the error for debugging
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

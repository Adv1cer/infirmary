import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const patientrecord_id = searchParams.get('patientrecord_id');
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  if (patientrecord_id) {
    // Join symptomrecord with symptom to get symptom_name for a specific record
    const [rows] = await connection.execute(
      `SELECT sr.patientrecord_id, sr.symptom_id, s.symptom_name, sr.other_symptom
       FROM symptomrecord sr
       LEFT JOIN symptom s ON sr.symptom_id = s.symptom_id
       WHERE sr.patientrecord_id = ?`,
      [patientrecord_id]
    );
    await connection.end();
    return NextResponse.json(rows);
  } else {
    // Return all symptoms
    const [rows] = await connection.execute(
      'SELECT symptom_id, symptom_name FROM symptom'
    );
    await connection.end();
    return NextResponse.json(rows);
  }
}
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

// Fetch patient record and join patient and patienttype tables for full info
async function getPatientRecordById(id: string) {
  const connection = await mysql.createConnection(dbConfig);
  const [rows] = await connection.execute(
    `SELECT pr.patientrecord_id, pr.patient_id, pr.datetime, pr.status,
            p.patient_name, pt.patienttype_name
     FROM patientrecord pr
     LEFT JOIN patient p ON pr.patient_id = p.patient_id
     LEFT JOIN patient_type pt ON p.patienttype_id = pt.patienttype_id
     WHERE pr.patientrecord_id = ?
     ORDER BY pr.datetime DESC`,
    [id]
  );
  await connection.end();
  if (Array.isArray(rows) && rows.length > 0) {
    return rows[0];
  }
  return null;
}

export async function GET(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const record = await getPatientRecordById(id);
  if (!record) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(record);
}

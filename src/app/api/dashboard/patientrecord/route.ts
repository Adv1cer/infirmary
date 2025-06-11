import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = (today.getMonth() + 1).toString().padStart(2, '0');
  const dd = today.getDate().toString().padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  // Update status to 0 for tickets with status 1 not from today
  console.log('Today string for update:', todayStr);
  const [updateResult] = await connection.execute(
    `UPDATE patientrecord SET status = 0 WHERE status = 1 AND DATE(datetime) <> ?`,
    [todayStr]
  );
  console.log('Update result:', updateResult);

  const [rows] = await connection.execute(
    `SELECT pr.patientrecord_id, pr.patient_id, pr.datetime, pr.status,
            p.patient_name, p.personel_id, pt.patienttype_name, pt.patienttype_id
     FROM patientrecord pr
     LEFT JOIN patient p ON pr.patient_id = p.patient_id
     LEFT JOIN patient_type pt ON p.patienttype_id = pt.patienttype_id
     ORDER BY pr.datetime DESC`
  );
  await connection.end();

  return NextResponse.json(rows);
}
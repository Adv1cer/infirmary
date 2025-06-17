import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { PatientStatisticsUtil, PatientRecord } from '@/components/statistic/utils/patientStatistics';

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // Import all patient records
    const [patientRecordsResult] = await connection.execute(
      'SELECT patientrecord_id, patient_id, datetime, status FROM patientrecord ORDER BY datetime DESC'
    );
      const patientRecords = patientRecordsResult as PatientRecord[];

    await connection.end();

    // Return all records for client-side filtering
    return NextResponse.json({
      records: patientRecords
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient statistics' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import Tokens from 'csrf';

const tokens = new Tokens();
const secret = process.env.CSRF_SECRET || 'secret';

export async function POST(req: NextRequest) {
    const csrfToken = req.headers.get('csrf-token');

    if (!csrfToken || !tokens.verify(secret, csrfToken)) {
        return new NextResponse('Invalid CSRF Token', { status: 403 });
    }

    const body = await req.json();
    const { name, status, studentId, selectedSymptoms, otherSymptom } = body;
    // Defensive: ensure selectedSymptoms is an array of numbers
    const selectedSymptomsArray = Array.isArray(selectedSymptoms)
        ? selectedSymptoms.map((s: any) => Number(s)).filter((n: any) => !isNaN(n))
        : [];
    if (!name || !status || !Array.isArray(selectedSymptomsArray) || selectedSymptomsArray.length === 0) {
        return new NextResponse(JSON.stringify({ error: 'Missing or invalid parameters' }), { status: 400 });
    }
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });
        let patientIdToUse: number;
        if (status === "1" || status === "2") {
            const [existing] = await connection.execute<mysql.RowDataPacket[]>(
                'SELECT patient_id FROM patient WHERE personel_id = ?',
                [studentId]
            );
            if (Array.isArray(existing) && existing.length > 0) {
                patientIdToUse = (existing as mysql.RowDataPacket[])[0].patient_id;
            } else {
                const [patientResult] = await connection.execute(
                    'INSERT INTO patient (personel_id, patient_name, patienttype_id) VALUES (?, ?, ?)',
                    [studentId, name, status]
                );
                patientIdToUse = (patientResult as any).insertId;
            }
        } else {
            const [existing] = await connection.execute<mysql.RowDataPacket[]>(
                'SELECT patient_id FROM patient WHERE personel_id IS NULL AND patient_name = ?',
                [name]
            );
            if (Array.isArray(existing) && existing.length > 0) {
                patientIdToUse = existing[0].patient_id;
            } else {
                const [patientResult] = await connection.execute(
                    'INSERT INTO patient (personel_id, patient_name, patienttype_id) VALUES (?, ?, ?)',
                    [null, name, status]
                );
                patientIdToUse = (patientResult as any).insertId;
            }
        }
        const [recordResult] = await connection.execute(
            'INSERT INTO patientrecord (patient_id, datetime, status) VALUES (?, NOW(), 1)',
            [patientIdToUse]
        );
        const patientRecordId = (recordResult as any).insertId;
        if (Array.isArray(selectedSymptomsArray) && selectedSymptomsArray.length > 0) {
            const values = selectedSymptomsArray.map(
                (symptomId: number) => [
                    patientRecordId,
                    symptomId,
                    String(symptomId) === "12" ? otherSymptom || '' : ''
                ]
            );
            await connection.query(
                'INSERT INTO symptomrecord (patientrecord_id, symptom_id, other_symptom) VALUES ?',
                [values]
            );
        }
        await connection.end();
        let symptomDetails: { symptom_id: number, symptom_name: string }[] = [];
        if (Array.isArray(selectedSymptomsArray) && selectedSymptomsArray.length > 0) {
            const symptomConn = await mysql.createConnection({
                host: process.env.MYSQL_HOST,
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DATABASE,
            });
            const [symptomRows] = await symptomConn.execute<mysql.RowDataPacket[]>(
                `SELECT symptom_id, symptom_name FROM symptom WHERE symptom_id IN (${selectedSymptomsArray.map(() => '?').join(',')})`,
                selectedSymptomsArray
            );
            await symptomConn.end();
            symptomDetails = Array.isArray(symptomRows) ? symptomRows as { symptom_id: number, symptom_name: string }[] : [];
        }
        return NextResponse.json({
            success: true,
            patientRecordId,
            name,
            symptoms: symptomDetails,
            otherSymptom: selectedSymptomsArray.includes(12) ? otherSymptom : ''
        });
    } catch (error) {
        console.error('Error saving patient form:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to save patient form' }), { status: 500 });
    }
}

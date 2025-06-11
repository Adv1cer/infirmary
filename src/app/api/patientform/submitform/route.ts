import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: Request) {
    try {
        const { name, status, studentId, selectedSymptoms, otherSymptom } = await request.json();

        // Defensive: ensure selectedSymptoms is an array of numbers
        const selectedSymptomsArray = Array.isArray(selectedSymptoms)
            ? selectedSymptoms.map((s: any) => Number(s)).filter((n: any) => !isNaN(n))
            : [];
        if (!name || !status || !Array.isArray(selectedSymptomsArray) || selectedSymptomsArray.length === 0) {
            return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
        }

        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        let patientIdToUse: number;

        if (status === "1" || status === "2") {
            // For students/staff, check if personel_id already exists
            const [existing] = await connection.execute<mysql.RowDataPacket[]>(
                'SELECT patient_id FROM patient WHERE personel_id = ?',
                [studentId]
            );
            if (Array.isArray(existing) && existing.length > 0) {
                // Already exists, use existing patient_id
                patientIdToUse = (existing as mysql.RowDataPacket[])[0].patient_id;
            } else {
                // Insert new patient with personel_id
                const [patientResult] = await connection.execute(
                    'INSERT INTO patient (personel_id, patient_name, patienttype_id) VALUES (?, ?, ?)',
                    [studentId, name, status]
                );
                patientIdToUse = (patientResult as any).insertId;
            }
        } else {
            // Outsider: check if patient_name already exists
            const [existing] = await connection.execute<mysql.RowDataPacket[]>(
                'SELECT patient_id FROM patient WHERE personel_id IS NULL AND patient_name = ?',
                [name]
            );
            if (Array.isArray(existing) && existing.length > 0) {
                // Already exists, use existing patient_id
                patientIdToUse = existing[0].patient_id;
            } else {
                // Insert new outsider
                const [patientResult] = await connection.execute(
                    'INSERT INTO patient (personel_id, patient_name, patienttype_id) VALUES (?, ?, ?)',
                    [null, name, status]
                );
                patientIdToUse = (patientResult as any).insertId;
            }
        }

        // Insert patientrecord
        const [recordResult] = await connection.execute(
            'INSERT INTO patientrecord (patient_id, datetime, status) VALUES (?, NOW(), 1)',
            [patientIdToUse]
        );
        const patientRecordId = (recordResult as any).insertId;

        // Insert symptoms
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

        // Get symptom names for the selected symptoms
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
        return NextResponse.json({ error: 'Failed to save patient form' }, { status: 500 });
    }
}
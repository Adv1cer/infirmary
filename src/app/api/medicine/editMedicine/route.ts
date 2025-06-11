import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export async function PUT(req: NextRequest) {
  let connection;
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.pill_id) {
      return NextResponse.json({ error: 'Missing pill_id' }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);
    
    // Build dynamic query based on provided fields
    const updateFields = [];
    const updateValues = [];
    
    if (body.pill_name !== undefined) {
      updateFields.push('pill_name = ?');
      updateValues.push(body.pill_name);
    }
    
    if (body.dose !== undefined) {
      updateFields.push('dose = ?');
      updateValues.push(body.dose);
    }
    
    if (body.type_id !== undefined) {
      updateFields.push('type_id = ?');
      updateValues.push(body.type_id);
    }
    
    if (body.unit_id !== undefined) {
      updateFields.push('unit_id = ?');
      updateValues.push(body.unit_id);
    }
    
    if (body.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(body.status);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Add pill_id for WHERE clause
    updateValues.push(body.pill_id);
    
    const query = `UPDATE pill SET ${updateFields.join(', ')} WHERE pill_id = ?`;
    
    const [result] = await connection.execute(query, updateValues);
    
    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }

    // Get the updated record
    const [rows]: any = await connection.execute('SELECT * FROM pill WHERE pill_id = ?', [body.pill_id]);
    
    return NextResponse.json(rows && rows.length ? rows[0] : null, { status: 200 });
    
  } catch (error) {
    console.error('Error updating medicine:', error);
    let message = 'Database error';
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: 'Database error', detail: message }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function GET(req: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(req.url);
    const pill_id = searchParams.get('pill_id');
    
    if (!pill_id) {
      return NextResponse.json({ error: 'Missing pill_id parameter' }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);
    
    const [rows]: any = await connection.execute('SELECT * FROM pill WHERE pill_id = ?', [pill_id]);
    
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Medicine not found' }, { status: 404 });
    }
    
    return NextResponse.json(rows[0], { status: 200 });
    
  } catch (error) {
    console.error('Error fetching medicine:', error);
    let message = 'Database error';
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: 'Database error', detail: message }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
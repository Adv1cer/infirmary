import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { verifyAndInvalidateCsrfToken } from '@/app/api/csrf/route';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

// GET /api/admin/symptom - Fetch all symptoms
export async function GET(req: NextRequest) {
  let connection;
  try {
    console.log('Fetching symptoms from database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connection established');
    
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT symptom_id, symptom_name FROM symptom ORDER BY symptom_name ASC'
    );
    
    console.log('Query executed, rows found:', rows.length);
    console.log('Sample data:', rows.slice(0, 3));
    
    return NextResponse.json({
      success: true,
      data: rows
    });
    
  } catch (error) {
    console.error('Database error:', error);
    let message = 'Database error';
    if (error instanceof Error) message = error.message;
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database error', 
        detail: message 
      }, 
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// POST /api/admin/symptom - Add new symptom
export async function POST(req: NextRequest) {
  // CSRF protection
  const csrfToken = req.headers.get('csrf-token');
  if (!csrfToken || !verifyAndInvalidateCsrfToken(csrfToken)) {
    return NextResponse.json({ error: 'Invalid or used CSRF Token' }, { status: 403 });
  }

  let connection;
  try {
    const body = await req.json();
    const { symptom_name } = body;
    
    if (!symptom_name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required field: symptom_name' 
        }, 
        { status: 400 }
      );
    }
    
    connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.execute(
      'INSERT INTO symptom (symptom_name) VALUES (?)',
      [symptom_name]
    );
    
    const insertResult = result as mysql.ResultSetHeader;
    
    // Fetch the newly created symptom
    const [newSymptom] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT symptom_id, symptom_name FROM symptom WHERE symptom_id = ?',
      [insertResult.insertId]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Symptom created successfully',
      data: newSymptom[0]
    });
    
  } catch (error) {
    console.error('Database error:', error);
    let message = 'Database error';
    if (error instanceof Error) message = error.message;
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database error', 
        detail: message 
      }, 
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// PUT /api/admin/symptom - Update symptom
export async function PUT(req: NextRequest) {
  // CSRF protection
  const csrfToken = req.headers.get('csrf-token');
  if (!csrfToken || !verifyAndInvalidateCsrfToken(csrfToken)) {
    return NextResponse.json({ error: 'Invalid or used CSRF Token' }, { status: 403 });
  }

  let connection;
  try {
    const body = await req.json();
    const { symptom_id, symptom_name } = body;
    
    if (!symptom_id || !symptom_name) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: symptom_id and symptom_name' 
        }, 
        { status: 400 }
      );
    }
    
    connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.execute(
      'UPDATE symptom SET symptom_name = ? WHERE symptom_id = ?',
      [symptom_name, symptom_id]
    );
    
    const updateResult = result as mysql.ResultSetHeader;
    
    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Symptom not found' 
        }, 
        { status: 404 }
      );
    }
    
    // Fetch updated symptom
    const [updatedSymptom] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT symptom_id, symptom_name FROM symptom WHERE symptom_id = ?',
      [symptom_id]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Symptom updated successfully',
      data: updatedSymptom[0]
    });
    
  } catch (error) {
    console.error('Database error:', error);
    let message = 'Database error';
    if (error instanceof Error) message = error.message;
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database error', 
        detail: message 
      }, 
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// DELETE /api/admin/symptom - Delete symptom
export async function DELETE(req: NextRequest) {
  // CSRF protection
  const csrfToken = req.headers.get('csrf-token');
  if (!csrfToken || !verifyAndInvalidateCsrfToken(csrfToken)) {
    return NextResponse.json({ error: 'Invalid or used CSRF Token' }, { status: 403 });
  }

  let connection;
  try {
    const { searchParams } = new URL(req.url);
    const symptom_id = searchParams.get('symptom_id');
    
    if (!symptom_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameter: symptom_id' 
        }, 
        { status: 400 }
      );
    }
    
    connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.execute(
      'DELETE FROM symptom WHERE symptom_id = ?',
      [symptom_id]
    );
    
    const deleteResult = result as mysql.ResultSetHeader;
    
    if (deleteResult.affectedRows === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Symptom not found' 
        }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Symptom deleted successfully'
    });
    
  } catch (error) {
    console.error('Database error:', error);
    let message = 'Database error';
    if (error instanceof Error) message = error.message;
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database error', 
        detail: message 
      }, 
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
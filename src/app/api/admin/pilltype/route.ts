import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

// GET - Fetch all pill types
export async function GET() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT type_id, type_name FROM pill_type ORDER BY type_id ASC'
    );
    
    console.log('Pill types fetched:', rows);
    
    return NextResponse.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching pill types:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch pill types'
    }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// POST - Add new pill type
export async function POST(request: NextRequest) {
  let connection;
  try {
    const csrfToken = request.headers.get('csrf-token');
    if (!csrfToken) {
      return NextResponse.json({
        success: false,
        error: 'CSRF token missing'
      }, { status: 403 });
    }

    const { type_name } = await request.json();
    
    if (!type_name || typeof type_name !== 'string' || !type_name.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Type name is required'
      }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);
    
    // Check if type already exists
    const [existing] = await connection.execute(
      'SELECT type_id FROM pill_type WHERE type_name = ?',
      [type_name.trim()]
    );
    
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Type name already exists'
      }, { status: 400 });
    }
    
    const [result] = await connection.execute(
      'INSERT INTO pill_type (type_name) VALUES (?)',
      [type_name.trim()]
    ) as any;
    
    const newType = {
      type_id: result.insertId,
      type_name: type_name.trim()
    };
    
    console.log('Pill type added:', newType);
    
    return NextResponse.json({
      success: true,
      data: newType
    });
  } catch (error) {
    console.error('Error adding pill type:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add pill type'
    }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// PUT - Update pill type
export async function PUT(request: NextRequest) {
  let connection;
  try {
    const csrfToken = request.headers.get('csrf-token');
    if (!csrfToken) {
      return NextResponse.json({
        success: false,
        error: 'CSRF token missing'
      }, { status: 403 });
    }

    const { type_id, type_name } = await request.json();
    
    if (!type_id || !type_name || typeof type_name !== 'string' || !type_name.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Type ID and name are required'
      }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);
    
    // Check if new name already exists for different ID
    const [existing] = await connection.execute(
      'SELECT type_id FROM pill_type WHERE type_name = ? AND type_id != ?',
      [type_name.trim(), type_id]
    );
    
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Type name already exists'
      }, { status: 400 });
    }
    
    const [result] = await connection.execute(
      'UPDATE pill_type SET type_name = ? WHERE type_id = ?',
      [type_name.trim(), type_id]
    ) as any;
    
    if (result.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        error: 'Pill type not found'
      }, { status: 404 });
    }
    
    const updatedType = {
      type_id: parseInt(type_id),
      type_name: type_name.trim()
    };
    
    console.log('Pill type updated:', updatedType);
    
    return NextResponse.json({
      success: true,
      data: updatedType
    });
  } catch (error) {
    console.error('Error updating pill type:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update pill type'
    }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// DELETE - Delete pill type
export async function DELETE(request: NextRequest) {
  let connection;
  try {
    const csrfToken = request.headers.get('csrf-token');
    if (!csrfToken) {
      return NextResponse.json({
        success: false,
        error: 'CSRF token missing'
      }, { status: 403 });
    }

    const url = new URL(request.url);
    const type_id = url.searchParams.get('type_id');
    
    if (!type_id) {
      return NextResponse.json({
        success: false,
        error: 'Type ID is required'
      }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);
    
    // Check if type is being used in medicine table
    const [medicineCheck] = await connection.execute(
      'SELECT pill_id FROM medicine WHERE type_id = ? LIMIT 1',
      [type_id]
    );
    
    if (Array.isArray(medicineCheck) && medicineCheck.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete pill type that is being used by medicines'
      }, { status: 400 });
    }
    
    const [result] = await connection.execute(
      'DELETE FROM pill_type WHERE type_id = ?',
      [type_id]
    ) as any;
    
    if (result.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        error: 'Pill type not found'
      }, { status: 404 });
    }
    
    console.log('Pill type deleted:', type_id);
    
    return NextResponse.json({
      success: true,
      message: 'Pill type deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pill type:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete pill type'
    }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

// GET - Fetch all units
export async function GET() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT unit_id, unit_type FROM unit ORDER BY unit_id ASC'
    );
    
    console.log('Units fetched:', rows);
    
    return NextResponse.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch units'
    }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// POST - Add new unit
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

    const { unit_type } = await request.json();
    
    if (!unit_type || typeof unit_type !== 'string' || !unit_type.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Unit type is required'
      }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);
    
    // Check if unit already exists
    const [existing] = await connection.execute(
      'SELECT unit_id FROM unit WHERE unit_type = ?',
      [unit_type.trim()]
    );
    
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Unit type already exists'
      }, { status: 400 });
    }
    
    const [result] = await connection.execute(
      'INSERT INTO unit (unit_type) VALUES (?)',
      [unit_type.trim()]
    ) as any;
    
    const newUnit = {
      unit_id: result.insertId,
      unit_type: unit_type.trim()
    };
    
    console.log('Unit added:', newUnit);
    
    return NextResponse.json({
      success: true,
      data: newUnit
    });
  } catch (error) {
    console.error('Error adding unit:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add unit'
    }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// PUT - Update unit
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

    const { unit_id, unit_type } = await request.json();
    
    if (!unit_id || !unit_type || typeof unit_type !== 'string' || !unit_type.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Unit ID and type are required'
      }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);
    
    // Check if new type already exists for different ID
    const [existing] = await connection.execute(
      'SELECT unit_id FROM unit WHERE unit_type = ? AND unit_id != ?',
      [unit_type.trim(), unit_id]
    );
    
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Unit type already exists'
      }, { status: 400 });
    }
    
    const [result] = await connection.execute(
      'UPDATE unit SET unit_type = ? WHERE unit_id = ?',
      [unit_type.trim(), unit_id]
    ) as any;
    
    if (result.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        error: 'Unit not found'
      }, { status: 404 });
    }
    
    const updatedUnit = {
      unit_id: parseInt(unit_id),
      unit_type: unit_type.trim()
    };
    
    console.log('Unit updated:', updatedUnit);
    
    return NextResponse.json({
      success: true,
      data: updatedUnit
    });
  } catch (error) {
    console.error('Error updating unit:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update unit'
    }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// DELETE - Delete unit
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
    const unit_id = url.searchParams.get('unit_id');
    
    if (!unit_id) {
      return NextResponse.json({
        success: false,
        error: 'Unit ID is required'
      }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);
    
    // Check if unit is being used in medicine table
    const [medicineCheck] = await connection.execute(
      'SELECT pill_id FROM medicine WHERE unit_id = ? LIMIT 1',
      [unit_id]
    );
    
    if (Array.isArray(medicineCheck) && medicineCheck.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete unit that is being used by medicines'
      }, { status: 400 });
    }
    
    const [result] = await connection.execute(
      'DELETE FROM unit WHERE unit_id = ?',
      [unit_id]
    ) as any;
    
    if (result.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        error: 'Unit not found'
      }, { status: 404 });
    }
    
    console.log('Unit deleted:', unit_id);
    
    return NextResponse.json({
      success: true,
      message: 'Unit deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting unit:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete unit'
    }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

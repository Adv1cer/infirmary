import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

// GET /api/admin - Fetch all users with their role information for team management
export async function GET(req: NextRequest) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
      // Fetch all users with their role information
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT 
        u.user_id,
        u.name,
        u.email,
        u.phone,
        u.role_id,
        r.role_name
      FROM user u
      LEFT JOIN role r ON u.role_id = r.role_id
      ORDER BY u.name ASC`
    );
    
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

// PUT /api/admin - Update user role
export async function PUT(req: NextRequest) {
  let connection;
  try {
    const body = await req.json();
    const { user_id, role_id } = body;
    
    // Validate required fields
    if (!user_id || !role_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: user_id and role_id' 
        }, 
        { status: 400 }
      );
    }
    
    connection = await mysql.createConnection(dbConfig);
    
    // Update user role
    const [result] = await connection.execute(
      'UPDATE user SET role_id = ? WHERE user_id = ?',
      [role_id, user_id]
    );
    
    const updateResult = result as mysql.ResultSetHeader;
    
    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found or no changes made' 
        }, 
        { status: 404 }
      );
    }
      // Fetch updated user data
    const [updatedRows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT 
        u.user_id,
        u.name,
        u.email,
        u.phone,
        u.role_id,
        r.role_name
      FROM user u
      LEFT JOIN role r ON u.role_id = r.role_id
      WHERE u.user_id = ?`,
      [user_id]
    );
    
    return NextResponse.json({
      success: true,
      message: 'User role updated successfully',
      data: updatedRows[0]
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

// DELETE /api/admin - Delete user (optional feature)
export async function DELETE(req: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');
    
    if (!user_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameter: user_id' 
        }, 
        { status: 400 }
      );
    }
    
    connection = await mysql.createConnection(dbConfig);
    
    // Delete user
    const [result] = await connection.execute(
      'DELETE FROM user WHERE user_id = ?',
      [user_id]
    );
    
    const deleteResult = result as mysql.ResultSetHeader;
    
    if (deleteResult.affectedRows === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found' 
        }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
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
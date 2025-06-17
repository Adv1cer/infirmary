import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { authOptions } from '@/lib/auth';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

// GET /api/account - Get current user account details
export async function GET(req: NextRequest) {
  let connection;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT 
        u.user_id,
        u.name,
        u.email,
        u.phone,
        u.profile_picture,
        u.role_id,
        r.role_name,
        u.created_at,
        u.updated_at
      FROM user u
      LEFT JOIN role r ON u.role_id = r.role_id
      WHERE u.user_id = ?`,
      [session.user.id]
    );
    
    if (rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    const userData = rows[0];
    
    return NextResponse.json({
      success: true,
      data: {
        user_id: userData.user_id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        profile_picture: userData.profile_picture,
        role_id: userData.role_id,
        role_name: userData.role_name,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      }
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database error' 
      }, 
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

// PUT /api/account - Update user account details
export async function PUT(req: NextRequest) {
  let connection;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone, password, profile_picture } = body;
    
    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Name and email are required' 
        }, 
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);
    
    // Check if email is already taken by another user
    const [existingUsers] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT user_id FROM user WHERE email = ? AND user_id != ?',
      [email, session.user.id]
    );
    
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email is already taken by another user' 
        }, 
        { status: 400 }
      );
    }

    // Prepare update query
    let updateQuery = 'UPDATE user SET name = ?, email = ?, phone = ?';
    let updateParams: any[] = [name, email, phone || ''];
    
    // Add profile picture if provided
    if (profile_picture !== undefined) {
      updateQuery += ', profile_picture = ?';
      updateParams.push(profile_picture);
    }
    
    // Add password if provided
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      updateParams.push(hashedPassword);
    }
    
    updateQuery += ' WHERE user_id = ?';
    updateParams.push(session.user.id);
    
    const [result] = await connection.execute(updateQuery, updateParams);
    
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
        u.profile_picture,
        u.role_id,
        r.role_name
      FROM user u
      LEFT JOIN role r ON u.role_id = r.role_id
      WHERE u.user_id = ?`,
      [session.user.id]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Account updated successfully',
      data: updatedRows[0]
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database error' 
      }, 
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

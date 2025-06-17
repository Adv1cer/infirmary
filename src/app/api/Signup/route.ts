import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export async function POST(request: Request) {
  let connection;
  try {
    const { username, email, password, phone, token } = await request.json();

    // Validate input
    if (!username || !email || !password || !phone) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    // Connect to the database
    connection = await mysql.createConnection(dbConfig);

    // If token is provided, validate it
    if (token) {
      const [tokenRows] = await connection.execute(
        'SELECT * FROM signup_tokens WHERE token = ? AND used = FALSE AND expires_at > NOW()',
        [token]
      );
      
      if (!Array.isArray(tokenRows) || tokenRows.length === 0) {
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid or expired signup link' 
        }, { status: 400 });
      }

      // Mark token as used
      await connection.execute(
        'UPDATE signup_tokens SET used = TRUE WHERE token = ?',
        [token]
      );
    }

    // Check if email already exists
    const [existingUsers] = await connection.execute(
      'SELECT user_id FROM user WHERE email = ?',
      [email]
    );
    
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email already exists' 
      }, { status: 400 });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database with the default role_id as 1 (or adjust as needed)
    const [result] = await connection.execute<mysql.ResultSetHeader>(
      'INSERT INTO user (name, email, password, phone, role_id) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, phone, 1] 
    );

    if (result.affectedRows > 0) {
      return NextResponse.json({ success: true, message: 'Signup successful' });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to create user' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
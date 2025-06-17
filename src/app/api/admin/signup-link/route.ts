import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import crypto from 'crypto';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

// POST - Generate one-time signup link
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

    // Generate a unique token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    connection = await mysql.createConnection(dbConfig);
    
    // Create signup_tokens table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS signup_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(64) UNIQUE NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INT,
        INDEX idx_token (token),
        INDEX idx_expires (expires_at)
      )
    `);
    
    // Insert the token
    const [result] = await connection.execute(
      'INSERT INTO signup_tokens (token, expires_at) VALUES (?, ?)',
      [token, expiresAt]
    );
    
    // Generate the signup URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const signupUrl = `${baseUrl}/Signup?token=${token}`;
    
    console.log('Generated signup token:', token);
    
    return NextResponse.json({
      success: true,
      data: {
        token,
        signupUrl,
        expiresAt: expiresAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating signup link:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate signup link'
    }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// GET - Validate token
export async function GET(request: NextRequest) {
  let connection;
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token is required'
      }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT * FROM signup_tokens WHERE token = ? AND used = FALSE AND expires_at > NOW()',
      [token]
    );
    
    if (Array.isArray(rows) && rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired token'
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      valid: true
    });
  } catch (error) {
    console.error('Error validating token:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to validate token'
    }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

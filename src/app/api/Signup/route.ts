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
  try {
    const { username, email, password, phone } = await request.json();

    // Validate input
    if (!username || !email || !password || !phone) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Connect to the database
    const connection = await mysql.createConnection(dbConfig);

    // Insert the user into the database with the default role_id as 2 (user)
    const [result] = await connection.execute<mysql.ResultSetHeader>(
      'INSERT INTO user (name, email, password, phone, role_id) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, phone, 1] 
    );

    await connection.end();

    if (result.affectedRows > 0) {
      return NextResponse.json({ success: true, message: 'Signup successful' });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to create user' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
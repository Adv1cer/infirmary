import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import mysql from 'mysql2/promise';
import { authOptions } from '@/lib/auth';

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

// POST /api/account/upload-profile-picture - Upload profile picture
export async function POST(req: NextRequest) {
  let connection;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const data = await req.formData();
    const file: File | null = data.get('profile_picture') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile_${session.user.id}_${Date.now()}.${fileExtension}`;
    const filePath = join(process.cwd(), 'public', 'uploads', 'profiles', fileName);

    // Ensure directory exists
    await writeFile(filePath, buffer);

    // Update database with new profile picture path
    connection = await mysql.createConnection(dbConfig);
    
    const profilePicturePath = `/uploads/profiles/${fileName}`;
    
    await connection.execute(
      'UPDATE user SET profile_picture = ? WHERE user_id = ?',
      [profilePicturePath, session.user.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profile_picture: profilePicturePath
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Upload failed' 
      }, 
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

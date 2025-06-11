import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Update with your actual MySQL connection config
const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
};

export async function PUT(req: NextRequest) {
  try {
    const { patientrecord_id, status } = await req.json();
    if (!patientrecord_id || typeof status !== "number") {
      return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
    }
    const conn = await mysql.createConnection(dbConfig);
    const [result] = await conn.execute(
      "UPDATE patientrecord SET status = ? WHERE patientrecord_id = ?",
      [status, patientrecord_id]
    );
    await conn.end();
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

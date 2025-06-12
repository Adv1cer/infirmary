import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, symptoms, otherSymptom } = body;

        // ในที่นี้คุณสามารถบันทึกข้อมูลลงในฐานข้อมูลหรือ cache ได้
        // สำหรับตอนนี้เราจะส่งข้อมูลกลับไปให้ client จัดการ

        return NextResponse.json({
            success: true,
            data: {
                id,
                name,
                symptoms,
                otherSymptom
            }
        });
    } catch (error) {
        console.error('Error processing ticket data:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

"use client";
import { useParams, useSearchParams } from "next/navigation";

export default function Page() {
    const { id } = useParams(); // ✅ ใช้ useParams() สำหรับ client component
    const searchParams = useSearchParams();

    const name = searchParams.get("name") || "";
    const symptomsRaw = searchParams.get("symptoms") || "[]";
    const otherSymptom = searchParams.get("otherSymptom") || "";

    let symptoms: { symptom_id: number, symptom_name: string }[] = [];
    try {
        symptoms = JSON.parse(symptomsRaw);
    } catch {}

    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-300 via-purple-300 to-blue-400 p-4">
            <div className="flex flex-col items-center justify-center w-full max-w-lg p-8 bg-white/40 backdrop-blur-md rounded-2xl shadow-lg border border-white/20">
                <h2 className="mb-6 text-2xl font-bold text-center">บัตรคิวผู้ป่วย</h2>
                <div className="w-full text-lg space-y-4">
                    <div><span className="font-semibold">เลขที่บันทึก:</span> {id}</div>
                    <div><span className="font-semibold">ชื่อ:</span> {name}</div>
                    <div>
                        <span className="font-semibold">อาการ:</span>
                        <ul className="list-disc ml-6">
                            {symptoms.map(s => (
                                <li key={s.symptom_id}>{s.symptom_name}</li>
                            ))}
                        </ul>
                    </div>
                    {otherSymptom && (
                        <div><span className="font-semibold">หมายเหตุ:</span> {otherSymptom}</div>
                    )}
                </div>
            </div>
        </main>
    );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from 'react-hot-toast';
import DialogFormConfirm from "./dialogFormConfirm";
import { StatusPopover, SymptomsPopover } from "./popoverForm";

export default function PatientForm({ initialSymptoms = [] }: { initialSymptoms?: any[] }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [studentId, setStudentId] = useState("");
    const [otherSymptom, setOtherSymptom] = useState("");
    const [statusValue, setStatusValue] = useState("");
    const [symptoms, setSymptoms] = useState<any[]>(initialSymptoms);
    const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);
    const [open, setOpen] = useState(false);
    const [statusOpen, setStatusOpen] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [name, setName] = useState("");

    useEffect(() => {
        if (!initialSymptoms.length) {
            fetch("/api/patientform/symptoms")
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        setSymptoms(data);
                    } else {
                        setSymptoms([]);
                    }
                })
                .catch(() => setSymptoms([]));
        }
    }, []);

    const toggleSymptom = (id: string) => {
        const numId = Number(id);
        setSelectedSymptoms((prev) =>
            prev.includes(numId) ? prev.filter((s) => s !== numId) : [...prev, numId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};
        if (!name.trim()) newErrors.name = "กรุณากรอกชื่อ";
        if (!statusValue) newErrors.status = "กรุณาเลือกสถานะ";
        if (statusValue === "1" && !studentId.trim()) newErrors.studentId = "กรุณากรอกรหัสนักศึกษา";
        if (statusValue === "2" && !studentId.trim()) newErrors.studentId = "กรุณากรอก Personal ID";
        if (selectedSymptoms.length === 0) newErrors.symptom = "กรุณาเลือกอาการ";
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        if (selectedSymptoms.includes(12) && !otherSymptom.trim()) {
            newErrors.otherSymptom = "กรุณาระบุอาการอื่นๆ";
            setErrors(newErrors);
            return;
        }
        setShowConfirmDialog(true);
    };

    const handleConfirmSubmit = async () => {
        const formData = {
            name,
            status: statusValue,
            studentId,
            selectedSymptoms: selectedSymptoms.map(Number),
            otherSymptom: selectedSymptoms.includes(12) ? otherSymptom : "",
        };
        try {
            const res = await fetch("/api/patientform/submitform", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                const data = await res.json();
                setShowConfirmDialog(false);
                toast.success('บันทึกข้อมูลสำเร็จแล้ว!', { duration: 4000 });
                router.push(`/showticket/${data.patientRecordId}?name=${encodeURIComponent(data.name)}&symptoms=${encodeURIComponent(JSON.stringify(data.symptoms))}&otherSymptom=${encodeURIComponent(data.otherSymptom)}`);
                return;
            } else {
                const errorData = await res.json();
                setShowConfirmDialog(false);
                toast.error(errorData.error || "เกิดข้อผิดพลาดในการส่งข้อมูล");
            }
        } catch (error) {
            setShowConfirmDialog(false);
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-teal-100 p-4">
            <div className="flex flex-col items-center justify-center w-full max-w-xl p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-blue-200/50">
                <h2 className="mb-8 text-3xl font-semibold text-black text-center drop-shadow-sm">แบบสอบถามอาการ</h2>
                <div className="w-full">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name" className="block mb-2 text-lg font-medium text-black">
                                ชื่อ-นามสกุล
                            </label>
                            <input
                                type="text"
                                id="name"
                                className="w-full p-3 text-lg border border-blue-300/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                            {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name}</span>}
                        </div>
                        <div>
                            <label htmlFor="status" className="block mb-2 text-lg font-medium text-black">
                                สถานะ
                            </label>
                            <StatusPopover
                                open={statusOpen}
                                setOpen={setStatusOpen}
                                statusValue={statusValue}
                                setStatusValue={setStatusValue}
                            />
                            {errors.status && <span className="text-red-500 text-sm">{errors.status}</span>}
                        </div>
                        {statusValue === "1" && (
                            <div className="transition-all duration-300 ease-in-out">
                                <label htmlFor="studentId" className="block mb-2 text-lg font-medium text-black">
                                    Student ID
                                </label>
                                <input
                                    type="text"
                                    id="studentId"
                                    className="w-full p-3 text-lg border border-blue-300/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                                    value={studentId}
                                    onChange={e => setStudentId(e.target.value)}
                                    required
                                />
                                {errors.studentId && <span className="text-red-500 text-sm mt-1">{errors.studentId}</span>}
                            </div>
                        )}
                        {statusValue === "2" && (
                            <div className="transition-all duration-300 ease-in-out">
                                <label htmlFor="studentId" className="block mb-2 text-lg font-medium text-black">
                                    Personal ID
                                </label>
                                <input
                                    type="text"
                                    id="studentId"
                                    className="w-full p-3 text-lg border border-blue-300/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                                    value={studentId}
                                    onChange={e => setStudentId(e.target.value)}
                                    required
                                />
                                {errors.studentId && <span className="text-red-500 text-sm mt-1">{errors.studentId}</span>}
                            </div>
                        )}
                        <div>
                            <label htmlFor="symptom" className="block mb-2 text-lg font-medium text-black">
                                อาการ
                            </label>
                            <SymptomsPopover
                                open={open}
                                setOpen={setOpen}
                                symptoms={symptoms}
                                selectedSymptoms={selectedSymptoms}
                                toggleSymptom={toggleSymptom}
                            />
                            {/* Show "อื่นๆ" input if symptom ID 12 is selected */}
                            {selectedSymptoms.includes(12) && (
                                <div className="mt-4 transition-all duration-300 ease-in-out">
                                    <label htmlFor="otherSymptom" className="block mb-2 text-lg font-medium text-black">
                                        หมายเหตุ
                                    </label>
                                    <input
                                        type="text"
                                        id="otherSymptom"
                                        className="w-full p-3 text-lg border border-blue-300/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                                        value={otherSymptom}
                                        onChange={e => setOtherSymptom(e.target.value)}
                                        required
                                    />
                                    {errors.otherSymptom && <span className="text-red-500 text-sm mt-1">{errors.otherSymptom}</span>}
                                </div>
                            )}
                            {errors.symptom && <span className="text-red-500 text-sm mt-1">{errors.symptom}</span>}
                        </div>
                        <button
                            type="submit"
                            className="w-full p-3 mt-6 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 focus:ring-4 focus:ring-blue-300 shadow-lg"
                        >
                            บันทึกข้อมูล
                        </button>
                    </form>
                </div>
            </div>
            <DialogFormConfirm
                open={showConfirmDialog}
                setOpen={setShowConfirmDialog}
                name={name}
                statusValue={statusValue}
                studentId={studentId}
                symptoms={symptoms}
                selectedSymptoms={selectedSymptoms}
                otherSymptom={otherSymptom}
                onConfirm={handleConfirmSubmit}
            />
        </main>
    );
}

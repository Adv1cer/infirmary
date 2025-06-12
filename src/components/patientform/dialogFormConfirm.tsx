import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import React, { useState } from "react";

export type Symptom = {
    symptom_id: string;
    symptom_name: string;
};

interface DialogFormConfirmProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    name: string;
    statusValue: string;
    studentId: string;
    symptoms: Symptom[];
    selectedSymptoms: number[];
    otherSymptom: string;
    onConfirm: () => void;
}

const DialogFormConfirm: React.FC<DialogFormConfirmProps> = ({
    open,
    setOpen,
    name,
    statusValue,
    studentId,
    symptoms,
    selectedSymptoms,
    otherSymptom,
    onConfirm,
}) => {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-center">
                        ยืนยันการส่งข้อมูล
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600">
                        คุณต้องการส่งข้อมูลแบบสอบถามอาการหรือไม่?
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3">
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div><strong>ชื่อ-นามสกุล:</strong> {name}</div>
                        <div><strong>สถานะ:</strong> {
                            statusValue === "1" ? "นักศึกษา" :
                                statusValue === "2" ? "บุคคลากร" :
                                    statusValue === "3" ? "บุคคลภายนอก" : ""
                        }</div>
                        {(statusValue === "1" || statusValue === "2") && (
                            <div><strong>{statusValue === "1" ? "Student ID" : "Personal ID"}:</strong> {studentId}</div>
                        )}
                        <div><strong>อาการ:</strong> {
                            symptoms
                                .filter((s) => selectedSymptoms.includes(Number(s.symptom_id)))
                                .map((s) => s.symptom_name)
                                .join(", ")
                        }</div>
                        {selectedSymptoms.includes(12) && otherSymptom && (
                            <div><strong>หมายเหตุ:</strong> {otherSymptom}</div>
                        )}
                    </div>
                </div>
                <DialogFooter className="flex gap-3 sm:gap-3">
                    <Button
                        onClick={handleConfirm}
                        className={`flex-1 bg-blue-500 hover:bg-blue-600 flex items-center justify-center ${loading ? 'cursor-wait opacity-70' : ''}`}
                        disabled={loading}
                    >
                        {loading && (
                            <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                        )}
                        ยืนยัน
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="flex-1"
                        disabled={loading}
                    >
                        ยกเลิก
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DialogFormConfirm;
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DialogMedicineEdit({ medicine, onSave }: {
  medicine: any, // ต้องส่ง medicine เสมอ (สำหรับแก้ไขเท่านั้น)
  onSave?: (data: any) => void
}) {
  const [open, setOpen] = useState(false);
  const [pillTypes, setPillTypes] = useState<{ type_id: number, type_name: string }[]>([]);
  const [unitTypes, setUnitTypes] = useState<{ unit_id: number, unit_type: string }[]>([]);
  const [form, setForm] = useState({
    pill_id: medicine.pill_id,
    pill_name: medicine.pill_name,
    dose: medicine.dose,
    type_id: medicine.type_id,
    unit_id: medicine.unit_id,
    status: medicine.status,
  });

  useEffect(() => {
    // Fetch pillTypes and unitTypes from API
    fetch('/api/medicine/pilltype')
      .then(res => res.json())
      .then(data => setPillTypes(data));
    fetch('/api/medicine/unit')
      .then(res => res.json())
      .then(data => setUnitTypes(data));
  }, []);

  useEffect(() => {
    setForm({
      pill_id: medicine.pill_id,
      pill_name: medicine.pill_name,
      dose: medicine.dose,
      type_id: medicine.type_id,
      unit_id: medicine.unit_id,
      status: medicine.status,
    });
  }, [medicine, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'status' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/medicine/editMedicine', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setOpen(false);
    if (onSave) onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-all" type="button">
          แก้ไข
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลยา</DialogTitle>
          <DialogDescription>
            แก้ไขข้อมูลยาให้ครบถ้วน
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-2" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="pill_name">ชื่อยา</Label>
            <Input name="pill_name" value={form.pill_name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="dose">ขนาดยา (Dose)</Label>
            <Input name="dose" value={form.dose} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="type_id">ประเภท (Type)</Label>
            <select name="type_id" value={form.type_id} onChange={handleChange} className="w-full border rounded px-3 py-1" required>
              {pillTypes.map(t => <option key={t.type_id} value={t.type_id}>{t.type_name}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="unit_id">หน่วย (Unit)</Label>
            <select name="unit_id" value={form.unit_id} onChange={handleChange} className="w-full border rounded px-3 py-1" required>
              {unitTypes.map(u => <option key={u.unit_id} value={u.unit_id}>{u.unit_type}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="status">สถานะ</Label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-1">
              <option value={1}>ใช้งาน</option>
              <option value={0}>ไม่ใช้งาน</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setOpen(false)}>ยกเลิก</button>
            <button type="submit" className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">บันทึก</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
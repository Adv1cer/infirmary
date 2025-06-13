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

export default function DialogMedicineAdd({ onSave }: { onSave?: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [pillTypes, setPillTypes] = useState<{ type_id: number, type_name: string }[]>([]);
  const [unitTypes, setUnitTypes] = useState<{ unit_id: number, unit_type: string }[]>([]);
  const [form, setForm] = useState({
    pill_name: '',
    dose: '',
    type_id: '',
    unit_id: '',
    status: 1,
  });

  useEffect(() => {
    fetch('/api/medicine/pilltype')
      .then(res => res.json())
      .then(data => setPillTypes(data));
    fetch('/api/medicine/unit')
      .then(res => res.json())
      .then(data => setUnitTypes(data));
  }, []);

  useEffect(() => {
    // Set default type/unit when loaded
    if (pillTypes.length && !form.type_id) {
      setForm(f => ({ ...f, type_id: pillTypes[0].type_id.toString() }));
    }
    if (unitTypes.length && !form.unit_id) {
      setForm(f => ({ ...f, unit_id: unitTypes[0].unit_id.toString() }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pillTypes, unitTypes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'status' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Convert type_id and unit_id to number before sending
    const payload = {
      ...form,
      type_id: Number(form.type_id),
      unit_id: Number(form.unit_id),
    };
    // Fetch CSRF token before submitting
    const csrfRes = await fetch('/api/csrf');
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;
    await fetch('/api/medicine/addMedicine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'csrf-token': csrfToken,
      },
      body: JSON.stringify(payload),
    });
    setOpen(false);
    setForm({ pill_name: '', dose: '', type_id: pillTypes[0]?.type_id?.toString() || '', unit_id: unitTypes[0]?.unit_id?.toString() || '', status: 1 });
    if (onSave) onSave(payload);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-all" type="button">
          เพิ่มยาใหม่
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เพิ่มยาใหม่</DialogTitle>
          <DialogDescription>
            กรอกข้อมูลยาให้ครบถ้วน
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
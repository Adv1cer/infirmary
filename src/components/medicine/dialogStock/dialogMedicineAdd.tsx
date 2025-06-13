import React, { useState } from 'react';
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

export default function DialogStockAdd({ pillId, onSave }: { pillId: number, onSave?: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    pill_id: pillId,
    expire: '',
    total: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Fetch CSRF token before submitting
    const csrfRes = await fetch('/api/csrf');
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;
    await fetch('/api/medicine/addStock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'csrf-token': csrfToken,
      },
      body: JSON.stringify({
        pill_id: form.pill_id,
        expire: form.expire,
        total: Number(form.total),
      }),
    });
    setLoading(false);
    setOpen(false);
    setForm({ pill_id: pillId, expire: '', total: '' });
    if (onSave) onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-green-100 text-green-700 hover:bg-green-200 transition-all px-3 py-1 rounded" type="button">
          เพิ่มสต็อก
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เพิ่มสต็อกยา</DialogTitle>
          <DialogDescription>กรอกข้อมูลสต็อกยาให้ครบถ้วน</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="pill_id">Pill ID</Label>
            <Input id="pill_id" name="pill_id" type="text" value={form.pill_id} disabled />
          </div>
          <div>
            <Label htmlFor="expire">วันหมดอายุ</Label>
            <Input id="expire" name="expire" type="date" value={form.expire} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="total">จำนวนทั้งหมด</Label>
            <Input id="total" name="total" type="number" value={form.total} onChange={handleChange} required min={1} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setOpen(false)} disabled={loading}>ยกเลิก</button>
            <button type="submit" className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>บันทึก</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
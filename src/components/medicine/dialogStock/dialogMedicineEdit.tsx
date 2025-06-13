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

// Helper to get CSRF token
async function getCsrfToken(): Promise<string> {
  const res = await fetch('/api/csrf');
  const data = await res.json();
  return data.csrfToken;
}

// Helper to POST/PUT with CSRF and auto-retry on 403
async function fetchWithCsrfRetry(
  url: string,
  options: RequestInit = {},
  maxRetry = 1
): Promise<Response> {
  let csrfToken = await getCsrfToken();
  let attempt = 0;
  while (attempt <= maxRetry) {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers ? options.headers : {}),
        'csrf-token': csrfToken,
      },
    });
    if (res.status !== 403) return res;
    // If forbidden, try to get a new token and retry
    csrfToken = await getCsrfToken();
    attempt++;
  }
  throw new Error('Forbidden: CSRF token expired or invalid');
}

export default function DialogStockEdit({ stock, onSave }: { stock: any, onSave?: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    pillstock_id: stock.pillstock_id,
    pill_id: stock.pill_id,
    expire: stock.expire ? stock.expire.slice(0, 10) : '', // YYYY-MM-DD
    total: stock.total,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        pillstock_id: form.pillstock_id,
        pill_id: form.pill_id,
        expire: form.expire,
        total: Number(form.total),
      };
      const res = await fetchWithCsrfRetry('/api/medicine/editStock', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 403) {
          alert('เซสชันหมดอายุ กรุณารีเฟรชหน้าใหม่หรือล็อกอินอีกครั้ง');
        } else {
          alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
        }
        setLoading(false);
        return;
      }
      setLoading(false);
      setOpen(false);
      if (onSave) onSave(payload);
    } catch (error) {
      setLoading(false);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-all px-3 py-1 rounded" type="button">
          แก้ไขสต็อก
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>แก้ไขสต็อกยา</DialogTitle>
          <DialogDescription>แก้ไขข้อมูลสต็อกยาให้ครบถ้วน</DialogDescription>
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

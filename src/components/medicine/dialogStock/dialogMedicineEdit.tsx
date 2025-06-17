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
import { CalendarDays, Package, Hash } from 'lucide-react';

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
      if (onSave) onSave(payload); // <-- This triggers parent refresh
    } catch (error) {
      setLoading(false);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button 
          className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 transition-all duration-200 px-3 py-1.5 rounded-md text-sm font-medium border border-amber-200" 
          type="button"
        >
          <Package className="w-4 h-4" />
          แก้ไขสต็อก
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white border-0 shadow-xl">
        <DialogHeader className="text-center pb-4 border-b border-gray-100">
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
            <Package className="w-6 h-6 text-amber-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900">แก้ไขสต็อกยา</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            แก้ไขข้อมูลสต็อกยาให้ครบถ้วนและถูกต้อง
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pill ID Field */}
            <div className="space-y-2">
              <Label htmlFor="pill_id" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" />
                รหัสยา
              </Label>
              <Input 
                id="pill_id" 
                name="pill_id" 
                type="text" 
                value={form.pill_id} 
                disabled 
                className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed focus:ring-0 focus:border-gray-200" 
              />
            </div>

            {/* Total Field */}
            <div className="space-y-2">
              <Label htmlFor="total" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                จำนวนทั้งหมด
              </Label>
              <Input 
                id="total" 
                name="total" 
                type="number" 
                value={form.total} 
                onChange={handleChange} 
                required 
                min={1}
                className="border-gray-200 focus:border-amber-500 focus:ring-amber-200 transition-colors duration-200" 
              />
            </div>
          </div>

          {/* Expiry Date Field - Full Width */}
          <div className="space-y-2">
            <Label htmlFor="expire" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-gray-500" />
              วันหมดอายุ
            </Label>
            <Input 
              id="expire" 
              name="expire" 
              type="date" 
              value={form.expire} 
              onChange={handleChange} 
              required 
              className="border-gray-200 focus:border-amber-500 focus:ring-amber-200 transition-colors duration-200" 
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                        <button 
              type="submit" 
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  บันทึกการแก้ไข
                </>
              )}
            </button>
            <button 
              type="button" 
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={() => setOpen(false)} 
              disabled={loading}
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

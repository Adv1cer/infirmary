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
import { Package } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        pill_id: form.pill_id,
        expire: form.expire,
        total: Number(form.total),
      };
      const res = await fetchWithCsrfRetry('/api/medicine/addStock', {
        method: 'POST',
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
      setForm({ pill_id: pillId, expire: '', total: '' });
      if (onSave) onSave(payload); // <-- This triggers parent refresh
    } catch (error) {
      setLoading(false);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 px-3 py-1.5 border border-green-600 bg-green-200 text-green-600 font-medium rounded-lg hover:bg-green-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" type="button">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          เพิ่มสต็อก
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            เพิ่มสต็อกยา
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            กรอกข้อมูลสต็อกยาให้ครบถ้วนและถูกต้อง
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          {/* Pill ID (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="pill_id" className="text-sm font-medium text-gray-700">
              รหัสยา
            </Label>
            <Input 
              id="pill_id" 
              name="pill_id" 
              type="text" 
              value={form.pill_id} 
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              disabled 
            />
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expire" className="text-sm font-medium text-gray-700">
              วันหมดอายุ <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="expire" 
              name="expire" 
              type="date" 
              value={form.expire} 
              onChange={handleChange} 
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required 
            />
          </div>

          {/* Total Quantity */}
          <div className="space-y-2">
            <Label htmlFor="total" className="text-sm font-medium text-gray-700">
              จำนวนทั้งหมด <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="total" 
              name="total" 
              type="number" 
              value={form.total} 
              onChange={handleChange} 
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="กรอกจำนวน"
              required 
              min={1} 
            />
          </div>          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                        <button 
              type="submit" 
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
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
                  บันทึกสต็อก
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
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
import { Package } from 'lucide-react';

export default function DialogMedicineEdit({ medicine, onSave }: {
  medicine: any, // ต้องส่ง medicine เสมอ (สำหรับแก้ไขเท่านั้น)
  onSave?: (data: any) => void
}) {  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
      // Convert type_id and unit_id to number before sending
      const payload = {
        ...form,
        type_id: Number(form.type_id),
        unit_id: Number(form.unit_id),
      };
      // Use fetchWithCsrfRetry for CSRF-protected request
      const res = await fetchWithCsrfRetry('/api/medicine/editMedicine', {
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
        <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2" type="button">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          แก้ไข
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            แก้ไขข้อมูลยา
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            แก้ไขข้อมูลยาให้ครบถ้วนและถูกต้อง
          </DialogDescription>
        </DialogHeader>
        
        <form className="space-y-6 pt-6" onSubmit={handleSubmit}>
          {/* Medicine Name */}
          <div className="space-y-2">
            <Label htmlFor="pill_name" className="text-sm font-medium text-gray-700">
              ชื่อยา <span className="text-red-500">*</span>
            </Label>
            <Input 
              name="pill_name" 
              value={form.pill_name} 
              onChange={handleChange} 
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="กรอกชื่อยา"
              required 
            />
          </div>

          {/* Dose */}
          <div className="space-y-2">
            <Label htmlFor="dose" className="text-sm font-medium text-gray-700">
              ขนาดยา (Dose) <span className="text-red-500">*</span>
            </Label>
            <Input 
              name="dose" 
              value={form.dose} 
              onChange={handleChange} 
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="เช่น 500mg, 10ml"
              required 
            />
          </div>

          {/* Medicine Type */}
          <div className="space-y-2">
            <Label htmlFor="type_id" className="text-sm font-medium text-gray-700">
              ประเภท (Type) <span className="text-red-500">*</span>
            </Label>
            <select 
              name="type_id" 
              value={form.type_id} 
              onChange={handleChange} 
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              required
            >
              {pillTypes.map(t => (
                <option key={t.type_id} value={t.type_id}>{t.type_name}</option>
              ))}
            </select>
          </div>

          {/* Unit Type */}
          <div className="space-y-2">
            <Label htmlFor="unit_id" className="text-sm font-medium text-gray-700">
              หน่วย (Unit) <span className="text-red-500">*</span>
            </Label>
            <select 
              name="unit_id" 
              value={form.unit_id} 
              onChange={handleChange} 
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              required
            >
              {unitTypes.map(u => (
                <option key={u.unit_id} value={u.unit_id}>{u.unit_type}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
              สถานะ
            </Label>
            <select 
              name="status" 
              value={form.status} 
              onChange={handleChange} 
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            >
              <option value={1}>ใช้งาน</option>
              <option value={0}>ไม่ใช้งาน</option>
            </select>
          </div>          {/* Action Buttons */}
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
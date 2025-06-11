import React, { useEffect, useState } from 'react';
import DialogMedicineEdit from './dialogMedicine/dialogEdit';
import DialogMedicineAdd from './dialogMedicine/dialogAdd';
import DialogStockAdd from './dialogStock/dialogMedicineAdd';
import DialogStockEdit from './dialogStock/dialogMedicineEdit';

interface Patient {
  id: number;
  patient_id: number;
  patient_name: string;
  patient_type: string;
  datetime: string;
  status: string;
}

interface Medicine {
  pill_id: number;
  pill_name: string;
  dose: string;
  status: number;
  type_name: string;
  unit_type: string;
}

interface StockRow {
  pillstock_id: number;
  pill_id: number;
  expire: string;
  total: number;
}

function StockTable({ pillId }: { pillId: number }) {
  const [stock, setStock] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    if (!pillId) return;
    setLoading(true);
    fetch(`/api/prescription/medicine/stock?pill_id=${pillId}`)
      .then((res) => res.json())
      .then((data) => setStock(data))
      .finally(() => setLoading(false));
  }, [pillId]);

  if (!showTable) {
    return (
      <tr>
        <td colSpan={7} className="p-0 text-center">
          <button
            className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-all"
            onClick={() => setShowTable(true)}
            type="button"
          >
            แสดงสต็อก
          </button>
        </td>
      </tr>
    );
  }

  if (loading) return <tr><td colSpan={7} className="text-center py-4">Loading stock...</td></tr>;
  if (!stock.length) return <tr><td colSpan={7} className="text-center py-4 text-gray-500 text-sm">ไม่พบข้อมูลสต็อก</td></tr>;

  return (
    <tr>
      <td colSpan={7} className="p-0">
        <div className="overflow-x-auto bg-blue-50/50 border-t">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 to-pink-100">
                <th className="px-4 py-2 border-b text-blue-700">Stock ID</th>
                <th className="px-4 py-2 border-b text-blue-700">Pill ID</th>
                <th className="px-4 py-2 border-b text-blue-700">Pill Name</th>
                <th className="px-4 py-2 border-b text-pink-700">Expire (Date/Time)</th>
                <th className="px-4 py-2 border-b text-blue-700">Total</th>
                <th className="px-4 py-2 border-b text-blue-700"><DialogStockAdd pillId={pillId} /></th>
              </tr>
            </thead>
            <tbody>
              {stock.map((s) => (
                <tr key={s.pillstock_id}>
                  <td className="px-4 py-2 border-b text-center">{s.pillstock_id}</td>
                  <td className="px-4 py-2 border-b text-center">{s.pill_id}</td>
                  <td className="px-4 py-2 border-b text-center">{/* pill_name will be fetched below */} - </td>
                  <td className="px-4 py-2 border-b text-center">{new Date(s.expire).toLocaleString('th-TH')}</td>
                  <td className="px-4 py-2 border-b text-center">{s.total}</td>
                  <td className="px-4 py-2 border-b text-center"><DialogStockEdit stock={s} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
}

export default function MedicineTable() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [openRow, setOpenRow] = useState<number | null>(null);

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      const res = await fetch('/api/prescription/medicine');
      if (res.ok) {
        const data = await res.json();
        setMedicines(data);
      }
      setLoading(false);
    };
    fetchMedicines();
  }, []);

  if (loading) return <div className="p-8 text-blue-600">Loading medicines...</div>;
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className="w-full bg-white shadow-sm">
      <div className="flex items-center justify-center py-6">
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="text-lg font-medium">รายการยา</h2>
        </div>
      </div>
      </div>
      <div className="bg-white shadow-sm overflow-hidden">      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PATIENT ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PATIENT NAME</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PATIENT TYPE</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATETIME</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTION</th>            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {medicines.map((m) => (
              <React.Fragment key={m.pill_id}>
                <tr className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setOpenRow(openRow === m.pill_id ? null : m.pill_id)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.pill_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.pill_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.dose}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.type_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.unit_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      m.status === 1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {m.status === 1 ? 'สำเร็จ' : 'ไม่สำเร็จ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                      ดำเนินการ
                    </button>
                  </td>
                </tr>
                {openRow === m.pill_id && <StockTable pillId={m.pill_id} />}              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="bg-white px-6 py-3 flex items-center justify-center border-t border-gray-200">
          <div className="flex items-center gap-4">
            <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page 1 of 2
            </span>
            <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

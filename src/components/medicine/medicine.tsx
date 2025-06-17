import React, { useEffect, useState } from "react";
import DialogMedicineEdit from "./dialogMedicine/dialogEdit";
import DialogMedicineAdd from "./dialogMedicine/dialogAdd";
import DialogStockAdd from "./dialogStock/dialogMedicineAdd";
import DialogStockEdit from "./dialogStock/dialogMedicineEdit";

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
  pill_name?: string;
  expire: string;
  total: number;
}

function StockTable({ pillId, pillName }: { pillId: number; pillName: string }) {
  const [stock, setStock] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!pillId) return;
    setLoading(true);
    fetch(`/api/prescription/medicine/stock?pill_id=${pillId}`)
      .then((res) => res.json())
      .then((data) => {
        // เพิ่มชื่อยาให้กับแต่ละ stock item
        const stockWithNames = data.map((item: StockRow) => ({
          ...item,
          pill_name: pillName
        }));
        setStock(stockWithNames);
      })
      .finally(() => setLoading(false));
  }, [pillId, pillName, refreshKey]);  return (
    <tr>
      <td colSpan={7} className="p-0">
        <div className="overflow-x-auto bg-blue-50/30 border-t border-blue-200">
          <table className="bg-blue-50/20 min-w-full text-sm">
            <thead>
              <tr className="bg-blue-100/60 border-b border-blue-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Stock ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Pill ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Pill Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                  Expire (Date/Time)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-center">
                  <DialogStockAdd pillId={pillId} onSave={() => setRefreshKey((k) => k + 1)} />
                </th>              </tr>
            </thead>
            <tbody className="bg-blue-50/20 divide-y divide-blue-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-blue-600">
                    Loading stock...
                  </td>
                </tr>
              ) : stock.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-blue-500 text-sm">
                    ไม่พบข้อมูลสต็อก
                  </td>
                </tr>
              ) : (
                stock.map((s) => (
                  <tr key={s.pillstock_id} className="hover:bg-blue-100/40 transition-colors">
                    <td className="px-6 py-4 text-sm text-blue-900">
                      {s.pillstock_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-900">
                      {s.pill_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-900">
                      {s.pill_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-900">
                      {new Date(s.expire).toLocaleString("th-TH")}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-blue-900">{s.total}</td>
                    <td className="px-6 py-4 text-center">
                      <DialogStockEdit stock={s} onSave={() => setRefreshKey((k) => k + 1)} />
                    </td>
                  </tr>
                ))
              )}
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
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      const res = await fetch("/api/prescription/medicine");
      if (res.ok) {
        const data = await res.json();
        setMedicines(data);
      }
      setLoading(false);
    };
    fetchMedicines();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(medicines.length / itemsPerPage);
  const paginatedMedicines = medicines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading)
    return <div className="p-8 text-blue-600">Loading medicines...</div>;
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full bg-white shadow-sm mb-6">
        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-2 text-gray-600">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h2 className="text-lg font-medium">รายการยา</h2>
          </div>
        </div>
      </div>      <div className="bg-white shadow-sm overflow-hidden mx-6 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  MEDICINE ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  MEDICINE NAME
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  MEDICINE DOSE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  MEDICINE TYPE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  UNIT TYPE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  <DialogMedicineAdd onSave={() => {
                    // Refresh medicines after add
                    setLoading(true);
                    fetch("/api/prescription/medicine")
                      .then(res => res.json())
                      .then(data => setMedicines(data))
                      .finally(() => setLoading(false));                  }} />
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {paginatedMedicines.map((m) => (
                <React.Fragment key={m.pill_id}>
                  <tr
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() =>
                      setOpenRow(openRow === m.pill_id ? null : m.pill_id)
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {m.pill_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {m.pill_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {m.dose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {m.type_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {m.unit_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          m.status === 1
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {m.status === 1 ? "ใช้งาน" : "ไม่ใช้งาน"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <DialogMedicineEdit medicine={m} onSave={() => {
                        setLoading(true);
                        fetch("/api/prescription/medicine")
                          .then(res => res.json())
                          .then(data => setMedicines(data))
                          .finally(() => setLoading(false));
                      }} />                    </td>
                  </tr>
                  {openRow === m.pill_id && <StockTable pillId={m.pill_id} pillName={m.pill_name} />}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="bg-slate-50 px-6 py-3 flex items-center justify-center border-t border-slate-200">
            <div className="flex items-center gap-4">
              <button
                className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-sm text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

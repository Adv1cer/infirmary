import React from "react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function StockTable({
  pillId,
  selected,
  setSelected,
}: {
  pillId: number;
  onChoose?: (stock: any, amount: number) => void;
  selected: { pillstock: any; amount: number }[];
  setSelected: React.Dispatch<
    React.SetStateAction<{ pillstock: any; amount: number }[]>
  >;
}) {
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pillId) return;
    setLoading(true);
    fetch(`/api/prescription/medicine/stock?pill_id=${pillId}`)
      .then((res) => res.json())
      .then((data) => setStock(data))
      .finally(() => setLoading(false));
  }, [pillId]);

  const handleSelect = (s: any) => {
    if (
      !selected.find((sel) => sel.pillstock.pillstock_id === s.pillstock_id)
    ) {
      setSelected([{ pillstock: s, amount: 1 }, ...selected]);
    }
  };

  return (
    <div className="overflow-x-auto bg-gradient-to-r from-blue-25 to-pink-25 border-t-2 border-blue-200">
      <div className="p-4">
        <div className="flex items-center mb-3">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-pink-400 rounded-full flex items-center justify-center mr-2">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
              />
            </svg>
          </div>
          <h4 className="text-sm font-bold text-blue-700">สต็อกคลังยา</h4>
        </div>
        <table className="min-w-full bg-white/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-sm border border-blue-100">
          <thead>
            <tr className="bg-gradient-to-r from-blue-100 to-pink-100">
              <th className="px-4 py-2 text-xs font-bold text-blue-700 border-b border-blue-200">
                รหัสสต็อก
              </th>
              <th className="px-4 py-2 text-xs font-bold text-pink-700 border-b border-pink-200">
                วันหมดอายุ
              </th>
              <th className="px-4 py-2 text-xs font-bold text-blue-700 border-b border-blue-200">
                จำนวนคงเหลือ
              </th>
              <th className="px-4 py-2 text-xs font-bold text-blue-700 border-b border-blue-200">
                เลือก
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  กำลังโหลด...
                </td>
              </tr>
            ) : (
              stock.map((s: any) => (
                <tr
                  key={s.pillstock_id}
                  className="hover:bg-blue-50/50 transition-colors duration-200"
                >
                  <td className="px-4 py-2 text-center text-slate-700 border-b border-blue-100">
                    {s.pillstock_id}
                  </td>
                  <td className="px-4 py-2 text-center text-slate-700 border-b border-pink-100">
                    {new Date(s.expire).toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-4 py-2 text-center font-semibold text-slate-700 border-b border-blue-100">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        s.total > 50
                          ? "bg-green-100 text-green-700"
                          : s.total > 10
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.total} หน่วย
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center border-b border-blue-100">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => handleSelect(s)}
                    >
                      เลือก
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MedicineTable({
  patientrecord_id,
}: {
  patientrecord_id: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openRow, setOpenRow] = useState<number | null>(null);
  // Move selected state to parent
  const [selected, setSelected] = useState<
    { pillstock: any; amount: number }[]
  >([]);

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
  if (loading)
    return (
      <div className="flex items-center justify-center p-8 bg-gradient-to-r from-blue-50 to-pink-50 rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
        <span className="text-blue-600 font-medium">กำลังโหลดข้อมูลยา...</span>
      </div>
    );

  // Handler for changing amount in selected table
  const handleAmountChange = (pillstock_id: number, value: string) => {
    setSelected(
      selected.map((sel) =>
        sel.pillstock.pillstock_id === pillstock_id
          ? {
              ...sel,
              amount: Math.max(1, Math.min(Number(value), sel.pillstock.total)),
            }
          : sel
      )
    );
  };
  // Handler for removing a selected pillstock
  const handleRemove = (pillstock_id: number) => {
    setSelected(
      selected.filter((sel) => sel.pillstock.pillstock_id !== pillstock_id)
    );
  };

  return (
    <div className="mt-8 bg-gradient-to-br from-blue-50 to-pink-50 p-6 rounded-2xl shadow-xl border-2 border-blue-100/50">
      <div className="flex items-center justify-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-200 to-pink-200 rounded-full flex items-center justify-center mr-3">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
          รายการยา
        </h2>
      </div>
      {/* Selected pillstocks table (between card and main table) */}
      {selected.length > 0 && (
        <div className="mb-8">
          <h4 className="text-sm font-bold text-blue-700 mb-2">ยาที่เลือก</h4>
          <table className="min-w-full bg-white/90 rounded-lg overflow-hidden shadow border border-blue-200 mb-2">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 to-blue-100">
                <th className="px-4 py-2 text-xs font-bold text-blue-700">
                  รหัสสต็อก
                </th>
                <th className="px-4 py-2 text-xs font-bold text-blue-700">
                  วันหมดอายุ
                </th>
                <th className="px-4 py-2 text-xs font-bold text-blue-700">
                  จำนวนคงเหลือ
                </th>
                <th className="px-4 py-2 text-xs font-bold text-blue-700">
                  จำนวนที่ต้องการ
                </th>
                <th className="px-4 py-2 text-xs font-bold text-blue-700"></th>
              </tr>
            </thead>
            <tbody>
              {selected.map((sel) => (
                <tr key={sel.pillstock.pillstock_id}>
                  <td className="px-4 py-2 text-center">
                    {sel.pillstock.pillstock_id}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {new Date(sel.pillstock.expire).toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {sel.pillstock.total}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center">
                      <Input
                        type="number"
                        min={1}
                        max={sel.pillstock.total}
                        value={sel.amount}
                        onChange={(e) =>
                          handleAmountChange(
                            sel.pillstock.pillstock_id,
                            e.target.value
                          )
                        }
                        className="w-24 h-10 text-center border-2 border-blue-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 bg-white/90 font-semibold text-blue-700 text-base"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => handleRemove(sel.pillstock.pillstock_id)}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-2 mt-4 justify-end">
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              onClick={async () => {
                if (selected.length === 0) return;
                console.log("session:", session);
                console.log("session.user:", session?.user?.id);
                if (!session?.user?.id) {
                  alert("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
                  return;
                }
                try {
                  const res = await fetch(
                    "/api/dashboard/prescription/pillrecord",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        patientrecord_id,
                        pills: selected.map((sel) => ({
                          pillstock_id: sel.pillstock.pillstock_id,
                          quantity: sel.amount,
                          user_id: session.user.id,
                        })),
                      }),
                    }
                  );
                  if (res.ok) {
                    const result = await res.json();
                    alert("บันทึกสำเร็จ");
                    setSelected([]);

                    // Trigger status update for the ticket
                    if (result.statusUpdated && result.patientrecord_id) {
                      // Set localStorage trigger for ticket status update
                      localStorage.setItem(
                        `status_update_${result.patientrecord_id}`,
                        "true"
                      );

                      // Also dispatch custom event
                      window.dispatchEvent(
                        new CustomEvent("statusUpdate", {
                          detail: { patientrecord_id: result.patientrecord_id },
                        })
                      );
                    }

                    router.push("/Home"); // Use Next.js router for navigation
                  } else {
                    const error = await res.json();
                    alert(
                      "เกิดข้อผิดพลาดในการบันทึก: " +
                        (error.details || error.error || "")
                    );
                  }
                } catch (e) {
                  alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
                }
              }}
            >
              บันทึก
            </button>
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
              onClick={() => setSelected([])}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
      {/* Main medicine table */}
      <div className="overflow-x-auto bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-100 to-blue-100">
              <th className="px-6 py-4 text-left text-sm font-bold text-blue-700 border-b border-blue-200">
                รหัสยา
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-blue-700 border-b border-pink-200">
                ชื่อยา
              </th>
              <th className="px-6 py-4 text-center text-sm font-bold text-blue-700 border-b border-blue-200">
                ขนาด
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold text-blue-700 border-b border-pink-200">
                ประเภท
              </th>
              <th className="px-6 py-4 text-center text-sm font-bold text-blue-700 border-b border-blue-200">
                หน่วย
              </th>
              <th className="px-6 py-4 text-center text-sm font-bold text-blue-700 border-b border-pink-200">
                สถานะ
              </th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med) => (
              <React.Fragment key={med.pill_id}>
                <tr
                  key={med.pill_id}
                  className={`cursor-pointer transition-all duration-300 border-b border-blue-100/50 ${
                    openRow === med.pill_id
                      ? "bg-gradient-to-r from-blue-100 to-blue-100 shadow-md"
                      : "hover:bg-gradient-to-r hover:from-blue-50 hover:to-pink-50"
                  }`}
                  onClick={() =>
                    setOpenRow(openRow === med.pill_id ? null : med.pill_id)
                  }
                >
                  <td className="px-6 py-4 text-center font-semibold text-slate-700">
                    <div className="flex items-center justify-center">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                        {med.pill_id}
                      </span>
                      {openRow === med.pill_id && (
                        <svg
                          className="w-4 h-4 ml-2 text-blue-500 animate-bounce"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {med.pill_name}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                      {med.dose}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{med.type_name}</td>
                  <td className="px-6 py-4 text-center text-slate-600">
                    {med.unit_name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        med.status === 1
                          ? "bg-gradient-to-r from-green-100 to-blue-100 text-green-700 border border-green-200"
                          : "bg-gradient-to-r from-red-100 to-blue-100 text-red-700 border border-red-200"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          med.status === 1 ? "bg-green-400" : "bg-red-400"
                        }`}
                      ></div>
                      {med.status === 1 ? "ใช้งาน" : "ไม่ใช้งาน"}
                    </span>
                  </td>
                </tr>
                {openRow === med.pill_id && (
                  <tr key={`stock-${med.pill_id}`}>
                    <td colSpan={6} className="p-0">
                      <StockTable
                        pillId={med.pill_id}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-blue-600/70">
          คลิกที่แถวเพื่อดูข้อมูลสต็อกคลังยา
        </p>
      </div>
    </div>
  );
}

"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TicketData {
  name: string;
  symptoms: { symptom_id: number; symptom_name: string }[];
  otherSymptom: string;
  status?: string; // "waiting" | "dispensed"
}

export default function Page() {
  const { id } = useParams();
  const router = useRouter();
  const [ticketData, setTicketData] = useState<TicketData>({
    name: "",
    symptoms: [],
    otherSymptom: "",
    status: "waiting",
  });
  const [loading, setLoading] = useState(true);

  // Function to check status immediately
  const checkStatus = async () => {
    try {
      const response = await fetch(`/api/showticket/status/${id}`);
      if (response.ok) {
        const statusData = await response.json();
        if (statusData.status !== undefined) {
          setTicketData((prev) => ({
            ...prev,
            status: statusData.status === 0 ? "dispensed" : "waiting",
          }));
          return statusData.status === 0;
        }
      }
    } catch (error) {
      console.error("Error checking status:", error);
    }
    return false;
  };
  useEffect(() => {
    // ดึงข้อมูลจาก sessionStorage หรือ localStorage ที่ส่งมาจาก POST
    const storedData = sessionStorage.getItem(`ticket_${id}`);
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setTicketData(data);
      } catch (error) {
        console.error("Error parsing stored data:", error);
      }
    }
    setLoading(false);

    // Initial status check
    checkStatus();

    // Listen for storage events (when pill records are submitted)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `status_update_${id}`) {
        checkStatus();
        // Remove the trigger key
        localStorage.removeItem(`status_update_${id}`);
      }
    };

    // Listen for custom events
    const handleStatusUpdate = (e: CustomEvent) => {
      if (e.detail.patientrecord_id === id) {
        checkStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("statusUpdate" as any, handleStatusUpdate);

    // Poll for status updates every 10 seconds
    const pollInterval = setInterval(checkStatus, 10000);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("statusUpdate" as any, handleStatusUpdate);
    };
  }, [id]);
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-6 py-8 text-center">
            <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              บัตรคิวผู้ป่วย
            </h1>
            <div className="bg-white/60 rounded-full px-4 py-2 inline-block">
              <span className="text-sm font-medium text-gray-600">เลขที่</span>
              <span className="text-lg font-bold text-blue-600 ml-2">
                #{id}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {" "}
            {/* Patient Name */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">
                    ชื่อผู้ป่วย
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    {ticketData.name}
                  </p>
                </div>
              </div>
            </div>
            {/* Status */}
            <div
              className={`rounded-2xl p-4 border ${
                ticketData.status === "dispensed"
                  ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-100"
                  : "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-100"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ticketData.status === "dispensed"
                      ? "bg-blue-200"
                      : "bg-yellow-200"
                  }`}
                >
                  {ticketData.status === "dispensed" ? (
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      ticketData.status === "dispensed"
                        ? "text-blue-700"
                        : "text-yellow-700"
                    }`}
                  >
                    สถานะ
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    {ticketData.status === "dispensed"
                      ? "จ่ายยาแล้ว"
                      : "รอจ่ายยา"}
                  </p>
                </div>
              </div>
            </div>
            {/* Symptoms */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center mt-1">
                  <svg
                    className="w-4 h-4 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m4-6h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m-4-8V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-700 mb-3">
                    อาการที่แจ้ง
                  </p>
                  <div className="space-y-2">
                    {ticketData.symptoms.map((s) => (
                      <div
                        key={s.symptom_id}
                        className="bg-white/60 rounded-lg px-3 py-2"
                      >
                        <span className="text-gray-800 font-medium">
                          • {s.symptom_name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Other Symptoms */}
            {ticketData.otherSymptom && (
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-100">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center mt-1">
                    <svg
                      className="w-4 h-4 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-700 mb-2">
                      หมายเหตุเพิ่มเติม
                    </p>
                    <div className="bg-white/60 rounded-lg px-3 py-2">
                      <p className="text-gray-800">{ticketData.otherSymptom}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}{" "}
          </div>

          {/* Exit Button - Only show when medication is dispensed */}
          {ticketData.status === "dispensed" && (
            <div className="px-6 pb-6">
              <button
                onClick={() => {
                  router.push("/");
                }}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-center space-x-2">
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>ออกจากระบบ</span>
                </div>
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 text-center border-t border-gray-100">
            <p className="text-sm text-gray-500 font-medium">
              กรุณาแสดงบัตรนี้ต่อเจ้าหน้าที่
            </p>
            <div className="flex items-center justify-center mt-2 space-x-1">
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

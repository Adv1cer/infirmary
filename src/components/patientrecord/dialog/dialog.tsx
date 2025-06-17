import { useState } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function DialogAction({ record, onStatusChange }: { record: any, onStatusChange?: () => void }) {
  const [symptoms, setSymptoms] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter();

  const fetchSymptoms = async () => {
    setLoading(true)
    const res = await fetch(
      `/api/patientform/symptoms?patientrecord_id=${record.patientrecord_id}`
    )
    const data = await res.json()
    setSymptoms(data)
    setLoading(false)
  }

  const setStatusToZero = async () => {
    setLoading(true);
    const res = await fetch(`/api/dashboard/setstatus`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientrecord_id: record.patientrecord_id, status: 0 }),
    });
    setLoading(false);
    if (res.ok) {
      if (onStatusChange) onStatusChange();
      setOpen(false);
    } else {
      // handle error if needed
      alert("Failed to update status");
    }
  };

  const handleDispense = () => {
    router.push(`/prescription/${record.patientrecord_id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="px-4 py-2 bg-blue-600 text-white shadow-md rounded-md hover:bg-blue-500 transition-colors duration-200"
          onClick={() => { fetchSymptoms(); setOpen(true); }}
        >
          ดำเนินการ
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl min-h-[400px] bg-slate-50 to-blue-50">

        {/* Dotted background pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
        // style={{
        //   backgroundImage: 'radial-gradient(circle, #8b5cf6 1px, transparent 1px)',
        //   backgroundSize: '20px 20px',
        //   zIndex: 0,
        // }}
        />

        <div className="relative z-10 w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">ข้อมูลผู้ป่วย</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Patient Info Card */}
            <div className="bg-[#f9f9f92e] to-blue-50 p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">ID:</span>
                  <div className="font-semibold text-gray-800">{record.patientrecord_id}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Patient ID:</span>
                  <div className="font-semibold text-gray-800">{record.patient_id}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Name:</span>
                  <div className="font-semibold text-gray-800">{record.patient_name}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Type:</span>
                  <div className="font-semibold text-gray-800">{record.patienttype_name}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-gray-500">Date/Time:</span>
                  <div className="font-semibold text-gray-800">
                    {new Date(record.datetime).toLocaleString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-gray-500">Status:</span>
                  <div className={`font-semibold ${record.status === 1 ? 'text-orange-600' : 'text-green-600'}`}>
                    {record.status === 1 ? "รอจ่ายยา" : "สำเร็จ"}
                  </div>
                </div>
              </div>
            </div>

            {/* Symptoms Card */}
            <div className="bg-[#f9f9f92e] p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></div>
                <h3 className="font-semibold text-gray-800">Symptom Records</h3>
              </div>
              {loading ? (
                <div className="text-gray-500">Loading...</div>
              ) : symptoms.length > 0 ? (
                <ul className="space-y-2">
                  {symptoms.map((s, i) => (
                    <li key={i} className="flex items-start">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">
                        {s.symptom_name}
                        {s.other_symptom ? (
                          <span className="text-gray-500 italic"> ({s.other_symptom})</span>
                        ) : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500">No symptoms</div>
              )}
            </div>
          </div>

          <DialogFooter className="sm:justify-start mt-4 flex">
            {record.status !== 0 && (
              <>
                <button
                  className="text-white bg-green-500 px-4 py-2 rounded-md shadow-md text-gray-800 hover:bg-gray-50 transition-colors duration-200"
                  onClick={handleDispense}
                >
                  จ่ายยา
                </button>
                <button
                  className="text-white bg-yellow-400 px-4 py-2 rounded-md shadow-md text-gray-800 hover:bg-gray-50 transition-colors duration-200"
                  onClick={setStatusToZero}
                >
                  เสร็จสิ้น
                </button>
              </>
            )}
            <DialogClose asChild>
              <button className="text-white bg-red-500 px-6 py-2 rounded-md shadow-md text-gray-800 hover:bg-gray-50 transition-colors duration-200 ml-auto">
                ปิด
              </button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PrescriptioComponent() {
  const params = useParams();
  const id = params ? params['id'] : undefined;
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true);
      const res = await fetch(`/api/prescription/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPatient(data);
      }
      setLoading(false);
    };
    if (id) fetchPatient();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!patient) return <div className="p-8">No patient found.</div>;
  return (
    <div className="max-w-2xl mx-auto mt-8 p-8 bg-gradient-to-r from-blue-50 to-blue-50 rounded-2xl shadow-xl border-2 border-blue-100/50 backdrop-blur-sm">
      <div className="flex items-center justify-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-200 to-pink-200 rounded-full flex items-center justify-center mr-4">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
          ข้อมูลผู้ป่วย
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-100 hover:shadow-md transition-all duration-300">
          <span className="text-sm font-medium text-blue-600 mb-1 block">หมายเลขบันทึก</span>
          <div className="text-lg font-bold text-slate-700">{patient.patientrecord_id}</div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-100 hover:shadow-md transition-all duration-300">
          <span className="text-sm font-medium text-blue-600 mb-1 block">รหัสผู้ป่วย</span>
          <div className="text-lg font-bold text-slate-700">{patient.patient_id}</div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-100 hover:shadow-md transition-all duration-300">
          <span className="text-sm font-medium text-blue-600 mb-1 block">ชื่อ-นามสกุล</span>
          <div className="text-lg font-bold text-slate-700">{patient.patient_name}</div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-100 hover:shadow-md transition-all duration-300">
          <span className="text-sm font-medium text-blue-600 mb-1 block">ประเภทผู้ป่วย</span>
          <div className="text-lg font-bold text-slate-700">{patient.patienttype_name}</div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-100 hover:shadow-md transition-all duration-300 md:col-span-2">
          <span className="text-sm font-medium text-blue-600 mb-1 block">วันที่และเวลา</span>
          <div className="text-lg font-bold text-slate-700">
            {new Date(patient.datetime).toLocaleString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-100 hover:shadow-md transition-all duration-300 md:col-span-2">
          <span className="text-sm font-medium text-pink-600 mb-1 block">สถานะ</span>
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
            patient.status === 1 
              ? 'bg-gradient-to-r from-orange-100 to-orange-100 text-orange-600 border border-orange-200' 
              : 'bg-gradient-to-r from-green-100 to-blue-100 text-green-600 border border-green-200'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              patient.status === 1 ? 'bg-orange-400' : 'bg-green-400'
            }`}></div>
            {patient.status === 1 ? "รอจ่ายยา" : "สำเร็จ"}
          </div>
        </div>
      </div>
    </div>
  );
}

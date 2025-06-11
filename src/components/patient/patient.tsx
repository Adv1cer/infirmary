import { useEffect, useState } from 'react';

interface Patient {
  patient_id: number;
  personal_id: string;
  patient_name: string;
  patienttype_id: number;
  patienttype_name: string; // เพิ่มตรงนี้
}

export default function PatientTable() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      const res = await fetch('/api/dashboard/patientrecord');
      if (res.ok) {
        const data = await res.json();
        // Map to unique patients by patient_id
        const unique = Object.values(
          data.reduce((acc: any, cur: any) => {
            if (!acc[cur.patient_id]) {
              acc[cur.patient_id] = {
                patient_id: cur.patient_id,
                personal_id: cur.personel_id || '', // แก้ตรงนี้ให้ตรงกับฐานข้อมูล
                patient_name: cur.patient_name,
                patienttype_id: cur.patienttype_id,
                patienttype_name: cur.patienttype_name, // เพิ่มตรงนี้
              };
            }
            return acc;
          }, {})
        );
        setPatients(unique as Patient[]);
      }
      setLoading(false);
    };
    fetchPatients();
  }, []);

  if (loading) return <div className="p-8 text-gray-600">Loading patients...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="w-full mx-auto">
        {/* Patient List Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Patient List
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PATIENT ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PERSONAL ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TYPE ID</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((p) => (
                  <tr key={p.patient_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.patient_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.personal_id || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.patient_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.patienttype_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

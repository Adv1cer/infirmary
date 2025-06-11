import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DialogAction from '@/components/patientrecord/dialog/dialog';

type PatientRecord = {
    patientrecord_id: number;
    patient_id: number;
    datetime: string;
    status: number;
    patient_name: string;
    patienttype_name: string;
};

export default function PatientRecord() {
    const { data: session, status } = useSession();
    const [records, setRecords] = useState<PatientRecord[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchRecords = () => {
            fetch('/api/dashboard/patientrecord')
                .then(res => res.json())
                .then(data => setRecords(data));
        };
        fetchRecords();
        const interval = setInterval(fetchRecords, 43200000);
        return () => clearInterval(interval);
    }, [refreshKey]);

    const today = new Date();
    const toDateString = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0');
    };
    const todayStr = toDateString(today.toISOString());
    const isToday = (dateStr: string) => toDateString(dateStr) === todayStr;

    const todaysRecords = records.filter(r => isToday(r.datetime));
    const waitingForMed = todaysRecords.filter(r => r.status == 1);
    const displayRecords = todaysRecords.filter(r => r.status === 1); return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="w-full mx-auto">
                {/* Statistics Cards */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center flex items-center justify-center gap-2">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Patient Records
                    </h2>
                    <div className="flex flex-row gap-6">
                        <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                            <span className="text-gray-600 font-medium">รอการจ่ายยา (วันนี้): </span>
                            <span className="ml-2 font-bold text-2xl text-orange-400">{waitingForMed.length}</span>
                        </div>
                        <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                            <span className="text-gray-600 font-medium">ผู้ป่วยวันนี้: </span>
                            <span className="ml-2 font-bold text-2xl text-green-600">{todaysRecords.length}</span>
                        </div>
                    </div>
                </div>

                {/* Patient Records Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-700 flex items-center justify-center gap-2">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            ผู้ป่วยวันนี้
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PATIENT ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PATIENT NAME</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PATIENT TYPE</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATETIME</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {displayRecords.map(record => (
                                    <tr key={record.patientrecord_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.patientrecord_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.patient_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.patient_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.patienttype_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(record.datetime).toLocaleString('th-TH', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.status === 1
                                                    ? 'bg-orange-100 text-orange-800'
                                                    : 'bg-green-100 text-green-800'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${record.status === 1 ? 'bg-orange-400' : 'bg-green-400'
                                                    }`}></span>
                                                {record.status === 1 ? 'รอจ่ายยา' : 'สำเร็จ'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <DialogAction record={record} onStatusChange={() => setRefreshKey(k => k + 1)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-center">
                        <div className="flex justify-center sm:hidden">
                            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Previous
                            </button>
                            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:items-center sm:justify-center">
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                    Previous
                                </button>
                                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Page 1 of 2
                                </button>
                                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
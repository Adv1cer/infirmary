'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DialogAction from '@/components/patientrecord/dialog/dialog';
import DialogHome from './DialogHome';

type PatientRecord = {
    patientrecord_id: number;
    patient_id: number;
    datetime: string;
    status: number;
    patient_name: string;
    patienttype_name: string;
};

export default function HomePage() {
    const { data: session, status } = useSession();
    const [records, setRecords] = useState<PatientRecord[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;

    useEffect(() => {
        const fetchRecords = () => {
            fetch('/api/dashboard/patientrecord')
                .then(res => res.json())
                .then(data => setRecords(data));
        };
        fetchRecords();
        // Optionally, refresh every 12 hours
        const interval = setInterval(fetchRecords, 43200000);
        return () => clearInterval(interval);
    }, [refreshKey]);

    // Helper to get YYYY-MM-DD string
    const toDateString = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0');
    };
    const today = new Date();
    const todayStr = toDateString(today.toISOString());
    const isToday = (dateStr: string) => toDateString(dateStr) === todayStr;

    const todaysRecords = records.filter(r => isToday(r.datetime));
    const waitingForMed = todaysRecords.filter(r => r.status === 1);
    const statusZeroRecords = todaysRecords.filter(r => r.status === 0);      
    const totalPages = Math.ceil(statusZeroRecords.length / recordsPerPage);
    const paginatedRecords = statusZeroRecords.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

    return (
        <div className="flex-1 bg-gray-100">
            <div className="mx-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-lg border border-slate-200/50 p-8 my-4">
                <h2 className="mb-4 text-3xl font-bold bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent">Welcome to Our App</h2>
                {session ? (
                    <>
                        <div className="space-y-3">
                            <p className="text-lg text-slate-700">
                                Logged in as: <span className="font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">{session.user?.id}</span>
                            </p>
                            <p className="text-lg text-slate-700">
                                Email: <span className="font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">{session.user?.email}</span>
                            </p>
                            <p className="text-lg text-slate-700">
                                Role: <span className="font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-lg">{session.user?.role}</span>
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-4">
                            <p className="text-lg text-slate-600">Your one-stop solution for all your needs.</p>
                            <p className="text-lg text-slate-600 bg-amber-50 border border-amber-200 rounded-lg p-4">
                                Get started by logging in or signing up!
                            </p>
                        </div>
                    </>
                )}            
                </div>           
            <div className="mx-4 bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-lg border border-slate-200/50 p-6">
                <h2 className="mb-6 text-2xl font-bold text-center flex items-center justify-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-slate-100 to-gray-100 rounded-xl shadow-sm">
                        <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>                  
                    <span className="bg-gradient-to-r from-slate-700 to-slate-600 bg-clip-text text-transparent">
                        ผู้ป่วยวันนี้
                    </span>
                </h2>
                <div className="overflow-x-auto rounded-2xl shadow-sm border border-slate-200/30">
                    <table className="w-full bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-100 via-blue-50 to-rose-50 border-b border-slate-200/50">
                                <th className="px-6 py-4 text-left text-slate-700 font-semibold text-sm uppercase tracking-wide">ID</th>
                                <th className="px-6 py-4 text-left text-slate-700 font-semibold text-sm uppercase tracking-wide">Patient ID</th>
                                <th className="px-6 py-4 text-left text-slate-700 font-semibold text-sm uppercase tracking-wide">Patient Name</th>
                                <th className="px-6 py-4 text-left text-slate-700 font-semibold text-sm uppercase tracking-wide">Patient Type</th>
                                <th className="px-6 py-4 text-left text-slate-700 font-semibold text-sm uppercase tracking-wide">Datetime</th>
                                <th className="px-6 py-4 text-left text-slate-700 font-semibold text-sm uppercase tracking-wide">Status</th>
                                <th className="px-6 py-4 text-left text-slate-700 font-semibold text-sm uppercase tracking-wide">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedRecords.map(record => (
                                <tr key={record.patientrecord_id} className="hover:bg-gradient-to-r hover:from-blue-25 hover:to-rose-25 transition-all duration-300 group">
                                    <td className="px-6 py-4 text-center font-semibold text-slate-700 group-hover:text-blue-700">{record.patientrecord_id}</td>
                                    <td className="px-6 py-4 text-center text-slate-600 group-hover:text-rose-600 font-medium">{record.patient_id}</td>
                                    <td className="px-6 py-4 text-slate-800 font-medium group-hover:text-slate-900">{record.patient_name}</td>
                                    <td className="px-6 py-4 text-slate-700 group-hover:text-slate-800">{record.patienttype_name}</td>
                                    <td className="px-6 py-4 text-slate-600 text-sm group-hover:text-slate-700">{new Date(record.datetime).toLocaleString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-3 py-2 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200/50 shadow-sm">
                                            <div className="w-2 h-2 rounded-full mr-2 bg-emerald-400 shadow-sm"></div>
                                            สำเร็จ
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <DialogHome record={record} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Controls */}
                <div className="flex justify-center items-center gap-2 mt-4">
                    <button
                        className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-50"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span className="px-2 text-slate-700">Page {currentPage} of {totalPages}</span>
                    <button
                        className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-50"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
'use client';
import Sidebar from '@/components/sidebar/sidebar';
import HomePage from '@/components/home/HomePage';
import Patientrecord from '@/components/patientrecord/patientrecord';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import PatientTable from '@/components/patient/patient';
import MedicineTable from '@/components/medicine/medicine';

const tabs = [
    { label: 'หน้าหลัก', value: 'home', icon: '🏠' },
    { label: 'รับเรื่องผู้ป่วย', value: 'patientrecord', icon: '📝' },
    { label: 'รายชื่อผู้ป่วย', value: 'patient', icon: '📋' },
    { label: 'รายงานการจ่ายยา', value: 'medicine', icon: '💊' },
    { label: 'สถิติ', value: 'statistic', icon: '📊' },
];

export default function Home() {
    const { data: session } = useSession();
    const router = useRouter();
    const [activePage, setActivePage] = useState('home');

    return (
        <main className="flex min-h-screen bg-gradient-to-br from-blue-25 via-white to-pink-25">
            <Sidebar role={session?.user?.role ?? ''} setActivePage={setActivePage} />
            <div className="flex-1 flex flex-col">
                <nav className="flex justify-center mt-8 mb-4">
                    <ul className="flex gap-4 bg-white/80 rounded-xl shadow-md px-2 py-1">
                        {tabs.map((tab) => (
                            <motion.li
                                key={tab.value}
                                initial={false}
                                animate={{ backgroundColor: activePage === tab.value ? '#e0f2fe' : 'transparent' }}
                                className="relative px-6 py-2 rounded-lg cursor-pointer font-semibold text-blue-700 flex items-center gap-2 select-none"
                                onClick={() => setActivePage(tab.value)}
                                style={{ minWidth: 120, justifyContent: 'center', display: 'flex' }}
                            >
                                <span className="text-xl mr-1">{tab.icon}</span> {tab.label}
                                {activePage === tab.value && (
                                    <motion.div
                                        layoutId="underline"
                                        className="absolute left-2 right-2 bottom-1 h-1 rounded bg-gradient-to-r from-blue-400 to-pink-400"
                                        style={{ zIndex: 1 }}
                                    />
                                )}
                            </motion.li>
                        ))}
                    </ul>
                </nav>
                <div className="flex-1 flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activePage}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="flex-1 flex flex-col"
                        >
                            {activePage === 'home' && <HomePage />}
                            {activePage === 'patientrecord' && <Patientrecord />}
                            {activePage === 'patient' && <PatientTable />}
                            {activePage === 'medicine' && <MedicineTable />}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}
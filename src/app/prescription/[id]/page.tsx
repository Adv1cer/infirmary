'use client';
import Prescription from '@/components/prescription/prescription';
import Sidebar from '@/components/sidebar/sidebar';

import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';

import { useState } from 'react';
import MedicineTable from '@/components/prescription/medicine/medicine';

export default function PrescriptionPage() {
    const { data: session } = useSession();
    const { id } = useParams();
    const [activePage, setActivePage] = useState<string>('');

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-25 via-white to-pink-25 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <Prescription />
                <MedicineTable patientrecord_id={id as string} />
            </div>
        </main>
    );
}

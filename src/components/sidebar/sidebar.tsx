import { useState } from 'react';
import { signOut } from 'next-auth/react';
import {
    LayoutDashboard, List, ClipboardList, HeartPulse
} from 'lucide-react';
import Image from 'next/image';

const Sidebar = ({ role, setActivePage }: { role: string, setActivePage: (page: string) => void }) => {
    const [active, setActive] = useState('Services list');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' });
    };

    const menuItems = [
        {
            label: 'Dashboard',
            icon: <LayoutDashboard />,
            children: [
                { label: 'หน้าหลัก', icon: <HeartPulse />, page: 'home' },
                { label: 'รับเรื่องผู้ป่วย', icon: <ClipboardList />, page: 'patientrecord' },
                { label: 'รายชื่อผู้ป่วย', icon: <List />, page: 'patient' },
                { label: 'รายงานการจ่ายยา', icon: <ClipboardList />, page: 'medicine' },
                { label: 'สถิติ', icon: <ClipboardList />, page: 'statistics' },
            ]
        },
        ...(role === 'admin' || role === '1'
            ? [{ label: 'Admin', icon: <ClipboardList /> },
            { label: 'Setting', icon: <ClipboardList /> },
            ]
            : []
        ),
        { label: 'Logout', icon: <ClipboardList /> },
    ];

    return (
        <aside className="w-64 h-screen bg-white shadow-md p-4 space-y-4 text-gray-700">
            <div className="text-xl font-bold mb-6 flex items-center gap-2">
                <div className="relative w-10 h-10">
                    <Image
                        src="/logo.png"
                        alt="UTCC LOGO"
                        fill
                        className="rounded object-contain"
                    />
                </div>
                UTCC Infirmary
            </div>
            <nav className="space-y-2">
                {menuItems.map((item, i) => (
                    <div key={i}>
                        {item.label === 'Logout' ? (
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left hover:bg-blue-100"
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ) : item.children ? (
                            <>
                                <button
                                    onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left hover:bg-blue-100 font-semibold"
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                    <span className="ml-auto">{openDropdown === item.label ? '▲' : '▼'}</span>
                                </button>
                                {openDropdown === item.label && (
                                    <div className="pl-6">
                                        {item.children.map((child, j) => (
                                            <button
                                                key={j}
                                                onClick={() => {
                                                    setActive(child.label);
                                                    if (child.page) setActivePage(child.page);
                                                }}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left hover:bg-blue-100 ${active === child.label ? 'bg-blue-100 font-semibold text-white-600' : ''}`}
                                            >
                                                {child.icon}
                                                <span>{child.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={() => setActive(item.label)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left hover:bg-blue-100 ${active === item.label ? 'bg-blue-100 font-semibold text-white-600' : ''}`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        )}
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
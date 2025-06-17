import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Session } from 'next-auth';
import {
    LayoutDashboard, List, ClipboardList, HeartPulse, User, Settings, LogOut
} from 'lucide-react';
import Image from 'next/image';

const Sidebar = ({ role, session, setActivePage }: { role: string, session: Session | null, setActivePage: (page: string) => void }) => {
    const [active, setActive] = useState('Services list');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' });
    };    // Helper function to get profile picture URL
    const getProfilePictureUrl = (profilePicture: string | undefined) => {
        if (!profilePicture) return null;
        if (profilePicture.startsWith('http') || profilePicture.startsWith('/')) {
            return profilePicture;
        }
        return `/uploads/profiles/${profilePicture}`;
    };const menuItems = [
        {
            label: 'Dashboard',
            icon: <LayoutDashboard />,
            children: [
                { label: 'หน้าหลัก', icon: <HeartPulse />, page: 'home' },
                { label: 'รับเรื่องผู้ป่วย', icon: <ClipboardList />, page: 'patientrecord' },
                { label: 'รายชื่อผู้ป่วย', icon: <List />, page: 'patient' },
                { label: 'สต็อกยา', icon: <ClipboardList />, page: 'medicine' },
                { label: 'สถิติ', icon: <ClipboardList />, page: 'statistic' },
            ]
        },
        ...(role === 'admin' || role === 'Administrator' || role === '1'
            ? [
                { label: 'Admin', icon: <Settings />, page: 'admin' },
            ]
            : []
        ),
    ];    // Bottom menu items (account and logout)
    const profilePictureUrl = getProfilePictureUrl(session?.user?.profile_picture);
    
    const bottomMenuItems = [
        { 
            label: session?.user?.name || 'บัญชี', 
            icon: profilePictureUrl ? (
                <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    <Image
                        src={profilePictureUrl}
                        alt="Profile"
                        fill
                        className="object-cover"
                        onError={(e) => {
                            // Hide the image and show fallback icon if image fails to load
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    {/* Fallback icon that shows if image fails */}
                    <User className="w-4 h-4 text-gray-400" />
                </div>
            ) : (
                <div className="relative w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-400" />
                </div>
            ), 
            page: 'account' 
        },
        { 
            label: 'Logout', 
            icon: <LogOut /> 
        },
    ];return (
        <aside className="w-64 h-screen bg-white shadow-md p-4 space-y-4 text-gray-700 flex flex-col">
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
            
            {/* Main navigation */}
            <nav className="space-y-2 flex-1">
                {menuItems.map((item, i) => (
                    <div key={i}>
                        {item.children ? (
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
                                onClick={() => {
                                    setActive(item.label);
                                    if (item.page) setActivePage(item.page);
                                }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left hover:bg-blue-100 ${active === item.label ? 'bg-blue-100 font-semibold text-white-600' : ''}`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        )}
                    </div>
                ))}
            </nav>

            {/* Bottom navigation (Account and Logout) */}
            <nav className="space-y-2 border-t pt-4">
                {bottomMenuItems.map((item, i) => (
                    <div key={i}>
                        {item.label === 'Logout' ? (
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left hover:bg-red-100 text-red-600"
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setActive(item.label);
                                    if (item.page) setActivePage(item.page);
                                }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left hover:bg-blue-100 ${active === item.label ? 'bg-blue-100 font-semibold text-white-600' : ''}`}
                            >
                                {item.icon}
                                <span className="truncate">{item.label}</span>
                            </button>
                        )}
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
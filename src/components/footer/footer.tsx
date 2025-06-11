import { useRouter, usePathname } from 'next/navigation';


export default function Footer() {
  const pathname = usePathname();

      const footerBg = (pathname === '/Login' || pathname === '/')
    ? 'bg-white text-neutral-950'
    : 'bg-blue-900 text-white';
    return (
        <footer className={`flex items-center justify-center w-full h-16 ${footerBg}`}>
        <p className="text-sm">© 2023 Infirmary. All rights reserved.</p>
        </footer>
    );
}
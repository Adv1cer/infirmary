import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();


const handleSignOut = () => {
  signOut({ callbackUrl: '/' });
};


  return (
    <nav className="flex items-center justify-between p-8 text-neutral-950 h-16">
      <div className="text-xl font-bold flex items-center gap-2">
        <div className="relative w-12 h-12">
          <Image
            src="/logo.png"
            alt="UTCC LOGO"
            fill
            className="rounded"
          />
        </div>
        <a
          href={session ? "/Home" : "/"}
          className="text-xl hover:text-gray-400"
        >
          UTCC Infirmary
        </a>
      </div>
      <ul className="flex space-x-4">
        {session ? (
          <li>
            <button
              onClick={() => handleSignOut()}
              className="hover:text-gray-400 bg-transparent border-none cursor-pointer"
            >
              Logout
            </button>
          </li>
        ) : (
          <li>
            <a href="/Login" className="text-xl  hover:text-gray-400">Login</a>
          </li>
        )}
      </ul>
    </nav>
  );
}
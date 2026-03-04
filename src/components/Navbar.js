'use client';

import { useSession, signOut } from 'next-auth/react';
import { Search, LogOut, BarChart3 } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-primary-600" />
          <h1 className="text-xl font-bold text-gray-900">
            AsistenteSEO <span className="text-primary-600">IA</span>
          </h1>
        </div>

        {session && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-gray-600 hidden sm:inline">
                {session.user?.name}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, Search, Swords, FileEdit } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Search Console', icon: BarChart3, exact: true },
  { href: '/dashboard/investigacion', label: 'Investigación', icon: Search },
  { href: '/dashboard/competencia', label: 'Competencia', icon: Swords },
  { href: '/dashboard/contenido', label: 'Contenido IA', icon: FileEdit },
];

export default function DashboardNav() {
  const pathname = usePathname();

  const isActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex gap-1 overflow-x-auto py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

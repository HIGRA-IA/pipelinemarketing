'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, BarChart3, Bell, Menu, X, CalendarClock } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projetos', label: 'Projetos', icon: FolderKanban },
  { href: '/cronograma', label: 'Cronograma', icon: CalendarClock },
  { href: '/kpis', label: 'KPIs', icon: BarChart3 },
  { href: '/notificacoes', label: 'Notificações', icon: Bell },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/20 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-primary leading-tight">HIGRA</h1>
            <p className="text-[10px] text-slate-500 leading-tight">Marketing Manager</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems?.map?.((item) => {
            const Icon = item?.icon;
            const isActive = pathname === item?.href || (item?.href !== '/' && pathname?.startsWith?.(item?.href));
            return (
              <Link
                key={item?.href}
                href={item?.href ?? '/'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-600 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {Icon && <Icon size={16} />}
                {item?.label}
              </Link>
            );
          }) ?? []}
        </nav>

        <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-white/20 px-4 py-3 space-y-1">
          {navItems?.map?.((item) => {
            const Icon = item?.icon;
            const isActive = pathname === item?.href;
            return (
              <Link
                key={item?.href}
                href={item?.href ?? '/'}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-primary text-white' : 'text-slate-600 hover:bg-primary/10'
                }`}
              >
                {Icon && <Icon size={16} />}
                {item?.label}
              </Link>
            );
          }) ?? []}
        </div>
      )}
    </header>
  );
}

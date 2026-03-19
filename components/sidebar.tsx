'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FolderKanban, CalendarClock,
  BarChart3, Bot, Bell, ChevronLeft, ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/',             label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/projetos',     label: 'Projetos',       icon: FolderKanban },
  { href: '/cronograma',   label: 'Cronograma',     icon: CalendarClock },
  { href: '/kpis',         label: 'KPIs',           icon: BarChart3 },
  { href: '/agentes',      label: 'Agentes IA',     icon: Bot },
  { href: '/notificacoes', label: 'Notificações',   icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        flex-shrink-0 h-screen bg-white border-r border-slate-100 flex flex-col
        transition-all duration-300 ease-in-out shadow-sm
        ${collapsed ? 'w-[64px]' : 'w-[220px]'}
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-100 flex-shrink-0">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white font-bold text-base">H</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 overflow-hidden">
              <p className="text-sm font-bold text-primary leading-tight truncate">HIGRA</p>
              <p className="text-[10px] text-slate-400 leading-tight truncate">Marketing Manager</p>
            </div>
          )}
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 group relative
                ${isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
                }
              `}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {/* Tooltip when collapsed */}
              {collapsed && (
                <span className="
                  absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs
                  rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100
                  pointer-events-none transition-opacity z-50
                ">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-slate-100 flex-shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className="
            w-full flex items-center justify-center gap-2 p-2
            text-slate-400 hover:text-primary hover:bg-slate-50
            rounded-xl transition-all text-xs font-medium
          "
        >
          {collapsed
            ? <ChevronRight size={16} />
            : <><ChevronLeft size={16} /><span>Recolher</span></>
          }
        </button>
      </div>
    </aside>
  );
}

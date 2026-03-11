import Header from '@/components/header';
import NotificationsPanel from '@/components/notifications-panel';

export default function NotificacoesPage() {
  return (
    <>
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary">Notificações</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie alertas de prazos e revisões semanais de plataformas</p>
        </div>
        <NotificationsPanel />
      </main>
    </>
  );
}

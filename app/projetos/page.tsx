import Header from '@/components/header';
import ProjectsList from '@/components/projects-list';

export default function ProjetosPage() {
  return (
    <>
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary">Projetos</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie os projetos de marketing de performance das empresas do Grupo HIGRA</p>
        </div>
        <ProjectsList />
      </main>
    </>
  );
}

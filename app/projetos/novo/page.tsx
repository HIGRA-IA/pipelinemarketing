import NewProjectForm from '@/components/new-project-form';

export default function NovoProjetoPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Novo Projeto</h1>
        <p className="text-slate-500 text-sm mt-1">Configure um novo projeto de marketing de performance (60 dias)</p>
      </div>
      <NewProjectForm />
    </div>
  );
}

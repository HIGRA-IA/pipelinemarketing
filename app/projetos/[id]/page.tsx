import Header from '@/components/header';
import ProjectDetail from '@/components/project-detail';

export default function ProjectPage({ params }: { params: { id: string } }) {
  return (
    <>
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        <ProjectDetail projectId={params?.id ?? ''} />
      </main>
    </>
  );
}

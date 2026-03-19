import ProjectDetail from '@/components/project-detail';

export default function ProjectPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      <ProjectDetail projectId={params?.id ?? ''} />
    </div>
  );
}

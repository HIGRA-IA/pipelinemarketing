export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Seção de Conteúdo Rico que deve ser adicionada ao Sprint 1
const CONTEUDO_RICO_STAGE = {
  number: 4,
  name: 'Ativos - Conteúdo Rico',
  tasks: [
    { description: 'Conteúdo Rico 1 (eBook, Whitepaper, Guia)', toolsAi: 'ChatGPT, Canva', toolsThirdParty: 'Design interno' },
    { description: 'Conteúdo Rico 2 (Checklist, Template, Infográfico)', toolsAi: 'ChatGPT, Canva', toolsThirdParty: 'Design interno' },
    { description: 'Conteúdo Rico 3 (Webinar, Vídeo-aula, Estudo de Caso)', toolsAi: 'ChatGPT, Runway', toolsThirdParty: 'Videomaker interno' },
  ],
};

export async function POST() {
  try {
    // Buscar todos os sprints número 1 (Sprint de Planejamento + Execução)
    const sprint1s = await prisma.sprint.findMany({
      where: { number: 1 },
      include: { tasks: true },
    });

    let tasksAdded = 0;
    let sprintsUpdated = 0;

    for (const sprint of sprint1s) {
      // Verificar se já tem tarefas de Conteúdo Rico
      const hasConteudoRico = sprint.tasks.some(
        (t) => t.stageName?.includes('Conteúdo Rico')
      );

      if (!hasConteudoRico) {
        // Adicionar as novas tarefas da seção Ativos - Conteúdo Rico
        for (const task of CONTEUDO_RICO_STAGE.tasks) {
          await prisma.task.create({
            data: {
              sprintId: sprint.id,
              stageNumber: CONTEUDO_RICO_STAGE.number,
              stageName: CONTEUDO_RICO_STAGE.name,
              description: task.description,
              toolsAi: task.toolsAi,
              toolsThirdParty: task.toolsThirdParty,
              status: 'pendente',
            },
          });
          tasksAdded++;
        }
        sprintsUpdated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sincronização concluída: ${tasksAdded} tarefas adicionadas em ${sprintsUpdated} sprints.`,
      tasksAdded,
      sprintsUpdated,
    });
  } catch (error) {
    console.error('Error syncing tasks:', error);
    return NextResponse.json(
      { error: 'Erro ao sincronizar tarefas' },
      { status: 500 }
    );
  }
}

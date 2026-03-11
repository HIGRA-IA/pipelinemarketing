export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SPRINT_TEMPLATES } from '@/lib/template-data';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        company: true,
        sprints: { include: { tasks: true }, orderBy: { number: 'asc' } },
        channelData: { 
          select: { 
            id: true, 
            cost: true, 
            leads: true, 
            mqls: true,
            sqls: true,
            clicks: true,
            impressions: true,
          } 
        },
        _count: { select: { channelData: true, kpiEntries: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(projects ?? []);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, name, theme, objective, priorityProduct, startDate, budgetTraffic, targetCpl } = body ?? {};

    if (!companyId || !name || !startDate) {
      return NextResponse.json({ error: 'Campos obrigatórios: companyId, name, startDate' }, { status: 400 });
    }

    const activeProjects = await prisma.project.count({
      where: { status: { in: ['planejamento', 'em_andamento'] } },
    });
    if (activeProjects >= 4) {
      return NextResponse.json({ error: 'Máximo de 4 projetos simultâneos atingido' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 60);

    const project = await prisma.project.create({
      data: {
        companyId,
        name,
        theme: theme ?? '',
        objective: objective ?? 'Gerar SQL',
        priorityProduct: priorityProduct ?? '',
        startDate: start,
        endDate: end,
        budgetTraffic: budgetTraffic ?? 3000,
        targetCpl: targetCpl ?? 600,
        sprints: {
          create: SPRINT_TEMPLATES?.map?.((st, idx) => {
            const sprintStart = new Date(start);
            sprintStart.setDate(sprintStart.getDate() + idx * 15);
            const sprintEnd = new Date(sprintStart);
            sprintEnd.setDate(sprintEnd.getDate() + 14);
            return {
              number: st?.number ?? idx + 1,
              name: st?.name ?? `Sprint ${idx + 1}`,
              startDate: sprintStart,
              endDate: sprintEnd,
              objective: st?.objective ?? '',
              status: 'pendente',
              tasks: {
                create: (st?.stages ?? [])?.flatMap?.((stage) =>
                  (stage?.tasks ?? [])?.map?.((task) => ({
                    stageNumber: stage?.number ?? 1,
                    stageName: stage?.name ?? '',
                    description: task?.description ?? '',
                    toolsAi: task?.toolsAi ?? '',
                    toolsThirdParty: task?.toolsThirdParty ?? '',
                    status: 'pendente',
                  }))
                ) ?? [],
              },
            };
          }) ?? [],
        },
      },
      include: {
        company: true,
        sprints: { include: { tasks: true }, orderBy: { number: 'asc' } },
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Erro ao criar projeto' }, { status: 500 });
  }
}

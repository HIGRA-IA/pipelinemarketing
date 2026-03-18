export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { calculateTaskDates, getSprintDates } from '@/lib/calculate-task-dates';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params?.id },
      include: {
        company: true,
        sprints: { include: { tasks: { orderBy: { stageNumber: 'asc' } } }, orderBy: { number: 'asc' } },
        channelData: { orderBy: [{ year: 'desc' }, { month: 'desc' }, { weekNumber: 'desc' }] },
        kpiEntries: { orderBy: { date: 'desc' } },
      },
    });
    if (!project) return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();

    const projectData: Record<string, any> = {
      name: body?.name,
      theme: body?.theme,
      objective: body?.objective,
      priorityProduct: body?.priorityProduct,
      status: body?.status,
      budgetTraffic: body?.budgetTraffic != null ? Number(body.budgetTraffic) : undefined,
      targetCpl: body?.targetCpl != null ? Number(body.targetCpl) : undefined,
      targetMqlToSql: body?.targetMqlToSql != null ? Number(body.targetMqlToSql) : undefined,
      targetCtr: body?.targetCtr != null ? Number(body.targetCtr) : undefined,
      targetCustoMql: body?.targetCustoMql != null ? Number(body.targetCustoMql) : undefined,
      targetCustoSql: body?.targetCustoSql != null ? Number(body.targetCustoSql) : undefined,
    };

    // If startDate is changing, recalculate sprint and task dates
    if (body?.startDate) {
      const newStart = new Date(body.startDate);
      const newEnd = new Date(newStart);
      newEnd.setDate(newEnd.getDate() + 60);
      projectData.startDate = newStart;
      projectData.endDate = newEnd;

      // Fetch existing sprints with tasks (ordered by number)
      const sprints = await prisma.sprint.findMany({
        where: { projectId: params.id },
        include: { tasks: { orderBy: { stageNumber: 'asc' } } },
        orderBy: { number: 'asc' },
      });

      // Recalculate and update each sprint + its tasks
      for (let i = 0; i < sprints.length; i++) {
        const sprint = sprints[i];
        const { startDate: sprintStart, endDate: sprintEnd } = getSprintDates(newStart, i);

        await prisma.sprint.update({
          where: { id: sprint.id },
          data: { startDate: sprintStart, endDate: sprintEnd },
        });

        const tasksWithDates = calculateTaskDates(sprintStart, sprintEnd, sprint.tasks);
        for (const task of tasksWithDates) {
          await prisma.task.update({
            where: { id: task.id },
            data: { startDate: task.startDate, dueDate: task.dueDate },
          });
        }
      }
    }

    const project = await prisma.project.update({
      where: { id: params?.id },
      data: projectData,
    });
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.project.delete({ where: { id: params?.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  }
}

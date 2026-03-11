export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const taskResources = await prisma.taskResource.findMany({
      where: { taskId: id },
      include: { resource: true },
    });
    return NextResponse.json(taskResources.map(tr => tr.resource));
  } catch (error) {
    console.error('Error fetching task resources:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    const body = await req.json();
    const { resourceId } = body;

    if (!resourceId) {
      return NextResponse.json({ error: 'resourceId é obrigatório' }, { status: 400 });
    }

    const taskResource = await prisma.taskResource.create({
      data: { taskId, resourceId },
      include: { resource: true },
    });

    return NextResponse.json(taskResource.resource);
  } catch (error: any) {
    console.error('Error adding resource to task:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Recurso já associado' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro ao adicionar recurso' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await params;
    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get('resourceId');

    if (!resourceId) {
      return NextResponse.json({ error: 'resourceId é obrigatório' }, { status: 400 });
    }

    await prisma.taskResource.deleteMany({
      where: { taskId, resourceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing resource from task:', error);
    return NextResponse.json({ error: 'Erro ao remover recurso' }, { status: 500 });
  }
}

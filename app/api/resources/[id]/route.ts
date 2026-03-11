export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, category, color } = body;

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(color && { color }),
      },
    });

    return NextResponse.json(resource);
  } catch (error: any) {
    console.error('Error updating resource:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Nome já existe' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro ao atualizar recurso' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.resource.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json({ error: 'Erro ao excluir recurso' }, { status: 500 });
  }
}

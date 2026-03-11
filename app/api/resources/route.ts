export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, color } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const resource = await prisma.resource.create({
      data: {
        name,
        category: category || 'Ferramenta IA',
        color: color || '#A19AD3',
      },
    });

    return NextResponse.json(resource);
  } catch (error: any) {
    console.error('Error creating resource:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Recurso já existe' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro ao criar recurso' }, { status: 500 });
  }
}

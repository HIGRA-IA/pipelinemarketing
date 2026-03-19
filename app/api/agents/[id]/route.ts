import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const agent = await prisma.aiAgent.findUnique({ where: { id: params.id } });
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(agent);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { name, description, icon, isActive, modelProvider, modelName, temperature, maxTokens, systemPrompt } = body;

  const agent = await prisma.aiAgent.update({
    where: { id: params.id },
    data: { name, description, icon, isActive, modelProvider, modelName, temperature, maxTokens, systemPrompt },
  });
  return NextResponse.json(agent);
}

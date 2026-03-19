import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const agents = await prisma.aiAgent.findMany({ orderBy: { createdAt: 'asc' } });
  return NextResponse.json(agents);
}

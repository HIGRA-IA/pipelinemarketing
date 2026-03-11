export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const companies = await prisma.company.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(companies ?? []);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json([], { status: 500 });
  }
}

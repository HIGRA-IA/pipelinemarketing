export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeAll = searchParams.get('includeAll') === 'true';

    const tasks = await prisma.task.findMany({
      where: includeAll ? {} : { dueDate: { not: null } },
      include: {
        sprint: {
          include: {
            project: {
              include: {
                company: true,
              },
            },
          },
        },
      },
      orderBy: [
        { startDate: 'asc' },
        { dueDate: 'asc' },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching task schedule:', error);
    return NextResponse.json([], { status: 500 });
  }
}

/**
 * Import data from Abacus.ai production app to local Supabase
 * Run with: npx tsx --env-file=.env scripts/import-from-abacus.ts
 *
 * Schema mapping:
 *  Company:     name, projectsPerYear(default 6), frequency(default "1 a cada 2 meses")
 *  Project:     companyId, name, theme, objective, priorityProduct, startDate, endDate,
 *               status, budgetTraffic, targetCpl
 *  Sprint:      projectId, number, name, startDate, endDate, objective, status
 *  Task:        sprintId, stageNumber, stageName, description, status, toolsAi, toolsThirdParty
 *  Resource:    name, category, color
 *  TaskResource: taskId, resourceId
 *  ChannelData: projectId, channel, year, month, weekNumber, impressions, clicks, conversions, cost
 *  KpiEntry:    projectId, date, cpl, totalSpent, totalLeads, totalMqls, totalSqls
 */

import { PrismaClient } from '@prisma/client';

const dbUrl = (process.env.DATABASE_URL ?? '').replace(/connection_limit=\d+/, '') + '&connection_limit=1';
const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
const BASE_URL = 'https://marketingdeperformancehigra.abacusai.app';

async function fetchJson(path: string): Promise<any> {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ⚠ ${url} → ${res.status}`);
      return null;
    }
    return res.json();
  } catch (e) {
    console.warn(`  ⚠ fetch error ${url}:`, e);
    return null;
  }
}

async function clearDatabase() {
  console.log('🗑  Clearing database...');
  await prisma.taskResource.deleteMany();
  await prisma.kpiEntry.deleteMany();
  await prisma.channelData.deleteMany();
  await prisma.task.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.project.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.company.deleteMany();
  console.log('   ✓ Done');
}

async function importCompanies() {
  console.log('\n🏢 Importing companies...');
  const data = await fetchJson('/api/companies');
  if (!data) return [];

  const list: any[] = Array.isArray(data) ? data : (data.companies ?? []);
  let count = 0;

  for (const c of list) {
    try {
      await prisma.company.create({
        data: {
          id: c.id,
          name: c.name,
          projectsPerYear: 6,
          frequency: '1 a cada 2 meses',
          createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        },
      });
      console.log(`   ✓ ${c.name}`);
      count++;
    } catch (e: any) {
      console.warn(`   ⚠ ${c.name}: ${e.message?.split('\n')[0]}`);
    }
  }
  console.log(`   Total: ${count}`);
  return list;
}

async function importResources() {
  console.log('\n👥 Importing resources...');
  const data = await fetchJson('/api/resources');
  if (!data) return [];

  const list: any[] = Array.isArray(data) ? data : (data.resources ?? []);
  let count = 0;

  // Map Abacus type → local category
  const categoryMap: Record<string, string> = {
    'AI': 'Ferramenta IA',
    'TOOL': 'Ferramenta',
    'HUMAN': 'Colaborador',
    'PLATFORM': 'Plataforma',
  };

  for (const r of list) {
    try {
      const category = categoryMap[r.type] ?? r.type ?? 'Ferramenta IA';
      await prisma.resource.create({
        data: {
          id: r.id,
          name: r.name,
          category,
          color: r.color ?? '#A19AD3',
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        },
      });
      count++;
    } catch (e: any) {
      console.warn(`   ⚠ ${r.name}: ${e.message?.split('\n')[0]}`);
    }
  }
  console.log(`   Total: ${count}`);
}

async function importProjects() {
  console.log('\n📁 Importing projects...');
  const data = await fetchJson('/api/projects');
  if (!data) return [];

  const list: any[] = Array.isArray(data) ? data : (data.projects ?? []);
  const now = new Date();

  for (const p of list) {
    console.log(`\n   ▸ ${p.name}`);

    // Ensure required dates exist
    const startDate = p.startDate ? new Date(p.startDate) : now;
    const endDate = p.endDate ? new Date(p.endDate) : new Date(now.getTime() + 90 * 86400000);

    try {
      await prisma.project.create({
        data: {
          id: p.id,
          companyId: p.companyId,
          name: p.name,
          theme: p.description ?? p.theme ?? '',
          objective: p.objective ?? 'Gerar SQL',
          priorityProduct: p.priorityProduct ?? '',
          startDate,
          endDate,
          status: p.status ?? 'planejamento',
          budgetTraffic: p.budget != null ? parseFloat(String(p.budget)) : (p.budgetTraffic ?? 3000),
          targetCpl: p.targetCpl ?? 600,
          targetMqlToSql: p.targetMqlToSql ?? null,
          targetCtr: p.targetCtr ?? null,
          targetCustoMql: p.targetCustoMql ?? null,
          targetCustoSql: p.targetCustoSql ?? null,
          createdAt: p.createdAt ? new Date(p.createdAt) : now,
        },
      });
      console.log(`   ✓ Project created`);
    } catch (e: any) {
      console.warn(`   ⚠ Project ${p.name}: ${e.message?.split('\n')[0]}`);
      continue;
    }

    // Import sprints
    const sprints: any[] = p.sprints ?? [];
    console.log(`     Sprints: ${sprints.length}`);

    for (let si = 0; si < sprints.length; si++) {
      const s = sprints[si];
      const sprintStart = s.startDate ? new Date(s.startDate) : now;
      const sprintEnd = s.endDate ? new Date(s.endDate) : new Date(now.getTime() + 14 * 86400000);

      try {
        const sprint = await prisma.sprint.create({
          data: {
            id: s.id,
            projectId: p.id,
            number: s.number ?? (si + 1),
            name: s.name,
            startDate: sprintStart,
            endDate: sprintEnd,
            objective: s.goal ?? s.objective ?? '',
            status: s.status ?? 'pendente',
            createdAt: s.createdAt ? new Date(s.createdAt) : now,
          },
        });

        const tasks: any[] = s.tasks ?? [];
        console.log(`       "${sprint.name}": ${tasks.length} tasks`);

        for (let ti = 0; ti < tasks.length; ti++) {
          const t = tasks[ti];
          try {
            await prisma.task.create({
              data: {
                id: t.id,
                sprintId: sprint.id,
                stageNumber: t.stageNumber ?? (ti + 1),
                stageName: t.stageName ?? t.stage ?? `Etapa ${ti + 1}`,
                description: t.title ?? t.description ?? '',
                status: t.status ?? 'pendente',
                toolsAi: t.toolsAi ?? '',
                toolsThirdParty: t.toolsThirdParty ?? '',
                notes: t.notes ?? '',
                startDate: t.startDate ? new Date(t.startDate) : null,
                dueDate: t.dueDate ? new Date(t.dueDate) : null,
                completedAt: t.completedAt ? new Date(t.completedAt) : null,
                createdAt: t.createdAt ? new Date(t.createdAt) : now,
              },
            });
          } catch (e: any) {
            console.warn(`         ⚠ Task ${t.title ?? ti}: ${e.message?.split('\n')[0]}`);
          }
        }
      } catch (e: any) {
        console.warn(`       ⚠ Sprint ${s.name}: ${e.message?.split('\n')[0]}`);
      }
    }

    // Import channel data
    const cdData = await fetchJson(`/api/projects/${p.id}/channel-data`);
    if (cdData) {
      const channels: any[] = Array.isArray(cdData) ? cdData : (cdData.channelData ?? cdData.data ?? []);
      if (channels.length > 0) {
        console.log(`     ChannelData: ${channels.length}`);
        for (const ch of channels) {
          try {
            await prisma.channelData.create({
              data: {
                id: ch.id,
                projectId: p.id,
                channel: ch.channel,
                subChannel: ch.subChannel ?? '',
                date: ch.date ? new Date(ch.date) : null,
                year: ch.year ?? new Date().getFullYear(),
                month: ch.month ?? 1,
                weekNumber: ch.weekNumber ?? 1,
                impressions: ch.impressions != null ? parseInt(String(ch.impressions)) : 0,
                clicks: ch.clicks != null ? parseInt(String(ch.clicks)) : 0,
                conversions: ch.conversions != null ? parseInt(String(ch.conversions)) : 0,
                cost: ch.investment != null ? parseFloat(String(ch.investment)) : (ch.cost ?? 0),
                leads: ch.leads ?? 0,
                mqls: ch.mqls ?? 0,
                sqls: ch.sqls ?? 0,
                notes: ch.notes ?? '',
                createdAt: ch.createdAt ? new Date(ch.createdAt) : now,
              },
            });
          } catch (e: any) {
            console.warn(`       ⚠ ChannelData ${ch.channel}: ${e.message?.split('\n')[0]}`);
          }
        }
      }
    }

    // Import KPI entries
    const kpiData = await fetchJson(`/api/projects/${p.id}/kpis`);
    if (kpiData) {
      const kpis: any[] = Array.isArray(kpiData) ? kpiData : (kpiData.kpis ?? kpiData.entries ?? []);
      if (kpis.length > 0) {
        console.log(`     KpiEntries: ${kpis.length}`);
        for (const k of kpis) {
          try {
            await prisma.kpiEntry.create({
              data: {
                id: k.id,
                projectId: p.id,
                date: k.date ? new Date(k.date) : now,
                cpl: k.cpl != null ? parseFloat(String(k.cpl)) : null,
                costPerProposal: k.costPerProposal != null ? parseFloat(String(k.costPerProposal)) : null,
                mqlToSqlRate: k.mqlToSqlRate != null ? parseFloat(String(k.mqlToSqlRate)) : null,
                projectedRoi: k.projectedRoi != null ? parseFloat(String(k.projectedRoi)) : null,
                ctr: k.ctr != null ? parseFloat(String(k.ctr)) : null,
                lpConversion: k.lpConversion != null ? parseFloat(String(k.lpConversion)) : null,
                mqlQuality: k.mqlQuality != null ? parseFloat(String(k.mqlQuality)) : null,
                totalSpent: k.totalSpent != null ? parseFloat(String(k.totalSpent)) : null,
                totalLeads: k.totalLeads != null ? parseInt(String(k.totalLeads)) : null,
                totalMqls: k.totalMqls != null ? parseInt(String(k.totalMqls)) : null,
                totalSqls: k.totalSqls != null ? parseInt(String(k.totalSqls)) : null,
                notes: k.notes ?? '',
                createdAt: k.createdAt ? new Date(k.createdAt) : now,
              },
            });
          } catch (e: any) {
            console.warn(`       ⚠ KpiEntry: ${e.message?.split('\n')[0]}`);
          }
        }
      }
    }
  }
}

async function importTaskResources() {
  console.log('\n🔗 Importing task-resource links...');
  const allTasks = await prisma.task.findMany({ select: { id: true } });
  let count = 0;

  for (const task of allTasks) {
    const trData = await fetchJson(`/api/tasks/${task.id}/resources`);
    if (!trData) continue;

    const list: any[] = Array.isArray(trData) ? trData : (trData.taskResources ?? trData.resources ?? []);

    for (const tr of list) {
      const resourceId = tr.resourceId ?? tr.id;
      if (!resourceId) continue;

      try {
        const exists = await prisma.resource.findUnique({ where: { id: resourceId } });
        if (!exists) continue;

        await prisma.taskResource.create({
          data: {
            id: tr.id,
            taskId: task.id,
            resourceId,
            createdAt: tr.createdAt ? new Date(tr.createdAt) : new Date(),
          },
        });
        count++;
      } catch {
        // skip duplicate/constraint errors silently
      }
    }
  }
  console.log(`   Total: ${count}`);
}

async function main() {
  console.log('🚀 Abacus → Supabase migration');
  console.log(`   Source: ${BASE_URL}\n`);

  try {
    await clearDatabase();
    await importCompanies();
    await importResources();
    await importProjects();
    await importTaskResources();

    const [companies, resources, projects, sprints, tasks, channels, kpis] = await Promise.all([
      prisma.company.count(),
      prisma.resource.count(),
      prisma.project.count(),
      prisma.sprint.count(),
      prisma.task.count(),
      prisma.channelData.count(),
      prisma.kpiEntry.count(),
    ]);

    console.log('\n✅ Migration complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Companies:    ${companies}`);
    console.log(`   Resources:    ${resources}`);
    console.log(`   Projects:     ${projects}`);
    console.log(`   Sprints:      ${sprints}`);
    console.log(`   Tasks:        ${tasks}`);
    console.log(`   Channel Data: ${channels}`);
    console.log(`   KPI Entries:  ${kpis}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

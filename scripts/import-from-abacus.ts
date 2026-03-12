import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'https://marketingdeperformancehigra.abacusai.app';

async function fetchJSON(path: string) {
  const res = await fetch(`${BASE_URL}${path}`);
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

async function main() {
  console.log('🔄 Buscando dados do Abacus...');
  const [companies, projects, resources] = await Promise.all([
    fetchJSON('/api/companies'),
    fetchJSON('/api/projects'),
    fetchJSON('/api/resources'),
  ]);
  console.log(`✅ companies: ${companies.length}, projects: ${projects.length}, resources: ${resources.length}`);

  // 1. Importar empresas
  console.log('\n📦 Importando empresas...');
  for (const c of companies) {
    await prisma.company.upsert({
      where: { id: c.id },
      update: { name: c.name, projectsPerYear: c.projectsPerYear, frequency: c.frequency },
      create: { id: c.id, name: c.name, projectsPerYear: c.projectsPerYear, frequency: c.frequency, createdAt: new Date(c.createdAt) },
    });
    console.log(`  ✓ ${c.name}`);
  }

  // 2. Importar recursos
  console.log('\n🛠️ Importando recursos...');
  for (const r of resources) {
    await prisma.resource.upsert({
      where: { id: r.id },
      update: { name: r.name, category: r.category, color: r.color },
      create: { id: r.id, name: r.name, category: r.category, color: r.color, createdAt: new Date(r.createdAt) },
    });
    console.log(`  ✓ ${r.name}`);
  }

  // 3. Importar projetos, sprints e tasks
  console.log('\n🚀 Importando projetos...');
  for (const p of projects) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: {
        name: p.name, theme: p.theme, objective: p.objective,
        priorityProduct: p.priorityProduct, status: p.status,
        budgetTraffic: p.budgetTraffic, targetCpl: p.targetCpl,
        targetMqlToSql: p.targetMqlToSql, targetCtr: p.targetCtr,
        targetCustoMql: p.targetCustoMql, targetCustoSql: p.targetCustoSql,
      },
      create: {
        id: p.id, companyId: p.companyId, name: p.name, theme: p.theme ?? '',
        objective: p.objective ?? 'Gerar SQL', priorityProduct: p.priorityProduct ?? '',
        startDate: new Date(p.startDate), endDate: new Date(p.endDate),
        status: p.status ?? 'planejamento',
        budgetTraffic: p.budgetTraffic ?? 0, targetCpl: p.targetCpl ?? 0,
        targetMqlToSql: p.targetMqlToSql ?? 0, targetCtr: p.targetCtr ?? 0,
        targetCustoMql: p.targetCustoMql ?? 0, targetCustoSql: p.targetCustoSql ?? 0,
        createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt),
      },
    });
    console.log(`  ✓ ${p.name}`);

    // Sprints
    for (const s of (p.sprints ?? [])) {
      await prisma.sprint.upsert({
        where: { id: s.id },
        update: { name: s.name, status: s.status, objective: s.objective },
        create: {
          id: s.id, projectId: p.id, number: s.number, name: s.name,
          startDate: new Date(s.startDate), endDate: new Date(s.endDate),
          objective: s.objective ?? '', status: s.status ?? 'pendente',
          createdAt: new Date(s.createdAt),
        },
      });

      // Tasks
      for (const t of (s.tasks ?? [])) {
        await prisma.task.upsert({
          where: { id: t.id },
          update: { status: t.status, description: t.description, notes: t.notes },
          create: {
            id: t.id, sprintId: s.id, stageNumber: t.stageNumber, stageName: t.stageName ?? '',
            description: t.description ?? '', toolsAi: t.toolsAi ?? '',
            toolsThirdParty: t.toolsThirdParty ?? '', status: t.status ?? 'pendente',
            notes: t.notes ?? null, createdAt: new Date(t.createdAt),
          },
        });
      }
    }
  }

  console.log('\n✅ Importação concluída!');
}

main()
  .catch(e => { console.error('❌ Erro:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

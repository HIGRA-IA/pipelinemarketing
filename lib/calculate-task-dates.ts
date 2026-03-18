const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export interface TaskLike {
  stageNumber: number;
  [key: string]: any;
}

export interface TaskWithDates extends TaskLike {
  startDate: Date;
  dueDate: Date;
}

/**
 * Distributes tasks across a sprint window by stageNumber.
 * Tasks with the same stageNumber are parallel (same dates).
 * Stages are sequential — each stage starts after the previous one ends.
 * The last stage always extends to sprintEnd.
 */
export function calculateTaskDates<T extends TaskLike>(
  sprintStart: Date,
  sprintEnd: Date,
  tasks: T[]
): (T & { startDate: Date; dueDate: Date })[] {
  if (!tasks.length) return [];

  // Unique stage numbers in ascending order
  const stageNumbers = [...new Set(tasks.map((t) => t.stageNumber))].sort(
    (a, b) => a - b
  );
  const totalStages = stageNumbers.length;

  // Days difference between sprint start and end (inclusive span)
  const daysDiff = Math.round((sprintEnd.getTime() - sprintStart.getTime()) / DAY_MS);
  // Days allocated per stage (floor), minimum 1
  const daysPerStage = Math.max(1, Math.floor(daysDiff / totalStages));

  // Build stage → { startDate, dueDate } map
  const stageDates = new Map<number, { startDate: Date; dueDate: Date }>();
  let offsetDays = 0;

  stageNumbers.forEach((stageNum, idx) => {
    const isLast = idx === totalStages - 1;
    const stageStart = addDays(sprintStart, offsetDays);
    const stageEnd = isLast ? sprintEnd : addDays(stageStart, daysPerStage - 1);
    stageDates.set(stageNum, { startDate: stageStart, dueDate: stageEnd });
    offsetDays += daysPerStage;
  });

  return tasks.map((task) => {
    const dates = stageDates.get(task.stageNumber) ?? {
      startDate: sprintStart,
      dueDate: sprintEnd,
    };
    return { ...task, startDate: dates.startDate, dueDate: dates.dueDate };
  });
}

/**
 * Returns sprint boundaries for a project starting on `projectStart`.
 * 4 sprints × 15 days each.
 */
export function getSprintDates(
  projectStart: Date,
  sprintIndex: number // 0-based
): { startDate: Date; endDate: Date } {
  const sprintStart = addDays(projectStart, sprintIndex * 15);
  const sprintEnd = addDays(sprintStart, 14);
  return { startDate: sprintStart, endDate: sprintEnd };
}

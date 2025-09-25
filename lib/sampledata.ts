import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  formatISO,
  isAfter,
  isBefore,
  isSameDay,
  startOfMonth,
} from 'date-fns';

export type Prescription = {
  id: string;
  name: string;
  colorClass: string; // Tailwind bg-* color class for dot indicators
  start: string; // ISO date yyyy-mm-dd
  end?: string; // ISO date yyyy-mm-dd (optional open-ended)
  times: Array<string>; // e.g., ["08:00", "20:00"]
  daysOfWeek?: Array<number>; // 0..6 (Sun..Sat)
  intervalDays?: number; // every N days starting from start
};

export type Occurrence = {
  date: string; // ISO yyyy-mm-dd
  id: string;
  name: string;
  colorClass: string;
  times: Array<string>;
};

export const prescriptions: Array<Prescription> = [
  {
    id: 'metformin',
    name: 'Metformin 500mg',
    colorClass: 'bg-blue-500',
    start: isoToday(),
    times: ['08:00', '20:00'],
  },
  {
    id: 'amoxicillin',
    name: 'Amoxicillin 250mg',
    colorClass: 'bg-amber-500',
    start: isoOffsetDays(-2),
    end: isoOffsetDays(7),
    times: ['09:00', '21:00'],
  },
  {
    id: 'vitamin_d',
    name: 'Vitamin D3 1000IU',
    colorClass: 'bg-emerald-500',
    start: isoOffsetDays(-20),
    times: ['10:00'],
    daysOfWeek: [0], // Sundays
  },
  {
    id: 'ibuprofen',
    name: 'Ibuprofen 200mg',
    colorClass: 'bg-rose-500',
    start: isoToday(),
    times: ['12:00'],
    intervalDays: 2, // every other day
  },
];

export function isoToday(): string {
  return formatISO(new Date(), { representation: 'date' });
}

export function isoOffsetDays(offset: number): string {
  return formatISO(addDays(new Date(), offset), { representation: 'date' });
}

export function dateKey(d: Date): string {
  return formatISO(d, { representation: 'date' });
}

function inWindow(date: Date, startIso: string, endIso?: string): boolean {
  const start = new Date(`${startIso}T00:00:00`);
  if (endIso) {
    const end = new Date(`${endIso}T23:59:59`);
    return (
      (isAfter(date, start) || isSameDay(date, start)) &&
      (isBefore(date, end) || isSameDay(date, end))
    );
  }
  return isAfter(date, start) || isSameDay(date, start);
}

function occursOn(date: Date, p: Prescription): boolean {
  if (!inWindow(date, p.start, p.end)) return false;
  if (p.daysOfWeek && p.daysOfWeek.length > 0) {
    return p.daysOfWeek.includes(date.getDay());
  }
  if (p.intervalDays && p.intervalDays > 1) {
    const start = new Date(`${p.start}T00:00:00`);
    const diff = differenceInCalendarDays(date, start);
    return diff >= 0 && diff % p.intervalDays === 0;
  }
  // default: daily
  return true;
}

export function getMonthPrescriptionMap(
  monthDate: Date,
): Record<string, Array<Occurrence>> {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  const map: Record<string, Array<Occurrence>> = {};
  for (const day of eachDayOfInterval({ start, end })) {
    const key = dateKey(day);
    const todays: Array<Occurrence> = [];
    for (const p of prescriptions) {
      if (occursOn(day, p)) {
        todays.push({
          date: key,
          id: p.id,
          name: p.name,
          colorClass: p.colorClass,
          times: p.times,
        });
      }
    }
    if (todays.length > 0) map[key] = todays;
  }
  return map;
}

export function getUpcomingPrescriptions(
  fromDate: Date,
  days = 14,
): Array<{ date: string; entries: Array<Occurrence> }> {
  const out: Array<{ date: string; entries: Array<Occurrence> }> = [];
  for (let i = 0; i < days; i++) {
    const d = addDays(fromDate, i);
    const key = dateKey(d);
    const entries: Array<Occurrence> = [];
    for (const p of prescriptions) {
      if (occursOn(d, p)) {
        entries.push({
          date: key,
          id: p.id,
          name: p.name,
          colorClass: p.colorClass,
          times: p.times,
        });
      }
    }
    if (entries.length > 0) out.push({ date: key, entries });
  }
  return out;
}

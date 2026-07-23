/**
 * "Where's the Nut Guy?" — the appearance schedule.
 *
 * Source: simplynutsandmore.com/where-is-the-nut-guy/ (scraped 2026-07-21).
 * The business does 225+ shows a year across the upper Midwest; this is the
 * published 2026 run. Update this file when the season changes — it is the
 * single source of truth for every "find us in person" surface on the site.
 *
 * Dates are ISO `YYYY-MM-DD` and treated as LOCAL calendar days (no timezone
 * math) so an event stays "today" for the whole day in Minnesota.
 */

export type NutGuyEvent = {
  /** Venue / show name. */
  venue: string;
  city: string;
  /** First day, ISO YYYY-MM-DD. */
  start: string;
  /** Last day (same as `start` for one-day appearances). */
  end: string;
  /** Optional flag for the marquee event of the year. */
  featured?: boolean;
  /** Shown when we have something worth saying about the stop. */
  note?: string;
};

const CANTERBURY = { venue: 'Canterbury Park', city: 'Shakopee, MN' } as const;

/** One-day and multi-day Canterbury appearances, as published for 2026. */
const CANTERBURY_RUNS: Array<[string, string]> = [
  ['2026-06-18', '2026-06-18'],
  ['2026-06-20', '2026-06-21'],
  ['2026-06-25', '2026-06-25'],
  ['2026-06-27', '2026-06-28'],
  ['2026-07-02', '2026-07-05'],
  ['2026-07-09', '2026-07-09'],
  ['2026-07-11', '2026-07-12'],
  ['2026-07-22', '2026-07-23'],
  ['2026-07-25', '2026-07-26'],
  ['2026-07-30', '2026-07-30'],
  ['2026-08-01', '2026-08-02'],
  ['2026-08-06', '2026-08-06'],
  ['2026-08-08', '2026-08-09'],
  ['2026-08-13', '2026-08-13'],
  ['2026-08-15', '2026-08-16'],
  ['2026-08-20', '2026-08-20'],
  ['2026-08-22', '2026-08-23'],
  ['2026-08-27', '2026-08-27'],
  ['2026-08-29', '2026-08-30'],
  ['2026-09-03', '2026-09-03'],
  ['2026-09-05', '2026-09-06'],
  ['2026-09-10', '2026-09-10'],
  ['2026-09-12', '2026-09-13'],
  ['2026-09-16', '2026-09-17'],
  ['2026-09-19', '2026-09-19'],
];

export const EVENTS_2026: NutGuyEvent[] = [
  ...CANTERBURY_RUNS.map(([start, end]) => ({ ...CANTERBURY, start, end })),
  {
    venue: 'Minnesota State Fair',
    city: 'Falcon Heights, MN',
    start: '2026-08-27',
    end: '2026-09-07',
    featured: true,
    note: 'Twelve days of free samples. Confirmed by owner 2026-07-21.',
  },
];

/** Local-midnight Date for an ISO day string (avoids UTC off-by-one). */
function toLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Events that haven't finished yet, soonest first. */
export function upcomingEvents(
  events: NutGuyEvent[] = EVENTS_2026,
  limit = 5,
  now: Date = new Date(),
): NutGuyEvent[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return events
    .filter((e) => toLocalDate(e.end) >= today)
    .sort((a, b) => toLocalDate(a.start).getTime() - toLocalDate(b.start).getTime())
    .slice(0, limit);
}

/** "Jul 22", or "Jul 22–23" / "Aug 29 – Sep 6" for multi-day runs. */
export function formatEventDate(e: NutGuyEvent): string {
  const s = toLocalDate(e.start);
  const t = toLocalDate(e.end);
  const mon = (d: Date) => d.toLocaleDateString('en-US', { month: 'short' });
  if (e.start === e.end) return `${mon(s)} ${s.getDate()}`;
  if (s.getMonth() === t.getMonth()) return `${mon(s)} ${s.getDate()}–${t.getDate()}`;
  return `${mon(s)} ${s.getDate()} – ${mon(t)} ${t.getDate()}`;
}

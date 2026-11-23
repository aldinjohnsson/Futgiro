import type { Court, Match } from '@/types/futgiro';

export type BookableSlot = {
  key: string;
  courtId: string;
  courtName: string;
  courtCity: string;
  startsAt: string;
  time: string;
};

const SAO_PAULO_OFFSET = '-03:00';

// A calendar date has the same weekday everywhere, so UTC avoids browser time zone shifts.
export const getWeekdayOfDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};

export const buildStartsAt = (date: string, time: string) => `${date}T${time}:00${SAO_PAULO_OFFSET}`;

export function getBookableSlots(courts: Court[], matches: Match[], date: string, now: number): BookableSlot[] {
  if (!date) return [];
  const weekday = getWeekdayOfDate(date);
  const bookedTimes = new Set(
    matches.map((match) => `${match.courtId}|${new Date(match.startsAt).getTime()}`),
  );

  const slots: BookableSlot[] = [];
  for (const court of courts) {
    for (const slot of court.slots) {
      if (slot.weekday !== weekday) continue;
      const startsAt = buildStartsAt(date, slot.startTime);
      const startsAtTime = new Date(startsAt).getTime();
      if (startsAtTime <= now) continue;
      if (bookedTimes.has(`${court.id}|${startsAtTime}`)) continue;
      slots.push({
        key: `${court.id}|${startsAt}`,
        courtId: court.id,
        courtName: court.name,
        courtCity: court.city,
        startsAt,
        time: slot.startTime,
      });
    }
  }

  return slots.sort((a, b) => a.time.localeCompare(b.time) || a.courtName.localeCompare(b.courtName));
}

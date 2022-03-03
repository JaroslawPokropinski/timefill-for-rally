import { Record as RecordDto } from '@src/types/Record';

export function getMonday() {
  const d = new Date();
  var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff)).getTime() / 1000;
}

export function getHoursPerDay(records: RecordDto[], since: Date, days = 7) {
  const start = new Date(since);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + days);

  const filteredRecords = records.filter(
    (r) => r.t1 >= start.getTime() / 1000 && r.t2 < end.getTime() / 1000,
  );

  const toDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const firstBy = (r: RecordDto, prefix: string) => {
    return r.ds.split(' ').filter((s) => s.startsWith(`#${prefix}`))[0];
  };

  const recordsWithDay = filteredRecords.map((r) => ({
    day: toDay(new Date(r.t1 * 1000)).getDay(),
    seconds: r.t2 - r.t1,
    tag:
      firstBy(r, 'ta') ??
      firstBy(r, 'event') ??
      firstBy(r, 'personal') ??
      firstBy(r, 'scrum') ??
      firstBy(r, '') ??
      '',
  }));

  const res: Record<number, Record<string, number>> = {};
  recordsWithDay.forEach((r) => {
    const timePerTask = res[r.day] ?? {};
    timePerTask[r.tag] = (timePerTask[r.tag] ?? 0) + r.seconds / 3600;
    res[r.day] = timePerTask;
  });
  return res;
}

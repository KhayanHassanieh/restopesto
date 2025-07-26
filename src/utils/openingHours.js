export function isRestaurantOpen(openingHoursStr) {
  if (!openingHoursStr) return true;
  const regex = /(\d{1,2}:\d{2})(?:\s*(AM|PM))?\s*-\s*(\d{1,2}:\d{2})(?:\s*(AM|PM))?/i;
  const match = openingHoursStr.match(regex);
  if (!match) {
    return true; // if can't parse, assume open
  }
  let [, openTime, openPeriod, closeTime, closePeriod] = match;

  function parseTime(t, period) {
    let [hours, minutes] = t.split(':').map(Number);
    if (period) {
      if (period.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12;
      }
      if (period.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
    }
    return { hours, minutes };
  }

  const open = parseTime(openTime, openPeriod);
  const close = parseTime(closeTime, closePeriod);

  const now = new Date();
  const openDate = new Date(now);
  openDate.setHours(open.hours, open.minutes, 0, 0);
  const closeDate = new Date(now);
  closeDate.setHours(close.hours, close.minutes, 0, 0);

  if (closeDate <= openDate) {
    // handle overnight hours, e.g., 18:00 - 02:00
    if (now >= openDate) {
      return true;
    }
    closeDate.setDate(closeDate.getDate() + 1);
  }

  return now >= openDate && now <= closeDate;
}

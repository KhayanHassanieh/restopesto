export const daysOfWeek = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

export function isRestaurantOpen(hours) {
  if (!hours || typeof hours !== 'object') return true;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  const localNow = new Date(now.toLocaleString('en-US', { timeZone }));
  const day = localNow.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const dayHours = hours[day];
  if (!dayHours || !dayHours.open || !dayHours.close) return true;
  if (dayHours.open === dayHours.close) return false;
  const [openH, openM] = dayHours.open.split(':').map(Number);
  const [closeH, closeM] = dayHours.close.split(':').map(Number);
  const openDate = new Date(localNow);
  openDate.setHours(openH, openM, 0, 0);
  const closeDate = new Date(localNow);
  closeDate.setHours(closeH, closeM, 0, 0);
  if (closeDate <= openDate) {
    if (localNow >= openDate) return true;
    closeDate.setDate(closeDate.getDate() + 1);
  }
  return localNow >= openDate && localNow <= closeDate;
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(h, 10), parseInt(m, 10));
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

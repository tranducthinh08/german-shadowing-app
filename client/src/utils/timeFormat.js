/**
 * Format seconds to mm:ss or hh:mm:ss format
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null || seconds === undefined) return '00:00';
  const totalSecs = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  if (hrs > 0) {
    const hh = String(hrs).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

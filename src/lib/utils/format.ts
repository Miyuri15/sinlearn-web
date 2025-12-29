export function formatBytes(bytes: number | undefined | null): string {
  if (bytes === undefined || bytes === null) return "";
  if (!Number.isFinite(bytes)) return "";
  const units = ["B", "KB", "MB", "GB", "TB"] as const;
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  const decimals = n < 10 && i > 0 ? 1 : 0;
  return `${n.toFixed(decimals)} ${units[i]}`;
}

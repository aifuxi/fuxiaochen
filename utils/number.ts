export function numberFormatter(num: number): string {
  if (num < 1e3) {
    return `${num}`;
  }
  if (num < 1e4) {
    return (num / 1e3).toFixed(1) + '千';
  }
  if (num < 1e8) {
    return (num / 1e4).toFixed(1) + '万';
  } else {
    return (num / 1e8).toFixed(1) + '亿';
  }
}

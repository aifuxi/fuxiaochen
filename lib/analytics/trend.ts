import type { AnalyticsSnapshot } from "./schema";

export function trendGeometry(trend: AnalyticsSnapshot["trend"]) {
  const max = Math.max(4, Math.ceil(Math.max(0, ...trend.map((item) => item.pv ?? 0)) / 4) * 4);
  const points = trend.map((item, i) => ({
    ...item,
    x: trend.length === 1 ? 327 : 54 + (i * 546) / (trend.length - 1),
    pvY: item.pv === null ? null : 228 - (item.pv / max) * 196,
    uvY: item.uv === null ? null : 228 - (item.uv / max) * 196,
  }));
  const path = (key: "pvY" | "uvY") => {
    let connected = false;
    return points
      .map((point) => {
        if (point[key] === null) {
          connected = false;
          return "";
        }
        const command = connected ? "L" : "M";
        connected = true;
        return `${command}${point.x},${point[key]}`;
      })
      .join(" ");
  };
  return { max, points, path };
}

export type AnalyticsRange = "7d" | "30d" | "quarter";

export const analyticsRanges: { value: AnalyticsRange; label: string }[] = [
  { value: "7d", label: "近 7 天" },
  { value: "30d", label: "近 30 天" },
  { value: "quarter", label: "本季度" },
];

const articles = [
  { title: "Mac 效率工具清单（2025 版）", pv: 8571, uv: 6241, rate: 72.8 },
  { title: "如何保持写作灵感：10 个实用方法", pv: 6108, uv: 4180, rate: 68.4 },
  { title: "在路上小确幸的生活", pv: 5842, uv: 3950, rate: 67.6 },
  { title: "独立创作者的个人 IP 突围指南", pv: 3254, uv: 2110, rate: 64.8 },
  { title: "摄影入门：光线的魔法", pv: 2156, uv: 1542, rate: 71.5 },
];

function createSnapshot(days: number, totalPv: number, multiplier: number) {
  const weights = Array.from({ length: days }, (_, i) => 60 + ((i * 17 + 23) % 53));
  const weightSum = weights.reduce((sum, value) => sum + value, 0);
  const dailyPv = weights.map((weight) => Math.floor((weight / weightSum) * totalPv));
  dailyPv[days - 1] += totalPv - dailyPv.reduce((sum, value) => sum + value, 0);
  return {
    trend: dailyPv.map((pv, i) => ({
      date: new Date(Date.UTC(2026, 8, 30 - days + 1 + i)).toISOString().slice(0, 10),
      pv,
      uv: Math.round(pv * (0.43 + (i % 5) * 0.02)),
    })),
    articles: articles
      .map((article, i) => ({
        ...article,
        pv: Math.round(article.pv * multiplier * (days === 7 ? 1 + (i % 2) * 0.5 : 1)),
        uv: Math.round(article.uv * multiplier),
        rate: Number((article.rate + (days === 7 ? 1.2 : days === 92 ? -1.8 : 0)).toFixed(1)),
      }))
      .toSorted((a, b) => b.pv - a.pv),
  };
}

// 日 UV 可重复计入跨日访客，周期 UV 为去重快照，不能直接相加。
export const analyticsSnapshots = {
  "7d": {
    ...createSnapshot(7, 62184, 0.26),
    uv: 5836,
    duration: "4分48秒",
    bounce: "39.75%",
    changes: ["+12.8%", "+16.3%", "+5.9%", "-3.2%"],
    devices: [55.2, 39.3, 5.5],
  },
  "30d": {
    ...createSnapshot(30, 238401, 1),
    uv: 19542,
    duration: "4分32秒",
    bounce: "42.15%",
    changes: ["+14.2%", "+18.6%", "+6.1%", "-2.4%"],
    devices: [58.4, 36.1, 5.5],
  },
  quarter: {
    ...createSnapshot(92, 684720, 2.8),
    uv: 52864,
    duration: "4分16秒",
    bounce: "44.20%",
    changes: ["+21.5%", "+24.8%", "+4.2%", "-1.8%"],
    devices: [60.8, 33.4, 5.8],
  },
};

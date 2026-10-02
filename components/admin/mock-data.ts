export type Notice = { id: string; title: string; detail: string; time: string; read: boolean };

export const initialNotices: Notice[] = [
  {
    id: "notice-1",
    title: "有新的评论待审核",
    detail: "小雨评论了你的文章",
    time: "10 分钟前",
    read: false,
  },
  {
    id: "notice-2",
    title: "文章发布计划完成",
    detail: "定时文章已发布",
    time: "1 小时前",
    read: false,
  },
  {
    id: "notice-3",
    title: "模拟备份检查完成",
    detail: "演示数据状态正常",
    time: "4 小时前",
    read: true,
  },
];

export const initialSources = [
  { name: "直接访问", percentage: 52.7 },
  { name: "搜索引擎", percentage: 24.3 },
  { name: "社交媒体", percentage: 12.7 },
  { name: "外部链接", percentage: 6.1 },
  { name: "其他", percentage: 4.2 },
];

const visits = [
  3900, 4300, 4700, 4100, 5200, 5800, 5100, 5600, 6100, 5900, 5400, 6700, 6300, 7000, 6600, 6200,
  7100, 7300, 6800, 7500, 6900, 7200, 6500, 4000, 4200, 6000, 7500, 5800, 6400, 8200,
];
export const traffic30Days = visits.map((count, index) => {
  const day = new Date(Date.UTC(2025, 3, 21 + index));
  return {
    date: `${String(day.getUTCMonth() + 1).padStart(2, "0")}-${String(day.getUTCDate()).padStart(2, "0")}`,
    visits: count,
  };
});

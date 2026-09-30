export type VisitorLog = {
  id: string;
  ip: string;
  location: string;
  entryPage: string;
  browser: string;
  os: string;
  duration: string;
  time: string;
};

export const visitorSummary = { online: 14, uniqueIps: 1428, cities: 28, crawlers: 312 };

export const initialVisitorLogs: VisitorLog[] = [
  {
    id: "visitor-1",
    ip: "183.14.231.98",
    location: "中国 广东省 深圳市",
    entryPage: "/posts/mac-efficiency-tools-2025",
    browser: "Chrome 122.0",
    os: "macOS 14.2",
    duration: "04:12",
    time: "15:58:21",
  },
  {
    id: "visitor-2",
    ip: "112.97.45.16",
    location: "中国 北京市 朝阳区",
    entryPage: "/posts/keep-writing-inspiration-tips",
    browser: "Safari Mobile",
    os: "iOS 17.3",
    duration: "02:45",
    time: "15:54:10",
  },
  {
    id: "visitor-3",
    ip: "222.186.31.254",
    location: "中国 江苏省 南京市",
    entryPage: "/posts/happy-life-on-the-road",
    browser: "Edge 121.0",
    os: "Windows 11",
    duration: "01:18",
    time: "15:48:32",
  },
  {
    id: "visitor-4",
    ip: "66.249.79.130",
    location: "美国 加利福尼亚州（Googlebot）",
    entryPage: "/categories/efficiency-tools",
    browser: "Googlebot",
    os: "Linux",
    duration: "00:05",
    time: "15:45:01",
  },
  {
    id: "visitor-5",
    ip: "117.136.38.192",
    location: "中国 四川省 成都市",
    entryPage: "/posts/happy-life-on-the-road",
    browser: "WeChat Built-in",
    os: "iOS 17.2",
    duration: "08:50",
    time: "15:39:14",
  },
  {
    id: "visitor-6",
    ip: "116.228.89.44",
    location: "中国 上海市 静安区",
    entryPage: "/",
    browser: "Chrome 122.0",
    os: "Windows 11",
    duration: "03:30",
    time: "15:31:44",
  },
];

export const visitorStreamSamples: Omit<VisitorLog, "id" | "time" | "duration">[] = [
  {
    ip: "220.191.82.145",
    location: "中国 浙江省 杭州市",
    entryPage: "/",
    browser: "Chrome 122.0",
    os: "Windows 11",
  },
  {
    ip: "120.231.14.99",
    location: "中国 湖北省 武汉市",
    entryPage: "/posts/keep-writing-inspiration-tips",
    browser: "Safari Mobile",
    os: "iOS 17.4",
  },
  {
    ip: "180.110.22.45",
    location: "中国 江苏省 苏州市",
    entryPage: "/posts/mac-efficiency-tools-2025",
    browser: "Edge 120.0",
    os: "Windows 11",
  },
  {
    ip: "61.135.169.121",
    location: "中国 北京市（Baiduspider）",
    entryPage: "/categories/efficiency-tools",
    browser: "Baiduspider",
    os: "Linux",
  },
  {
    ip: "64.233.160.20",
    location: "美国 谷歌数据中心",
    entryPage: "/",
    browser: "Googlebot",
    os: "Linux",
  },
];

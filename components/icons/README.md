# 本地图标

39 种动画改编自 [lucide-animated](https://lucide-animated.com/) 的官方 registry，按需引入源码；16 种未覆盖的图形从本项目原 `lucide-react@1.49.0` 提取并补齐 Motion 动画。

保留官方动画路径，移除外层 div 与各组件重复的鼠标控制代码，统一为 SVG 根节点和 `useIconAnimation`。Sparkles 的两个控制器合并，保留星形动画的一秒延迟；Sparkles、Play 与 Pause 的多关键帧显式使用 tween，避免 Motion 的 spring 两关键帧限制。组件导出沿用原项目名称，`size` 默认 24，SVG 属性直接传递。

动画作用域取最近的按钮、链接、选项或 `data-icon-animation-scope`；输入组额外设置 `data-icon-input-scope`。Card 标记整卡，嵌套操作使用自己的控件作用域。没有作用域时仅响应自身悬停。

`IconMotionProvider` 传递页面动效开关，React Portal 同样继承。系统减少动态效果偏好始终优先，动画不循环。具体行为见根目录 `DESIGN.md`。

官方源码采用 MIT，许可证见 `LICENSE.lucide-animated`；Lucide 图形采用 ISC，部分 Feather 图形采用 MIT，完整声明见 `LICENSE.lucide`。

## 名称与来源

| 本地导出      | 文件                                | 来源                                                                                |
| ------------- | ----------------------------------- | ----------------------------------------------------------------------------------- |
| Activity      | activity.tsx                        | [官方 registry](https://lucide-animated.com/r/activity.json)                        |
| ArrowDown     | arrow-down.tsx                      | [官方 registry](https://lucide-animated.com/r/arrow-down.json)                      |
| ArrowRight    | arrow-right.tsx                     | [官方 registry](https://lucide-animated.com/r/arrow-right.json)                     |
| ArrowUp       | arrow-up.tsx                        | [官方 registry](https://lucide-animated.com/r/arrow-up.json)                        |
| ArrowUpRight  | arrow-up-right.tsx                  | [官方 registry](https://lucide-animated.com/r/arrow-up-right.json)                  |
| BarChart3     | chart-no-axes-column-increasing.tsx | [官方 registry](https://lucide-animated.com/r/chart-no-axes-column-increasing.json) |
| Bell          | bell.tsx                            | [官方 registry](https://lucide-animated.com/r/bell.json)                            |
| CalendarDays  | calendar-days.tsx                   | [官方 registry](https://lucide-animated.com/r/calendar-days.json)                   |
| Check         | check.tsx                           | [官方 registry](https://lucide-animated.com/r/check.json)                           |
| ChevronDown   | chevron-down.tsx                    | [官方 registry](https://lucide-animated.com/r/chevron-down.json)                    |
| ChevronLeft   | chevron-left.tsx                    | [官方 registry](https://lucide-animated.com/r/chevron-left.json)                    |
| ChevronRight  | chevron-right.tsx                   | [官方 registry](https://lucide-animated.com/r/chevron-right.json)                   |
| Clock3        | clock.tsx                           | [官方 registry](https://lucide-animated.com/r/clock.json)                           |
| Code2         | code2.tsx                           | Lucide 图形 + 250ms 缩放                                                            |
| Copy          | copy.tsx                            | [官方 registry](https://lucide-animated.com/r/copy.json)                            |
| ExternalLink  | external-link.tsx                   | [官方 registry](https://lucide-animated.com/r/external-link.json)                   |
| Eye           | eye.tsx                             | [官方 registry](https://lucide-animated.com/r/eye.json)                             |
| FileText      | file-text.tsx                       | [官方 registry](https://lucide-animated.com/r/file-text.json)                       |
| Folder        | folder.tsx                          | Lucide 图形 + 250ms 缩放                                                            |
| Globe2        | earth.tsx                           | [官方 registry](https://lucide-animated.com/r/earth.json)                           |
| HardDrive     | hard-drive.tsx                      | Lucide 图形 + 250ms 缩放                                                            |
| History       | history.tsx                         | [官方 registry](https://lucide-animated.com/r/history.json)                         |
| Home          | home.tsx                            | [官方 registry](https://lucide-animated.com/r/home.json)                            |
| ImageIcon     | image.tsx                           | Lucide 图形 + 250ms 缩放                                                            |
| Info          | info.tsx                            | Lucide 图形 + 250ms 缩放                                                            |
| Layers3       | layers.tsx                          | [官方 registry](https://lucide-animated.com/r/layers.json)                          |
| Lightbulb     | lightbulb.tsx                       | Lucide 图形 + 250ms 缩放                                                            |
| LineChart     | chart-line.tsx                      | [官方 registry](https://lucide-animated.com/r/chart-line.json)                      |
| Link2         | link-2.tsx                          | [官方 registry](https://lucide-animated.com/r/link-2.json)                          |
| LockKeyhole   | lock-keyhole.tsx                    | [官方 registry](https://lucide-animated.com/r/lock-keyhole.json)                    |
| Mail          | mail.tsx                            | Lucide 图形 + 250ms 缩放                                                            |
| Menu          | menu.tsx                            | [官方 registry](https://lucide-animated.com/r/menu.json)                            |
| MessageCircle | message-circle.tsx                  | [官方 registry](https://lucide-animated.com/r/message-circle.json)                  |
| Monitor       | monitor.tsx                         | Lucide 图形 + 250ms 缩放                                                            |
| MousePointer2 | mouse-pointer2.tsx                  | Lucide 图形 + 250ms 缩放                                                            |
| Pause         | pause.tsx                           | [官方 registry](https://lucide-animated.com/r/pause.json)                           |
| Pencil        | pencil.tsx                          | Lucide 图形 + 250ms 缩放                                                            |
| PieChart      | chart-pie.tsx                       | [官方 registry](https://lucide-animated.com/r/chart-pie.json)                       |
| Play          | play.tsx                            | [官方 registry](https://lucide-animated.com/r/play.json)                            |
| Plus          | plus.tsx                            | [官方 registry](https://lucide-animated.com/r/plus.json)                            |
| RotateCcw     | rotate-ccw.tsx                      | [官方 registry](https://lucide-animated.com/r/rotate-ccw.json)                      |
| Save          | save.tsx                            | Lucide 图形 + 250ms 缩放                                                            |
| Search        | search.tsx                          | [官方 registry](https://lucide-animated.com/r/search.json)                          |
| Settings      | settings.tsx                        | [官方 registry](https://lucide-animated.com/r/settings.json)                        |
| ShieldCheck   | shield-check.tsx                    | [官方 registry](https://lucide-animated.com/r/shield-check.json)                    |
| Smartphone    | smartphone.tsx                      | Lucide 图形 + 250ms 缩放                                                            |
| Sparkles      | sparkles.tsx                        | [官方 registry](https://lucide-animated.com/r/sparkles.json)                        |
| Tablet        | tablet.tsx                          | Lucide 图形 + 250ms 缩放                                                            |
| Tags          | tags.tsx                            | Lucide 图形 + 250ms 缩放                                                            |
| Trash2        | trash2.tsx                          | Lucide 图形 + 250ms 缩放                                                            |
| Upload        | upload.tsx                          | [官方 registry](https://lucide-animated.com/r/upload.json)                          |
| UploadCloud   | cloud-upload.tsx                    | [官方 registry](https://lucide-animated.com/r/cloud-upload.json)                    |
| UserRound     | user-round.tsx                      | Lucide 图形 + 250ms 缩放                                                            |
| Users         | users.tsx                           | [官方 registry](https://lucide-animated.com/r/users.json)                           |
| X             | x.tsx                               | [官方 registry](https://lucide-animated.com/r/x.json)                               |

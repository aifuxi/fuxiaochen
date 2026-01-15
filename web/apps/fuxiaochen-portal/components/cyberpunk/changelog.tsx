export function Changelog() {
  const logs = [
    {
      version: "v2.0.1",
      date: "2024-03-15",
      content: "优化了神经渲染引擎。修复了全息投影中的内存泄漏。",
    },
    {
      version: "v2.0.0",
      date: "2024-03-10",
      content: "初始系统大修。强制执行深色模式。安装了霓虹磁通电容器。",
    },
    {
      version: "v1.5.0",
      date: "2024-02-28",
      content: "添加了毛玻璃模块。更新了安全协议。",
    },
  ];

  return (
    <div className="glass-panel rounded-2xl border border-neon-purple/20 p-8">
      <h3 className="mb-8 flex items-center gap-3 text-2xl font-bold text-neon-purple">
        <span className="text-3xl">⚡</span> 系统日志 / System_Logs
      </h3>
      <div className="relative ml-3 space-y-8 border-l border-neon-purple/30">
        {logs.map((log, i) => (
          <div key={i} className="group relative pl-8">
            <div
              className={`
                absolute top-1.5 -left-[5px] h-2.5 w-2.5 rounded-full border-2 border-neon-purple bg-cyber-black
                shadow-[0_0_10px_var(--color-neon-purple)] transition-colors duration-300
                group-hover:bg-neon-purple
              `}
            />
            <div
              className={`
                mb-2 flex flex-col gap-2
                sm:flex-row sm:items-center
              `}
            >
              <span className="rounded bg-neon-cyan/10 px-2 py-0.5 font-mono text-sm text-neon-cyan">
                {log.version}
              </span>
              <span className="text-xs tracking-wide text-gray-500 uppercase">
                {log.date}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-300">
              {log.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Changelog() {
  const logs = [
    { version: "v2.0.1", date: "2024-03-15", content: "优化了神经渲染引擎。修复了全息投影中的内存泄漏。" },
    { version: "v2.0.0", date: "2024-03-10", content: "初始系统大修。强制执行深色模式。安装了霓虹磁通电容器。" },
    { version: "v1.5.0", date: "2024-02-28", content: "添加了毛玻璃模块。更新了安全协议。" },
  ];

  return (
    <div className="glass-panel p-8 rounded-2xl border border-neon-purple/20">
      <h3 className="text-2xl font-bold mb-8 text-neon-purple flex items-center gap-3">
        <span className="text-3xl">⚡</span> 系统日志 / System_Logs
      </h3>
      <div className="relative border-l border-neon-purple/30 ml-3 space-y-8">
        {logs.map((log, i) => (
          <div key={i} className="relative pl-8 group">
            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-cyber-black border-2 border-neon-purple shadow-[0_0_10px_var(--color-neon-purple)] group-hover:bg-neon-purple transition-colors duration-300" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <span className="text-neon-cyan font-mono text-sm bg-neon-cyan/10 px-2 py-0.5 rounded">{log.version}</span>
              <span className="text-gray-500 text-xs uppercase tracking-wide">{log.date}</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{log.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

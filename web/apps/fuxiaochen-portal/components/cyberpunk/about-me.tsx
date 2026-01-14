export function AboutMe() {
  return (
    <div className="glass-panel p-8 rounded-2xl relative overflow-hidden border border-neon-magenta/30 h-full">
       <div className="absolute top-0 right-0 w-32 h-32 bg-neon-magenta/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
       
       <div className="relative z-10">
         <h2 className="text-3xl font-bold mb-8 text-neon-magenta">关于操作员 / About_Operator</h2>
         <div className="flex flex-col md:flex-row gap-8 items-start">
           <div className="w-24 h-24 shrink-0 rounded-full border-2 border-neon-magenta p-1 shadow-[0_0_20px_var(--color-neon-magenta)]">
             <div className="w-full h-full rounded-full bg-gray-800 overflow-hidden relative flex items-center justify-center">
               <span className="text-2xl">👨‍💻</span>
               <div className="absolute inset-0 bg-gradient-to-tr from-neon-purple to-neon-cyan opacity-30 mix-blend-overlay" />
             </div>
           </div>
           <div className="space-y-6">
             <p className="text-gray-300 leading-relaxed font-light">
               全栈开发人员，沉迷于未来感界面和数字体验。
               在现实与赛博朋克未来之间架起桥梁。
               专注于 React、Next.js 和沉浸式 UI/UX。
             </p>
             <div className="flex gap-8 border-t border-white/10 pt-6">
               <div className="flex flex-col">
                 <span className="text-3xl font-bold text-white font-mono">05+</span>
                 <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">年经验 / Years Exp</span>
               </div>
               <div className="flex flex-col">
                 <span className="text-3xl font-bold text-white font-mono">20+</span>
                 <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">项目 / Projects</span>
               </div>
             </div>
           </div>
         </div>
       </div>
    </div>
  );
}

export function GlitchHero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(123,97,255,0.05),transparent_60%)]" />
      
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20" 
           style={{
             backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }} 
      />

      <div className="text-center z-10 space-y-8 px-4">
        <div className="inline-block border border-neon-cyan/30 px-4 py-1 rounded-full bg-neon-cyan/5 backdrop-blur-sm mb-4">
          <span className="text-neon-cyan text-xs tracking-[0.2em] uppercase">System Version 2.4.0</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-neon-cyan via-white to-neon-magenta relative">
          <span className="relative z-10">Cyber<br />Native</span>
          <span className="absolute inset-0 text-neon-cyan opacity-30 blur-sm animate-pulse z-0">Cyber<br />Native</span>
        </h1>
        
        <p className="text-neon-purple text-lg md:text-2xl tracking-[0.5em] uppercase font-light max-w-2xl mx-auto leading-relaxed">
          Exploring the digital frontier
        </p>
        
        <div className="pt-12 flex flex-col md:flex-row gap-6 justify-center">
           <button className="px-10 py-4 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan font-bold uppercase tracking-widest hover:bg-neon-cyan hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_40px_rgba(0,255,255,0.6)] clip-path-polygon">
            Enter Matrix
          </button>
           <button className="px-10 py-4 border border-white/20 text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-all duration-300 hover:border-white/40">
            View Protocol
          </button>
        </div>
      </div>
    </section>
  );
}

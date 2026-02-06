"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Image as ImageIcon, RefreshCw, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function CoverGeneratorPage() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  // State
  const [title, setTitle] = useState("LIQUID GLASS");
  const [subtitle, setSubtitle] = useState("Design System");
  const [author, setAuthor] = useState("@fuxiaochen");
  const [bgStyle, setBgStyle] = useState("gradient-1");
  const [showGlitch, setShowGlitch] = useState(false);
  const [showBorder, setShowBorder] = useState(true);

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setLoading(true);
    try {
      const dataUrl = await toPng(previewRef.current, {
        pixelRatio: 2, // High resolution
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `cover-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate cover:", err);
    } finally {
      setLoading(false);
    }
  };

  // Background styles
  const getBackgroundStyle = () => {
    const base = "absolute inset-0 w-full h-full";
    switch (bgStyle) {
      case "neon-grid":
        return (
          <>
            <div className={`
              ${base}
              bg-[#000]
            `} />
            <div
              className={`
                ${base}
                bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)]
                bg-[size:40px_40px]
              `}
            />
          </>
        );
      case "circuit":
        return <div className={`
          ${base}
          bg-[#1a1a2e] opacity-80
        `} />;
      case "gradient-1":
        return (
          <div
            className={`
              ${base}
              bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800
            `}
          />
        );
      case "gradient-2":
        return (
          <div
            className={`
              ${base}
              bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-700
            `}
          />
        );
      default:
        return <div className={`
          ${base}
          bg-gray-900
        `} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)]">
      <main className="mx-auto max-w-7xl px-4 pt-32 pb-20">
        {/* Header Section */}
        <div className="relative mb-16 space-y-4 text-center">
          <h1 className={`
            text-4xl font-bold tracking-tight text-[var(--text-color)]
            md:text-5xl
          `}>
            Cover Generator
          </h1>
          <p className="mx-auto max-w-xl text-lg text-[var(--text-color-secondary)]">
            Create beautiful cover images for your blog posts or social media.
          </p>
        </div>

        <div className={`
          mx-auto grid max-w-7xl grid-cols-1 gap-8
          lg:grid-cols-3
        `}>
          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <GlassCard className="space-y-6 p-6">
              <div className="flex items-center gap-2 font-semibold text-[var(--text-color)]">
                <RefreshCw className="h-5 w-5" />
                <span>Configuration</span>
              </div>

              {/* Text Settings */}
              <div className="space-y-4">
                <div className={`
                  flex items-center gap-2 text-xs font-bold tracking-wider text-[var(--text-color-secondary)] uppercase
                `}>
                  <Type className="h-3 w-3" /> Text
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-[var(--glass-border)] bg-[var(--glass-bg)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="border-[var(--glass-border)] bg-[var(--glass-bg)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Author / Tag</Label>
                  <Input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="border-[var(--glass-border)] bg-[var(--glass-bg)]"
                  />
                </div>
              </div>

              {/* Visual Settings */}
              <div className="space-y-4">
                <div className={`
                  flex items-center gap-2 text-xs font-bold tracking-wider text-[var(--text-color-secondary)] uppercase
                `}>
                  <ImageIcon className="h-3 w-3" /> Visuals
                </div>
                <div className="space-y-2">
                  <Label>Background</Label>
                  <Select
                    value={bgStyle}
                    onValueChange={(val) => val && setBgStyle(val)}
                  >
                    <SelectTrigger className="border-[var(--glass-border)] bg-[var(--glass-bg)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gradient-1">Blue/Purple Gradient</SelectItem>
                      <SelectItem value="gradient-2">Teal/Cyan Gradient</SelectItem>
                      <SelectItem value="neon-grid">Neon Grid</SelectItem>
                      <SelectItem value="circuit">Dark Circuit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className={`
                  flex items-center justify-between rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)]
                  p-3
                `}>
                  <Label className="cursor-pointer">Glitch Effect</Label>
                  <Switch
                    checked={showGlitch}
                    onCheckedChange={setShowGlitch}
                  />
                </div>

                <div className={`
                  flex items-center justify-between rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)]
                  p-3
                `}>
                  <Label className="cursor-pointer">Border Frame</Label>
                  <Switch
                    checked={showBorder}
                    onCheckedChange={setShowBorder}
                  />
                </div>
              </div>

              <Button
                className={`
                  w-full bg-[var(--accent-color)] text-white
                  hover:opacity-90
                `}
                onClick={handleDownload}
                disabled={loading}
              >
                {loading ? (
                  "Generating..."
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" /> Export Image
                  </>
                )}
              </Button>
            </GlassCard>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <div className={`
              flex items-center justify-center rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4
              lg:p-12
            `}>
              <div
                ref={previewRef}
                className={`
                  relative flex aspect-[16/9] w-full flex-col items-center justify-center overflow-hidden
                  ${showBorder ? "border-8 border-white/20" : ""}
                `}
              >
                {/* Background Layer */}
                {getBackgroundStyle()}

                {/* Glitch Overlay */}
                {showGlitch && (
                  <div
                    className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
                    }}
                  />
                )}

                {/* Content Layer */}
                <div className={`
                  relative z-10 flex h-full w-full flex-col items-center justify-center p-12 text-center
                  backdrop-blur-[0px]
                `}>

                  {/* Main Text */}
                  <h1
                    className={`
                      mb-4 text-6xl font-black tracking-tighter text-white uppercase drop-shadow-lg
                      md:text-8xl
                      ${showGlitch ? "animate-pulse" : ""}
                    `}
                    style={{ fontFamily: "sans-serif" }}
                  >
                    {title}
                  </h1>

                  {/* Subtitle */}
                  <div className="relative">
                    <p className={`
                      text-2xl font-light tracking-[0.2em] text-white/90 uppercase
                      md:text-3xl
                    `}>
                      {subtitle}
                    </p>
                  </div>

                  {/* Author/Footer */}
                  <div className="absolute bottom-8 flex items-center gap-3">
                    <div className="h-[1px] w-12 bg-white/50" />
                    <span className="font-mono text-sm tracking-widest text-white/80 uppercase">
                      {author}
                    </span>
                    <div className="h-[1px] w-12 bg-white/50" />
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-sm text-[var(--text-color-secondary)]">
              Preview shown at lower resolution. Export will be high quality (2x).
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

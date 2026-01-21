"use client";

import { useRef, useState } from "react";

import { toPng } from "html-to-image";
import { Download, Image as ImageIcon, RefreshCw, Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const [title, setTitle] = useState("CYBERPUNK COVER");
  const [subtitle, setSubtitle] = useState("Next-Gen Generator");
  const [author, setAuthor] = useState("@fuxiaochen.com");
  const [bgStyle, setBgStyle] = useState("neon-grid"); // neon-grid, circuit, matrix, gradient-1, gradient-2
  const [showGlitch, setShowGlitch] = useState(true);
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
      link.download = `cyberpunk-cover-${Date.now()}.png`;
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
            <div
              className={`
                ${base}
                bg-cyber-black
              `}
            />
            <div
              className={`
                ${base}
                bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)]
                [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]
                bg-[size:40px_40px]
              `}
            />
            <div
              className={`
                ${base}
                bg-gradient-to-t from-cyber-black via-transparent to-transparent
              `}
            />
          </>
        );
      case "circuit":
        return (
          <>
            <div
              className={`
                ${base}
                bg-[#050510]
              `}
            />
            <div
              className={`
                ${base}
                bg-[radial-gradient(#7b61ff_1px,transparent_1px)]
                [background-size:20px_20px]
                opacity-20
              `}
            />
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%237b61ff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              }}
            />
          </>
        );
      case "gradient-1":
        return (
          <div
            className={`
              ${base}
              bg-gradient-to-br from-purple-900 via-gray-900 to-cyan-900
            `}
          />
        );
      case "gradient-2":
        return (
          <div
            className={`
              ${base}
              bg-gradient-to-tr from-black via-slate-900 to-indigo-900
            `}
          />
        );
      default:
        return (
          <div
            className={`
              ${base}
              bg-cyber-black
            `}
          />
        );
    }
  };

  return (
    <div
      className={`
        min-h-screen bg-cyber-black px-4 pt-32 pb-12
        md:px-8
      `}
    >
      {/* Header Section */}
      <div className="relative mb-16 text-center">
        <h1
          className={`
            glitch-text mb-4 inline-block font-display text-5xl font-bold tracking-tighter text-white uppercase
            md:text-7xl
          `}
          data-text="Cover_Generator"
        >
          封面生成器 / Cover_Generator
        </h1>
        <p className="mt-4 font-mono text-lg text-neon-purple/80">
          /// INITIALIZING_NEURAL_FABRICATOR... 初始化神经构造机
          <br />
          /// VISUAL_DATA_SYNTHESIS... 视觉数据合成
        </p>
        <div
          className={`
            pointer-events-none absolute top-1/2 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full
            bg-neon-purple/20 blur-[100px]
          `}
        />
      </div>
      <div
        className={`
          mx-auto grid max-w-7xl grid-cols-1 gap-8
          lg:grid-cols-3
        `}
      >
        {/* Controls Panel */}
        <div
          className={`
            space-y-6
            lg:col-span-1
          `}
        >
          <Card className="border-white/10 bg-cyber-gray/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neon-cyan">
                <RefreshCw className="h-5 w-5" />
                Generator Settings
              </CardTitle>
              <CardDescription>Customize your cyberpunk cover</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Text Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-gray-400 uppercase">
                  <Type className="h-4 w-4" /> Text
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`
                      border-white/10 bg-black/40 font-mono text-sm text-neon-cyan transition-all duration-300
                      placeholder:text-gray-600
                      hover:border-white/20
                      focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,255,255,0.15)] focus:ring-1
                      focus:ring-neon-cyan/50
                    `}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className={`
                      border-white/10 bg-black/40 font-mono text-sm text-neon-cyan transition-all duration-300
                      placeholder:text-gray-600
                      hover:border-white/20
                      focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,255,255,0.15)] focus:ring-1
                      focus:ring-neon-cyan/50
                    `}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Author/Tag</Label>
                  <Input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className={`
                      border-white/10 bg-black/40 font-mono text-sm text-neon-cyan transition-all duration-300
                      placeholder:text-gray-600
                      hover:border-white/20
                      focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,255,255,0.15)] focus:ring-1
                      focus:ring-neon-cyan/50
                    `}
                  />
                </div>
              </div>

              {/* Visual Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold tracking-wider text-gray-400 uppercase">
                  <ImageIcon className="h-4 w-4" /> Visuals
                </div>
                <div className="space-y-2">
                  <Label>Background Style</Label>
                  <Select
                    value={bgStyle}
                    onValueChange={(val) => val && setBgStyle(val)}
                  >
                    <SelectTrigger
                      className={`
                        border-white/10 bg-black/40 font-mono text-sm text-neon-cyan transition-all duration-300
                        hover:border-white/20
                        focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(0,255,255,0.15)] focus:ring-1
                        focus:ring-neon-cyan/50
                      `}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-neon-cyan/30 bg-cyber-black text-gray-300">
                      <SelectItem
                        value="neon-grid"
                        className={`
                          cursor-pointer
                          focus:bg-neon-cyan/10 focus:text-neon-cyan
                        `}
                      >
                        Neon Grid
                      </SelectItem>
                      <SelectItem
                        value="circuit"
                        className={`
                          cursor-pointer
                          focus:bg-neon-cyan/10 focus:text-neon-cyan
                        `}
                      >
                        Circuit Board
                      </SelectItem>
                      <SelectItem
                        value="gradient-1"
                        className={`
                          cursor-pointer
                          focus:bg-neon-cyan/10 focus:text-neon-cyan
                        `}
                      >
                        Cyber Gradient A
                      </SelectItem>
                      <SelectItem
                        value="gradient-2"
                        className={`
                          cursor-pointer
                          focus:bg-neon-cyan/10 focus:text-neon-cyan
                        `}
                      >
                        Cyber Gradient B
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div
                  className={`
                    flex items-center justify-between rounded-lg border border-white/5 bg-black/20 p-3 transition-colors
                    hover:border-white/10
                  `}
                >
                  <Label className="cursor-pointer">Glitch Effect</Label>
                  <Switch
                    checked={showGlitch}
                    onCheckedChange={setShowGlitch}
                    className={`
                      data-[state=checked]:bg-neon-cyan
                      data-[state=unchecked]:bg-white/10
                    `}
                  />
                </div>

                <div
                  className={`
                    flex items-center justify-between rounded-lg border border-white/5 bg-black/20 p-3 transition-colors
                    hover:border-white/10
                  `}
                >
                  <Label className="cursor-pointer">Neon Border</Label>
                  <Switch
                    checked={showBorder}
                    onCheckedChange={setShowBorder}
                    className={`
                      data-[state=checked]:bg-neon-cyan
                      data-[state=unchecked]:bg-white/10
                    `}
                  />
                </div>
              </div>

              <Button
                className={`
                  w-full bg-neon-cyan font-bold tracking-widest text-black
                  hover:bg-cyan-400
                `}
                onClick={handleDownload}
                disabled={loading}
              >
                {loading ? (
                  "GENERATING..."
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" /> EXPORT COVER
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div
          className={`
            flex items-center justify-center rounded-xl border border-white/5 bg-black/20 p-4
            lg:col-span-2 lg:p-12
          `}
        >
          <div
            ref={previewRef}
            className={`
              relative flex aspect-[16/9] w-full flex-col items-center justify-center overflow-hidden
              ${showBorder ? "border-2 border-neon-cyan shadow-[0_0_20px_rgba(0,255,255,0.3)]" : ""}
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
            <div
              className={`
                relative z-10 flex h-full w-full flex-col items-center justify-center p-12 text-center
                backdrop-blur-[2px]
              `}
            >
              {/* Decorative Elements */}
              <div className="absolute top-6 left-6 h-24 w-24 rounded-tl-xl border-t-2 border-l-2 border-white/30" />
              <div className="absolute right-6 bottom-6 h-24 w-24 rounded-br-xl border-r-2 border-b-2 border-white/30" />
              <div className="absolute top-6 right-6 flex gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-neon-cyan" />
                <div className="h-2 w-2 animate-pulse rounded-full bg-neon-purple delay-75" />
                <div className="h-2 w-2 animate-pulse rounded-full bg-neon-magenta delay-150" />
              </div>

              {/* Main Text */}
              <h1
                className={`
                  mb-4 bg-gradient-to-r from-neon-cyan via-white to-neon-purple bg-clip-text text-5xl font-bold
                  tracking-tighter text-transparent uppercase
                  md:text-7xl
                  ${showGlitch ? "animate-pulse" : ""}
                `}
                style={{
                  textShadow: showGlitch
                    ? "2px 2px 0px rgba(0,255,255,0.5), -2px -2px 0px rgba(123,97,255,0.5)"
                    : "none",
                  fontFamily: "var(--font-display)",
                }}
              >
                {title}
              </h1>

              {/* Subtitle */}
              <div className="relative">
                <p
                  className={`
                    text-xl font-light tracking-[0.2em] text-neon-purple uppercase
                    md:text-2xl
                  `}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {subtitle}
                </p>
                <div
                  className={`
                    absolute -bottom-2 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-neon-cyan
                    to-transparent opacity-50
                  `}
                />
              </div>

              {/* Author/Footer */}
              <div className="absolute bottom-8 flex items-center gap-3">
                <div className="h-[1px] w-12 bg-white/30" />
                <span className="font-mono text-sm tracking-widest text-gray-400 uppercase">
                  {author}
                </span>
                <div className="h-[1px] w-12 bg-white/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

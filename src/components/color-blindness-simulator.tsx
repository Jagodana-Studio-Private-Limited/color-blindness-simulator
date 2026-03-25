"use client";

import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ToolEvents } from "@/lib/analytics";
import {
  simulateColor,
  hexToRgb,
  rgbToHex,
  contrastRatio,
  getContrastTextColor,
  type SimulationType,
} from "@/lib/color-blindness";

// ─── Constants ───────────────────────────────────────────────────────────────

const CVD_TYPES: {
  id: SimulationType;
  label: string;
  description: string;
  prevalence: string;
  badge?: string;
}[] = [
  {
    id: "normal",
    label: "Normal Vision",
    description: "Typical trichromatic vision",
    prevalence: "~92%",
  },
  {
    id: "protanopia",
    label: "Protanopia",
    description: "Red-blind · L-cone absent",
    prevalence: "~1% M",
  },
  {
    id: "deuteranopia",
    label: "Deuteranopia",
    description: "Green-blind · M-cone absent",
    prevalence: "~1% M",
  },
  {
    id: "tritanopia",
    label: "Tritanopia",
    description: "Blue-blind · S-cone absent",
    prevalence: "<0.1%",
  },
  {
    id: "protanomaly",
    label: "Protanomaly",
    description: "Red-weak · L-cone shifted",
    prevalence: "~1% M",
  },
  {
    id: "deuteranomaly",
    label: "Deuteranomaly",
    description: "Green-weak · M-cone shifted",
    prevalence: "~5% M",
    badge: "Most Common",
  },
  {
    id: "tritanomaly",
    label: "Tritanomaly",
    description: "Blue-weak · S-cone shifted",
    prevalence: "0.01%",
  },
  {
    id: "achromatopsia",
    label: "Achromatopsia",
    description: "Total color blindness",
    prevalence: "0.003%",
  },
  {
    id: "achromatomaly",
    label: "Achromatomaly",
    description: "Partial color blindness",
    prevalence: "Very rare",
  },
];

const DEFAULT_COLORS = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", "#dda0dd"];

const EXTRA_COLORS = [
  "#ff9f43", "#10ac84", "#5f27cd", "#ee5a24", "#c8d6e5", "#576574", "#f368e0", "#ff9ff3",
];

const MAX_COLORS = 8;

/** Normalize any valid hex to lowercase #rrggbb. */
function normHex(hex: string): string {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHex(rgb) : hex;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ColorInput({
  hex,
  inputValue,
  onChange,
  onInput,
  onRemove,
  canRemove,
}: {
  hex: string;
  inputValue: string;
  onChange: (hex: string) => void;
  onInput: (value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const pickerRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        {/* Native color picker — invisible overlay */}
        <input
          ref={pickerRef}
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-0 rounded-xl"
          aria-label={`Color picker: ${hex}`}
        />
        {/* Visible swatch */}
        <div
          className="w-14 h-14 rounded-xl ring-2 ring-border/40 hover:ring-brand transition-all cursor-pointer"
          style={{ backgroundColor: hex }}
        />
        {/* Remove button (above picker via z-10) */}
        {canRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
            aria-label="Remove color"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <Input
        value={inputValue}
        onChange={(e) => onInput(e.target.value)}
        className="w-16 h-6 text-center font-mono text-xs px-1 uppercase"
        maxLength={6}
        placeholder="RRGGBB"
        aria-label={`Hex input: ${hex}`}
      />
    </div>
  );
}

function PaletteEditor({
  palette,
  hexInputs,
  onColorChange,
  onHexInput,
  onAdd,
  onRemove,
}: {
  palette: string[];
  hexInputs: string[];
  onColorChange: (i: number, hex: string) => void;
  onHexInput: (i: number, value: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-lg">Color Palette</h3>
          <p className="text-sm text-muted-foreground">
            Click a swatch to edit · up to {MAX_COLORS} colors
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={palette.length >= MAX_COLORS}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Color
        </Button>
      </div>
      <div className="flex flex-wrap gap-4">
        {palette.map((hex, i) => (
          <ColorInput
            key={i}
            hex={hex}
            inputValue={hexInputs[i] ?? hex.slice(1).toUpperCase()}
            onChange={(h) => onColorChange(i, h)}
            onInput={(v) => onHexInput(i, v)}
            onRemove={() => onRemove(i)}
            canRemove={palette.length > 1}
          />
        ))}
      </div>
    </div>
  );
}

function SimulationGrid({
  simulations,
  onCopy,
}: {
  /** simulations[typeIndex][colorIndex] = simulated hex */
  simulations: string[][];
  onCopy: (hex: string) => void;
}) {
  const colCount = simulations[0]?.length ?? 0;

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <h3 className="font-semibold">Simulation Results</h3>
        <p className="text-sm text-muted-foreground">
          Click any swatch to copy its hex value · M = predominantly affects males
        </p>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {CVD_TYPES.map((type, typeIdx) => (
            <div
              key={type.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3 border-b border-border/20 last:border-0",
                typeIdx % 2 === 1 && "bg-muted/20",
                type.id === "normal" && "bg-brand/5"
              )}
            >
              {/* Label column */}
              <div className="w-52 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{type.label}</span>
                  {type.badge && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] py-0 px-1.5 h-4 bg-brand/10 text-brand border-brand/20"
                    >
                      {type.badge}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 flex gap-2">
                  <span>{type.description}</span>
                  <span className="text-brand/60 font-medium">{type.prevalence}</span>
                </div>
              </div>

              {/* Swatch row */}
              <div className="flex gap-2">
                {Array.from({ length: colCount }, (_, colIdx) => {
                  const simHex = simulations[typeIdx]?.[colIdx] ?? "#000000";
                  const rgb = hexToRgb(simHex);
                  const textColor = rgb ? getContrastTextColor(rgb) : "#000";

                  return (
                    <button
                      key={colIdx}
                      onClick={() => onCopy(simHex)}
                      className="group relative w-12 h-12 rounded-lg ring-1 ring-border/30 hover:ring-brand hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-brand"
                      style={{ backgroundColor: simHex }}
                      title={`${simHex.toUpperCase()} — click to copy`}
                      aria-label={`${type.label} simulation color ${simHex}`}
                    >
                      <span
                        className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-medium opacity-0 group-hover:opacity-100 transition-opacity rounded-lg leading-none"
                        style={{ color: textColor, backgroundColor: simHex }}
                      >
                        {simHex.slice(1).toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContrastChecker({
  palette,
  bgIdx,
  fgIdx,
  onBgChange,
  onFgChange,
}: {
  palette: string[];
  bgIdx: number;
  fgIdx: number;
  onBgChange: (i: number) => void;
  onFgChange: (i: number) => void;
}) {
  const bgHex = palette[bgIdx] ?? "#ffffff";
  const fgHex = palette[fgIdx] ?? "#000000";

  const rows = CVD_TYPES.map((type) => {
    const bgRgb = hexToRgb(bgHex);
    const fgRgb = hexToRgb(fgHex);
    if (!bgRgb || !fgRgb) return null;
    const simBg = simulateColor(bgRgb, type.id);
    const simFg = simulateColor(fgRgb, type.id);
    const simBgHex = rgbToHex(simBg);
    const simFgHex = rgbToHex(simFg);
    const ratio = contrastRatio(simBg, simFg);
    return {
      ...type,
      simBgHex,
      simFgHex,
      ratio,
      largeAA: ratio >= 3,
      normalAA: ratio >= 4.5,
      normalAAA: ratio >= 7,
    };
  });

  const ratioClass = (ratio: number) => {
    if (ratio >= 7) return "text-green-600 dark:text-green-400";
    if (ratio >= 4.5) return "text-teal-600 dark:text-teal-400";
    if (ratio >= 3) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Selectors */}
      <div className="p-4 sm:p-6 border-b border-border/50 space-y-4">
        <h3 className="font-semibold">WCAG Contrast Checker</h3>
        <div className="flex flex-wrap gap-6 items-start">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
              Background
            </p>
            <div className="flex gap-2">
              {palette.map((hex, i) => (
                <button
                  key={i}
                  onClick={() => onBgChange(i)}
                  className={cn(
                    "w-8 h-8 rounded-lg ring-1 transition-all",
                    bgIdx === i
                      ? "ring-2 ring-brand scale-110 shadow-md"
                      : "ring-border/30 hover:ring-brand/50"
                  )}
                  style={{ backgroundColor: hex }}
                  aria-label={`Set ${hex} as background`}
                  aria-pressed={bgIdx === i}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
              Foreground
            </p>
            <div className="flex gap-2">
              {palette.map((hex, i) => (
                <button
                  key={i}
                  onClick={() => onFgChange(i)}
                  className={cn(
                    "w-8 h-8 rounded-lg ring-1 transition-all",
                    fgIdx === i
                      ? "ring-2 ring-brand scale-110 shadow-md"
                      : "ring-border/30 hover:ring-brand/50"
                  )}
                  style={{ backgroundColor: hex }}
                  aria-label={`Set ${hex} as foreground`}
                  aria-pressed={fgIdx === i}
                />
              ))}
            </div>
          </div>
          {/* Preview */}
          <div
            className="flex-1 min-w-[180px] rounded-xl p-4 flex flex-col items-center justify-center gap-1"
            style={{ backgroundColor: bgHex }}
          >
            <span
              className="text-lg font-bold leading-none"
              style={{ color: fgHex }}
            >
              Aa
            </span>
            <span
              className="text-xs"
              style={{ color: fgHex }}
            >
              Sample text preview
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          M = Large Text (≥3:1) · AA = Normal Text (≥4.5:1) · AAA = Enhanced (≥7:1)
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide w-44">
                CVD Type
              </th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Preview
              </th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide w-24">
                Ratio
              </th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide w-16">
                Large M
              </th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide w-16">
                AA
              </th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide w-16">
                AAA
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              if (!row) return null;
              return (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border/20 last:border-0",
                    i % 2 === 1 && "bg-muted/10"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm">{row.label}</div>
                    <div className="text-xs text-muted-foreground">{row.prevalence}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className="rounded-md px-3 py-1.5 text-sm font-medium inline-block"
                      style={{ backgroundColor: row.simBgHex, color: row.simFgHex }}
                    >
                      Aa
                    </div>
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-center font-mono font-semibold text-sm",
                      ratioClass(row.ratio)
                    )}
                  >
                    {row.ratio.toFixed(2)}:1
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.largeAA ? (
                      <span className="text-green-600 dark:text-green-400 font-bold text-base">✓</span>
                    ) : (
                      <span className="text-red-500 font-bold text-base">✗</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.normalAA ? (
                      <span className="text-green-600 dark:text-green-400 font-bold text-base">✓</span>
                    ) : (
                      <span className="text-red-500 font-bold text-base">✗</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.normalAAA ? (
                      <span className="text-green-600 dark:text-green-400 font-bold text-base">✓</span>
                    ) : (
                      <span className="text-red-500 font-bold text-base">✗</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ColorBlindnessSimulator() {
  const [palette, setPalette] = useState<string[]>(DEFAULT_COLORS);
  const [hexInputs, setHexInputs] = useState<string[]>(
    DEFAULT_COLORS.map((h) => h.slice(1).toUpperCase())
  );
  const [bgIdx, setBgIdx] = useState(0);
  const [fgIdx, setFgIdx] = useState(1);
  const [extraIdx, setExtraIdx] = useState(0);

  // simulations[typeIndex][colorIndex] = simulated hex string
  const simulations = useMemo(
    () =>
      CVD_TYPES.map((type) =>
        palette.map((hex) => {
          const rgb = hexToRgb(hex);
          if (!rgb) return hex;
          return rgbToHex(simulateColor(rgb, type.id));
        })
      ),
    [palette]
  );

  const handleColorChange = (index: number, hex: string) => {
    const normalized = normHex(hex) || hex;
    const newPalette = [...palette];
    newPalette[index] = normalized;
    setPalette(newPalette);
    const newInputs = [...hexInputs];
    newInputs[index] = normalized.slice(1).toUpperCase();
    setHexInputs(newInputs);
  };

  const handleHexInput = (index: number, raw: string) => {
    const sanitized = raw.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6);
    const newInputs = [...hexInputs];
    newInputs[index] = sanitized.toUpperCase();
    setHexInputs(newInputs);

    if (sanitized.length === 3 || sanitized.length === 6) {
      const rgb = hexToRgb(`#${sanitized}`);
      if (rgb) {
        const newPalette = [...palette];
        newPalette[index] = rgbToHex(rgb);
        setPalette(newPalette);
      }
    }
  };

  const handleAddColor = () => {
    if (palette.length >= MAX_COLORS) return;
    const available = [...EXTRA_COLORS, ...DEFAULT_COLORS].filter(
      (c) => !palette.includes(normHex(c))
    );
    const newColor = normHex(available[extraIdx % available.length] ?? "#888888");
    setExtraIdx((prev) => prev + 1);
    setPalette((prev) => [...prev, newColor]);
    setHexInputs((prev) => [...prev, newColor.slice(1).toUpperCase()]);
    ToolEvents.toolUsed("add_color");
  };

  const handleRemoveColor = (index: number) => {
    if (palette.length <= 1) return;
    const newPalette = palette.filter((_, i) => i !== index);
    const newInputs = hexInputs.filter((_, i) => i !== index);
    setPalette(newPalette);
    setHexInputs(newInputs);
    setBgIdx((prev) => Math.min(prev, newPalette.length - 1));
    setFgIdx((prev) => Math.min(prev, newPalette.length - 1));
  };

  const copyHex = (hex: string) => {
    navigator.clipboard
      .writeText(hex.toUpperCase())
      .then(() => {
        toast.success(`Copied ${hex.toUpperCase()}`);
        ToolEvents.resultCopied();
      })
      .catch(() => toast.error("Failed to copy"));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-4 w-full"
    >
      {/* Palette Editor */}
      <PaletteEditor
        palette={palette}
        hexInputs={hexInputs}
        onColorChange={handleColorChange}
        onHexInput={handleHexInput}
        onAdd={handleAddColor}
        onRemove={handleRemoveColor}
      />

      {/* Simulation / Contrast tabs */}
      <Tabs defaultValue="simulation" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-xs">
          <TabsTrigger value="simulation">Simulation Grid</TabsTrigger>
          <TabsTrigger value="contrast">Contrast Check</TabsTrigger>
        </TabsList>

        <TabsContent value="simulation" className="mt-4">
          <SimulationGrid simulations={simulations} onCopy={copyHex} />
        </TabsContent>

        <TabsContent value="contrast" className="mt-4">
          <ContrastChecker
            palette={palette}
            bgIdx={bgIdx}
            fgIdx={fgIdx}
            onBgChange={setBgIdx}
            onFgChange={setFgIdx}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

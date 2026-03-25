/**
 * Color Vision Deficiency (CVD) simulation.
 * Pipeline: sRGB (0-255) → linearize → matrix multiply → clamp → sRGB (0-255)
 *
 * Dichromacy matrices from Machado et al. 2009, operating on linearized sRGB.
 * Anomalous trichromacy at 0.5 severity from the same paper.
 * Achromatopsia uses ITU-R BT.709 luminance weights.
 */

export type SimulationType =
  | "normal"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "protanomaly"
  | "deuteranomaly"
  | "tritanomaly"
  | "achromatopsia"
  | "achromatomaly";

export interface RGB {
  r: number; // 0–255
  g: number;
  b: number;
}

// 3×3 matrices — each row is [outR_weight, outG_weight, outB_weight]
const CVD_MATRICES: Record<SimulationType, readonly [readonly number[], readonly number[], readonly number[]]> = {
  normal: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  // Machado et al. 2009 — severity 1.0
  protanopia: [
    [0.152286,  1.052583, -0.204868],
    [0.114503,  0.786281,  0.099216],
    [-0.003882, -0.048116,  1.051998],
  ],
  deuteranopia: [
    [0.367322,  0.860646, -0.227968],
    [0.280085,  0.672501,  0.047413],
    [-0.011820,  0.042940,  0.968881],
  ],
  tritanopia: [
    [1.255528, -0.078411, -0.177117],
    [-0.078411,  0.930809,  0.147602],
    [0.004733,  0.385682,  0.609584],
  ],
  // Machado et al. 2009 — severity 0.5 (anomalous trichromacy)
  protanomaly: [
    [0.458064,  0.679578, -0.137641],
    [0.092785,  0.846313,  0.060902],
    [-0.007136, -0.016315,  1.023451],
  ],
  deuteranomaly: [
    [0.547494,  0.607765, -0.155259],
    [0.181692,  0.781680,  0.036628],
    [-0.010410,  0.027275,  0.983136],
  ],
  tritanomaly: [
    [1.017277,  0.027029, -0.044306],
    [-0.006113,  0.958479,  0.047634],
    [0.006379,  0.248708,  0.744913],
  ],
  // Achromatopsia — ITU-R BT.709 luminance for all channels
  achromatopsia: [
    [0.2126, 0.7152, 0.0722],
    [0.2126, 0.7152, 0.0722],
    [0.2126, 0.7152, 0.0722],
  ],
  // Achromatomaly — 50 % blend toward achromatopsia
  achromatomaly: [
    [0.6063, 0.3576, 0.0361],
    [0.1063, 0.8576, 0.0361],
    [0.1063, 0.3576, 0.5361],
  ],
} as const;

// ── sRGB ↔ linear conversions ─────────────────────────────────────────────

function linearize(v8: number): number {
  const v = v8 / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function delinearize(linear: number): number {
  const c = Math.max(0, Math.min(1, linear));
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.round(v * 255);
}

// ── Public API ────────────────────────────────────────────────────────────

/** Apply CVD simulation to an sRGB color (component values 0–255). */
export function simulateColor(rgb: RGB, type: SimulationType): RGB {
  const m = CVD_MATRICES[type];
  const lr = linearize(rgb.r);
  const lg = linearize(rgb.g);
  const lb = linearize(rgb.b);
  return {
    r: delinearize(m[0][0] * lr + m[0][1] * lg + m[0][2] * lb),
    g: delinearize(m[1][0] * lr + m[1][1] * lg + m[1][2] * lb),
    b: delinearize(m[2][0] * lr + m[2][1] * lg + m[2][2] * lb),
  };
}

/** Parse #rgb or #rrggbb → RGB, or null on failure. */
export function hexToRgb(hex: string): RGB | null {
  const s = hex.replace(/^#/, "");
  if (s.length === 3) {
    return {
      r: parseInt(s[0] + s[0], 16),
      g: parseInt(s[1] + s[1], 16),
      b: parseInt(s[2] + s[2], 16),
    };
  }
  if (s.length === 6) {
    return {
      r: parseInt(s.slice(0, 2), 16),
      g: parseInt(s.slice(2, 4), 16),
      b: parseInt(s.slice(4, 6), 16),
    };
  }
  return null;
}

/** RGB → lowercase #rrggbb hex string. */
export function rgbToHex(rgb: RGB): string {
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(rgb.r)}${h(rgb.g)}${h(rgb.b)}`;
}

function relativeLuminance(rgb: RGB): number {
  return (
    0.2126 * linearize(rgb.r) +
    0.7152 * linearize(rgb.g) +
    0.0722 * linearize(rgb.b)
  );
}

/** WCAG 2.1 contrast ratio between two sRGB colors (result ≥ 1). */
export function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Return "#ffffff" or "#000000" — whichever contrasts better against bg. */
export function getContrastTextColor(bg: RGB): string {
  return relativeLuminance(bg) < 0.179 ? "#ffffff" : "#000000";
}

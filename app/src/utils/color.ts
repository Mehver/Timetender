/** Color helpers. */

/** "#aba" -> "#aabbaa"; ensures a leading '#'. Returns null for invalid input. */
export function normalizeHex(input: string | null | undefined): string | null {
  if (!input) return null;
  let c = input.trim();
  if (!c) return null;
  if (!c.startsWith('#')) c = `#${c}`;
  const hex = c.slice(1);
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toLowerCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    return `#${hex}`.toLowerCase();
  }
  return null;
}

/** Picks black/white foreground for a background color (WCAG-ish luminance). */
export function readableTextColor(bg: string): '#000000' | '#ffffff' {
  const hex = normalizeHex(bg);
  if (!hex) return '#000000';
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.55 ? '#000000' : '#ffffff';
}

/** "#rrggbb" + alpha -> "rgba(r,g,b,a)". Falls back to the input on bad hex. */
export function withAlpha(color: string, alpha: number): string {
  const hex = normalizeHex(color);
  if (!hex) return color;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Preset palette used by the color picker (balanced for both light/dark UI). */
export const COLOR_PRESETS = [
  '#ef5350', '#ec407a', '#ab47bc', '#7e57c2',
  '#5c6bc0', '#42a5f5', '#26c6da', '#26a69a',
  '#66bb6a', '#9ccc65', '#d4e157', '#ffee58',
  '#ffca28', '#ffa726', '#ff7043', '#8d6e63',
  '#78909c', '#455a64',
];

export function pickDefaultColor(index: number): string {
  return COLOR_PRESETS[index % COLOR_PRESETS.length];
}

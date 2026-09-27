export type PageSize = "A4" | "A3" | "A5" | "Letter" | "Legal";

export type Orientation = "portrait" | "landscape";

export type TextDirection = "ltr" | "rtl";

/** CSS length string, e.g. `"12mm"`, `"0.5in"`, or shorthand `"12mm 8mm"`. */
export type PageMargin =
  | string
  | {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };

export type PageConfig = {
  size?: PageSize;
  orientation?: Orientation;
  /** Default: `"14mm 8mm 16mm 15mm"`. */
  margin?: PageMargin;
};

export type PageNumberConfig = {
  enabled?: boolean;
  /**
   * Tokens: `{current}`, `{total}`.
   * Default: `"Page {current} of {total}"`.
   */
  format?: string;
};

export type WatermarkConfig = {
  text: string;
  opacity?: number;
  /** CSS angle, e.g. `"-30deg"`. */
  rotate?: string;
};

export type PrintTheme = {
  fontFamily?: string;
  fontSize?: string;
  primaryColor?: string;
  textColor?: string;
  background?: string;
  borderColor?: string;
  mutedColor?: string;
  paperColor?: string;
  spacing?: string;
};

/** Physical page dimensions in millimetres (width × height for portrait). */
export const PAGE_SIZE_MM: Record<PageSize, { width: number; height: number }> =
  {
    A4: { width: 210, height: 297 },
    A3: { width: 297, height: 420 },
    A5: { width: 148, height: 210 },
    Letter: { width: 215.9, height: 279.4 },
    Legal: { width: 215.9, height: 355.6 },
  };

export const DEFAULT_PAGE_CONFIG: Required<
  Pick<PageConfig, "size" | "orientation">
> & { margin: string } = {
  size: "A4",
  orientation: "portrait",
  margin: "14mm 8mm 16mm 15mm",
};

export function resolvePageDimensions(
  page: PageConfig = {},
): { widthMm: number; heightMm: number } {
  const size = page.size ?? DEFAULT_PAGE_CONFIG.size;
  const orientation = page.orientation ?? DEFAULT_PAGE_CONFIG.orientation;
  const base = PAGE_SIZE_MM[size];
  if (orientation === "landscape") {
    return { widthMm: base.height, heightMm: base.width };
  }
  return { widthMm: base.width, heightMm: base.height };
}

export function formatPageMargin(margin: PageMargin | undefined): string {
  if (margin === undefined) {
    return DEFAULT_PAGE_CONFIG.margin;
  }
  if (typeof margin === "string") {
    return margin;
  }
  const top = margin.top ?? "14mm";
  const right = margin.right ?? "8mm";
  const bottom = margin.bottom ?? "16mm";
  const left = margin.left ?? "15mm";
  return `${top} ${right} ${bottom} ${left}`;
}

export function formatPageSizeRule(page: PageConfig = {}): string {
  const size = page.size ?? DEFAULT_PAGE_CONFIG.size;
  const orientation = page.orientation ?? DEFAULT_PAGE_CONFIG.orientation;
  return `${size} ${orientation}`;
}

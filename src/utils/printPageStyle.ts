import {
  formatPageMargin,
  formatPageSizeRule,
  type PageConfig,
  type PageNumberConfig,
  type PrintTheme,
} from "../types/page";
export type PrintFontPageStyleOptions = {
  /** CSS font-family stack. Defaults to system sans-serif. */
  fontFamily?: string;
  /**
   * Optional raw CSS (typically `@font-face` rules) injected before the
   * font-family rules. Host your own font files and pass the CSS here.
   */
  fontFaceCss?: string;
};

const DEFAULT_FONT_FAMILY = "Arial, Helvetica, sans-serif";

/**
 * Font rules injected into the react-to-print iframe.
 * Uses a system stack by default — no hosted font files required.
 */
export const getPrintFontPageStyle = (
  options: PrintFontPageStyleOptions = {},
) => {
  const fontFamily = options.fontFamily ?? DEFAULT_FONT_FAMILY;
  const fontFaceCss = options.fontFaceCss ?? "";

  return `
  ${fontFaceCss}
  html,
  body,
  #print-container,
  #print-container * {
    font-family: ${fontFamily} !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
`;
};

const printPageNumberMarginStyle = (fontFamily: string) => `
    font-family: ${fontFamily} !important;
    font-size: 8pt !important;
    line-height: 1.3 !important;
    color: #8a8a8a !important;
    vertical-align: top !important;
`;

export type PrintPageNumberStyleOptions = {
  fontFamily?: string;
  pageNumber?: PageNumberConfig;
  /** Resolved format string, e.g. `"Page {current} of {total}"`. */
  format?: string;
  direction?: "ltr" | "rtl";
};

export const getPrintPageNumberPageStyle = (
  fontFamilyOrOptions: string | PrintPageNumberStyleOptions = DEFAULT_FONT_FAMILY,
) => {
  const options: PrintPageNumberStyleOptions =
    typeof fontFamilyOrOptions === "string"
      ? { fontFamily: fontFamilyOrOptions }
      : fontFamilyOrOptions;

  const fontFamily = options.fontFamily ?? DEFAULT_FONT_FAMILY;
  const enabled = options.pageNumber?.enabled !== false;
  if (!enabled) {
    return `
  .print-page-footer__pagination {
    display: none !important;
  }
`;
  }

  const format =
    options.format ??
    options.pageNumber?.format ??
    "Page {current} of {total}";
  const cssContent = buildCssCounterContent(format);
  const isRtl = options.direction === "rtl";
  const primaryBox = isRtl ? "@bottom-left" : "@bottom-right";
  const clearBox = isRtl ? "@bottom-right" : "@bottom-left";

  return `
  @page {
    ${primaryBox} {
      content: ${cssContent} !important;
      ${printPageNumberMarginStyle(fontFamily)}
    }
    ${clearBox} {
      content: normal !important;
    }
  }
  .print-page-footer__pagination::before {
    content: none !important;
  }
  .print-page-footer__separator {
    display: none !important;
  }
`;
};

/** Convert `"Page {current} of {total}"` into CSS content with counters. */
function buildCssCounterContent(format: string): string {
  const parts: string[] = [];
  let remaining = format;
  const tokenRe = /\{current\}|\{total\}/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  while ((match = tokenRe.exec(format)) !== null) {
    const textBefore = format.slice(lastIndex, match.index);
    if (textBefore) {
      parts.push(JSON.stringify(textBefore));
    }
    parts.push(
      match[0] === "{current}" ? "counter(page)" : "counter(pages)",
    );
    lastIndex = match.index + match[0].length;
    remaining = format.slice(lastIndex);
  }
  if (remaining || lastIndex === 0) {
    const tail = format.slice(lastIndex);
    if (tail) {
      parts.push(JSON.stringify(tail));
    }
  }
  if (parts.length === 0) {
    return JSON.stringify(format);
  }
  return parts.join(" ");
}

export const getPrintChromePageStyle = () => `
  .print-page-generated {
    display: flex !important;
    position: fixed !important;
    top: auto !important;
    right: 0 !important;
    bottom: 12mm !important;
    left: auto !important;
    width: auto !important;
    align-items: flex-end !important;
    justify-content: flex-end !important;
    pointer-events: none !important;
    z-index: 2 !important;
  }
  [dir="rtl"] .print-page-generated {
    right: auto !important;
    left: 0 !important;
  }
  .print-page-generated__text {
    writing-mode: vertical-rl !important;
    text-orientation: mixed !important;
    letter-spacing: 0.22em !important;
    text-transform: uppercase !important;
    white-space: nowrap !important;
    line-height: 1 !important;
  }
  [dir="rtl"] .print-page-generated__text {
    writing-mode: vertical-lr !important;
  }
`;

export type PrintDocumentPageStyleExtras =
  | string
  | ((root: string) => string);

export type PrintDocumentPageStyleOptions = {
  page?: PageConfig;
  theme?: PrintTheme;
  extras?: PrintDocumentPageStyleExtras;
};

export const getPrintDocumentPageStyle = (
  rootClass: string,
  extrasOrOptions?: PrintDocumentPageStyleExtras | PrintDocumentPageStyleOptions,
) => {
  let extras: PrintDocumentPageStyleExtras | undefined;
  let page: PageConfig | undefined;
  let theme: PrintTheme | undefined;

  if (
    extrasOrOptions &&
    typeof extrasOrOptions === "object" &&
    !Array.isArray(extrasOrOptions) &&
    ("page" in extrasOrOptions ||
      "theme" in extrasOrOptions ||
      "extras" in extrasOrOptions)
  ) {
    page = extrasOrOptions.page;
    theme = extrasOrOptions.theme;
    extras = extrasOrOptions.extras;
  } else {
    extras = extrasOrOptions as PrintDocumentPageStyleExtras | undefined;
  }

  const root = `#print-container.${rootClass}`;
  const extraCss = typeof extras === "function" ? extras(root) : extras ?? "";
  const sizeRule = formatPageSizeRule(page);
  const marginRule = formatPageMargin(page?.margin);
  const themeVars = themeToCssVars(theme);

  return `
  @page {
    size: ${sizeRule};
    margin: ${marginRule};
  }
  html, body {
    height: initial !important;
    overflow: initial !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    background-color: #fff !important;
    color: #111827;
  }
  ${themeVars ? `${root} { ${themeVars} }` : ""}
  @media print {
    ${root},
    ${root} * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    ${root} {
      font-size: ${theme?.fontSize ?? "12px"} !important;
      line-height: 1.45 !important;
      color: ${theme?.textColor ?? "#111827"} !important;
      background: ${theme?.background ?? theme?.paperColor ?? "#fff"} !important;
      box-shadow: none !important;
      gap: 0 !important;
      padding-block-end: 18mm !important;
      box-decoration-break: clone;
      -webkit-box-decoration-break: clone;
    }
    ${root}.print-doc--report,
    ${root} .print-doc__body,
    ${root} .print-stack {
      display: block !important;
      gap: 0 !important;
    }
    ${root} .print-chip {
      background: #eeeeee !important;
      color: #8a8a8a !important;
    }
    ${root} .print-chip--accent {
      background: #eaf2ff !important;
      color: ${theme?.primaryColor ?? "#1a4c99"} !important;
    }
    ${root} .print-card__head {
      background: #fdfdfd !important;
      color: #8a8a8a !important;
    }
    ${root} .print-card--emphasis .print-card__head {
      background: #111827 !important;
      color: #fff !important;
    }
    ${root} .print-table thead th,
    ${root} .print-table__table thead th {
      background: #fdfdfd !important;
      color: #8a8a8a !important;
    }
    ${root} .print-callout {
      background: #f8fafc !important;
      border-inline-start-color: ${theme?.primaryColor ?? "#1a4c99"} !important;
    }
    ${root} .print-page {
      min-height: 0 !important;
      break-after: auto;
      page-break-after: auto;
    }
    ${root} .print-page + .print-page {
      margin-block-start: 9mm !important;
    }
    ${root} .print-card {
      overflow: visible !important;
    }
    ${root} .print-card,
    ${root} .print-meta-grid,
    ${root} .print-callout,
    ${root} .print-sig-row,
    ${root} .print-signature {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    ${root} .print-page-footer {
      background: #fff !important;
      z-index: 3;
    }
    ${root} .print-section-head,
    ${root} .print-kicker {
      break-after: avoid;
      page-break-after: avoid;
    }
    ${root} .print-table tbody tr,
    ${root} .print-table__table tbody tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    ${root} .print-table thead,
    ${root} .print-table__table thead {
      display: table-header-group;
    }
    ${root} .print-table tfoot,
    ${root} .print-table__table tfoot {
      display: table-footer-group;
    }
    ${root} .print-break-before {
      break-before: page;
      page-break-before: always;
    }
    ${root} .print-break-after {
      break-after: page;
      page-break-after: always;
    }
    ${root} .print-break-inside-avoid {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    ${extraCss}
  }
`;
};

function themeToCssVars(theme?: PrintTheme): string {
  if (!theme) {
    return "";
  }
  const lines: string[] = [];
  if (theme.fontFamily) lines.push(`--print-font-family: ${theme.fontFamily};`);
  if (theme.fontSize) lines.push(`--print-font-size: ${theme.fontSize};`);
  if (theme.primaryColor) lines.push(`--print-accent: ${theme.primaryColor};`);
  if (theme.textColor) lines.push(`--print-ink: ${theme.textColor};`);
  if (theme.mutedColor) lines.push(`--print-muted: ${theme.mutedColor};`);
  if (theme.background || theme.paperColor) {
    lines.push(
      `--print-paper: ${theme.paperColor ?? theme.background ?? "#fff"};`,
    );
  }
  if (theme.borderColor) lines.push(`--print-rule: ${theme.borderColor};`);
  if (theme.spacing) lines.push(`--print-spacing: ${theme.spacing};`);
  return lines.join(" ");
}

export type MergePrintPageStyleOptions = {
  customPageStyle?: string;
  font?: PrintFontPageStyleOptions;
  page?: PageConfig;
  pageNumber?: PageNumberConfig;
  pageNumberFormat?: string;
  direction?: "ltr" | "rtl";
  theme?: PrintTheme;
};

export const mergePrintPageStyle = (
  customPageStyle?: string | MergePrintPageStyleOptions,
  font?: PrintFontPageStyleOptions,
) => {
  let options: MergePrintPageStyleOptions;
  if (customPageStyle && typeof customPageStyle === "object") {
    options = customPageStyle;
  } else {
    options = { customPageStyle, font };
  }

  const fontOpts = options.font ?? font;
  const fontFamily = fontOpts?.fontFamily ?? DEFAULT_FONT_FAMILY;
  return `${getPrintFontPageStyle(fontOpts)}${getPrintChromePageStyle()}${options.customPageStyle ?? ""}${getPrintPageNumberPageStyle({
    fontFamily,
    pageNumber: options.pageNumber,
    format: options.pageNumberFormat,
    direction: options.direction,
  })}`;
};

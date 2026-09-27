import { describe, expect, it } from "vitest";
import {
  formatPageMargin,
  formatPageSizeRule,
  resolvePageDimensions,
  PAGE_SIZE_MM,
} from "../src/types/page";
import {
  getPrintDocumentPageStyle,
  getPrintPageNumberPageStyle,
  mergePrintPageStyle,
} from "../src/utils/printPageStyle";

describe("page configuration", () => {
  it("resolves portrait and landscape dimensions for all sizes", () => {
    expect(resolvePageDimensions({ size: "A4" })).toEqual({
      widthMm: 210,
      heightMm: 297,
    });
    expect(
      resolvePageDimensions({ size: "A4", orientation: "landscape" }),
    ).toEqual({ widthMm: 297, heightMm: 210 });
    expect(resolvePageDimensions({ size: "A3" }).widthMm).toBe(
      PAGE_SIZE_MM.A3.width,
    );
    expect(resolvePageDimensions({ size: "A5" }).heightMm).toBe(
      PAGE_SIZE_MM.A5.height,
    );
    expect(resolvePageDimensions({ size: "Letter" }).widthMm).toBeCloseTo(
      215.9,
    );
    expect(resolvePageDimensions({ size: "Legal" }).heightMm).toBeCloseTo(
      355.6,
    );
  });

  it("formats @page size and margin rules", () => {
    expect(formatPageSizeRule({ size: "A3", orientation: "landscape" })).toBe(
      "A3 landscape",
    );
    expect(formatPageMargin("12mm")).toBe("12mm");
    expect(
      formatPageMargin({ top: "10mm", right: "8mm", bottom: "10mm", left: "8mm" }),
    ).toBe("10mm 8mm 10mm 8mm");
  });

  it("emits configurable page size in document styles", () => {
    const css = getPrintDocumentPageStyle("print-doc", {
      page: { size: "Letter", orientation: "landscape", margin: "10mm" },
    });
    expect(css).toContain("size: Letter landscape");
    expect(css).toContain("margin: 10mm");
  });

  it("keeps A4 portrait as the default", () => {
    const css = getPrintDocumentPageStyle("spi-print-document-root");
    expect(css).toContain("size: A4 portrait");
  });

  it("supports custom page number format and RTL margin boxes", () => {
    const ltr = getPrintPageNumberPageStyle({
      format: "Pág. {current}/{total}",
      direction: "ltr",
    });
    expect(ltr).toContain("@bottom-right");
    expect(ltr).toContain("counter(page)");
    expect(ltr).toContain("counter(pages)");

    const rtl = getPrintPageNumberPageStyle({
      format: "صفحه {current} از {total}",
      direction: "rtl",
    });
    expect(rtl).toContain("@bottom-left");
  });

  it("merges font, chrome, and page styles", () => {
    const css = mergePrintPageStyle({
      customPageStyle: "h1 { color: red; }",
      font: { fontFamily: "Tahoma, sans-serif" },
      direction: "rtl",
      pageNumber: { enabled: true, format: "Page {current} of {total}" },
    });
    expect(css).toContain("Tahoma");
    expect(css).toContain("h1 { color: red; }");
    expect(css).toContain("@bottom-left");
  });
});

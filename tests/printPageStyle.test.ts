import { describe, expect, it } from "vitest";
import { getPrintDocumentPageStyle } from "../src/utils/printPageStyle";

describe("getPrintDocumentPageStyle", () => {
  it("emits shared A4 flatten rules scoped to the document root class", () => {
    const css = getPrintDocumentPageStyle("spi-print-document-root");

    expect(css).toContain("size: A4 portrait");
    expect(css).toContain("#print-container.spi-print-document-root");
    expect(css).toContain(".print-chip--accent");
    expect(css).toContain(".print-card--emphasis .print-card__head");
    expect(css).toContain(".print-page + .print-page");
    expect(css).toContain("margin-block-start: 9mm");
    expect(css).toContain("padding-block-end: 18mm");
    expect(css).toContain("box-decoration-break: clone");
    expect(css).toContain("overflow: visible !important");
    expect(css).toContain(".print-page-footer");
  });

  it("appends module extras inside the print media query", () => {
    const css = getPrintDocumentPageStyle(
      "risk-print-document-root",
      (root) => `
        ${root} .risk-print__matrix-cell--final {
          background: #111827 !important;
        }
      `,
    );

    expect(css).toContain(
      "#print-container.risk-print-document-root .risk-print__matrix-cell--final",
    );
    expect(css.indexOf("@media print")).toBeLessThan(
      css.indexOf(".risk-print__matrix-cell--final"),
    );
  });
});

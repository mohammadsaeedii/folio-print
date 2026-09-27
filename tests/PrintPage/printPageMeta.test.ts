import { describe, expect, it } from "vitest";
import {
  formatPrintDocumentId,
  formatPrintRevision,
  getPrintDocumentType,
  joinPrintMeta,
  resolvePrintFooterDocumentType,
  PRINT_META_SEPARATOR,
} from "../../src/components/PrintPage/printPageMeta";

describe("printPageMeta", () => {
  it("joins prefix and number into a document id", () => {
    expect(formatPrintDocumentId({ prefix: "BKN", number: "SR-1009" })).toBe(
      "BKN-SR-1009",
    );
  });

  it("returns whichever document id part is present", () => {
    expect(formatPrintDocumentId({ number: "BKN-SR-1009" })).toBe("BKN-SR-1009");
    expect(formatPrintDocumentId({ prefix: "BKN" })).toBe("BKN");
    expect(formatPrintDocumentId({})).toBe("");
  });

  it("pads numeric revisions to two digits", () => {
    expect(formatPrintRevision(0)).toBe("00");
    expect(formatPrintRevision("7")).toBe("07");
    expect(formatPrintRevision("A1")).toBe("A1");
  });

  it("prefers documentType over title for the header kicker", () => {
    expect(
      getPrintDocumentType({
        documentType: "Safety Risk Assessment Record",
        title: "Flight Safety Risks in Conflict Areas",
      }),
    ).toBe("Safety Risk Assessment Record");
    expect(getPrintDocumentType({ title: "Meeting report" })).toBe(
      "Meeting report",
    );
  });

  it("prefers the branded report type over the header document type in the footer", () => {
    expect(
      resolvePrintFooterDocumentType(
        "Safety Risk Report",
        "Safety Risk Assessment Record",
      ),
    ).toBe("Safety Risk Report");
  });

  it("falls back to the header document type when no report type is branded", () => {
    expect(
      resolvePrintFooterDocumentType(undefined, "Compliance Checklist"),
    ).toBe("Compliance Checklist");
    expect(resolvePrintFooterDocumentType("   ", "Compliance Checklist")).toBe(
      "Compliance Checklist",
    );
    expect(resolvePrintFooterDocumentType(null, "Compliance Checklist")).toBe(
      "Compliance Checklist",
    );
  });

  it("joins footer identity parts with a middot", () => {
    expect(joinPrintMeta(["BKN JET", "Safety Risk Report", "BKN-SR-1009"])).toBe(
      `BKN JET${PRINT_META_SEPARATOR}Safety Risk Report${PRINT_META_SEPARATOR}BKN-SR-1009`,
    );
    expect(joinPrintMeta(["BKN JET", "  ", undefined, "BKN-SR-1009"])).toBe(
      `BKN JET${PRINT_META_SEPARATOR}BKN-SR-1009`,
    );
  });
});

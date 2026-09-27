import { act, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockPrint, capturedOptions, exportPdfMock } = vi.hoisted(() => ({
  mockPrint: vi.fn(),
  capturedOptions: {
    current: null as {
      documentTitle?: string;
      pageStyle?: string;
      contentRef?: { current: HTMLElement | null };
    } | null,
  },
  exportPdfMock: vi.fn(async () => undefined),
}));

vi.mock("react-to-print", () => ({
  useReactToPrint: (options: {
    documentTitle?: string;
    pageStyle?: string;
    contentRef?: { current: HTMLElement | null };
  }) => {
    capturedOptions.current = options;
    return mockPrint;
  },
}));

vi.mock("../../src/utils/exportPdf", () => ({
  exportPdfFromElement: (...args: unknown[]) => exportPdfMock(...args),
}));

import { usePrintFromRef } from "../../src/hooks/usePrintFromRef";
import { PrintPreview } from "../../src/components/PrintPreview";

describe("usePrintFromRef API", () => {
  beforeEach(() => {
    mockPrint.mockClear();
    exportPdfMock.mockClear();
  });

  it("exposes print, exportPdf, preview and builds page styles", () => {
    const contentRef = { current: document.createElement("div") };
    const { result } = renderHook(() =>
      usePrintFromRef({
        title: "Invoice",
        contentRef,
        page: { size: "A4", orientation: "landscape", margin: "12mm" },
        direction: "rtl",
        pageNumber: { enabled: true, format: "Page {current} of {total}" },
      }),
    );

    expect(capturedOptions.current?.documentTitle).toBe("Invoice");
    expect(capturedOptions.current?.pageStyle).toContain("A4 landscape");
    expect(capturedOptions.current?.pageStyle).toContain("12mm");
    expect(typeof result.current.print).toBe("function");
    expect(typeof result.current.exportPdf).toBe("function");
    expect(typeof result.current.preview).toBe("function");
    expect(result.current.PrintableRoot).toBeTruthy();
    expect(result.current.isPreviewOpen).toBe(false);

    act(() => {
      result.current.preview();
    });
    expect(result.current.isPreviewOpen).toBe(true);

    act(() => {
      result.current.closePreview();
    });
    expect(result.current.isPreviewOpen).toBe(false);
  });

  it("exportPdf delegates to exportPdfFromElement with filename", async () => {
    const el = document.createElement("div");
    el.className = "print-doc";
    const contentRef = { current: el };
    const { result } = renderHook(() =>
      usePrintFromRef({
        title: "Report",
        contentRef,
        page: { size: "A5", orientation: "portrait" },
      }),
    );

    await act(async () => {
      await result.current.exportPdf({ filename: "report.pdf" });
    });

    expect(exportPdfMock).toHaveBeenCalledTimes(1);
    expect(exportPdfMock.mock.calls[0]?.[0]).toMatchObject({
      element: el,
      filename: "report.pdf",
      page: { size: "A5", orientation: "portrait" },
    });
  });

  it("preserves documentTitle as a backwards-compatible alias", () => {
    renderHook(() =>
      usePrintFromRef({
        documentTitle: "Legacy Title",
      }),
    );
    expect(capturedOptions.current?.documentTitle).toBe("Legacy Title");
  });
});

describe("PrintPreview", () => {
  it("renders preview chrome with page proportions", () => {
    const source = document.createElement("div");
    source.className = "print-doc";
    source.innerHTML = "<p>Preview body</p>";
    document.body.appendChild(source);
    const contentRef = { current: source };

    render(
      <PrintPreview
        open
        onClose={() => undefined}
        onPrint={() => undefined}
        onDownloadPdf={() => undefined}
        title="Invoice"
        page={{ size: "A4", orientation: "portrait" }}
        direction="rtl"
        contentRef={contentRef}
      />,
    );

    expect(screen.getByRole("dialog")).toHaveAttribute("dir", "rtl");
    expect(screen.getByText("Preview: Invoice")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
    expect(screen.getByText("Print")).toBeInTheDocument();
    expect(screen.getByText("Download PDF")).toBeInTheDocument();
    document.body.removeChild(source);
  });
});

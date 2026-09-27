import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { mockPrint, capturedOptions } = vi.hoisted(() => ({
  mockPrint: vi.fn(),
  capturedOptions: {
    current: null as {
      documentTitle?: string;
      pageStyle?: string;
      contentRef?: { current: HTMLElement | null };
    } | null,
  },
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

vi.mock("../../src/hooks/printableRoot", () => ({
  createPrintableRoot: () =>
    function PrintableRoot({ children }: { children?: unknown }) {
      return children;
    },
}));

import { usePrintFromRef } from "../../src/hooks/usePrintFromRef";

describe("usePrintFromRef", () => {
  it("passes document title, merged page style, and content ref to react-to-print", () => {
    const contentRef = { current: document.createElement("div") };
    const { result } = renderHook(() =>
      usePrintFromRef({
        documentTitle: "Risk report",
        contentRef,
        pageStyle: "h1 { color: black; }",
      }),
    );

    expect(capturedOptions.current?.documentTitle).toBe("Risk report");
    expect(capturedOptions.current?.contentRef).toBe(contentRef);
    expect(capturedOptions.current?.pageStyle).toContain("Arial");
    expect(capturedOptions.current?.pageStyle).toContain("h1 { color: black; }");
    expect(typeof result.current.PrintableRoot).toBe("function");

    act(() => {
      result.current.print();
    });
    expect(mockPrint).toHaveBeenCalledTimes(1);
  });
});

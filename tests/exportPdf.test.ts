import { describe, expect, it, vi, beforeEach } from "vitest";

const html2canvas = vi.fn(async () => {
  const canvas = {
    width: 100,
    height: 250,
  } as HTMLCanvasElement;
  return canvas;
});

const addImage = vi.fn();
const addPage = vi.fn();
const save = vi.fn();

vi.mock("html2canvas", () => ({
  default: (...args: unknown[]) => html2canvas(...args),
}));

vi.mock("jspdf", () => ({
  jsPDF: class {
    addImage = addImage;
    addPage = addPage;
    save = save;
    internal = {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 100,
      },
    };
  },
}));

import { exportPdfFromElement } from "../src/utils/exportPdf";

describe("exportPdfFromElement", () => {
  beforeEach(() => {
    html2canvas.mockClear();
    addImage.mockClear();
    addPage.mockClear();
    save.mockClear();

    // jsdom lacks a real canvas implementation — stub page slicing.
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      fillStyle: "",
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/jpeg;base64,abc",
    );
  });

  it("creates a multi-page PDF and triggers download", async () => {
    const element = document.createElement("div");
    element.textContent = "Report content";
    document.body.appendChild(element);

    await exportPdfFromElement({
      element,
      filename: "invoice",
      page: { size: "A4", orientation: "portrait" },
    });

    expect(html2canvas).toHaveBeenCalled();
    expect(addImage).toHaveBeenCalled();
    expect(save).toHaveBeenCalledWith("invoice.pdf");
    // Tall source (250px) vs page slice height → more than one page
    expect(addPage.mock.calls.length).toBeGreaterThanOrEqual(1);

    document.body.removeChild(element);
  });
});

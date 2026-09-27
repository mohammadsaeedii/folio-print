import type { PageConfig } from "../types/page";
import { resolvePageDimensions } from "../types/page";

export type ExportPdfFromElementOptions = {
  element: HTMLElement;
  filename?: string;
  page?: PageConfig;
  /** Pixel scale for rasterization. Default 2. */
  scale?: number;
  /** JPEG quality 0–1. Default 0.92. */
  imageQuality?: number;
  direction?: "ltr" | "rtl";
};

type Html2CanvasFn = (
  element: HTMLElement,
  options?: {
    scale?: number;
    useCORS?: boolean;
    allowTaint?: boolean;
    backgroundColor?: string | null;
    logging?: boolean;
    windowWidth?: number;
    windowHeight?: number;
  },
) => Promise<HTMLCanvasElement>;

type JsPdfCtor = new (options?: {
  orientation?: "portrait" | "landscape" | "p" | "l";
  unit?: "mm" | "pt" | "px" | "in";
  format?: number[] | string;
  compress?: boolean;
}) => {
  addImage: (
    imageData: string,
    format: string,
    x: number,
    y: number,
    w: number,
    h: number,
    alias?: string,
    compression?: string,
    rotation?: number,
  ) => void;
  addPage: () => void;
  save: (filename: string) => void;
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
};

async function loadPdfDeps(): Promise<{
  html2canvas: Html2CanvasFn;
  jsPDF: JsPdfCtor;
}> {
  try {
    const [html2canvasMod, jspdfMod] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    const html2canvas = (html2canvasMod.default ??
      html2canvasMod) as Html2CanvasFn;
    const jsPDF = (jspdfMod.jsPDF ??
      (jspdfMod as { default?: { jsPDF?: JsPdfCtor } }).default?.jsPDF ??
      jspdfMod.default) as JsPdfCtor;
    return { html2canvas, jsPDF };
  } catch (error) {
    const message =
      "PDF export requires optional peer dependencies `html2canvas` and `jspdf`. Install them with: npm install html2canvas jspdf";
    if (error instanceof Error) {
      error.message = `${message} (${error.message})`;
      throw error;
    }
    throw new Error(message);
  }
}

/**
 * Rasterize a DOM element into a multi-page PDF download.
 *
 * Browser limitation: content is captured via canvas (html2canvas), so complex
 * CSS (some filters, cross-origin images without CORS, webfonts still loading)
 * may differ slightly from the print dialog output.
 */
export async function exportPdfFromElement(
  options: ExportPdfFromElementOptions,
): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("exportPdf is only available in the browser.");
  }

  const {
    element,
    filename = "document.pdf",
    page = {},
    scale = 2,
    imageQuality = 0.92,
  } = options;

  const { html2canvas, jsPDF } = await loadPdfDeps();
  const { widthMm, heightMm } = resolvePageDimensions(page);
  const orientation = page.orientation ?? "portrait";

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const pdf = new jsPDF({
    orientation: orientation === "landscape" ? "landscape" : "portrait",
    unit: "mm",
    format: [widthMm, heightMm],
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const pageCanvasHeight = (canvas.width * pageHeight) / pageWidth;

  let renderedHeight = 0;
  let pageIndex = 0;

  while (renderedHeight < canvas.height) {
    const sliceHeight = Math.min(
      pageCanvasHeight,
      canvas.height - renderedHeight,
    );
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = Math.max(1, Math.floor(sliceHeight));
    const ctx = pageCanvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not create canvas context for PDF export.");
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    ctx.drawImage(
      canvas,
      0,
      renderedHeight,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    );

    const imgData = pageCanvas.toDataURL("image/jpeg", imageQuality);
    const sliceImgHeight = (sliceHeight * imgWidth) / canvas.width;

    if (pageIndex > 0) {
      pdf.addPage();
    }
    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, sliceImgHeight);

    renderedHeight += sliceHeight;
    pageIndex += 1;

    // Safety: avoid infinite loops on zero-height slices
    if (sliceHeight <= 0) {
      break;
    }
  }

  const safeName = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  pdf.save(safeName);
}

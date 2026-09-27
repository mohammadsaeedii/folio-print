"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useReactToPrint } from "react-to-print";
import { createPrintableRoot, type PrintableRootConfigRefs } from "./printableRoot";
import {
  getPrintDocumentPageStyle,
  mergePrintPageStyle,
} from "../utils/printPageStyle";
import { exportPdfFromElement } from "../utils/exportPdf";
import { PrintPreview } from "../components/PrintPreview";
import { formatPageMargin, formatPageSizeRule } from "../types/page";
import { DEFAULT_PRINT_LABELS } from "../labels";
import type {
  ExportPdfOptions,
  PreviewOptions,
  PrintFromRefOptions,
  UsePrintFromRefWithRootResult,
  PrintFromRefTableData,
} from "../types/printFormTypes";

export const usePrintFromRef = <T extends HTMLElement = HTMLDivElement>(
  options?: PrintFromRefOptions<T> & {
    tableData?: PrintFromRefTableData | null;
    showTable?: boolean;
  },
): UsePrintFromRefWithRootResult => {
  const internalRef = useRef<HTMLDivElement>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const {
    contentRef: contentRefOption,
    pageHeader,
    branding,
    tableData = null,
    showTable = true,
    title,
    documentTitle,
    page,
    direction: directionOption,
    pageNumber,
    watermark,
    theme,
    font,
    header,
    footer,
    pageStyle: customPageStyle,
    ...reactToPrintOptions
  } = options ?? {};

  const activeContentRef = contentRefOption ?? internalRef;
  const contentRef = activeContentRef as React.RefObject<HTMLElement | null>;

  const direction = directionOption ?? "ltr";
  const resolvedTitle = title ?? documentTitle;

  const pageHeaderRef = useRef(pageHeader);
  pageHeaderRef.current = pageHeader;

  const tableDataRef = useRef(tableData);
  tableDataRef.current = tableData;

  const showTableRef = useRef(showTable);
  showTableRef.current = showTable;

  const brandingRef = useRef(branding);
  brandingRef.current = branding;

  const directionRef = useRef(direction);
  directionRef.current = direction;

  const watermarkRef = useRef(watermark);
  watermarkRef.current = watermark;

  const themeRef = useRef(theme);
  themeRef.current = theme;

  const headerRef = useRef(header);
  headerRef.current = header;

  const footerRef = useRef(footer);
  footerRef.current = footer;

  const pageRef = useRef(page);
  pageRef.current = page;

  const configRefs = useMemo<PrintableRootConfigRefs>(
    () => ({
      pageHeader: pageHeaderRef,
      tableData: tableDataRef,
      showTable: showTableRef,
      branding: brandingRef,
      direction: directionRef,
      watermark: watermarkRef,
      theme: themeRef,
      header: headerRef,
      footer: footerRef,
      page: pageRef,
    }),
    [],
  );

  const pageNumberFormat =
    pageNumber?.format ?? DEFAULT_PRINT_LABELS.pageNumberFormat;

  const builtPageStyle = useMemo(() => {
    const pageRule = `
@page {
  size: ${formatPageSizeRule(page)};
  margin: ${formatPageMargin(page?.margin)};
}
`;
    const documentCss =
      typeof customPageStyle === "string" && customPageStyle.length > 0
        ? `${customPageStyle}\n${pageRule}`
        : getPrintDocumentPageStyle("print-doc", { page, theme });

    return mergePrintPageStyle({
      customPageStyle: documentCss,
      font: {
        fontFamily: font?.fontFamily ?? theme?.fontFamily,
        fontFaceCss: font?.fontFaceCss,
      },
      page,
      pageNumber,
      pageNumberFormat,
      direction,
      theme,
    });
  }, [
    page,
    theme,
    font,
    customPageStyle,
    pageNumber,
    pageNumberFormat,
    direction,
  ]);

  const print = useReactToPrint({
    ...reactToPrintOptions,
    documentTitle: resolvedTitle,
    pageStyle: builtPageStyle,
    contentRef: contentRef,
  });

  const exportPdf = useCallback(
    async (pdfOptions?: ExportPdfOptions) => {
      const element = contentRef.current;
      if (!element) {
        throw new Error(
          "Cannot export PDF: printable content ref is not mounted.",
        );
      }
      const filename =
        pdfOptions?.filename ??
        pdfOptions?.fileName ??
        (resolvedTitle ? `${resolvedTitle}.pdf` : "document.pdf");

      const previousClass = element.className;
      element.classList.add("print-layout--pdf");
      try {
        await exportPdfFromElement({
          element,
          filename,
          page,
          scale: pdfOptions?.scale,
          imageQuality: pdfOptions?.imageQuality,
          direction,
        });
      } finally {
        element.className = previousClass;
      }
    },
    [contentRef, page, direction, resolvedTitle],
  );

  const preview = useCallback((_options?: PreviewOptions) => {
    setIsPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  const PrintableRoot = useMemo(() => {
    return createPrintableRoot(activeContentRef, configRefs);
  }, [activeContentRef, configRefs]);

  const PreviewPortal = useCallback((): ReactNode => {
    if (typeof document === "undefined") {
      return null;
    }
    return createPortal(
      <PrintPreview
        open={isPreviewOpen}
        onClose={closePreview}
        onPrint={() => {
          print();
        }}
        onDownloadPdf={() => exportPdf()}
        title={resolvedTitle}
        page={page}
        pageNumberFormat={pageNumberFormat}
        direction={direction}
        contentRef={contentRef}
      />,
      document.body,
    );
  }, [
    isPreviewOpen,
    closePreview,
    print,
    exportPdf,
    resolvedTitle,
    page,
    pageNumberFormat,
    direction,
    contentRef,
  ]);

  return {
    print,
    exportPdf,
    preview,
    closePreview,
    isPreviewOpen,
    PrintableRoot: PrintableRoot!,
    PreviewPortal,
  };
};

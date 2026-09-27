"use client";

import { useRef, useState, type ReactNode, type RefObject } from "react";
import {
  createPrintableRoot,
  type PrintableRootComponent,
  type PrintableRootConfigRefs,
} from "./printableRoot";
import type {
  PrintBranding,
  PrintFromRefTableData,
  PrintPageHeaderConfig,
} from "../types/printFormTypes";
import type {
  PageConfig,
  PrintTheme,
  TextDirection,
  WatermarkConfig,
} from "../types/page";

export type { PrintableRootComponent };

export type UseStablePrintableRootOptions = {
  pageHeader?: PrintPageHeaderConfig;
  branding?: PrintBranding;
  tableData?: PrintFromRefTableData | null;
  showTable?: boolean;
  direction?: TextDirection;
  watermark?: WatermarkConfig;
  theme?: PrintTheme;
  header?: ReactNode;
  footer?: ReactNode;
  page?: PageConfig;
};

export type UseStablePrintableRootResult = {
  contentRef: RefObject<HTMLDivElement | null>;
  PrintableRoot: PrintableRootComponent;
};

export function useStablePrintableRoot(
  options: UseStablePrintableRootOptions = {},
): UseStablePrintableRootResult {
  const {
    pageHeader,
    branding,
    tableData = null,
    showTable = true,
    direction,
    watermark,
    theme,
    header,
    footer,
    page,
  } = options;

  const contentRef = useRef<HTMLDivElement>(null);

  const pageHeaderRef = useRef(pageHeader);
  pageHeaderRef.current = pageHeader;

  const brandingRef = useRef(branding);
  brandingRef.current = branding;

  const tableDataRef = useRef(tableData);
  tableDataRef.current = tableData;

  const showTableRef = useRef(showTable);
  showTableRef.current = showTable;

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

  const configRefs = useRef<PrintableRootConfigRefs>({
    pageHeader: pageHeaderRef,
    branding: brandingRef,
    tableData: tableDataRef,
    showTable: showTableRef,
    direction: directionRef,
    watermark: watermarkRef,
    theme: themeRef,
    header: headerRef,
    footer: footerRef,
    page: pageRef,
  }).current;

  const [PrintableRoot] = useState<PrintableRootComponent>(() =>
    createPrintableRoot(contentRef, configRefs),
  );

  return {
    contentRef,
    PrintableRoot,
  };
}

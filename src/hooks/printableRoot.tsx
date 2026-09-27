"use client";

import {
  forwardRef,
  useCallback,
  type CSSProperties,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { usePrintWorkspace } from "../contexts/PrintWorkspaceContext";
import {
  PrintPageFooter,
  PrintPageGenerated,
  PrintPageHeader,
} from "../components/PrintPage";
import {
  formatPrintDocumentId,
  getPrintDocumentType,
  resolvePrintFooterDocumentType,
} from "../components/PrintPage/printPageMeta";
import { PrintTable } from "../components/tablePrint";
import { PrintWatermark } from "../components/PrintBlocks";
import type {
  PrintableRootComponent,
  PrintableRootProps,
  PrintBranding,
  PrintPageHeaderConfig,
  PrintFromRefTableData,
} from "../types/printFormTypes";
import type {
  PageConfig,
  PrintTheme,
  TextDirection,
  WatermarkConfig,
} from "../types/page";

export function assignRef<T>(ref: Ref<T> | undefined, value: T | null): void {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
  } else {
    ref.current = value;
  }
}

export type PrintableRootConfigRefs = {
  pageHeader: RefObject<PrintPageHeaderConfig | undefined>;
  tableData: RefObject<PrintFromRefTableData | null | undefined>;
  showTable: RefObject<boolean | undefined>;
  branding: RefObject<PrintBranding | undefined>;
  direction: RefObject<TextDirection | undefined>;
  watermark: RefObject<WatermarkConfig | undefined>;
  theme: RefObject<PrintTheme | undefined>;
  header: RefObject<ReactNode | undefined>;
  footer: RefObject<ReactNode | undefined>;
  page: RefObject<PageConfig | undefined>;
};

function themeToStyle(theme?: PrintTheme): CSSProperties | undefined {
  if (!theme) {
    return undefined;
  }
  const style: CSSProperties & Record<string, string> = {};
  if (theme.fontFamily) style["--print-font-family"] = theme.fontFamily;
  if (theme.fontSize) style["--print-font-size"] = theme.fontSize;
  if (theme.primaryColor) style["--print-accent"] = theme.primaryColor;
  if (theme.textColor) style["--print-ink"] = theme.textColor;
  if (theme.mutedColor) style["--print-muted"] = theme.mutedColor;
  if (theme.background || theme.paperColor) {
    style["--print-paper"] = theme.paperColor ?? theme.background ?? "#fff";
  }
  if (theme.borderColor) style["--print-rule"] = theme.borderColor;
  if (theme.spacing) style["--print-spacing"] = theme.spacing;
  return style;
}

export const createPrintableRoot = (
  contentRef: RefObject<HTMLElement | null>,
  configRefs: PrintableRootConfigRefs,
): PrintableRootComponent => {
  const PrintableRoot = forwardRef<HTMLDivElement, PrintableRootProps>(
    function PrintableRoot(
      { children, className, style, ...rest },
      forwardedRef,
    ) {
      const { isUncontrolledDocument, companyName, logo } = usePrintWorkspace();
      const branding = configRefs.branding.current;
      const pageHeaderConfig = configRefs.pageHeader.current;
      const tableData = configRefs.tableData.current;
      const showTable = configRefs.showTable.current;
      const direction = configRefs.direction.current ?? "ltr";
      const watermark = configRefs.watermark.current;
      const theme = configRefs.theme.current;
      const customHeader = configRefs.header.current;
      const customFooter = configRefs.footer.current;
      const companyNameFinal = branding?.companyName ?? companyName;
      const logoSrc = branding?.logoSrc ?? logo;
      const documentType = getPrintDocumentType(pageHeaderConfig ?? {});
      const documentId = formatPrintDocumentId(pageHeaderConfig ?? {});
      const footerDocumentType = resolvePrintFooterDocumentType(
        branding?.reportType,
        documentType,
      );
      const rootClassName = ["print-doc", className].filter(Boolean).join(" ");
      const themeStyle = themeToStyle(theme);
      const mergedStyle = themeStyle ? { ...themeStyle, ...style } : style;

      const setRef = useCallback(
        (node: HTMLDivElement | null) => {
          contentRef.current = node;
          assignRef(forwardedRef, node);
        },
        [contentRef, forwardedRef],
      );

      const headerNode =
        customHeader !== undefined ? (
          customHeader
        ) : (
          <PrintPageHeader
            config={pageHeaderConfig}
            companyName={companyNameFinal}
            logoSrc={logoSrc}
          />
        );

      const footerNode =
        customFooter !== undefined ? (
          customFooter
        ) : (
          <PrintPageFooter
            companyName={companyNameFinal}
            documentType={footerDocumentType}
            documentId={documentId}
            isUncontrolledDocument={Boolean(isUncontrolledDocument)}
            uncontrolledLabel={branding?.uncontrolledLabel}
          />
        );

      return (
        <div
          ref={setRef}
          className={rootClassName}
          id="print-container"
          dir={direction}
          style={mergedStyle}
          {...rest}
        >
          {watermark ? (
            <PrintWatermark
              text={watermark.text}
              opacity={watermark.opacity}
              rotate={watermark.rotate}
            />
          ) : null}
          <PrintPageGenerated label={branding?.generatedByLabel} />
          {headerNode}
          <div className="print-doc__body">
            {children}
            {showTable && tableData ? (
              <PrintTable
                meta={tableData.meta}
                columns={tableData.columns}
                rows={tableData.rows}
                className={tableData.className}
                columnWidths={tableData.columnWidths}
                totals={tableData.totals}
                subtotal={tableData.subtotal}
                summary={tableData.summary}
              />
            ) : null}
          </div>
          {footerNode}
        </div>
      );
    },
  );

  PrintableRoot.displayName = "PrintableRoot";
  return PrintableRoot as unknown as PrintableRootComponent;
};

export type { PrintableRootComponent };

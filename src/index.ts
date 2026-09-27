export { usePrintFromRef } from "./hooks/usePrintFromRef";
export { useStablePrintableRoot } from "./hooks/useStablePrintableRoot";
export { createPrintableRoot, assignRef } from "./hooks/printableRoot";
export type { PrintableRootConfigRefs } from "./hooks/printableRoot";
export type {
  UseStablePrintableRootOptions,
  UseStablePrintableRootResult,
} from "./hooks/useStablePrintableRoot";

export {
  PrintDisclaimer,
  PrintDocument,
  PrintHost,
  PrintHistorySection,
  PrintPage,
  PrintPageFooter,
  PrintPageGenerated,
  PrintPageHeader,
  usePrintHistoryLabels,
  formatPrintDocumentId,
  formatPrintRevision,
  getPrintDocumentType,
  joinPrintMeta,
  resolvePrintFooterDocumentType,
  PRINT_META_SEPARATOR,
  printDocumentClassName,
} from "./components/PrintPage";
export type {
  PrintHistoryEntry,
  PrintHistoryLabels,
  PrintHistorySectionProps,
  PrintPageHeaderLabels,
} from "./components/PrintPage";

export {
  PrintPageBreak,
  PrintSection,
  PrintSignature,
  PrintWatermark,
  PrintCover,
} from "./components/PrintBlocks";
export type {
  PrintPageBreakProps,
  PrintSectionProps,
  PrintSignatureProps,
  PrintWatermarkProps,
  PrintCoverProps,
} from "./components/PrintBlocks";

export { PrintPreview } from "./components/PrintPreview";
export type { PrintPreviewProps } from "./components/PrintPreview";

export { PrintTable } from "./components/tablePrint";
export type {
  PrintTableColumn,
  PrintTableRow,
  PrintTableProps,
} from "./components/tablePrint";

export {
  getPrintFontPageStyle,
  getPrintChromePageStyle,
  getPrintPageNumberPageStyle,
  getPrintDocumentPageStyle,
  mergePrintPageStyle,
} from "./utils/printPageStyle";
export type {
  PrintDocumentPageStyleExtras,
  PrintDocumentPageStyleOptions,
  PrintFontPageStyleOptions,
  MergePrintPageStyleOptions,
  PrintPageNumberStyleOptions,
} from "./utils/printPageStyle";

export { exportPdfFromElement } from "./utils/exportPdf";
export type { ExportPdfFromElementOptions } from "./utils/exportPdf";

export {
  PAGE_SIZE_MM,
  DEFAULT_PAGE_CONFIG,
  resolvePageDimensions,
  formatPageMargin,
  formatPageSizeRule,
} from "./types/page";

export type {
  PrintPageHeaderConfig,
  PrintBranding,
  PrintFromRefOptions,
  PrintableRootProps,
  PrintableRootComponent,
  UsePrintFromRefWithRootResult,
  PrintFromRefTableData,
  ExportPdfOptions,
  PreviewOptions,
  ExportPdfFromRefOptions,
  UseExportPdfFromRefWithRootResult,
  PageSize,
  Orientation,
  PageMargin,
  PageConfig,
  PageNumberConfig,
  WatermarkConfig,
  PrintTheme,
  TextDirection,
} from "./types/printFormTypes";

export {
  PrintWorkspaceProvider,
  usePrintWorkspace,
} from "./contexts/PrintWorkspaceContext";
export type {
  PrintWorkspaceValue,
  PrintWorkspaceProviderProps,
} from "./contexts/PrintWorkspaceContext";

export {
  DEFAULT_PRINT_LABELS,
  DEFAULT_PRINT_HISTORY_LABELS,
  formatPageNumber,
} from "./labels";

export type PrintPageMetaInput = {
  prefix?: string | number;
  number?: string | number;
  revision?: string | number;
  date?: string | number;
  title?: string;
  documentType?: string;
};

export const PRINT_META_SEPARATOR = " \u00b7 ";

export const isPrintMetaPresent = (value: string | number | undefined): boolean =>
  value !== undefined && String(value).trim() !== "";

export const formatPrintDocumentId = (
  input: Pick<PrintPageMetaInput, "prefix" | "number">,
): string => {
  const prefix = isPrintMetaPresent(input.prefix) ? String(input.prefix).trim() : "";
  const number = isPrintMetaPresent(input.number) ? String(input.number).trim() : "";

  if (prefix && number) {
    return `${prefix}-${number}`;
  }

  return prefix || number;
};

export const formatPrintRevision = (revision: string | number): string => {
  const raw = String(revision).trim();

  if (/^\d+$/.test(raw)) {
    return raw.padStart(2, "0");
  }

  return raw;
};

export const getPrintDocumentType = (
  input: Pick<PrintPageMetaInput, "title" | "documentType">,
): string => {
  const documentType = input.documentType?.trim() ?? "";

  if (documentType) {
    return documentType;
  }

  return input.title?.trim() ?? "";
};

/**
 * Footer identity label. The report template prints the short report name in the
 * footer ("Safety Risk Report") while the header kicker carries the long document
 * type ("Safety Risk Assessment Record"), so the branded `reportType` wins when
 * present and the header document type is the fallback.
 */
export const resolvePrintFooterDocumentType = (
  reportType: string | null | undefined,
  documentType: string,
): string => reportType?.trim() || documentType;

export const joinPrintMeta = (parts: Array<string | undefined | null>): string =>
  parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(PRINT_META_SEPARATOR);

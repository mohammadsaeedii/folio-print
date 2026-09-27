"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  resolvePageDimensions,
  type PageConfig,
} from "../../types/page";
import { DEFAULT_PRINT_LABELS, formatPageNumber } from "../../labels";

export type PrintPreviewProps = {
  open: boolean;
  onClose: () => void;
  onPrint?: () => void;
  onDownloadPdf?: () => void | Promise<void>;
  title?: string;
  page?: PageConfig;
  pageNumberFormat?: string;
  direction?: "ltr" | "rtl";
  /** Source printable element to clone into the preview. */
  contentRef?: RefObject<HTMLElement | null>;
};

function mmToPx(mm: number): number {
  return (mm * 96) / 25.4;
}

export function PrintPreview({
  open,
  onClose,
  onPrint,
  onDownloadPdf,
  title,
  page = {},
  pageNumberFormat = DEFAULT_PRINT_LABELS.pageNumberFormat,
  direction = "ltr",
  contentRef,
}: PrintPreviewProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const [cloneHtml, setCloneHtml] = useState<string>("");

  const { widthMm, heightMm } = resolvePageDimensions(page);
  const pageHeightPx = useMemo(() => mmToPx(heightMm), [heightMm]);

  useEffect(() => {
    if (!open) {
      setCloneHtml("");
      setPageCount(1);
      return;
    }

    const source = contentRef?.current;
    if (!source) {
      return;
    }

    const clone = source.cloneNode(true) as HTMLElement;
    clone.removeAttribute("id");
    clone.classList.add("print-layout--print");
    clone.style.width = `${widthMm}mm`;
    clone.style.boxSizing = "border-box";

    const probe = document.createElement("div");
    probe.style.cssText =
      "position:absolute;left:-99999px;top:0;visibility:hidden;";
    probe.appendChild(clone);
    document.body.appendChild(probe);
    const height = clone.scrollHeight || clone.offsetHeight;
    const pages = Math.max(1, Math.ceil(height / pageHeightPx));
    setPageCount(pages);
    setCloneHtml(clone.outerHTML);
    document.body.removeChild(probe);
  }, [open, contentRef, widthMm, pageHeightPx]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const pageStyle = {
    width: `${widthMm}mm`,
    height: `${heightMm}mm`,
    maxWidth: "100%",
  };

  return (
    <div
      className="print-preview-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={DEFAULT_PRINT_LABELS.preview}
      dir={direction}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="print-preview">
        <div className="print-preview__toolbar">
          <h2 className="print-preview__title">
            {title
              ? `${DEFAULT_PRINT_LABELS.preview}: ${title}`
              : DEFAULT_PRINT_LABELS.preview}
          </h2>
          <div className="print-preview__actions">
            {onDownloadPdf ? (
              <button
                type="button"
                className="print-preview__btn"
                onClick={() => {
                  void onDownloadPdf();
                }}
              >
                {DEFAULT_PRINT_LABELS.downloadPdf}
              </button>
            ) : null}
            {onPrint ? (
              <button
                type="button"
                className="print-preview__btn print-preview__btn--primary"
                onClick={onPrint}
              >
                {DEFAULT_PRINT_LABELS.print}
              </button>
            ) : null}
            <button
              type="button"
              className="print-preview__btn"
              onClick={onClose}
            >
              {DEFAULT_PRINT_LABELS.close}
            </button>
          </div>
        </div>
        <div className="print-preview__stage" ref={stageRef}>
          {Array.from({ length: pageCount }, (_, index) => (
            <div
              key={index}
              className="print-preview__page"
              style={pageStyle}
              data-page={index + 1}
            >
              <span className="print-preview__page-label">
                {formatPageNumber(pageNumberFormat, index + 1, pageCount)}
              </span>
              <div
                className="print-preview__content"
                style={{
                  height: `${heightMm}mm`,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {cloneHtml ? (
                  <div
                    style={{
                      transform: `translateY(-${index * pageHeightPx}px)`,
                    }}
                    dangerouslySetInnerHTML={{ __html: cloneHtml }}
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

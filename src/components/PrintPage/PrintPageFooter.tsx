"use client";

import { PrintDisclaimer } from "./PrintDisclaimer";
import { PrintPagePagination } from "./PrintPagePagination";
import { joinPrintMeta } from "./printPageMeta";

type PrintPageFooterProps = {
  companyName?: string | null;
  documentType?: string;
  documentId?: string;
  isUncontrolledDocument: boolean;
  uncontrolledLabel?: string;
};

export function PrintPageFooter({
  companyName,
  documentType,
  documentId,
  isUncontrolledDocument,
  uncontrolledLabel,
}: PrintPageFooterProps) {
  const identity = joinPrintMeta([companyName, documentType, documentId]);

  return (
    <footer className="print-page-footer">
      <div className="print-page-footer__inner">
        {identity ? (
          <span className="print-page-footer__identity">{identity}</span>
        ) : (
          <span />
        )}
        <div className="print-page-footer__trailing">
          <PrintPagePagination />
          {isUncontrolledDocument ? (
            <>
              <span className="print-page-footer__separator" aria-hidden="true">
                ·
              </span>
              <PrintDisclaimer
                isUncontrolledDocument={isUncontrolledDocument}
                label={uncontrolledLabel}
              />
            </>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

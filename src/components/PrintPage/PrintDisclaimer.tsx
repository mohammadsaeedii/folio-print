"use client";

import { DEFAULT_PRINT_LABELS } from "../../labels";

type PrintDisclaimerProps = {
  isUncontrolledDocument: boolean;
  label?: string;
};

export function PrintDisclaimer({
  isUncontrolledDocument,
  label,
}: PrintDisclaimerProps) {
  if (!isUncontrolledDocument) {
    return null;
  }

  return (
    <span className="print-page-footer__notice uncontrolled-document-print-notice">
      {label ?? DEFAULT_PRINT_LABELS.uncontrolledWhenPrinted}
    </span>
  );
}

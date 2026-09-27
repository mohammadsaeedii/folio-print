"use client";

import { DEFAULT_PRINT_LABELS } from "../../labels";

type PrintPageGeneratedProps = {
  label?: string;
};

export function PrintPageGenerated({ label }: PrintPageGeneratedProps) {
  const text = label ?? DEFAULT_PRINT_LABELS.generatedBy;

  return (
    <div className="print-page-generated" aria-hidden="true">
      <span className="print-page-generated__text">{text}</span>
    </div>
  );
}

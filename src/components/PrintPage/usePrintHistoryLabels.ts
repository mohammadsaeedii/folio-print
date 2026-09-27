"use client";

import { useMemo } from "react";
import { DEFAULT_PRINT_HISTORY_LABELS } from "../../labels";
import type { PrintHistoryLabels } from "./PrintHistorySection";

/**
 * Returns default English history labels.
 * Pass `overrides` to customize copy.
 */
export const usePrintHistoryLabels = (
  overrides?: Partial<PrintHistoryLabels>,
): PrintHistoryLabels => {
  return useMemo(
    () => ({
      ...DEFAULT_PRINT_HISTORY_LABELS,
      ...overrides,
    }),
    [
      overrides?.title,
      overrides?.empty,
      overrides?.date,
      overrides?.actor,
      overrides?.action,
      overrides?.detail,
    ],
  );
};

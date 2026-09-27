"use client";

import { useMemo } from "react";
import type { PrintPageHeaderConfig } from "../../types/printFormTypes";
import { DEFAULT_PRINT_LABELS } from "../../labels";
import {
  formatPrintDocumentId,
  formatPrintRevision,
  getPrintDocumentType,
  joinPrintMeta,
} from "./printPageMeta";

export type PrintPageHeaderLabels = {
  logoAlt?: string;
  documentHeader?: string;
  revision?: (revision: string) => string;
  issued?: (date: string) => string;
};

type PrintPageHeaderProps = {
  config?: PrintPageHeaderConfig;
  companyName?: string | null;
  /** Plain image URL (http(s), data:, blob:, or relative path). */
  logoSrc?: string | null;
  labels?: PrintPageHeaderLabels;
};

export function PrintPageHeader({
  config,
  companyName,
  logoSrc,
  labels,
}: PrintPageHeaderProps) {
  const logoAlt = labels?.logoAlt ?? DEFAULT_PRINT_LABELS.logoAlt;
  const documentHeader =
    labels?.documentHeader ?? DEFAULT_PRINT_LABELS.documentHeader;
  const formatRevision = labels?.revision ?? DEFAULT_PRINT_LABELS.revision;
  const formatIssued = labels?.issued ?? DEFAULT_PRINT_LABELS.issued;

  const logoUrl = logoSrc?.trim() || null;
  const showLogo = Boolean(logoUrl);
  const companyNameFinal = companyName?.trim() ?? "";
  const kicker = getPrintDocumentType(config ?? {});
  const documentId = formatPrintDocumentId(config ?? {});

  const revisionLine = useMemo(() => {
    if (!config) {
      return "";
    }

    const parts: string[] = [];

    if (config.revision !== undefined && config.revision !== "") {
      parts.push(formatRevision(formatPrintRevision(config.revision)));
    }

    if (config.date !== undefined && config.date !== "") {
      parts.push(formatIssued(String(config.date)));
    }

    return joinPrintMeta(parts);
  }, [config, formatRevision, formatIssued]);

  const headerLabel = kicker || companyNameFinal || documentHeader;
  const hasIdentity = Boolean(
    companyNameFinal || kicker || documentId || revisionLine || showLogo,
  );

  if (!hasIdentity) {
    return null;
  }

  return (
    <header className="print-page-header" aria-label={headerLabel}>
      <div className="print-page-header__inner">
        <div className="print-page-header__brand">
          <div className="print-page-header__titles">
            {companyNameFinal ? (
              <span className="print-page-header__company">{companyNameFinal}</span>
            ) : null}
            {kicker ? <p className="print-page-header__kicker">{kicker}</p> : null}
          </div>
        </div>

        {showLogo ? (
          <div className="print-page-header__logo">
            <img
              src={logoUrl!}
              alt={logoAlt}
              className="print-page-header__logo-image"
            />
          </div>
        ) : (
          <div
            className="print-page-header__logo print-page-header__logo--empty"
            aria-hidden="true"
          />
        )}

        <div className="print-page-header__ids">
          {documentId ? (
            <span className="print-page-header__number">{documentId}</span>
          ) : null}
          {revisionLine ? (
            <span className="print-page-header__meta">{revisionLine}</span>
          ) : null}
        </div>
      </div>
    </header>
  );
}

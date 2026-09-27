"use client";

import type { ReactNode } from "react";

type PrintHostProps = {
  children: ReactNode;
};

type PrintDocumentProps = {
  children: ReactNode;
  /** Optional custom header (replaces default when used with PrintableRoot slots). */
  header?: ReactNode;
  /** Optional custom footer. */
  footer?: ReactNode;
  className?: string;
  dir?: "ltr" | "rtl";
};

export const printDocumentClassName = (
  moduleClass: string,
  rootClass: string,
  extra?: string,
) => ["print-doc--report", moduleClass, rootClass, extra].filter(Boolean).join(" ");

export const PrintHost = ({ children }: PrintHostProps) => (
  <div className="print-host" aria-hidden="true">
    {children}
  </div>
);

export const PrintDocument = ({
  children,
  header,
  footer,
  className,
  dir,
}: PrintDocumentProps) => (
  <div
    className={["print-stack", className].filter(Boolean).join(" ")}
    dir={dir}
  >
    {header}
    {children}
    {footer}
  </div>
);

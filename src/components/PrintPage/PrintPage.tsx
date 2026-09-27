"use client";

import type { ReactNode } from "react";

type PrintPageProps = {
  children: ReactNode;
};

export const PrintPage = ({ children }: PrintPageProps) => (
  <section className="print-page">
    <div className="print-page__content">{children}</div>
  </section>
);

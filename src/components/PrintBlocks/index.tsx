"use client";

import type { CSSProperties, ReactNode } from "react";

export type PrintPageBreakProps = {
  /** Optional className; defaults include `print-page-break`. */
  className?: string;
};

/** Forces a page break before this point when printing / exporting PDF. */
export function PrintPageBreak({ className }: PrintPageBreakProps) {
  return (
    <div
      className={["print-page-break", "print-break-before", className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    />
  );
}

export type PrintSectionProps = {
  children: ReactNode;
  title?: ReactNode;
  className?: string;
  /** Avoid breaking the section across pages when possible. */
  avoidBreak?: boolean;
};

export function PrintSection({
  children,
  title,
  className,
  avoidBreak = false,
}: PrintSectionProps) {
  return (
    <section
      className={[
        "print-section",
        avoidBreak ? "print-break-inside-avoid" : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {title ? (
        <div className="print-section-head">
          <h2 className="print-heading">{title}</h2>
        </div>
      ) : null}
      {children}
    </section>
  );
}

export type PrintSignatureProps = {
  name?: string;
  role?: string;
  date?: string;
  className?: string;
  children?: ReactNode;
};

export function PrintSignature({
  name,
  role,
  date,
  className,
  children,
}: PrintSignatureProps) {
  return (
    <div className={["print-signature", className].filter(Boolean).join(" ")}>
      <div className="print-signature__line" aria-hidden="true" />
      {children}
      {name ? <div className="print-signature__name">{name}</div> : null}
      {role ? <div className="print-signature__role">{role}</div> : null}
      {date ? <div className="print-signature__date">{date}</div> : null}
    </div>
  );
}

export type PrintWatermarkProps = {
  text: string;
  opacity?: number;
  rotate?: string;
  className?: string;
};

export function PrintWatermark({
  text,
  opacity = 0.08,
  rotate = "-30deg",
  className,
}: PrintWatermarkProps) {
  const style = {
    opacity,
    transform: `rotate(${rotate})`,
  } as CSSProperties;

  return (
    <div
      className={["print-watermark", className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <span className="print-watermark__text" style={style}>
        {text}
      </span>
    </div>
  );
}

export type PrintCoverProps = {
  children?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  className?: string;
};

export function PrintCover({
  children,
  title,
  subtitle,
  className,
}: PrintCoverProps) {
  return (
    <div className={["print-cover", className].filter(Boolean).join(" ")}>
      {title ? <h1 className="print-cover__title">{title}</h1> : null}
      {subtitle ? <p className="print-cover__subtitle">{subtitle}</p> : null}
      {children}
    </div>
  );
}

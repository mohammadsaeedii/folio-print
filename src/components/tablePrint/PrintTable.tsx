"use client";

import type { ReactElement, ReactNode } from "react";

export interface PrintTableColumn {
  key: string;
  header: ReactNode;
  className?: string;
}

export interface PrintTableRow {
  key: string;
  cells: Record<string, ReactNode>;
  className?: string;
  cellClassName?: Record<string, string>;
  /**
   * Row break behaviour across pages.
   * - `"avoid"` (default): try not to split the row
   * - `"auto"`: allow the row to break
   */
  breakInside?: "avoid" | "auto";
  /** Mark as a section header row (styled differently). */
  section?: boolean;
}

export type PrintTableProps = {
  meta?: ReactNode;
  columns: PrintTableColumn[];
  rows?: PrintTableRow[];
  children?: ReactNode;
  className?: string;
  columnWidths?: string[];
  /** Optional tfoot summary / total rows. */
  totals?: PrintTableRow[];
  /** Alias for a single subtotal row (prepended to totals). */
  subtotal?: PrintTableRow;
  /** Alias for additional summary rows (appended to totals). */
  summary?: PrintTableRow[];
  /** Repeat thead on each printed page. Default true. */
  repeatHeader?: boolean;
};

function rowClassName(row: PrintTableRow, extras?: string): string {
  return [
    row.section ? "print-table__section-row" : null,
    row.breakInside === "auto"
      ? "print-table__row--allow-break"
      : "print-table__row--avoid-break",
    row.className,
    extras,
  ]
    .filter(Boolean)
    .join(" ");
}

function renderCells(row: PrintTableRow, columns: PrintTableColumn[]) {
  return columns.map((column) => (
    <td
      key={`${row.key}-${column.key}`}
      className={row.cellClassName?.[column.key]}
      valign="middle"
    >
      {row.cells[column.key] ?? null}
    </td>
  ));
}

export function PrintTable({
  meta,
  columns,
  rows,
  children,
  className,
  columnWidths,
  totals,
  subtotal,
  summary,
  repeatHeader = true,
}: PrintTableProps): ReactElement {
  const footerRows = [
    ...(subtotal ? [subtotal] : []),
    ...(totals ?? []),
    ...(summary ?? []),
  ];

  return (
    <div
      className={[
        "print-table",
        "table-export-print__table-wrap",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {meta ? <div className="print-table__meta">{meta}</div> : null}
      <table
        className={[
          "print-table__table",
          "table-export-print__table",
          repeatHeader ? "print-table__table--repeat-header" : null,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {columnWidths && columnWidths.length === columns.length ? (
          <colgroup>
            {columnWidths.map((width, index) => (
              <col
                key={`${columns[index]?.key ?? index}-width`}
                style={{ width }}
              />
            ))}
          </colgroup>
        ) : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.className}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows
            ? rows.map((row) => (
                <tr key={row.key} className={rowClassName(row)}>
                  {renderCells(row, columns)}
                </tr>
              ))
            : children}
        </tbody>
        {footerRows.length > 0 ? (
          <tfoot>
            {footerRows.map((row, index) => (
              <tr
                key={row.key}
                className={rowClassName(
                  row,
                  index === footerRows.length - 1
                    ? "print-table__totals-row"
                    : "print-table__summary-row",
                )}
              >
                {renderCells(row, columns)}
              </tr>
            ))}
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}

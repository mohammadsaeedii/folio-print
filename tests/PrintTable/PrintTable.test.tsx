import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrintTable } from "../../src/components/tablePrint/PrintTable";
import {
  PrintCover,
  PrintPageBreak,
  PrintSection,
  PrintSignature,
  PrintWatermark,
} from "../../src/components/PrintBlocks/index";

describe("PrintTable", () => {
  const columns = [
    { key: "item", header: "Item" },
    { key: "qty", header: "Qty" },
    { key: "amount", header: "Amount" },
  ];

  it("renders rows, repeated thead, and totals footer", () => {
    render(
      <PrintTable
        columns={columns}
        rows={[
          {
            key: "r1",
            cells: { item: "Fuel", qty: "10", amount: "100" },
          },
          {
            key: "r2",
            section: true,
            cells: { item: "Extras", qty: "", amount: "" },
          },
        ]}
        subtotal={{
          key: "sub",
          cells: { item: "Subtotal", qty: "", amount: "100" },
        }}
        totals={[
          {
            key: "total",
            cells: { item: "Total", qty: "", amount: "120" },
          },
        ]}
      />,
    );

    expect(screen.getByText("Fuel")).toBeInTheDocument();
    expect(screen.getByText("Extras")).toBeInTheDocument();
    expect(document.querySelector("thead")).toBeInTheDocument();
    expect(document.querySelector("tfoot")).toBeInTheDocument();
    expect(screen.getByText("Subtotal")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(
      document.querySelector(".print-table__table--repeat-header"),
    ).toBeInTheDocument();
  });

  it("marks avoid-break on rows by default", () => {
    render(
      <PrintTable
        columns={columns}
        rows={[
          {
            key: "r1",
            cells: { item: "Long", qty: "1", amount: "1" },
          },
          {
            key: "r2",
            breakInside: "auto",
            cells: { item: "Split", qty: "2", amount: "2" },
          },
        ]}
      />,
    );
    const rows = document.querySelectorAll("tbody tr");
    expect(rows[0]).toHaveClass("print-table__row--avoid-break");
    expect(rows[1]).toHaveClass("print-table__row--allow-break");
  });
});

describe("document building blocks", () => {
  it("renders page break, section, signature, watermark, and cover", () => {
    render(
      <>
        <PrintCover title="Annual Report" subtitle="2026" />
        <PrintWatermark text="CONFIDENTIAL" />
        <PrintSection title="Summary">
          <p>Body</p>
        </PrintSection>
        <PrintPageBreak />
        <PrintSignature name="Jane Doe" role="Approved By" date="2026-09-27" />
      </>,
    );

    expect(screen.getByText("Annual Report")).toBeInTheDocument();
    expect(screen.getByText("CONFIDENTIAL")).toBeInTheDocument();
    expect(screen.getByText("Summary")).toBeInTheDocument();
    expect(document.querySelector(".print-page-break")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Approved By")).toBeInTheDocument();
  });
});

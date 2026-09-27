import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  PrintDocument,
  PrintHost,
  printDocumentClassName,
} from "../../src/components/PrintPage/PrintDocument";
import { PrintPage } from "../../src/components/PrintPage/PrintPage";

describe("PrintDocument layout", () => {
  it("joins the shared report class with the module root class", () => {
    expect(printDocumentClassName("spi-print", "spi-print-document-root")).toBe(
      "print-doc--report spi-print spi-print-document-root",
    );
    expect(
      printDocumentClassName(
        "audit-print",
        "audit-print-document-root",
        "audit-report-modal__document",
      ),
    ).toBe(
      "print-doc--report audit-print audit-print-document-root audit-report-modal__document",
    );
  });

  it("renders an off-screen host, a page stack, and A4 page sections", () => {
    render(
      <PrintHost>
        <PrintDocument>
          <PrintPage>
            <p>Overview</p>
          </PrintPage>
          <PrintPage>
            <p>Trend</p>
          </PrintPage>
        </PrintDocument>
      </PrintHost>,
    );

    const host = document.querySelector(".print-host");
    expect(host).toHaveAttribute("aria-hidden", "true");
    expect(document.querySelector(".print-stack")).toBeInTheDocument();
    expect(document.querySelectorAll(".print-page")).toHaveLength(2);
    expect(document.querySelectorAll(".print-page__content")).toHaveLength(2);
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Trend")).toBeInTheDocument();
  });
});

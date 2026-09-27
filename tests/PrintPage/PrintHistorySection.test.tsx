import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrintHistorySection } from "../../src/components/PrintPage/PrintHistorySection";
import type { PrintHistoryEntry } from "../../src/components/PrintPage/PrintHistorySection";

const labels = {
  title: "Activity history",
  empty: "No activity recorded.",
  date: "Date",
  actor: "By",
  action: "Action",
  detail: "Detail",
};

const entries: PrintHistoryEntry[] = [
  {
    id: "h-1",
    occurredAt: "2026-02-10T08:00:00Z",
    actor: "Ozan Cinar",
    action: "Updated",
    detail: "Connected risk BKN-SR-1009",
  },
];

describe("PrintHistorySection", () => {
  it("renders a print-table of history entries", () => {
    render(
      <PrintHistorySection
        entries={entries}
        labels={labels}
        formatDate={(value) => value?.slice(0, 10) ?? "N/A"}
      />,
    );

    expect(screen.getByText("Activity history")).toBeInTheDocument();
    expect(screen.getByText("2026-02-10")).toBeInTheDocument();
    expect(screen.getByText("Ozan Cinar")).toBeInTheDocument();
    expect(screen.getByText("Updated")).toBeInTheDocument();
    expect(screen.getByText("Connected risk BKN-SR-1009")).toBeInTheDocument();
    expect(document.querySelector(".print-table")).toBeInTheDocument();
  });

  it("renders the empty copy when there are no entries", () => {
    render(
      <PrintHistorySection
        entries={[]}
        labels={labels}
        formatDate={() => "N/A"}
      />,
    );

    expect(screen.getByText("No activity recorded.")).toBeInTheDocument();
    expect(document.querySelector(".print-table")).not.toBeInTheDocument();
  });
});

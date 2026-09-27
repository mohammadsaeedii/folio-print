"use client";

export type PrintHistoryEntry = {
  id: string;
  occurredAt: string | null;
  actor: string | null;
  action: string;
  detail?: string | null;
};

export type PrintHistoryLabels = {
  title: string;
  empty: string;
  date: string;
  actor: string;
  action: string;
  detail: string;
};

export type PrintHistorySectionProps = {
  entries: PrintHistoryEntry[];
  labels: PrintHistoryLabels;
  formatDate: (value: string | null) => string;
};

export const PrintHistorySection = ({
  entries,
  labels,
  formatDate,
}: PrintHistorySectionProps) => {
  if (entries.length === 0) {
    return (
      <section className="print-history">
        <div className="print-kicker">{labels.title}</div>
        <p className="print-prose print-muted">{labels.empty}</p>
      </section>
    );
  }

  return (
    <section className="print-history">
      <div className="print-kicker">{labels.title}</div>
      <table className="print-table">
        <thead>
          <tr>
            <th>{labels.date}</th>
            <th>{labels.actor}</th>
            <th>{labels.action}</th>
            <th>{labels.detail}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{formatDate(entry.occurredAt)}</td>
              <td>{entry.actor?.trim() || "—"}</td>
              <td>{entry.action}</td>
              <td>{entry.detail?.trim() || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

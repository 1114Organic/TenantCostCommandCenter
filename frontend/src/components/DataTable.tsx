import { formatMoney } from "./BarList";

type DataTableProps<T extends object> = {
  title: string;
  rows: T[];
  columns: Array<{ key: keyof T; label: string; money?: boolean }>;
};

export function DataTable<T extends object>({ title, rows, columns }: DataTableProps<T>) {
  return (
    <section className="panel table-panel">
      <h3>{title}</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => {
                  const value = row[column.key] as unknown;
                  const displayValue = Array.isArray(value) ? value.join(", ") : String(value);
                  return <td key={String(column.key)}>{column.money ? formatMoney(Number(value)) : displayValue}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

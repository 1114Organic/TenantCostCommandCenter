type Item = Record<string, string | number>;

export function BarList({ title, items, labelKey }: { title: string; items: Item[]; labelKey: string }) {
  const max = Math.max(...items.map((item) => Number(item.cost)), 1);
  return (
    <section className="panel">
      <h3>{title}</h3>
      <div className="bar-list">
        {items.slice(0, 8).map((item) => (
          <div className="bar-row" key={String(item[labelKey])}>
            <div className="bar-label">
              <span>{String(item[labelKey])}</span>
              <strong>{formatMoney(Number(item.cost))}</strong>
            </div>
            <div className="bar-track">
              <div style={{ width: `${(Number(item.cost) / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

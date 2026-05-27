import { formatMoney } from "./BarList";

export function TrendChart({ points }: { points: Array<{ date: string; cost: number }> }) {
  const max = Math.max(...points.map((point) => point.cost), 1);
  return (
    <section className="panel trend-panel">
      <h3>Daily Spend Trend</h3>
      <div className="trend-chart">
        {points.map((point) => (
          <div className="trend-column" key={point.date}>
            <span>{formatMoney(point.cost)}</span>
            <div style={{ height: `${Math.max((point.cost / max) * 100, 8)}%` }} />
            <small>{point.date.slice(5)}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

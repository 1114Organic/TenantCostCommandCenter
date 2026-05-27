import { Download, RefreshCw } from "lucide-react";

export function DashboardHeader({ title, subtitle, onExport }: { title: string; subtitle: string; onExport?: () => void }) {
  return (
    <header className="dashboard-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="header-actions">
        <button title="Refresh">
          <RefreshCw size={17} />
        </button>
        <button title="Export CSV" onClick={onExport}>
          <Download size={17} />
        </button>
      </div>
    </header>
  );
}

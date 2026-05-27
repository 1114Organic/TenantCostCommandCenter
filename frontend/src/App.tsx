import { Activity, AlertTriangle, BarChart3, ClipboardCheck, Gauge, Layers, LineChart, Settings, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { ExecutiveDashboard } from "./pages/ExecutiveDashboard";
import { PlatformDashboard } from "./pages/PlatformDashboard";
import { ProductLineDashboard } from "./pages/ProductLineDashboard";
import { TenantDashboard } from "./pages/TenantDashboard";
import { AdminAllocationRulesPage, AnomaliesPage, BudgetsPage, RecommendationsPage, TaggingCompliancePage } from "./pages/WorkflowPages";
import { api } from "./services/api";
import type { Tenant } from "./services/types";
import { useAsync } from "./hooks/useAsync";

const tabs = [
  { id: "tenant", label: "Tenant", icon: Gauge },
  { id: "product", label: "Product Line", icon: Layers },
  { id: "platform", label: "Platform", icon: Activity },
  { id: "executive", label: "Executive", icon: LineChart },
  { id: "anomalies", label: "Anomalies", icon: AlertTriangle },
  { id: "recommendations", label: "Recommendations", icon: ClipboardCheck },
  { id: "budgets", label: "Budgets", icon: WalletCards },
  { id: "tagging", label: "Tagging", icon: BarChart3 },
  { id: "admin", label: "Admin", icon: Settings },
] as const;

export default function App() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("tenant");
  const tenants = useAsync(() => api.tenants(), []);
  const [selectedTenantId, setSelectedTenantId] = useState("tn-claims");
  const [selectedProductLine, setSelectedProductLine] = useState("Insurance");

  const tenantList = tenants.data ?? [];
  const selectedTenant = useMemo<Tenant | undefined>(() => tenantList.find((tenant) => tenant.tenant_id === selectedTenantId) ?? tenantList[0], [tenantList, selectedTenantId]);
  const productLines = Array.from(new Set(tenantList.map((tenant) => tenant.product_line))).filter((line) => line !== "Platform");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span>TCCC</span>
          <div>
            <strong>Tenant Cost Command Center</strong>
            <small>FinOps showback portal</small>
          </div>
        </div>
        <nav>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="selectors">
          <label>
            Tenant
            <select value={selectedTenant?.tenant_id ?? ""} onChange={(event) => setSelectedTenantId(event.target.value)}>
              {tenantList.map((tenant) => (
                <option key={tenant.tenant_id} value={tenant.tenant_id}>
                  {tenant.tenant_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Product Line
            <select value={selectedProductLine} onChange={(event) => setSelectedProductLine(event.target.value)}>
              {productLines.map((line) => (
                <option key={line} value={line}>
                  {line}
                </option>
              ))}
            </select>
          </label>
        </div>
      </aside>
      {activeTab === "tenant" && selectedTenant && <TenantDashboard tenant={selectedTenant} />}
      {activeTab === "product" && <ProductLineDashboard productLine={selectedProductLine} />}
      {activeTab === "platform" && <PlatformDashboard />}
      {activeTab === "executive" && <ExecutiveDashboard />}
      {activeTab === "anomalies" && <AnomaliesPage />}
      {activeTab === "recommendations" && <RecommendationsPage />}
      {activeTab === "budgets" && <BudgetsPage />}
      {activeTab === "tagging" && <TaggingCompliancePage />}
      {activeTab === "admin" && <AdminAllocationRulesPage />}
    </div>
  );
}

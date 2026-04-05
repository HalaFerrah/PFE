import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackNav from "../../../components/ui/BackNav";
import { useI18n } from "../../../i18n/I18nProvider";
import { getAdminContracts, updateContractStatus } from "../../../api/client";

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString()} DA`;
}

function statusClass(status) {
  return `status-pill status-${status || "pending"}`;
}

function AdminDashboardPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const token = localStorage.getItem("cash_token");
  const user = JSON.parse(localStorage.getItem("cash_user") || "{}");
  const [contracts, setContracts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || (user.role !== "admin" && user.role !== "agent")) {
      navigate("/login");
      return;
    }

    let active = true;
    getAdminContracts(token)
      .then((contractsData) => {
        if (!active) return;
        setContracts(contractsData.data || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, user.role, navigate]);

  const totals = useMemo(() => ({
    contracts: contracts.length,
    active: contracts.filter((item) => item.status === "active").length
  }), [contracts]);

  const handleLogout = () => {
    localStorage.removeItem("cash_token");
    localStorage.removeItem("cash_user");
    localStorage.removeItem("cash_last_boat_id");
    localStorage.removeItem("cash_last_contract_id");
    localStorage.removeItem("cash_quote_snapshot");
    navigate("/home");
  };

  const onStatusChange = async (contractId, status) => {
    try {
      await updateContractStatus(token, contractId, status);
      setContracts((prev) => prev.map((item) => (item.id === contractId ? { ...item, status } : item)));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="page-center full-admin-page">
      <div className="profile-hero-shell admin-hero-shell-page">
        <div className="profile-hero-copy">
          <p className="eyebrow">{t.adminNav}</p>
          <h1 className="profile-page-title">{t.adminTitle}</h1>
          <p className="profile-page-subtitle">{t.adminSubtitle}</p>
        </div>
        <div className="profile-hero-actions">
          <BackNav to="/home" />
          <button type="button" className="header-link" onClick={handleLogout}>
            {t.logout}
          </button>
        </div>
      </div>

      {error ? <p className="form-error profile-error">{error}</p> : null}

      <div className="admin-shell">
        <aside className="dashboard-panel admin-sidebar">
          <div className="profile-avatar">{(user.first_name || "A").slice(0, 1).toUpperCase()}</div>
          <h2 className="profile-name">{t.adminNav}</h2>
          <p className="profile-email">{user.email || "-"}</p>
          <div className="summary-block compact-summary">
            <div className="summary-row"><span>{t.roleLabel}</span><strong>{user.role || "admin"}</strong></div>
            <div className="summary-row"><span>{t.activeContracts}</span><strong>{totals.active}</strong></div>
            <div className="summary-row"><span>{t.totalContracts}</span><strong>{totals.contracts}</strong></div>
          </div>
        </aside>

        <div className="admin-main">
          <section className="dashboard-panel admin-summary-panel">
            <div className="section-head">
              <h3>{t.adminContracts}</h3>
              <span className="section-chip">{loading ? t.loadingText : `${totals.contracts} ${t.contractsLabel}`}</span>
            </div>
            <div className="dashboard-grid admin-stats-grid admin-stats-panel-grid">
              <div className="dashboard-panel stat-panel admin-stat-card"><span>{t.totalContracts}</span><strong>{totals.contracts}</strong></div>
              <div className="dashboard-panel stat-panel admin-stat-card"><span>{t.activeContracts}</span><strong>{totals.active}</strong></div>
            </div>
          </section>

          <section className="dashboard-panel admin-panel-block">
            <div className="section-head">
              <h3>{t.adminContracts}</h3>
              <span className="section-chip">{contracts.length} {t.contractsLabel}</span>
            </div>
            <div className="table-header-row">
              <span>{t.assuranceId}</span>
              <span>{t.boatName}</span>
              <span>{t.startDate}</span>
              <span>{t.endDate}</span>
              <span>{t.totalPrice}</span>
            </div>
            <div className="table-list">
              {contracts.length ? contracts.map((contract) => (
                <div className="with-control admin-contract-wrap" key={contract.id}>
                  <button type="button" className="table-row-card action-card admin-contract-row" onClick={() => navigate(`/contracts/${contract.id}`)}>
                    <span><strong>{contract.policy_number}</strong></span>
                    <span>{contract.boat_name}</span>
                    <span>{contract.start_date}</span>
                    <span>{contract.end_date}</span>
                    <span>{formatMoney(contract.total_general)}</span>
                  </button>
                  <div className="status-control admin-status-panel">
                    <span className={statusClass(contract.status)}>{contract.status}</span>
                    <select className="status-select" value={contract.status} onChange={(e) => onStatusChange(contract.id, e.target.value)}>
                      <option value="pending">pending</option>
                      <option value="active">active</option>
                      <option value="expired">expired</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                </div>
              )) : <div className="empty-card">{loading ? t.loadingText : t.noContracts}</div>}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboardPage;


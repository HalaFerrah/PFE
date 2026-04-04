import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackNav from "../../../components/ui/BackNav";
import { useI18n } from "../../../i18n/I18nProvider";
import { getContractDetail } from "../../../api/client";

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString()} DA`;
}

function statusClass(status) {
  return `status-pill status-${status || "pending"}`;
}

function ContractDetailPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("cash_token");
  const [contract, setContract] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    let active = true;
    getContractDetail(token, id)
      .then((data) => {
        if (!active) return;
        setContract(data.data || null);
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
  }, [token, id]);

  return (
    <section className="page-center contract-page">
      <h1 className="hero-title">{t.contractTitle}</h1>
      <p className="hero-subtitle">{t.contractSubtitle}</p>

      <div className="quote-card admin-card">
        <div className="card-toolbar">
          <BackNav to={JSON.parse(localStorage.getItem("cash_user") || "{}").role === "client" ? "/account" : "/admin/contracts"} />
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {loading ? <p>{t.loadingText}</p> : null}

        {contract ? (
          <div className="contract-layout">
            <section className="dashboard-panel">
              <div className="section-head">
                <h3>{t.contractOverview}</h3>
                <span className={statusClass(contract.status)}>{contract.status}</span>
              </div>
              <div className="summary-block">
                <div className="summary-row"><span>{t.assuranceId}</span><strong>{contract.policy_number}</strong></div>
                <div className="summary-row"><span>{t.startDate}</span><strong>{contract.start_date}</strong></div>
                <div className="summary-row"><span>{t.endDate}</span><strong>{contract.end_date}</strong></div>
                <div className="summary-row"><span>{t.statusLabel}</span><strong>{contract.status}</strong></div>
                <div className="summary-row"><span>{t.totalPrice}</span><strong>{formatMoney(contract.total_general)}</strong></div>
              </div>
            </section>

            <section className="dashboard-grid">
              <section className="dashboard-panel">
                <h3>{t.boatInfo}</h3>
                <div className="summary-block">
                  <div className="summary-row"><span>{t.boatName}</span><strong>{contract.boat_name}</strong></div>
                  <div className="summary-row"><span>{t.type}</span><strong>{contract.boat_type}</strong></div>
                  <div className="summary-row"><span>{t.power}</span><strong>{contract.engine_power_hp}</strong></div>
                  <div className="summary-row"><span>{t.yearConstruction}</span><strong>{contract.construction_year}</strong></div>
                  <div className="summary-row"><span>{t.material}</span><strong>{contract.construction_materials}</strong></div>
                  <div className="summary-row"><span>{t.amount}</span><strong>{formatMoney(contract.total_insured_value)}</strong></div>
                </div>
              </section>

              <section className="dashboard-panel">
                <h3>{t.clientInfo}</h3>
                <div className="summary-block">
                  <div className="summary-row"><span>{t.fullName}</span><strong>{contract.first_name} {contract.last_name}</strong></div>
                  <div className="summary-row"><span>{t.email}</span><strong>{contract.email}</strong></div>
                  <div className="summary-row"><span>{t.phone}</span><strong>{contract.phone_number}</strong></div>
                  <div className="summary-row"><span>{t.locationLabel}</span><strong>{contract.wilaya}</strong></div>
                  <div className="summary-row"><span>{t.addressLabel}</span><strong>{contract.address}</strong></div>
                </div>
              </section>
            </section>

            <section className="dashboard-panel contract-section">
              <h3>{t.assuranceLines}</h3>
              <div className="table-list compact-list">
                {(contract.guarantees || []).map((item) => (
                  <div className="list-card static-card guarantee-line-card" key={item.guarantee_code}>
                    <div className="guarantee-line-head">
                      <strong>{item.guarantee_code}</strong>
                      <span>{formatMoney(item.calculated_premium)}</span>
                    </div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default ContractDetailPage;

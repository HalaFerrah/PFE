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

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function ContractDetailPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("cash_token");
  const [contract, setContract] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const handlePrint = () => {
    window.print();
  };

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
    <section className="page-center contract-page contract-document-page">
      <h1 className="hero-title">{t.contractTitle}</h1>
      <p className="hero-subtitle">{t.contractSubtitle}</p>

      <div className="quote-card admin-card contract-shell">
        <div className="card-toolbar contract-toolbar">
          <BackNav to={JSON.parse(localStorage.getItem("cash_user") || "{}").role === "client" ? "/account" : "/admin/contracts"} />
          <button type="button" className="header-pill contract-print-btn" onClick={handlePrint}>
            {t.printContract}
          </button>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {loading ? <p>{t.loadingText}</p> : null}

        {contract ? (
          <article className="contract-paper">
            <header className="contract-paper-head">
              <div className="contract-paper-title-block">
                <p className="contract-paper-kicker">{t.contractDocumentLabel}</p>
                <h2>{t.contractFormalTitle}</h2>
                <p>{t.contractFormalSubtitle}</p>
              </div>
              <div className="contract-paper-meta">
                <span className={statusClass(contract.status)}>{contract.status}</span>
                <div className="contract-meta-item">
                  <span>{t.assuranceId}</span>
                  <strong>{contract.policy_number}</strong>
                </div>
                <div className="contract-meta-item">
                  <span>{t.issueDate}</span>
                  <strong>{formatDate(contract.created_at)}</strong>
                </div>
              </div>
            </header>

            <section className="contract-paper-section">
              <div className="contract-section-title-row">
                <h3>{t.contractOverview}</h3>
                <span className="contract-section-line" />
              </div>
              <div className="contract-overview-grid">
                <div className="contract-overview-card">
                  <span>{t.startDate}</span>
                  <strong>{formatDate(contract.start_date)}</strong>
                </div>
                <div className="contract-overview-card">
                  <span>{t.endDate}</span>
                  <strong>{formatDate(contract.end_date)}</strong>
                </div>
                <div className="contract-overview-card">
                  <span>{t.duration}</span>
                  <strong>{contract.contract_duration}</strong>
                </div>
                <div className="contract-overview-card">
                  <span>{t.totalPrice}</span>
                  <strong>{formatMoney(contract.total_general)}</strong>
                </div>
              </div>
            </section>

            <section className="contract-paper-grid">
              <section className="contract-paper-section">
                <div className="contract-section-title-row">
                  <h3>{t.clientInfo}</h3>
                  <span className="contract-section-line" />
                </div>
                <div className="contract-info-list">
                  <div className="contract-info-row"><span>{t.fullName}</span><strong>{contract.first_name} {contract.last_name}</strong></div>
                  <div className="contract-info-row"><span>{t.email}</span><strong>{contract.email}</strong></div>
                  <div className="contract-info-row"><span>{t.phone}</span><strong>{contract.phone_number}</strong></div>
                  <div className="contract-info-row"><span>{t.addressLabel}</span><strong>{contract.address}</strong></div>
                  <div className="contract-info-row"><span>{t.locationLabel}</span><strong>{contract.wilaya}</strong></div>
                </div>
              </section>

              <section className="contract-paper-section">
                <div className="contract-section-title-row">
                  <h3>{t.boatInfo}</h3>
                  <span className="contract-section-line" />
                </div>
                <div className="contract-info-list">
                  <div className="contract-info-row"><span>{t.boatName}</span><strong>{contract.boat_name}</strong></div>
                  <div className="contract-info-row"><span>{t.type}</span><strong>{contract.boat_type}</strong></div>
                  <div className="contract-info-row"><span>{t.power}</span><strong>{contract.engine_power_hp || "-"}</strong></div>
                  <div className="contract-info-row"><span>{t.yearConstruction}</span><strong>{contract.construction_year}</strong></div>
                  <div className="contract-info-row"><span>{t.material}</span><strong>{contract.construction_materials}</strong></div>
                  <div className="contract-info-row"><span>{t.boatId}</span><strong>{contract.registration_number || "-"}</strong></div>
                  <div className="contract-info-row"><span>{t.amount}</span><strong>{formatMoney(contract.total_insured_value)}</strong></div>
                </div>
              </section>
            </section>

            <section className="contract-paper-section">
              <div className="contract-section-title-row">
                <h3>{t.assuranceLines}</h3>
                <span className="contract-section-line" />
              </div>
              <div className="contract-lines-table">
                <div className="contract-lines-head">
                  <span>{t.guaranteeCode}</span>
                  <span>{t.guaranteeLabel}</span>
                  <span>{t.rateLabel}</span>
                  <span>{t.amount}</span>
                </div>
                {(contract.guarantees || []).map((item) => (
                  <div className="contract-lines-row" key={item.guarantee_code}>
                    <span><strong>{item.guarantee_code}</strong></span>
                    <span>{item.label}</span>
                    <span>{Number(item.applied_rate || 0).toLocaleString()}</span>
                    <span>{formatMoney(item.calculated_premium)}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="contract-paper-section">
              <div className="contract-section-title-row">
                <h3>{t.premiumBreakdown}</h3>
                <span className="contract-section-line" />
              </div>
              <div className="contract-financials">
                <div className="contract-info-row"><span>{t.mainNetPremium}</span><strong>{formatMoney(contract.main_net_premium)}</strong></div>
                <div className="contract-info-row"><span>{t.optionalGuarantees}</span><strong>{formatMoney(contract.options_net_premium)}</strong></div>
                <div className="contract-info-row"><span>{t.totalNetPremium}</span><strong>{formatMoney(contract.total_net_premium)}</strong></div>
                <div className="contract-info-row"><span>{t.durationCoefficient}</span><strong>{contract.duration_coefficient}</strong></div>
                <div className="contract-info-row"><span>{t.adjustedNetPremium}</span><strong>{formatMoney(contract.adjusted_net_premium)}</strong></div>
                <div className="contract-info-row"><span>{t.policyCost}</span><strong>{formatMoney(contract.cout_police)}</strong></div>
                <div className="contract-info-row"><span>{t.taxLabel}</span><strong>{formatMoney(contract.tva_amount)}</strong></div>
                <div className="contract-info-row"><span>{t.stampLabel}</span><strong>{formatMoney(contract.timbre)}</strong></div>
                <div className="contract-total-row">
                  <span>{t.finalCalculation}</span>
                  <strong>{formatMoney(contract.total_general)}</strong>
                </div>
              </div>
            </section>

            <footer className="contract-paper-footer">
              <div className="contract-signature-block">
                <span>{t.insurerSignature}</span>
                <div className="contract-signature-line" />
              </div>
              <div className="contract-signature-block">
                <span>{t.clientSignature}</span>
                <div className="contract-signature-line" />
              </div>
            </footer>
          </article>
        ) : (
          !loading && !error ? (
            <div className="empty-card">{t.noContracts}</div>
          ) : null
        )}
      </div>
    </section>
  );
}

export default ContractDetailPage;

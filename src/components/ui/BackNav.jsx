import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n/I18nProvider";

function BackNav({ to }) {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <button
      type="button"
      className="back-nav"
      onClick={() => {
        if (to) {
          navigate(to);
          return;
        }
        navigate(-1);
      }}
      aria-label={t.back}
    >
      <span className="back-arrow">&#8592;</span>
      <span>{t.back}</span>
    </button>
  );
}

export default BackNav;

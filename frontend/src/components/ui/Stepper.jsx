import { useI18n } from "../../i18n/I18nProvider";

function Stepper({ activeStep = 1 }) {
  const { t } = useI18n();

  const steps = [
    { id: 1, label: t.steps.one },
    { id: 2, label: t.steps.two },
    { id: 3, label: t.steps.three }
  ];

  return (
    <div className="stepper">
      {steps.map((step) => {
        const isActive = step.id === activeStep;
        const isDone = step.id < activeStep;
        return (
          <div className="step-item" key={step.id}>
            <div className="step-top">
              <span className={`dot ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>{step.id}</span>
            </div>
            <span className={`step-label ${isActive ? "active" : ""}`}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default Stepper;
